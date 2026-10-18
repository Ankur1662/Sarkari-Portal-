import express, { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { triggerSourceCheck, triggerAllSourcesCheck } from './scheduler';
import { extractRecruitmentData, generateHindiArticle } from './aiExtractor';
import { computeNoticeHash, isSafePublicUrl } from './sourceMonitor';
import { OfficialSource, DetectedNotice } from './types';

export const apiRouter = express.Router();

// Middleware: Admin Authorization Check for privileged endpoints
const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const adminKey = req.headers['x-admin-key'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  // Authorized passkeys
  if (adminKey === 'admin2026' || adminKey === 'sarkari@admin' || adminKey === 'admin') {
    next();
    return;
  }
  res.status(401).json({
    error: 'Unauthorized. Administrative credentials required for this operation.',
    code: 'AUTH_REQUIRED',
  });
};

// -------------------------------------------------------------
// 1. PUBLIC RECRUITMENT JOBS ENDPOINTS
// -------------------------------------------------------------

// GET /api/jobs - returns all public recruitment jobs
apiRouter.get('/jobs', (_req: Request, res: Response) => {
  const jobs = db.getJobs();
  res.json({ success: true, count: jobs.length, jobs });
});

// GET /api/jobs/:id - returns single job
apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const job = db.getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json({ success: true, job });
});

// POST /api/jobs - save/update job (Admin only)
apiRouter.post('/jobs', requireAdminAuth, (req: Request, res: Response) => {
  const jobData = req.body;
  if (!jobData || !jobData.id || !jobData.title) {
    res.status(400).json({ error: 'Invalid job data' });
    return;
  }
  const saved = db.saveJob(jobData);
  res.json({ success: true, job: saved });
});

// DELETE /api/jobs/:id - delete job (Admin only)
apiRouter.delete('/jobs/:id', requireAdminAuth, (req: Request, res: Response) => {
  const deleted = db.deleteJob(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json({ success: true, message: 'Job deleted successfully' });
});

// -------------------------------------------------------------
// 2. AI AUTOMATION DASHBOARD & STATS
// -------------------------------------------------------------

apiRouter.get('/automation/stats', (_req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  res.json({ success: true, stats });
});

apiRouter.get('/automation/config', (_req: Request, res: Response) => {
  const config = db.getConfig();
  res.json({ success: true, config });
});

apiRouter.put('/automation/config', requireAdminAuth, (req: Request, res: Response) => {
  const updates = req.body;
  const config = db.updateConfig(updates);
  res.json({ success: true, config });
});

apiRouter.get('/automation/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 100;
  const logs = db.getLogs(limit);
  res.json({ success: true, count: logs.length, logs });
});

// -------------------------------------------------------------
// 3. OFFICIAL SOURCE MANAGEMENT (Module 1)
// -------------------------------------------------------------

// GET /api/automation/sources - list all configured monitoring sources
apiRouter.get('/automation/sources', (_req: Request, res: Response) => {
  const sources = db.getSources();
  res.json({ success: true, count: sources.length, sources });
});

// POST /api/automation/sources - add or update official source
apiRouter.post('/automation/sources', requireAdminAuth, (req: Request, res: Response) => {
  const src = req.body as OfficialSource;
  if (!src.name || !src.websiteUrl) {
    res.status(400).json({ error: 'Source name and website URL are mandatory' });
    return;
  }

  // Validate website URL
  const safety = isSafePublicUrl(src.websiteUrl);
  if (!safety.safe) {
    res.status(400).json({ error: `Invalid source website URL: ${safety.reason}` });
    return;
  }

  if (src.noticeBoardUrl) {
    const noticeSafety = isSafePublicUrl(src.noticeBoardUrl);
    if (!noticeSafety.safe) {
      res.status(400).json({ error: `Invalid notice board URL: ${noticeSafety.reason}` });
      return;
    }
  }

  const sourceToSave: OfficialSource = {
    ...src,
    id: src.id || `src-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: src.status || 'active',
    isEnabled: src.isEnabled !== undefined ? src.isEnabled : true,
    frequencyMinutes: src.frequencyMinutes || 60,
    totalDetected: src.totalDetected || 0,
    totalPublished: src.totalPublished || 0,
    createdAt: src.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveSource(sourceToSave);
  db.addLog({
    id: `log-src-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    action: 'SOURCE_CONFIGURED',
    details: `Official source "${saved.name}" (${saved.shortName}) saved successfully.`,
    sourceId: saved.id,
  });

  res.json({ success: true, source: saved });
});

