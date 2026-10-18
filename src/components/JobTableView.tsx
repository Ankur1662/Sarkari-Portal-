import React from 'react';
import { JobNotification } from '../types/job';
import { Heart, ArrowUpRight, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { getJobStatusInfo } from '../utils/jobStatus';

interface JobTableViewProps {
  jobs: JobNotification[];
  onSelect: (job: JobNotification) => void;
  savedJobs: string[];
  onToggleSave: (jobId: string) => void;
}

export const JobTableView: React.FC<JobTableViewProps> = ({
  jobs,
  onSelect,
  savedJobs,
  onToggleSave,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto [overflow-scrolling:touch] scrollbar-thin">
        <table className="w-full text-left text-xs text-slate-600 min-w-[760px]">
          <thead className="bg-slate-900 text-white font-semibold border-b border-slate-800 uppercase text-[11px] tracking-wider">
            <tr>
              <th scope="col" className="py-3 px-3.5">Recruiting Exam & Advt</th>
              <th scope="col" className="py-3 px-3">Sector</th>
              <th scope="col" className="py-3 px-3 text-right">Vacancies</th>
              <th scope="col" className="py-3 px-3">Eligibility</th>
              <th scope="col" className="py-3 px-3">Last Date</th>
              <th scope="col" className="py-3 px-3">Status</th>
              <th scope="col" className="py-3 px-3 text-center">Verified Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No notifications match your current filter criteria.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const isSaved = savedJobs.includes(job.id);
                const statusInfo = getJobStatusInfo(job);

                return (
                  <tr
                    key={job.id}
                    onClick={() => onSelect(job)}
                    className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                  >
                    {/* Exam, Org, and Advt */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(job.id);
                          }}
                          className={`p-1 rounded hover:bg-slate-200 transition-colors shrink-0 mt-0.5 ${
                            isSaved ? 'text-red-600' : 'text-slate-300 group-hover:text-slate-400'
                          }`}
                          title={isSaved ? 'Saved' : 'Save notification'}
                          aria-label={isSaved ? 'Saved notification' : 'Save notification'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
                        </button>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-red-700 leading-snug line-clamp-1">
                            {job.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700">{job.shortOrg}</span>
                            <span>·</span>
                            <span className="font-mono text-slate-600">Advt: {job.advtNo}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{job.sectorName}</span>
                    </td>

                    {/* Vacancies */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-slate-900 whitespace-nowrap">
                      {job.vacancies > 0 ? job.vacancies.toLocaleString() : 'Notice Out'}
                    </td>

                    {/* Eligibility */}
                    <td className="py-3 px-3 max-w-[200px] truncate" title={job.qualification}>
                      {job.qualification}
                    </td>

                    {/* Last Date */}
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums font-medium text-slate-900">
                      <div className="font-bold">{job.importantDates.lastDate}</div>
                      <div className="text-[10px] text-slate-400">Start: {job.importantDates.startDate}</div>
                    </td>

                    {/* Calculated Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.badgeLabel}
                      </span>
                    </td>

                    {/* Verified Action Buttons */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Official PDF */}
                        {job.notificationPdfUrl && (
                          <a
                            href={job.notificationPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors border border-slate-200"
                            title="Official Notification PDF"
                            aria-label="Download Official Notification PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Dedicated External Action Button */}
                        {statusInfo.isActionable && statusInfo.actionUrl && (
                          <a
                            href={statusInfo.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors shadow-2xs ${
                              statusInfo.actionType === 'result'
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : statusInfo.actionType === 'admit'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : statusInfo.actionType === 'answer-key'
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <span>{statusInfo.actionText}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* Details Button */}
                        <button
                          type="button"
                          onClick={() => onSelect(job)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <span>Details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
