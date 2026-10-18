import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  X, 
  Save, 
  Search,
  Filter,
  Sliders,
  ShieldCheck,
  Check,
  Power
} from 'lucide-react';
import { OfficialSource } from '../../types/automation';
import { SectorId } from '../../types/job';
import { SECTORS } from '../../data/sectors';
import { automationService } from '../../services/automationService';

export const AdminSourcesTab: React.FC = () => {
  const [sources, setSources] = useState<OfficialSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingSourceId, setCheckingSourceId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Add / Edit Modal state
  const [editingSource, setEditingSource] = useState<OfficialSource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const data = await automationService.getSources();
      setSources(data);
    } catch (err) {
      console.error('Failed to load official sources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleOpenAdd = () => {
    const newSrc: OfficialSource = {
      id: '',
      name: '',
      shortName: '',
      websiteUrl: 'https://',
      noticeBoardUrl: 'https://',
      category: 'upsc',
      sourceType: 'html',
      frequencyMinutes: 60,
      isEnabled: true,
      status: 'active',
      totalDetected: 0,
      totalPublished: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingSource(newSrc);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (source: OfficialSource) => {
    setEditingSource({ ...source });
    setIsModalOpen(true);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;

    try {
      const saved = await automationService.saveSource(editingSource);
      setSources(prev => {
        const idx = prev.findIndex(s => s.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setIsModalOpen(false);
      setFeedbackMessage(`Official source "${saved.shortName}" saved successfully.`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to save source: ${err.message}`);
    }
  };

  const handleDeleteSource = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the monitoring registry?`)) {
      return;
    }

    try {
      await automationService.deleteSource(id);
      setSources(prev => prev.filter(s => s.id !== id));
      setFeedbackMessage(`Removed source "${name}".`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to remove source: ${err.message}`);
    }
  };

  const handleToggleEnable = async (source: OfficialSource) => {
    try {
      const updated = await automationService.saveSource({
        ...source,
        isEnabled: !source.isEnabled,
      });
      setSources(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err: any) {
      alert(`Error toggling source status: ${err.message}`);
    }
  };

  const handleCheckSourceNow = async (source: OfficialSource) => {
    setCheckingSourceId(source.id);
    setFeedbackMessage(`Checking live portal for ${source.shortName}...`);
    try {
      const res = await automationService.checkSource(source.id);
      if (res.success) {
        setFeedbackMessage(`Check completed for ${source.shortName}: Found ${res.newNotices} new recruitment notice(s).`);
        await loadSources();
      } else {
        setFeedbackMessage(`Check failed: ${res.error || 'Connection error'}`);
      }
    } catch (err: any) {
      setFeedbackMessage(`Error checking source: ${err.message}`);
    } finally {
      setCheckingSourceId(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const filteredSources = sources.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.shortName.toLowerCase().includes(q) ||
      s.websiteUrl.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Official Recruitment Sources Management
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                {sources.length} Configured
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage verified government portals, notice boards, RSS feeds, and monitoring frequencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Official Source</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-2 animate-in fade-in">
            <span>{feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage(null)} className="text-blue-500 hover:text-blue-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Search & Sources Table */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden space-y-3">
        
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources by name, category, or URL..."
              className="w-full text-xs px-3 py-1.5 pl-8 pr-7 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1.5 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Showing {filteredSources.length} of {sources.length} sources
          </span>
        </div>

        {/* Sources Cards / Table List */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xs divide-y divide-slate-100">
          {filteredSources.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching sources found.
            </div>
          ) : (
            filteredSources.map((source) => {
              const isChecking = checkingSourceId === source.id;

              return (
                <div key={source.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Organization & URLs */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold text-slate-900 text-sm">
                        {source.name}
                      </span>
                      <span className="font-bold text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded text-[10px] border border-blue-200">
                        {source.shortName}
                      </span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded text-[10px] uppercase">
                        {source.category}
                      </span>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        !source.isEnabled ? 'bg-slate-200 text-slate-600' :
                        source.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {!source.isEnabled ? 'DISABLED' : source.status.toUpperCase()}
                      </span>
                    </div>

                    {/* URLs */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-700 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>Portal: {source.websiteUrl}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      {source.noticeBoardUrl && source.noticeBoardUrl !== source.websiteUrl && (
                        <a
                          href={source.noticeBoardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-700 hover:underline flex items-center gap-1 font-mono text-[11px] text-slate-600"
                        >
                          <span>Notice Board ↗</span>
                        </a>
                      )}
                    </div>

                    {/* Monitoring Metadata */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Freq: Every {source.frequencyMinutes || 60}m</span>
                      </span>
                      <span>·</span>
                      <span>
                        Last Checked: {source.lastChecked ? new Date(source.lastChecked).toLocaleTimeString() : 'Never'}
                      </span>
                      <span>·</span>
                      <span>
                        Detected: <strong className="text-slate-800">{source.totalDetected || 0}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Published: <strong className="text-emerald-700">{source.totalPublished || 0}</strong>
                      </span>
                    </div>

                    {/* Error message if any */}
                    {source.lastErrorMessage && (
                      <div className="text-[10px] text-red-700 bg-red-50 border border-red-200 p-1.5 rounded flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{source.lastErrorMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    
                    {/* Check Now Button */}
                    <button
                      onClick={() => handleCheckSourceNow(source)}
                      disabled={isChecking || !source.isEnabled}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      title="Trigger immediate check on this recruitment board"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-blue-600' : ''}`} />
                      <span>{isChecking ? 'Checking...' : 'Check Now'}</span>
                    </button>

                    {/* Enable / Disable toggle */}
                    <button
                      onClick={() => handleToggleEnable(source)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        source.isEnabled 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200'
                      }`}
                      title={source.isEnabled ? 'Disable this source' : 'Enable this source'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Source */}
                    <button
                      onClick={() => handleOpenEdit(source)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Edit source parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Source */}
                    <button
                      onClick={() => handleDeleteSource(source.id, source.shortName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Remove source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Add / Edit Official Source */}
      {isModalOpen && editingSource && (
        <div className="fixed inset-0 z-60 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Official Source Configuration">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />
          
          <div className="min-h-full flex items-center justify-center p-3 sm:p-5">
            <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {editingSource.id ? 'Edit Official Recruitment Source' : 'Add New Official Source'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure government portal URLs and monitoring schedule
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveSource} className="p-5 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Organization Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Staff Selection Commission (SSC)"
                    value={editingSource.name}
                    onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Short Code / Acronym *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SSC, UPSC, RRB, UP Police"
                      value={editingSource.shortName}
                      onChange={(e) => setEditingSource({ ...editingSource, shortName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Recruitment Category / Sector
                    </label>
                    <select
                      value={editingSource.category}
                      onChange={(e) => setEditingSource({ ...editingSource, category: e.target.value as SectorId })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 bg-white"
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
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Official Portal Website URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://ssc.gov.in"
                    value={editingSource.websiteUrl}
                    onChange={(e) => setEditingSource({ ...editingSource, websiteUrl: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Notice-Board / Latest News URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://ssc.gov.in/candidate-portal/latest-news"
                    value={editingSource.noticeBoardUrl}
                    onChange={(e) => setEditingSource({ ...editingSource, noticeBoardUrl: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    If separate from main website, specify regional or candidate bulletin notice-board URL.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Source Format / Type
                    </label>
                    <select
                      value={editingSource.sourceType}
                      onChange={(e) => setEditingSource({ ...editingSource, sourceType: e.target.value as any })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="html">HTML Web Page / Notice Board</option>
                      <option value="rss">Official RSS Feed</option>
                      <option value="api">Official REST / JSON API</option>
                      <option value="pdf">Direct PDF Gazettes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Monitoring Frequency (Minutes)
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={1440}
                      value={editingSource.frequencyMinutes}
                      onChange={(e) => setEditingSource({ ...editingSource, frequencyMinutes: parseInt(e.target.value, 10) || 60 })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Editorial Notes / Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Staff recruitment for Group B & C posts"
                    value={editingSource.notes || ''}
                    onChange={(e) => setEditingSource({ ...editingSource, notes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Official Source</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
