import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  RotateCcw, 
  Save, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ExternalLink,
  Layers,
  Sparkles,
  Download,
  Copy,
  SlidersHorizontal,
  Bell,
  Bot,
  Building2
} from 'lucide-react';
import { JobNotification, NotificationAlert, SectorId, JobCategory, QualificationLevel } from '../types/job';
import { SECTORS } from '../data/sectors';
import { MOCK_JOBS } from '../data/mockJobs';
import { INITIAL_NOTIFICATIONS } from '../data/initialNotifications';
import { AdminAutomationTab } from './admin/AdminAutomationTab';
import { AdminSourcesTab } from './admin/AdminSourcesTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobNotification[];
  onSaveJob: (job: JobNotification) => void;
  onDeleteJob: (jobId: string) => void;
  onResetToDefault: () => void;
  notifications: NotificationAlert[];
  onAddNotification: (notif: NotificationAlert) => void;
  onDeleteNotification: (notifId: string) => void;
  onSelectJobForPreview: (job: JobNotification) => void;
  isAuthenticated?: boolean;
  onOpenAuth?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  jobs,
  onSaveJob,
  onDeleteJob,
  onResetToDefault,
  notifications,
  onAddNotification,
  onDeleteNotification,
  onSelectJobForPreview,
  isAuthenticated = true,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'alerts' | 'automation' | 'sources'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<SectorId | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | 'all'>('all');

  // Modal for Create/Edit Job
  const [editingJob, setEditingJob] = useState<JobNotification | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  // Modal for Delete Confirmation
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<JobNotification | null>(null);

  // New Flash Alert state
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertDesc, setNewAlertDesc] = useState('');
  const [newAlertSector, setNewAlertSector] = useState<SectorId>('upsc');
  const [newAlertUrgent, setNewAlertUrgent] = useState(true);

  if (!isOpen) return null;

  if (isAuthenticated === false) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
              <p className="text-xs text-slate-500 mt-1">
                Administrative desk functions require verified administrator authorization.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              {onOpenAuth && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Sign In as Administrator
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter((j) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        j.title.toLowerCase().includes(q) ||
        j.shortOrg.toLowerCase().includes(q) ||
        j.advtNo.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (sectorFilter !== 'all' && j.sector !== sectorFilter) return false;
    if (categoryFilter !== 'all' && j.categoryType !== categoryFilter) return false;
    return true;
  });

  const handleOpenCreateNew = () => {
    const emptyJob: JobNotification = {
      id: `job-custom-${Date.now()}`,
      title: '',
      postName: '',
      organization: '',
      shortOrg: '',
      advtNo: `ADVT-${new Date().getFullYear()}/01`,
      sector: 'upsc',
      sectorName: 'UPSC & Civil Services',
      categoryType: 'latest-jobs',
      vacancies: 100,
      qualification: "Bachelor's Degree in Any Stream from Recognized University",
      qualificationLevel: 'graduate',
      ageLimit: {
        min: 18,
        max: 30,
        asOfDate: '01/08/2026',
        relaxation: 'OBC: 3 Years, SC/ST: 5 Years, PwD: 10 Years',
      },
      importantDates: {
        startDate: new Date().toISOString().split('T')[0],
        lastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        feeLastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        examDate: 'Coming Soon 2026',
        admitCardDate: 'To be notified',
      },
      applicationFee: {
        genObcEws: 100,
        scStPh: 0,
        female: 0,
        paymentModes: 'Online Net Banking / Debit Card / UPI',
      },
      state: 'All India',
      payScale: 'Level 7 (₹44,900 - ₹1,42,400)',
      status: 'Active',
      isUrgent: false,
      isHot: true,
      notificationPdfUrl: 'https://upsc.gov.in',
      applyUrl: 'https://upsconline.nic.in',
      officialWebsite: 'https://upsc.gov.in',
      categoryBreakdown: {
        ur: 40,
        obc: 27,
        ews: 10,
        sc: 15,
        st: 8,
      },
      selectionProcess: [
        'Written Examination (Objective / CBT)',
        'Personal Interview / Skill Assessment',
        'Document Verification & Medical Examination',
      ],
      brief: 'Recruitment notification published by the department. Candidates must read the instructions carefully before filling out the online form.',
      datePosted: new Date().toISOString().split('T')[0],
    };
    setEditingJob(emptyJob);
    setIsEditingModalOpen(true);
  };

  const handleOpenEdit = (job: JobNotification) => {
    setEditingJob(JSON.parse(JSON.stringify(job)));
    setIsEditingModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob || !editingJob.title.trim()) return;

    // sync sectorName
    const sectorObj = SECTORS.find((s) => s.id === editingJob.sector);
    const updated = {
      ...editingJob,
      sectorName: sectorObj ? sectorObj.name : editingJob.sectorName,
    };

    onSaveJob(updated);
    setIsEditingModalOpen(false);
    setEditingJob(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmJob) {
      onDeleteJob(deleteConfirmJob.id);
      setDeleteConfirmJob(null);
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle.trim()) return;
    const alert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      title: newAlertTitle,
      description: newAlertDesc || 'Official announcement updated on gazette portal.',
      sector: newAlertSector,
      categoryType: 'latest-jobs',
      timestamp: 'Just now',
      isUrgent: newAlertUrgent,
      read: false,
      actionText: 'View Details',
    };
    onAddNotification(alert);
    setNewAlertTitle('');
    setNewAlertDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
          {/* Top Admin Header */}
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-black text-sm">
                ADMIN
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>SarkariPortal Central Management Console</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Control
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish new recruitments, edit information, adjust deadlines & broadcast real-time flash alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenCreateNew}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Job Post</span>
              </button>

              <button
                onClick={onResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                title="Restore default mock dataset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close Admin Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics & Tab Switcher Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'posts'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Manage Posts ({jobs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Flash Alerts ({notifications.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('automation')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'automation'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-red-500" />
                <span>AI Job Monitor & Publishing</span>
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'sources'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Official Sources</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 tabular-nums">
              <span>
                Total Vacancies: <strong className="text-slate-900 font-bold">{jobs.reduce((a, b) => a + (b.vacancies || 0), 0).toLocaleString()}</strong>
              </span>
              <span>·</span>
              <span>
                Admit Cards: <strong className="text-emerald-700 font-bold">{jobs.filter((j) => j.categoryType === 'admit-card' || j.status === 'Admit Card Available').length}</strong>
              </span>
              <span>·</span>
              <span>
                Results: <strong className="text-amber-800 font-bold">{jobs.filter((j) => j.categoryType === 'results' || j.status === 'Result Declared').length}</strong>
              </span>
            </div>
          </div>

          {/* Tab 1: Post Management View */}
          {activeTab === 'posts' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search & Filter Bar */}
              <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center gap-3 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, organization acronym, or advt number..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                </div>

                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Sectors ({jobs.length})</option>
                  {SECTORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Categories</option>
                  <option value="latest-jobs">Latest Jobs</option>
                  <option value="admit-card">Admit Cards</option>
                  <option value="results">Results</option>
                  <option value="answer-key">Answer Keys</option>
                  <option value="syllabus">Syllabus</option>
                </select>

                {(searchQuery || sectorFilter !== 'all' || categoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSectorFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Table of all posts with smooth horizontal scrolling on mobile */}
              <div className="flex-1 overflow-y-auto overflow-x-auto [overflow-scrolling:touch]">
                <table className="w-full text-left text-xs text-slate-600 min-w-[640px]">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="py-3 px-4">Title & Org</th>
                      <th scope="col" className="py-3 px-4">Sector</th>
                      <th scope="col" className="py-3 px-4">Category</th>
                      <th scope="col" className="py-3 px-4 text-right">Vacancies</th>
                      <th scope="col" className="py-3 px-4">Last Date</th>
                      <th scope="col" className="py-3 px-4">Status</th>
                      <th scope="col" className="py-3 px-4 text-center">Manage Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 line-clamp-1 max-w-sm">
                              {job.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {job.shortOrg} · Advt: {job.advtNo}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-medium text-slate-700">{job.sectorName}</span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {job.categoryType}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right tabular-nums font-mono font-bold text-slate-900 whitespace-nowrap">
                            {job.vacancies > 0 ? job.vacancies.toLocaleString() : 'N/A'}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap tabular-nums text-slate-800 font-medium">
                            {job.importantDates.lastDate}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                job.status === 'Closing Soon'
                                  ? 'bg-red-50 text-red-700'
                                  : job.status === 'Admit Card Available'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : job.status === 'Result Declared'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEdit(job)}
                                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit this job"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Preview Button */}
                              <button
                                onClick={() => onSelectJobForPreview(job)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Preview modal view"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeleteConfirmJob(job)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete this post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Flash Alerts & Marquee Ticker Management */}
          {activeTab === 'alerts' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {/* Add New Alert Box */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Broadcast New Live Flash Alert</span>
                </h3>

                <form onSubmit={handleCreateAlert} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alert Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newAlertTitle}
                        onChange={(e) => setNewAlertTitle(e.target.value)}
                        placeholder="e.g. UPSC CSE Prelims 2026 Admit Card Released!"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sector Tag
                      </label>
                      <select
                        value={newAlertSector}
                        onChange={(e) => setNewAlertSector(e.target.value as SectorId)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                      >
                        {SECTORS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Brief Description / Guidance
                    </label>
                    <input
                      type="text"
                      value={newAlertDesc}
                      onChange={(e) => setNewAlertDesc(e.target.value)}
                      placeholder="e.g. Download e-admit card directly using your registration ID..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newAlertUrgent}
                        onChange={(e) => setNewAlertUrgent(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="font-bold text-red-600">Mark as URGENT / Flash Priority</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Broadcast Alert</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Alerts List */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Active Live Ticker Alerts ({notifications.length})
                </h3>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
                  {notifications.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-slate-800 uppercase text-[10px]">
                            {alert.sector}
                          </span>
                          <span>·</span>
                          <span className="tabular-nums">{alert.timestamp}</span>
                          {alert.isUrgent && (
                            <span className="text-red-700 font-bold text-[10px]">URGENT</span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                          {alert.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 line-clamp-1">{alert.description}</p>
                      </div>

                      <button
                        onClick={() => onDeleteNotification(alert.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        title="Delete this alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: AI Monitoring & Publishing Workflow */}
          {activeTab === 'automation' && (
            <AdminAutomationTab onPublishJobToPortal={onSaveJob} />
          )}

          {/* Tab 4: Official Source Management */}
          {activeTab === 'sources' && (
            <AdminSourcesTab />
          )}

          {/* Footer Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              All modifications are persisted automatically and reflected instantly on the live website.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close Console
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Create / Edit Job Form */}
      {isEditingModalOpen && editingJob && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditingModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
            <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
              {/* Form Header */}
              <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {jobs.some((j) => j.id === editingJob.id) ? 'Edit Recruitment Information' : 'Create New Recruitment Post'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Advt ID: {editingJob.id}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveForm} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs">
                {/* 1. Basic Information */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    1. General Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <label className="block font-semibold text-slate-700 mb-1">Post / Exam Title *</label>
                      <input
                        type="text"
                        required
                        value={editingJob.title}
                        onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                        placeholder="e.g. UPSC Civil Services (IAS / IPS) Prelims 2026"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-semibold text-slate-700 mb-1">Short Org Name *</label>
                      <input
                        type="text"
                        required
                        value={editingJob.shortOrg}
                        onChange={(e) => setEditingJob({ ...editingJob, shortOrg: e.target.value })}
                        placeholder="e.g. UPSC, SSC, RRB"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-8">
                      <label className="block font-semibold text-slate-700 mb-1">Full Organization Authority</label>
                      <input
                        type="text"
                        value={editingJob.organization}
                        onChange={(e) => setEditingJob({ ...editingJob, organization: e.target.value })}
                        placeholder="e.g. Union Public Service Commission (UPSC)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-semibold text-slate-700 mb-1">Advt. Number</label>
                      <input
                        type="text"
                        value={editingJob.advtNo}
                        onChange={(e) => setEditingJob({ ...editingJob, advtNo: e.target.value })}
                        placeholder="e.g. 05/2026-CSP"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-semibold text-slate-700 mb-1">Government Sector</label>
                      <select
                        value={editingJob.sector}
                        onChange={(e) => setEditingJob({ ...editingJob, sector: e.target.value as SectorId })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                      >
                        {SECTORS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-semibold text-slate-700 mb-1">Category Type</label>
                      <select
                        value={editingJob.categoryType}
                        onChange={(e) => setEditingJob({ ...editingJob, categoryType: e.target.value as JobCategory })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                      >
                        <option value="latest-jobs">Latest Jobs (Online Form)</option>
                        <option value="admit-card">Admit Card</option>
                        <option value="results">Results</option>
                        <option value="answer-key">Answer Key</option>
                        <option value="syllabus">Syllabus</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-semibold text-slate-700 mb-1">Current Status</label>
                      <select
                        value={editingJob.status}
                        onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                      >
                        <option value="Active">Active (Application Open)</option>
                        <option value="Closing Soon">Closing Soon</option>
                        <option value="Admit Card Available">Admit Card Available</option>
                        <option value="Result Declared">Result Declared</option>
                        <option value="Answer Key Out">Answer Key Out</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Vacancies & Pay Scale */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    2. Vacancies & Compensation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Total Vacancies</label>
                      <input
                        type="number"
                        value={editingJob.vacancies}
                        onChange={(e) => setEditingJob({ ...editingJob, vacancies: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Pay Scale / Salary</label>
                      <input
                        type="text"
                        value={editingJob.payScale}
                        onChange={(e) => setEditingJob({ ...editingJob, payScale: e.target.value })}
                        placeholder="e.g. Level 10 (₹56,100 - ₹1,77,500)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">State / Location</label>
                      <input
                        type="text"
                        value={editingJob.state}
                        onChange={(e) => setEditingJob({ ...editingJob, state: e.target.value })}
                        placeholder="e.g. All India, Uttar Pradesh, Bihar"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Important Dates */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    3. Important Dates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Application Start Date</label>
                      <input
                        type="text"
                        value={editingJob.importantDates.startDate}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            importantDates: { ...editingJob.importantDates, startDate: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Last Date to Apply *</label>
                      <input
                        type="text"
                        required
                        value={editingJob.importantDates.lastDate}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            importantDates: { ...editingJob.importantDates, lastDate: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Exam Date</label>
                      <input
                        type="text"
                        value={editingJob.importantDates.examDate}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            importantDates: { ...editingJob.importantDates, examDate: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Eligibility & Age Limit */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    4. Eligibility & Age Criteria
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">Educational Qualification Description</label>
                      <input
                        type="text"
                        value={editingJob.qualification}
                        onChange={(e) => setEditingJob({ ...editingJob, qualification: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Qualification Level</label>
                      <select
                        value={editingJob.qualificationLevel}
                        onChange={(e) => setEditingJob({ ...editingJob, qualificationLevel: e.target.value as QualificationLevel })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
                      >
                        <option value="10th">10th Pass</option>
                        <option value="12th">12th Pass</option>
                        <option value="graduate">Graduate</option>
                        <option value="engineering">B.E. / B.Tech</option>
                        <option value="diploma">Diploma / ITI</option>
                        <option value="post-graduate">Post Graduate</option>
                        <option value="medical">Medical / Nursing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Min Age</label>
                      <input
                        type="number"
                        value={editingJob.ageLimit.min}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            ageLimit: { ...editingJob.ageLimit, min: parseInt(e.target.value, 10) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Max Age</label>
                      <input
                        type="number"
                        value={editingJob.ageLimit.max}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            ageLimit: { ...editingJob.ageLimit, max: parseInt(e.target.value, 10) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Age Relaxation</label>
                      <input
                        type="text"
                        value={editingJob.ageLimit.relaxation}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            ageLimit: { ...editingJob.ageLimit, relaxation: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Direct Official Links */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    5. Official Direct Links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Online Apply URL</label>
                      <input
                        type="url"
                        value={editingJob.applyUrl}
                        onChange={(e) => setEditingJob({ ...editingJob, applyUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Notification PDF URL</label>
                      <input
                        type="url"
                        value={editingJob.notificationPdfUrl}
                        onChange={(e) => setEditingJob({ ...editingJob, notificationPdfUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Flags */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingJob.isUrgent}
                      onChange={(e) => setEditingJob({ ...editingJob, isUrgent: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900"
                    />
                    <span className="font-bold text-red-600">Mark as Ending Soon / Urgent Notice</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingJob.isHot}
                      onChange={(e) => setEditingJob({ ...editingJob, isHot: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900"
                    />
                    <span className="font-bold text-amber-600">Highlight as Featured Post</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Publish</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Modal */}
      {deleteConfirmJob && (
        <div className="fixed inset-0 z-70 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteConfirmJob(null)}
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Recruitment Post?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to permanently delete:
                <br />
                <strong className="text-slate-900">{deleteConfirmJob.title}</strong>
                <br />
                This action will immediately remove the listing from all boards, categories, and search results.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