// DELETE /api/automation/sources/:id - delete official source
apiRouter.delete('/automation/sources/:id', requireAdminAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = db.deleteSource(id);
  if (!deleted) {
    res.status(404).json({ error: 'Source not found' });
    return;
  }
  db.addLog({
    id: `log-src-del-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'warn',
    action: 'SOURCE_DELETED',
    details: `Official source ID ${id} removed from monitoring registry.`,
    sourceId: id,
  });
  res.json({ success: true, message: 'Source removed successfully' });
});

// POST /api/automation/sources/:id/check - trigger immediate check for a source
apiRouter.post('/automation/sources/:id/check', requireAdminAuth, async (req: Request, res: Response) => {
  const result = await triggerSourceCheck(req.params.id);
  res.json({ success: result.success, newNotices: result.newNoticesCount, error: result.error });
});

// POST /api/automation/check-all - trigger immediate sweep across all enabled sources
apiRouter.post('/automation/check-all', requireAdminAuth, async (_req: Request, res: Response) => {
  const result = await triggerAllSourcesCheck();
  res.json({ success: true, checkedCount: result.checked, newNotices: result.totalNew });
});

// -------------------------------------------------------------
// 4. DETECTED NOTICES & PUBLISHING WORKFLOW
// -------------------------------------------------------------

// GET /api/automation/notices - list detected notices with optional status filter
apiRouter.get('/automation/notices', (req: Request, res: Response) => {
  const statusFilter = req.query.status as string;
  let notices = db.getNotices();
  if (statusFilter && statusFilter !== 'all') {
    notices = notices.filter((n) => n.status === statusFilter);
  }
  res.json({ success: true, count: notices.length, notices });
});

// GET /api/automation/notices/:id - single notice details
apiRouter.get('/automation/notices/:id', (req: Request, res: Response) => {
  const notice = db.getNotice(req.params.id);
  if (!notice) {
    res.status(404).json({ error: 'Notice not found' });
    return;
  }
  res.json({ success: true, notice });
});

// PUT /api/automation/notices/:id - update notice (editing extracted fields or article)
apiRouter.put('/automation/notices/:id', requireAdminAuth, (req: Request, res: Response) => {
  const existing = db.getNotice(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Notice not found' });
    return;
  }

  const updates = req.body;
  const merged: DetectedNotice = {
    ...existing,
    ...updates,
    extractedData: updates.extractedData ? { ...existing.extractedData, ...updates.extractedData } : existing.extractedData,
    hindiArticle: updates.hindiArticle ? { ...existing.hindiArticle, ...updates.hindiArticle } : existing.hindiArticle,
    lastProcessedAt: new Date().toISOString(),
  };

  const saved = db.saveNotice(merged);
  res.json({ success: true, notice: saved });
});

// POST /api/automation/notices/:id/publish - approve & publish to live portal
apiRouter.post('/automation/notices/:id/publish', requireAdminAuth, (req: Request, res: Response) => {
  const notes = req.body.notes || 'Manually approved and published by administrator';
  const result = db.publishNoticeAsJob(req.params.id, notes);
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ success: true, message: 'Notice published successfully to public portal', job: result.job });
});

// POST /api/automation/notices/:id/reject - reject notice
apiRouter.post('/automation/notices/:id/reject', requireAdminAuth, (req: Request, res: Response) => {
  const notice = db.getNotice(req.params.id);
  if (!notice) {
    res.status(404).json({ error: 'Notice not found' });
    return;
  }

  notice.status = 'rejected';
  notice.errorMessage = req.body.reason || 'Rejected by administrator';
  db.saveNotice(notice);

  db.addLog({
    id: `log-rej-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'warn',
    action: 'NOTICE_REJECTED',
    details: `Notice "${notice.noticeTitle}" was marked as rejected: ${notice.errorMessage}`,
    sourceId: notice.sourceId,
    noticeId: notice.id,
  });

  res.json({ success: true, message: 'Notice marked as rejected' });
});

