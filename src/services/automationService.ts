import { 
  OfficialSource, 
  DetectedNotice, 
  AutomationConfig, 
  AutomationLog, 
  AutomationDashboardStats 
} from '../types/automation';
import { JobNotification } from '../types/job';

const ADMIN_KEY = 'admin2026';

function getHeaders(isAdmin: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (isAdmin) {
    headers['x-admin-key'] = ADMIN_KEY;
  }
  return headers;
}

export const automationService = {
  // --- Public Jobs ---
  async getJobs(): Promise<JobNotification[]> {
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      return data.jobs || [];
    } catch (err) {
      console.warn('Backend /api/jobs unreachable, returning empty array fallback:', err);
      return [];
    }
  },

  async saveJob(job: JobNotification): Promise<JobNotification> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error('Failed to save job');
    const data = await res.json();
    return data.job;
  },

  async deleteJob(id: string): Promise<boolean> {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.ok;
  },

  // --- Automation Dashboard ---
  async getDashboardStats(): Promise<AutomationDashboardStats | null> {
    try {
      const res = await fetch('/api/automation/stats');
      if (!res.ok) return null;
      const data = await res.json();
      return data.stats;
    } catch {
      return null;
    }
  },

  async getConfig(): Promise<AutomationConfig | null> {
    try {
      const res = await fetch('/api/automation/config');
      if (!res.ok) return null;
      const data = await res.json();
      return data.config;
    } catch {
      return null;
    }
  },

  async updateConfig(updates: Partial<AutomationConfig>): Promise<AutomationConfig | null> {
    const res = await fetch('/api/automation/config', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update automation settings');
    const data = await res.json();
    return data.config;
  },

  async getLogs(limit: number = 100): Promise<AutomationLog[]> {
    try {
      const res = await fetch(`/api/automation/logs?limit=${limit}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  },

  // --- Sources ---
  async getSources(): Promise<OfficialSource[]> {
    try {
      const res = await fetch('/api/automation/sources');
      if (!res.ok) return [];
      const data = await res.json();
      return data.sources || [];
    } catch {
      return [];
    }
  },

  async saveSource(source: OfficialSource): Promise<OfficialSource> {
    const res = await fetch('/api/automation/sources', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(source),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save source');
    }
    const data = await res.json();
    return data.source;
  },

  async deleteSource(id: string): Promise<boolean> {
    const res = await fetch(`/api/automation/sources/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.ok;
  },

  async checkSource(id: string): Promise<{ success: boolean; newNotices: number; error?: string }> {
    const res = await fetch(`/api/automation/sources/${id}/check`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return await res.json();
  },

  async checkAllSources(): Promise<{ success: boolean; checkedCount: number; newNotices: number }> {
    const res = await fetch('/api/automation/check-all', {
      method: 'POST',
      headers: getHeaders(true),
    });
    return await res.json();
  },

  // --- Detected Notices ---
  async getNotices(status?: string): Promise<DetectedNotice[]> {
    try {
      const url = status && status !== 'all' ? `/api/automation/notices?status=${status}` : '/api/automation/notices';
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.notices || [];
    } catch {
      return [];
    }
  },

  async getNotice(id: string): Promise<DetectedNotice | null> {
    try {
      const res = await fetch(`/api/automation/notices/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.notice;
    } catch {
      return null;
    }
  },

  async updateNotice(id: string, updates: Partial<DetectedNotice>): Promise<DetectedNotice> {
    const res = await fetch(`/api/automation/notices/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update notice');
    const data = await res.json();
    return data.notice;
  },

  async publishNotice(id: string, notes?: string): Promise<{ success: boolean; job?: JobNotification; error?: string }> {
    const res = await fetch(`/api/automation/notices/${id}/publish`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to publish notice');
    return data;
  },

  async rejectNotice(id: string, reason?: string): Promise<boolean> {
    const res = await fetch(`/api/automation/notices/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  },

  async retryNotice(id: string): Promise<DetectedNotice> {
    const res = await fetch(`/api/automation/notices/${id}/retry`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to retry extraction');
    const data = await res.json();
    return data.notice;
  },

  async submitManualNotice(payload: {
    title: string;
    sourceName?: string;
    sourceUrl?: string;
    noticeText: string;
    advtNo?: string;
  }): Promise<DetectedNotice> {
    const res = await fetch('/api/automation/manual-notice', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit manual notice');
    }
    const data = await res.json();
    return data.notice;
  },
};
