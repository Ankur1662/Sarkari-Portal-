import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon 
} from 'lucide-react';
import { automationService } from '../services/automationService';
import { DetectedNotice } from '../types/automation';

interface ManualNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (notice: DetectedNotice) => void;
}

export const ManualNoticeModal: React.FC<ManualNoticeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [sourceName, setSourceName] = useState('Staff Selection Commission (SSC)');
  const [sourceUrl, setSourceUrl] = useState('https://ssc.gov.in');
  const [advtNo, setAdvtNo] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !noticeText.trim()) {
      setError('Please provide notice title and official notice text.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const notice = await automationService.submitManualNotice({
        title: title.trim(),
        sourceName: sourceName.trim(),
        sourceUrl: sourceUrl.trim(),
        advtNo: advtNo.trim(),
        noticeText: noticeText.trim(),
      });
      setIsLoading(false);
      onSuccess(notice);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to extract and process manual notice.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Manual Notice Processing">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Manual Notice & Document Processing
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Process official PDFs or notices when direct scraping is restricted
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recruitment Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSC CGL 2026 Examination Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Advertisement Number (Advt No)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 05/2026-CSP or CEN 04/2026"
                  value={advtNo}
                  onChange={(e) => setAdvtNo(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Organization / Recruitment Board
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Selection Commission (SSC)"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Official Source / PDF URL
                </label>
                <input
                  type="url"
                  placeholder="https://ssc.gov.in/notice.pdf"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Notice Text / PDF Extract *
              </label>
              <textarea
                required
                rows={7}
                placeholder="Paste the full text of the official notification, dates, eligibility criteria, vacancy details, and application instructions here..."
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                The AI extraction engine will parse dates, vacancies, eligibility, and generate a 14-section Hindi recruitment article.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing & Generating Article...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Extract & Generate Draft</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
