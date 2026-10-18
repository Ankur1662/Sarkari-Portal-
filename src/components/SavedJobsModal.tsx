import React from 'react';
import { X, Bookmark, Trash2, ArrowUpRight, Calendar, Users } from 'lucide-react';
import { JobNotification } from '../types/job';

interface SavedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedJobIds: string[];
  allJobs: JobNotification[];
  onSelectJob: (job: JobNotification) => void;
  onRemoveSaved: (jobId: string) => void;
  onClearAllSaved: () => void;
}

export const SavedJobsModal: React.FC<SavedJobsModalProps> = ({
  isOpen,
  onClose,
  savedJobIds,
  allJobs,
  onSelectJob,
  onRemoveSaved,
  onClearAllSaved,
}) => {
  if (!isOpen) return null;

  const savedJobsList = allJobs.filter((job) => savedJobIds.includes(job.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-2.5 sm:p-6">
        <div className="relative bg-white w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shrink-0">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  My Saved Jobs & Deadlines
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Track {savedJobsList.length} bookmarked notifications and cutoff dates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {savedJobsList.length > 0 && (
                <button
                  onClick={onClearAllSaved}
                  className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-5 max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
            {savedJobsList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Bookmark className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="font-semibold text-slate-700">No saved recruitments yet</p>
                <p className="text-slate-400 mt-1">
                  Click the bookmark icon on any job card or notice to keep track of its application deadline and admit card release.
                </p>
              </div>
            ) : (
              savedJobsList.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    onClose();
                    onSelectJob(job);
                  }}
                  className="py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{job.shortOrg}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.sectorName}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug mt-1">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
                      <span className="flex items-center gap-1 tabular-nums">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {job.vacancies > 0 ? `${job.vacancies.toLocaleString()} Posts` : 'Exam'}
                      </span>
                      <span className="flex items-center gap-1 tabular-nums font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Last Date: {job.importantDates.lastDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onRemoveSaved(job.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectJob(job);
                      }}
                      className="p-1.5 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
                      title="View Details"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
