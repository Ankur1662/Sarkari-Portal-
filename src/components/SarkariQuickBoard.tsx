import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Award, 
  CreditCard, 
  Search, 
  X, 
  Clock, 
  Calendar, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { JobNotification } from '../types/job';

interface SarkariQuickBoardProps {
  jobs: JobNotification[];
  onSelectJob: (job: JobNotification) => void;
  onViewAllCategory: (category: 'latest-jobs' | 'admit-card' | 'results' | 'answer-key' | 'syllabus') => void;
}

/**
 * Accurately determines the lifecycle state of a recruitment/exam entry:
 * - Active: ongoing recruitment or live download
 * - Closing Soon: urgent deadline approaching
 * - Declared: exam result / cut-off published
 * - Available: admit card / hall ticket live
 * - Expired: closed / deadline passed
 */
function getItemLifecycle(job: JobNotification) {
  // 1. Result Declared
  if (job.categoryType === 'results' || job.status === 'Result Declared') {
    return {
      statusType: 'declared',
      badgeLabel: 'Result Out',
      badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
      dotClass: 'bg-emerald-600',
    };
  }

  // 2. Admit Card Available
  if (job.categoryType === 'admit-card' || job.status === 'Admit Card Available') {
    return {
      statusType: 'available',
      badgeLabel: 'Admit Card',
      badgeClass: 'bg-purple-50 text-purple-900 border-purple-200 font-semibold',
      dotClass: 'bg-purple-600',
    };
  }

  // 3. Closed / Expired
  if ((job.status as string) === 'Closed') {
    return {
      statusType: 'expired',
      badgeLabel: 'Closed',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-300 font-medium',
      dotClass: 'bg-slate-400',
    };
  }

  // 4. Closing Soon / Urgent
  if (job.status === 'Closing Soon' || job.isUrgent) {
    return {
      statusType: 'closing-soon',
      badgeLabel: 'Closing Soon',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      dotClass: 'bg-rose-500 animate-pulse',
    };
  }

  // 5. Default Active
  return {
    statusType: 'active',
    badgeLabel: 'Active',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold',
    dotClass: 'bg-[#8B0000]',
  };
}

