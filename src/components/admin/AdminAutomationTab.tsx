import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  Edit3, 
  Check, 
  X, 
  RotateCcw, 
  UploadCloud, 
  Filter, 
  Search, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  History,
  Info
} from 'lucide-react';
import { 
  DetectedNotice, 
  AutomationDashboardStats, 
  AutomationConfig, 
  AutomationLog, 
  HindiRecruitmentArticle,
  ExtractedRecruitmentData
} from '../../types/automation';
import { JobNotification, SectorId, JobCategory, QualificationLevel } from '../../types/job';
import { automationService } from '../../services/automationService';
import { HindiArticleModal } from '../HindiArticleModal';
import { ManualNoticeModal } from '../ManualNoticeModal';

interface AdminAutomationTabProps {
  onPublishJobToPortal: (job: JobNotification) => void;
}

export const AdminAutomationTab: React.FC<AdminAutomationTabProps> = ({
  onPublishJobToPortal,
}) => {
  const [stats, setStats] = useState<AutomationDashboardStats | null>(null);
  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [notices, setNotices] = useState<DetectedNotice[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scanning state
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Modals state
  const [selectedArticle, setSelectedArticle] = useState<HindiRecruitmentArticle | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [reviewingNotice, setReviewingNotice] = useState<DetectedNotice | null>(null);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Editable fields in Review Modal
  const [editFormData, setEditFormData] = useState<ExtractedRecruitmentData | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sData, cData, nData, lData] = await Promise.all([
        automationService.getDashboardStats(),
        automationService.getConfig(),
        automationService.getNotices(),
        automationService.getLogs(50),
      ]);
      if (sData) setStats(sData);
      if (cData) setConfig(cData);
      setNotices(nData);
      setLogs(lData);
    } catch (err) {
      console.error('Failed to load automation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s poll for background changes
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoPublish = async () => {
    if (!config) return;
    const newStatus = !config.autoPublishEnabled;
    try {
      const updated = await automationService.updateConfig({ autoPublishEnabled: newStatus });
      if (updated) {
        setConfig(updated);
        setStats(prev => prev ? { ...prev, autoPublishEnabled: newStatus } : null);
        setScanMessage(newStatus ? 'Automatic publishing enabled for verified notices.' : 'Draft-first mode active: All notices require manual admin approval.');
        setTimeout(() => setScanMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Error toggling auto-publish: ${err.message}`);
    }
  };

  const handleScanAllSources = async () => {
    setIsScanningAll(true);
    setScanMessage('Scanning all enabled official recruitment portals (SSC, UPSC, RRBs, State Boards)...');
    try {
      const res = await automationService.checkAllSources();
      setScanMessage(`Scan completed! Checked ${res.checkedCount} sources, detected ${res.newNotices} new recruitment notices.`);
      await loadData();
    } catch (err: any) {
      setScanMessage(`Scan error: ${err.message}`);
    } finally {
      setIsScanningAll(false);
      setTimeout(() => setScanMessage(null), 6000);
    }
  };

  const handleOpenReview = (notice: DetectedNotice) => {
    setReviewingNotice(notice);
    setEditFormData(notice.extractedData ? { ...notice.extractedData } : null);
  };

  const handleSaveDraftChanges = async () => {
    if (!reviewingNotice || !editFormData) return;
    try {
      const updatedNotice = await automationService.updateNotice(reviewingNotice.id, {
        extractedData: editFormData,
      });
      setNotices(prev => prev.map(n => n.id === updatedNotice.id ? updatedNotice : n));
      setReviewingNotice(null);
      setScanMessage('Notice details updated successfully.');
      setTimeout(() => setScanMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to save draft changes: ${err.message}`);
    }
  };

  const handlePublishNotice = async (noticeId: string) => {
    try {
      const res = await automationService.publishNotice(noticeId, 'Manually approved and published via AI Automation Dashboard');
      if (res.success && res.job) {
        onPublishJobToPortal(res.job);
        setScanMessage(`Successfully published "${res.job.title}" to public portal!`);
        setReviewingNotice(null);
        await loadData();
        setTimeout(() => setScanMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Failed to publish notice: ${err.message}`);
    }
  };

  const handleRejectNotice = async (noticeId: string) => {
    const reason = prompt('Please specify a rejection or archival reason:', 'Duplicate notice or outdated recruitment');
    if (!reason) return;
    try {
      await automationService.rejectNotice(noticeId, reason);
      setReviewingNotice(null);
      await loadData();
    } catch (err: any) {
      alert(`Failed to reject notice: ${err.message}`);
    }
  };

  const handleRetryNotice = async (noticeId: string) => {
    try {
      setScanMessage('Re-analyzing notice with Gemini AI extraction engine...');
      const updated = await automationService.retryNotice(noticeId);
      setNotices(prev => prev.map(n => n.id === updated.id ? updated : n));
      setScanMessage('Notice re-extracted successfully.');
      setTimeout(() => setScanMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to retry notice: ${err.message}`);
    }
  };

  const filteredNotices = notices.filter(n => {
    if (statusFilter !== 'all' && n.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        n.noticeTitle.toLowerCase().includes(q) ||
        n.sourceName.toLowerCase().includes(q) ||
        (n.advtNo && n.advtNo.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      
      {/* 1. Header Banner & Auto-Publish Master Switch */}
      <div className="bg-white border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Bot className="w-5 h-5 text-red-600" />
                <span>AI Government Job Monitoring & Auto-Publishing Engine</span>
              </h3>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full border border-red-200">
                Server Authority Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Monitors official recruitment portals, extracts structured gazette data via Gemini AI, generates 14-section Hindi recruitment articles, and manages publishing workflows.
            </p>
          </div>

          {/* Action Buttons & Master Auto-Publish Toggle */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Master Auto-Publish Toggle (Disabled by default as mandated) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 sm:px-3 sm:py-2 flex items-center gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-900">Auto-Publish:</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    config?.autoPublishEnabled 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {config?.autoPublishEnabled ? 'ENABLED' : 'DISABLED (Draft First)'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  Min {config?.minConfidenceForAutoPublish || 90}% confidence required
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoPublish}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  config?.autoPublishEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
                title="Toggle automatic publishing for verified recruitment notices"
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            <button
              onClick={handleScanAllSources}
              disabled={isScanningAll}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningAll ? 'animate-spin' : ''}`} />
              <span>{isScanningAll ? 'Scanning Portals...' : 'Scan All Sources Now'}</span>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
              <span>Manual Notice / PDF</span>
            </button>

            <button
              onClick={() => setShowLogsDrawer(!showLogsDrawer)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              title="Audit Logs"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Feedback Toast */}
        {scanMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{scanMessage}</span>
            </div>
            <button onClick={() => setScanMessage(null)} className="text-blue-500 hover:text-blue-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Top Metric Cards */}
      <div className="p-4 sm:p-5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-white">
        
        {/* Monitored Sources */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Sources Monitored
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              {stats?.sourcesMonitored || 7}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
              {stats?.activeSources || 7} Active
            </span>
          </div>
        </div>

        {/* Detected Notices */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Notices Detected
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-blue-700 font-mono">
              {stats?.notificationsDetected || notices.length}
            </span>
            <span className="text-[10px] text-slate-400">Total</span>
          </div>
        </div>

        {/* Draft Articles Ready */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Draft Articles Ready
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-indigo-700 font-mono">
              {notices.filter(n => n.status === 'draft-ready').length}
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
              Hindi Ready
            </span>
          </div>
        </div>

        {/* Verification Required */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Verification Needed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-amber-700 font-mono">
              {notices.filter(n => n.status === 'verification-required').length}
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
              Review
            </span>
          </div>
        </div>

        {/* Published Articles */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Published Live
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {notices.filter(n => n.status === 'published').length}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
              Active
            </span>
          </div>
        </div>

        {/* Duplicate / Skipped */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Duplicates Blocked
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-600 font-mono">
              {stats?.duplicatesSkipped || 0}
            </span>
            <span className="text-[10px] text-slate-400">SHA-256</span>
          </div>
        </div>

      </div>

      {/* 3. Filter Bar & Queue Table */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden space-y-3">
        
        {/* Filter Buttons & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: `All (${notices.length})` },
              { id: 'draft-ready', label: `Draft Ready (${notices.filter(n => n.status === 'draft-ready').length})` },
              { id: 'verification-required', label: `Needs Review (${notices.filter(n => n.status === 'verification-required').length})` },
              { id: 'published', label: `Published (${notices.filter(n => n.status === 'published').length})` },
              { id: 'rejected', label: `Rejected (${notices.filter(n => n.status === 'rejected').length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices, advt no..."
              className="w-full text-xs px-3 py-1.5 pl-8 pr-7 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1.5 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notice Items Queue List */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xs divide-y divide-slate-100">
          {filteredNotices.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Bot className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No recruitment notices found in this queue.</p>
              <button
                onClick={handleScanAllSources}
                className="text-red-600 font-bold hover:underline"
              >
                Scan official recruitment sources now
              </button>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const ext = notice.extractedData;
              const hasArticle = Boolean(notice.hindiArticle);
              const conf = ext?.confidenceScore || 0;

              return (
                <div key={notice.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Metadata & Titles */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    
                    {/* Top row: Source badge + advtNo + date */}
                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {notice.sourceName}
                      </span>
                      {notice.advtNo && (
                        <span className="font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {notice.advtNo}
                        </span>
                      )}
                      <span className="text-slate-400">
                        Detected: {new Date(notice.detectedAt).toLocaleDateString()}
                      </span>

                      {/* Confidence Score Pill */}
                      {conf > 0 && (
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          conf >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          conf >= 75 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {conf}% Verified
                        </span>
                      )}

                      {/* Status Tag */}
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        notice.status === 'published' ? 'bg-emerald-600 text-white' :
                        notice.status === 'draft-ready' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                        notice.status === 'verification-required' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        notice.status === 'rejected' ? 'bg-slate-200 text-slate-700' :
                        'bg-blue-100 text-blue-900 animate-pulse'
                      }`}>
                        {notice.status === 'published' ? 'PUBLISHED LIVE' :
                         notice.status === 'draft-ready' ? 'DRAFT READY' :
                         notice.status === 'verification-required' ? 'NEEDS REVIEW' :
                         notice.status === 'rejected' ? 'REJECTED' : 'PROCESSING'}
                      </span>
                    </div>

                    {/* Notice Headline */}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {ext?.recruitmentTitle || notice.noticeTitle}
                    </h4>

                    {/* Extracted snapshot */}
                    {ext && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                        {ext.vacancies > 0 && (
                          <span className="font-bold text-slate-800">
                            {ext.vacancies.toLocaleString()} Posts
                          </span>
                        )}
                        {ext.importantDates?.lastDate && (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Last Date: {ext.importantDates.lastDate}</span>
                          </span>
                        )}
                        {ext.qualification && (
                          <span className="text-slate-500 truncate max-w-[200px]">
                            Qual: {ext.qualification}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Verification Flags (if any) */}
                    {ext && ext.verificationFlags.length > 0 && (
                      <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Flag: {ext.verificationFlags[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    
                    {/* View Hindi Article */}
                    {hasArticle && (
                      <button
                        onClick={() => setSelectedArticle(notice.hindiArticle || null)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Read generated 14-section Hindi article"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-red-600" />
                        <span>Hindi Guide</span>
                      </button>
                    )}

                    {/* Official Notice link */}
                    <a
                      href={notice.documentUrl || notice.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                      title="Open official government source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Source</span>
                    </a>

                    {/* Review & Edit Modal Trigger */}
                    <button
                      onClick={() => handleOpenReview(notice)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Review & Edit</span>
                    </button>

                    {/* Quick Approve & Publish (if not yet published) */}
                    {notice.status !== 'published' && (
                      <button
                        onClick={() => handlePublishNotice(notice.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        title="Publish recruitment notice directly to live SarkariPortal"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish Live</span>
                      </button>
                    )}

                    {/* Retry button */}
                    {notice.status !== 'published' && (
                      <button
                        onClick={() => handleRetryNotice(notice.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Retry AI extraction"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: Hindi Article Modal */}
      <HindiArticleModal
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
        isAdmin={true}
        onSaveArticle={(updated) => {
          setSelectedArticle(updated);
          // Sync with notice if present
          const notice = notices.find(n => n.hindiArticle?.id === updated.id);
          if (notice) {
            automationService.updateNotice(notice.id, { hindiArticle: updated });
          }
        }}
      />

      {/* MODAL 2: Manual Notice Modal */}
      <ManualNoticeModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={async (newNotice) => {
          setScanMessage(`Manual notice "${newNotice.noticeTitle}" processed into draft successfully!`);
          await loadData();
          setTimeout(() => setScanMessage(null), 4000);
        }}
      />

      {/* MODAL 3: Notice Review & Edit Modal */}
      {reviewingNotice && editFormData && (
        <div className="fixed inset-0 z-60 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Review & Edit Recruitment Notice">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity" onClick={() => setReviewingNotice(null)} />
          
          <div className="min-h-full flex items-center justify-center p-3 sm:p-5">
            <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Review & Edit Recruitment Data
                    </h3>
                    <p className="text-xs text-slate-400">
                      Verify extracted dates, eligibility, and official URLs before publishing
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewingNotice(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
                
                {/* Official Source Comparison Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-amber-950">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Official Source Reference: {reviewingNotice.sourceName}</span>
                    </span>
                    <a
                      href={reviewingNotice.documentUrl || reviewingNotice.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-700 hover:underline flex items-center gap-1 text-xs"
                    >
                      <span>Open Official Notice PDF / Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {editFormData.rawTextExcerpt && (
                    <p className="text-[11px] text-amber-900 font-mono bg-white/70 p-2 rounded border border-amber-200/60 leading-relaxed max-h-24 overflow-y-auto">
                      "{editFormData.rawTextExcerpt}"
                    </p>
                  )}
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Recruitment Title *
                    </label>
                    <input
                      type="text"
                      value={editFormData.recruitmentTitle}
                      onChange={(e) => setEditFormData({ ...editFormData, recruitmentTitle: e.target.value })}
                      className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Advertisement No.
                    </label>
                    <input
                      type="text"
                      value={editFormData.advtNo}
                      onChange={(e) => setEditFormData({ ...editFormData, advtNo: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={editFormData.organization}
                      onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Short Code (e.g. SSC, UPSC)
                    </label>
                    <input
                      type="text"
                      value={editFormData.shortOrg}
                      onChange={(e) => setEditFormData({ ...editFormData, shortOrg: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Total Vacancies
                    </label>
                    <input
                      type="number"
                      value={editFormData.vacancies}
                      onChange={(e) => setEditFormData({ ...editFormData, vacancies: parseInt(e.target.value, 10) || 0 })}
                      className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Important Dates */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Important Application & Examination Dates</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={editFormData.importantDates.startDate}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          importantDates: { ...editFormData.importantDates, startDate: e.target.value }
                        })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-rose-700 mb-1">Last Date (Deadline) *</label>
                      <input
                        type="text"
                        value={editFormData.importantDates.lastDate}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          importantDates: { ...editFormData.importantDates, lastDate: e.target.value }
                        })}
                        className="w-full text-xs font-bold text-rose-800 p-2 rounded-lg border border-rose-300 bg-rose-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Fee Payment Last Date</label>
                      <input
                        type="text"
                        value={editFormData.importantDates.feeLastDate}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          importantDates: { ...editFormData.importantDates, feeLastDate: e.target.value }
                        })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Exam Date</label>
                      <input
                        type="text"
                        value={editFormData.importantDates.examDate}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          importantDates: { ...editFormData.importantDates, examDate: e.target.value }
                        })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Eligibility & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Educational Qualification
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.qualification}
                      onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Pay Scale / Salary
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.payScale}
                      onChange={(e) => setEditFormData({ ...editFormData, payScale: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                {/* Official URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Official Notification PDF URL *
                    </label>
                    <input
                      type="url"
                      value={editFormData.officialNotificationUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, officialNotificationUrl: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Official Application Portal URL *
                    </label>
                    <input
                      type="url"
                      value={editFormData.officialApplicationUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, officialApplicationUrl: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRejectNotice(reviewingNotice.id)}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  Reject Notice
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraftChanges}
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Save Draft Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublishNotice(reviewingNotice.id)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Publish to SarkariPortal</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DRAWER: Audit Logs */}
      {showLogsDrawer && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-400" />
              <span>Monitoring Audit Logs</span>
            </h4>
            <button onClick={() => setShowLogsDrawer(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-2.5 text-xs">
            {logs.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No logs available.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold uppercase ${
                      log.level === 'error' ? 'text-red-700' :
                      log.level === 'warn' ? 'text-amber-700' :
                      log.level === 'success' ? 'text-emerald-700' : 'text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-snug">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