// POST /api/automation/notices/:id/retry - re-extract and re-generate
apiRouter.post('/automation/notices/:id/retry', requireAdminAuth, async (req: Request, res: Response) => {
  const notice = db.getNotice(req.params.id);
  if (!notice) {
    res.status(404).json({ error: 'Notice not found' });
    return;
  }

  try {
    notice.status = 'processing';
    notice.retryCount = (notice.retryCount || 0) + 1;
    db.saveNotice(notice);

    const config = db.getConfig();
    const rawText = notice.extractedData?.rawTextExcerpt || notice.noticeTitle;

    const extracted = await extractRecruitmentData(rawText, notice.sourceUrl, notice.sourceName, config.aiModel);
    notice.extractedData = extracted;

    const hindiArticle = await generateHindiArticle(extracted, notice.sourceUrl, config.aiModel);
    notice.hindiArticle = hindiArticle;

    notice.status = extracted.confidenceScore >= config.minConfidenceForAutoPublish ? 'draft-ready' : 'verification-required';
    notice.lastProcessedAt = new Date().toISOString();
    notice.errorMessage = undefined;

    db.saveNotice(notice);
    res.json({ success: true, notice });
  } catch (err: any) {
    notice.status = 'failed';
    notice.errorMessage = err.message || 'Retry extraction failed';
    db.saveNotice(notice);
    res.status(500).json({ error: notice.errorMessage });
  }
});

// POST /api/automation/manual-notice - upload or paste manual notice for extraction & Hindi article generation
apiRouter.post('/automation/manual-notice', requireAdminAuth, async (req: Request, res: Response) => {
  const { title, sourceName, sourceUrl, noticeText, advtNo } = req.body;

  if (!title || !noticeText) {
    res.status(400).json({ error: 'Notice title and notice text are required' });
    return;
  }

  try {
    const config = db.getConfig();
    const finalSourceUrl = sourceUrl || 'https://sarkariportal.gov.in/manual-upload';
    const finalSourceName = sourceName || 'Official Recruitment Notice';
    const docHash = computeNoticeHash(finalSourceUrl, title, new Date().toISOString().split('T')[0]);

    const noticeId = `notif-manual-${Date.now()}`;
    const newNotice: DetectedNotice = {
      id: noticeId,
      sourceId: 'src-manual-upload',
      sourceName: finalSourceName,
      sourceUrl: finalSourceUrl,
      noticeTitle: title,
      noticeDate: new Date().toISOString().split('T')[0],
      advtNo: advtNo || `MANUAL-${new Date().getFullYear()}`,
      documentHash: docHash,
      detectedAt: new Date().toISOString(),
      status: 'processing',
      retryCount: 0,
      lastProcessedAt: new Date().toISOString(),
    };

    db.saveNotice(newNotice);

    // AI extraction
    const extracted = await extractRecruitmentData(noticeText, finalSourceUrl, finalSourceName, config.aiModel);
    newNotice.extractedData = extracted;

    // Hindi article generation
    const hindiArticle = await generateHindiArticle(extracted, finalSourceUrl, config.aiModel);
    newNotice.hindiArticle = hindiArticle;

    newNotice.status = 'draft-ready';
    newNotice.lastProcessedAt = new Date().toISOString();

    db.saveNotice(newNotice);

    db.addLog({
      id: `log-man-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'success',
      action: 'MANUAL_NOTICE_PROCESSED',
      details: `Manual recruitment notice "${title}" extracted and draft Hindi article generated.`,
      noticeId: newNotice.id,
    });

    res.json({ success: true, notice: newNotice });
  } catch (err: any) {
    res.status(500).json({ error: `Manual processing failed: ${err.message}` });
  }
});