export const SarkariQuickBoard: React.FC<SarkariQuickBoardProps> = ({
  jobs,
  onSelectJob,
  onViewAllCategory,
}) => {
  const [boardSearch, setBoardSearch] = useState('');

  // Search filter helper across verified fields
  const filterItems = (list: JobNotification[]) => {
    if (!boardSearch.trim()) return list;
    const q = boardSearch.toLowerCase().trim();
    return list.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.shortOrg && j.shortOrg.toLowerCase().includes(q)) ||
        (j.organization && j.organization.toLowerCase().includes(q)) ||
        (j.postName && j.postName.toLowerCase().includes(q)) ||
        (j.advtNo && j.advtNo.toLowerCase().includes(q)) ||
        (j.state && j.state.toLowerCase().includes(q))
    );
  };

  // 1. Results & Cut-Off (LEFT COLUMN)
  const allResults = useMemo(
    () => jobs.filter((j) => j.categoryType === 'results' || j.status === 'Result Declared'),
    [jobs]
  );
  const results = useMemo(
    () => filterItems(allResults).slice(0, 7),
    [allResults, boardSearch]
  );

  // 2. Admit Card / Hall Ticket (CENTER COLUMN)
  const allAdmitCards = useMemo(
    () => jobs.filter((j) => j.categoryType === 'admit-card' || j.status === 'Admit Card Available'),
    [jobs]
  );
  const admitCards = useMemo(
    () => filterItems(allAdmitCards).slice(0, 7),
    [allAdmitCards, boardSearch]
  );

  // 3. Latest Jobs (RIGHT COLUMN)
  const allLatestJobs = useMemo(
    () => jobs.filter((j) => j.categoryType === 'latest-jobs'),
    [jobs]
  );
  const latestJobs = useMemo(
    () => filterItems(allLatestJobs).slice(0, 7),
    [allLatestJobs, boardSearch]
  );

  return (
    <section 
      aria-label="Sarkari Quick Access Board"
      className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full max-w-full"
    >
      {/* 1. Board Top Header Bar */}
      <div className="p-2.5 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000] animate-pulse shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Sarkari Quick Access Board
            </h2>
            <span className="text-[10px] bg-red-100 text-[#8B0000] font-bold px-2 py-0.5 rounded-full border border-red-200">
              Live Updates
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
            Direct verified links for online applications, hall tickets, and declared cut-offs
          </p>
        </div>

        {/* Quick Search within the board */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            value={boardSearch}
            onChange={(e) => setBoardSearch(e.target.value)}
            placeholder="Search within boards..."
            aria-label="Search within Sarkari quick access boards"
            className="w-full text-xs px-3 py-1.5 pl-8 pr-7 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#8B0000] bg-white placeholder:text-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" aria-hidden="true" />
          {boardSearch && (
            <button
              onClick={() => setBoardSearch('')}
              className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs p-0.5 cursor-pointer rounded-full"
              title="Clear search"
              aria-label="Clear board search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Three Main Categories Grid (Exact Order: 1. Results [LEFT] | 2. Admit Card [CENTER] | 3. Latest Jobs [RIGHT]) */}
      <div className="p-1.5 sm:p-2.5 lg:p-3 bg-slate-50/60">
        <div 
          className="quick-access-grid grid grid-cols-3 w-full max-w-full items-stretch"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '8px',
            alignItems: 'stretch',
          }}
        >
          
          {/* ======================================================== */}
          {/* COLUMN 1 [LEFT]: RESULTS                                 */}
          {/* Header: #8B0000 | Top: #8B0000 | Outer: #D9D9D9          */}
          {/* ======================================================== */}
          <div 
            className="quick-access-column flex flex-col min-w-0 w-full rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-2xs h-full"
            style={{ border: '1px solid #D9D9D9' }}
          >
            {/* Header: Dark Maroon (#8B0000) with vertically centered icon & clean English title */}
            <div 
              className="p-2 sm:p-2.5 min-h-[48px] sm:min-h-[54px] flex items-center justify-center gap-1.5 sm:gap-2 text-white shrink-0 border-t-[3px]"
              style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }}
            >
              <div 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-white shrink-0 bg-white/15 border border-white/20"
              >
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-white truncate leading-none">
                Results
              </h3>
            </div>

            {/* List Items */}
            <div className="divide-y divide-slate-100 flex-1 min-w-0 bg-white">
              {results.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-slate-400">
                  <p>No results found.</p>
                  {boardSearch && (
                    <button
                      onClick={() => setBoardSearch('')}
                      className="mt-1 text-[#8B0000] font-semibold hover:underline text-[9px] cursor-pointer"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              ) : (
                results.map((job) => {
                  const lifecycle = getItemLifecycle(job);

                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectJob(job)}
                      aria-label={`View result and scorecard for ${job.title}`}
                      className="p-1.5 sm:p-2.5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-1 sm:gap-1.5 min-w-0"
                    >
                      <span className="text-slate-400 font-bold text-xs sm:text-sm leading-tight shrink-0 select-none mt-0.5">•</span>
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Top row: Tags */}
                        <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[9.5px]">
                          <span className="font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded border border-slate-200 truncate max-w-[65px] sm:max-w-none">
                            {job.shortOrg || job.organization}
                          </span>
                          <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded border shrink-0 ${lifecycle.badgeClass}`}>
                            <span className={`w-1 h-1 rounded-full ${lifecycle.dotClass}`} />
                            <span className="truncate max-w-[55px] sm:max-w-none">{lifecycle.badgeLabel}</span>
                          </span>
                        </div>

                        {/* Title: Classic Blue Underlined Link */}
                        <a
                          href={`/job/${job.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectJob(job);
                          }}
                          className="text-[#0a58ca] hover:text-[#003882] underline font-semibold text-[10px] sm:text-[12px] lg:text-[13px] leading-snug line-clamp-2 break-words block transition-colors"
                        >
                          {job.title}
                        </a>

                        {/* Bottom: Date & Scorecard */}
                        <div className="flex items-center justify-between gap-1 pt-0.5 text-[8px] sm:text-[9.5px] text-slate-500 flex-wrap">
                          {job.importantDates?.resultDate && (
                            <span className="inline-flex items-center gap-0.5 font-semibold text-slate-700 truncate">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#8B0000] shrink-0" />
                              <span className="truncate">Out: {job.importantDates.resultDate.split(' ')[0]}</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1 shrink-0 ml-auto">
                            {(job.applyUrl || job.officialWebsite) && (
                              <a
                                href={job.applyUrl || job.officialWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-[#8B0000] hover:text-red-950 bg-red-50 hover:bg-red-100 border border-red-200 px-1 sm:px-1.5 py-0.2 rounded transition-colors"
                                title="Check Scorecard"
                              >
                                <span>Scorecard</span>
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer View More Button */}
            <div 
              className="p-1.5 sm:p-2 text-center mt-auto border-t bg-[#FAF5F5] border-[#D9D9D9]"
            >
              <button
                type="button"
                onClick={() => onViewAllCategory('results')}
                className="h-6 sm:h-7 text-[9px] sm:text-xs font-bold text-[#8B0000] hover:bg-[#F2E6E6] hover:underline flex items-center justify-center gap-1 w-full py-0.5 rounded transition-colors cursor-pointer truncate"
              >
                <span>View More</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2 [CENTER]: ADMIT CARD                            */}
          {/* Header: #8B0000 | Top: #8B0000 | Outer: #D9D9D9          */}
          {/* ======================================================== */}
          <div 
            className="quick-access-column flex flex-col min-w-0 w-full rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-2xs h-full"
            style={{ border: '1px solid #D9D9D9' }}
          >
            {/* Header: Dark Maroon (#8B0000) with vertically centered icon & clean English title */}
            <div 
              className="p-2 sm:p-2.5 min-h-[48px] sm:min-h-[54px] flex items-center justify-center gap-1.5 sm:gap-2 text-white shrink-0 border-t-[3px]"
              style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }}
            >
              <div 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-white shrink-0 bg-white/15 border border-white/20"
              >
                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-white truncate leading-none">
                Admit Card
              </h3>
            </div>

            {/* List Items */}
            <div className="divide-y divide-slate-100 flex-1 min-w-0 bg-white">
              {admitCards.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-slate-400">
                  <p>No admit cards found.</p>
                  {boardSearch && (
                    <button
                      onClick={() => setBoardSearch('')}
                      className="mt-1 text-[#8B0000] font-semibold hover:underline text-[9px] cursor-pointer"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              ) : (
                admitCards.map((job) => {
                  const lifecycle = getItemLifecycle(job);

                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectJob(job)}
                      aria-label={`View admit card details for ${job.title}`}
                      className="p-1.5 sm:p-2.5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-1 sm:gap-1.5 min-w-0"
                    >
                      <span className="text-slate-400 font-bold text-xs sm:text-sm leading-tight shrink-0 select-none mt-0.5">•</span>
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Top row: Tags */}
                        <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[9.5px]">
                          <span className="font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded border border-slate-200 truncate max-w-[65px] sm:max-w-none">
                            {job.shortOrg || job.organization}
                          </span>
                          <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded border shrink-0 ${lifecycle.badgeClass}`}>
                            <span className={`w-1 h-1 rounded-full ${lifecycle.dotClass}`} />
                            <span className="truncate max-w-[55px] sm:max-w-none">{lifecycle.badgeLabel}</span>
                          </span>
                        </div>

                        {/* Title: Classic Blue Underlined Link */}
                        <a
                          href={`/job/${job.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectJob(job);
                          }}
                          className="text-[#0a58ca] hover:text-[#003882] underline font-semibold text-[10px] sm:text-[12px] lg:text-[13px] leading-snug line-clamp-2 break-words block transition-colors"
                        >
                          {job.title}
                        </a>

                        {/* Bottom: Exam Date & Download */}
                        <div className="flex items-center justify-between gap-1 pt-0.5 text-[8px] sm:text-[9.5px] text-slate-500 flex-wrap">
                          {job.importantDates?.examDate && (
                            <span className="inline-flex items-center gap-0.5 font-semibold text-slate-700 truncate">
                              <Calendar className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">Exam: {job.importantDates.examDate}</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1 shrink-0 ml-auto">
                            {job.applyUrl && (
                              <a
                                href={job.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-[#8B0000] hover:text-red-950 bg-red-50 hover:bg-red-100 border border-red-200 px-1 sm:px-1.5 py-0.2 rounded transition-colors"
                                title="Download Hall Ticket"
                              >
                                <span>Download</span>
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer View More Button */}
            <div 
              className="p-1.5 sm:p-2 text-center mt-auto border-t bg-[#FAF5F5] border-[#D9D9D9]"
            >
              <button
                type="button"
                onClick={() => onViewAllCategory('admit-card')}
                className="h-6 sm:h-7 text-[9px] sm:text-xs font-bold text-[#8B0000] hover:bg-[#F2E6E6] hover:underline flex items-center justify-center gap-1 w-full py-0.5 rounded transition-colors cursor-pointer truncate"
              >
                <span>View More</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 3 [RIGHT]: LATEST JOBS                            */}
          {/* Header: #8B0000 | Top: #8B0000 | Outer: #D9D9D9          */}
          {/* ======================================================== */}
          <div 
            className="quick-access-column flex flex-col min-w-0 w-full rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-2xs h-full"
            style={{ border: '1px solid #D9D9D9' }}
          >
            {/* Header: Dark Maroon (#8B0000) with vertically centered icon & clean English title */}
            <div 
              className="p-2 sm:p-2.5 min-h-[48px] sm:min-h-[54px] flex items-center justify-center gap-1.5 sm:gap-2 text-white shrink-0 border-t-[3px]"
              style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }}
            >
              <div 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-white shrink-0 bg-white/15 border border-white/20"
              >
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-white truncate leading-none">
                Latest Jobs
              </h3>
            </div>

            {/* List Items */}
            <div className="divide-y divide-slate-100 flex-1 min-w-0 bg-white">
              {latestJobs.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-slate-400">
                  <p>No notices found.</p>
                  {boardSearch && (
                    <button
                      onClick={() => setBoardSearch('')}
                      className="mt-1 text-[#8B0000] font-semibold hover:underline text-[9px] cursor-pointer"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              ) : (
                latestJobs.map((job) => {
                  const lifecycle = getItemLifecycle(job);
                  const isUrgent = lifecycle.statusType === 'closing-soon';
                  const isExpired = lifecycle.statusType === 'expired';

                  return (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectJob(job)}
                      aria-label={`View details for ${job.title}`}
                      className="p-1.5 sm:p-2.5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-1 sm:gap-1.5 min-w-0"
                    >
                      <span className="text-slate-400 font-bold text-xs sm:text-sm leading-tight shrink-0 select-none mt-0.5">•</span>
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Top row: Tags */}
                        <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[9.5px]">
                          <span className="font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded border border-slate-200 truncate max-w-[65px] sm:max-w-none">
                            {job.shortOrg || job.organization}
                          </span>
                          {job.vacancies > 0 && (
                            <span className="font-mono text-slate-600 bg-slate-50 px-1 py-0.2 rounded border border-slate-200 hidden xs:inline">
                              {job.vacancies.toLocaleString()} Posts
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded border shrink-0 ${lifecycle.badgeClass}`}>
                            <span className={`w-1 h-1 rounded-full ${lifecycle.dotClass}`} />
                            <span className="truncate max-w-[55px] sm:max-w-none">{lifecycle.badgeLabel}</span>
                          </span>
                        </div>

                        {/* Title: Classic Blue Underlined Link */}
                        <a
                          href={`/job/${job.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectJob(job);
                          }}
                          className="text-[#0a58ca] hover:text-[#003882] underline font-semibold text-[10px] sm:text-[12px] lg:text-[13px] leading-snug line-clamp-2 break-words block transition-colors"
                        >
                          {job.title}
                        </a>

                        {/* Bottom: Date & Apply */}
                        <div className="flex items-center justify-between gap-1 pt-0.5 text-[8px] sm:text-[9.5px] text-slate-500 flex-wrap">
                          {job.importantDates?.lastDate && (
                            <span className={`inline-flex items-center gap-0.5 font-medium truncate ${
                              isUrgent ? 'text-rose-600 font-bold' : isExpired ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">Last: {job.importantDates.lastDate}</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1 shrink-0 ml-auto">
                            {job.applyUrl && (
                              <a
                                href={job.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-[#8B0000] hover:text-red-950 bg-red-50 hover:bg-red-100 border border-red-200 px-1 sm:px-1.5 py-0.2 rounded transition-colors"
                                title="Apply Online"
                              >
                                <span>Apply</span>
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer View More Button */}
            <div 
              className="p-1.5 sm:p-2 text-center mt-auto border-t bg-[#FAF5F5] border-[#D9D9D9]"
            >
              <button
                type="button"
                onClick={() => onViewAllCategory('latest-jobs')}
                className="h-6 sm:h-7 text-[9px] sm:text-xs font-bold text-[#8B0000] hover:bg-[#F2E6E6] hover:underline flex items-center justify-center gap-1 w-full py-0.5 rounded transition-colors cursor-pointer truncate"
              >
                <span>View More</span>
                <span>→</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
