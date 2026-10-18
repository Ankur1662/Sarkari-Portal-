import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  Bookmark, 
  Calendar, 
  IndianRupee, 
  Users, 
  Building, 
  Clock, 
  CheckCircle, 
  FileText,
  Share2,
  Printer,
  BookOpen
} from 'lucide-react';
import { JobNotification } from '../types/job';

interface JobDetailModalProps {
  job: JobNotification | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onOpenAgeCalculatorWithJob?: (job: JobNotification) => void;
  onOpenHindiGuide?: (job: JobNotification) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  isSaved,
  onToggleSave,
  onOpenAgeCalculatorWithJob,
  onOpenHindiGuide,
}) => {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out ${job.title} on SarkariPortal. Total Vacancies: ${job.vacancies}. Last Date: ${job.importantDates.lastDate}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-2.5 sm:p-6">
        <div className="relative bg-white w-full max-w-4xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-3 sm:my-8">
          {/* Top Banner / Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-6 border-b border-slate-800">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                  <span>{job.organization}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">Advt: {job.advtNo}</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  {job.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {job.postName}
                </p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {copied && (
                  <span className="text-[11px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 animate-in fade-in">
                    Copied!
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Share Notification"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrint}
                  className="hidden sm:block p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Print / Save PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Ribbon */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-800 text-xs">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
              >
                <span>Apply Online (Official Portal)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={job.notificationPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF</span>
              </a>

              <button
                onClick={() => onToggleSave(job.id)}
                className={`w-full xs:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 font-medium rounded-lg transition-colors border cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved to Watchlist' : 'Save to Watchlist'}</span>
              </button>

              {onOpenHindiGuide && (
                <button
                  onClick={() => onOpenHindiGuide(job)}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                  title="Read comprehensive Hindi recruitment guide"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>हिंदी अधिसूचना गाइड</span>
                </button>
              )}

              {onOpenAgeCalculatorWithJob && (
                <button
                  onClick={() => onOpenAgeCalculatorWithJob(job)}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer sm:ml-auto"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Check Age Eligibility</span>
                </button>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-7 space-y-5 sm:space-y-6 max-h-[calc(88vh-160px)] overflow-y-auto">
            {/* Quick 4-Grid Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                  Total Vacancies
                </span>
                <span className="text-lg font-bold text-slate-900 tabular-nums flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4 text-slate-500" />
                  {job.vacancies > 0 ? job.vacancies.toLocaleString() : 'As per norms'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                  Last Date to Apply
                </span>
                <span className="text-lg font-bold text-slate-900 tabular-nums flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {job.importantDates.lastDate}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                  Pay Scale / Salary
                </span>
                <span className="text-sm font-bold text-slate-900 leading-tight block mt-1 line-clamp-2">
                  {job.payScale}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                  Job Location
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-1">
                  <Building className="w-4 h-4 text-slate-500" />
                  {job.state}
                </span>
              </div>
            </div>

            {/* Two Column Section: Important Dates & Application Fee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Important Dates Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-100 font-bold text-xs text-slate-900 flex items-center gap-2 border-b border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span>Important Dates Schedule</span>
                </div>
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">Application Begin</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-bold tabular-nums text-right">
                        {job.importantDates.startDate}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-amber-50/30">
                      <td className="py-2.5 px-3.5 text-amber-900 font-semibold">Last Date to Apply Online</td>
                      <td className="py-2.5 px-3.5 text-amber-900 font-bold tabular-nums text-right">
                        {job.importantDates.lastDate}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">Last Date for Exam Fee</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-semibold tabular-nums text-right">
                        {job.importantDates.feeLastDate}
                      </td>
                    </tr>
                    {job.importantDates.correctionWindow && (
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-3.5 text-slate-600 font-medium">Correction Window</td>
                        <td className="py-2.5 px-3.5 text-slate-900 font-semibold text-right">
                          {job.importantDates.correctionWindow}
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">Exam Date</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-semibold text-right">
                        {job.importantDates.examDate}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">Admit Card Release</td>
                      <td className="py-2.5 px-3.5 text-emerald-700 font-semibold text-right">
                        {job.importantDates.admitCardDate}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Application Fee Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-100 font-bold text-xs text-slate-900 flex items-center gap-2 border-b border-slate-200">
                  <IndianRupee className="w-4 h-4 text-slate-600" />
                  <span>Application Fee Details</span>
                </div>
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">General / OBC / EWS</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-bold tabular-nums text-right">
                        {job.applicationFee.genObcEws === 0 ? '₹ 0/- (Exempted)' : `₹ ${job.applicationFee.genObcEws}/-`}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">SC / ST / PwBD / PH</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-bold tabular-nums text-right">
                        {job.applicationFee.scStPh === 0 ? '₹ 0/- (Exempted)' : `₹ ${job.applicationFee.scStPh}/-`}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-slate-600 font-medium">All Category Female</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-bold tabular-nums text-right">
                        {job.applicationFee.female === 0 ? '₹ 0/- (Exempted)' : `₹ ${job.applicationFee.female}/-`}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-slate-50/50">
                      <td colSpan={2} className="py-3 px-3.5 text-slate-500 text-[11px] leading-relaxed">
                        <strong className="text-slate-700">Payment Modes:</strong> {job.applicationFee.paymentModes}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Age Limit & Eligibility */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Age Limit & Relaxation Criteria (As on {job.ageLimit.asOfDate})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="space-y-1">
                  <p>
                    <strong>Minimum Age:</strong> {job.ageLimit.min} Years
                  </p>
                  <p>
                    <strong>Maximum Age:</strong> {job.ageLimit.max} Years
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Age Relaxation:</strong> {job.ageLimit.relaxation}
                  </p>
                </div>
              </div>
            </div>

            {/* Educational Qualification */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Educational Qualification & Requirements
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {job.qualification}
              </p>
            </div>

            {/* Category-Wise Vacancy Breakdown */}
            {job.vacancies > 0 && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-100 font-bold text-xs text-slate-900 border-b border-slate-200">
                  Category-Wise Vacancy Distribution
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-200 text-center text-xs">
                  <div className="p-3">
                    <span className="text-slate-500 block text-[11px] font-semibold">UR (Unreserved)</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{job.categoryBreakdown.ur}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-slate-500 block text-[11px] font-semibold">OBC</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{job.categoryBreakdown.obc}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-slate-500 block text-[11px] font-semibold">EWS</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{job.categoryBreakdown.ews}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-slate-500 block text-[11px] font-semibold">SC</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{job.categoryBreakdown.sc}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-slate-500 block text-[11px] font-semibold">ST</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{job.categoryBreakdown.st}</span>
                  </div>
                  <div className="p-3 bg-slate-50">
                    <span className="text-slate-700 block text-[11px] font-bold">Total Posts</span>
                    <span className="text-sm font-bold text-slate-950 tabular-nums">{job.vacancies.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selection Process */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                Selection Process & Stages
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {job.selectionProcess.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Direct Links Block (Signature Sarkari Result format) */}
            <div className="rounded-xl border border-slate-900 bg-slate-900 text-white p-5">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
                Official Important Direct Links
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-slate-200">Apply Online (Registration & Login)</span>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Click Here</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-slate-200">Download Official Notification (PDF)</span>
                  <a
                    href={job.notificationPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Click Here</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-slate-200">Official Recruitment Website</span>
                  <a
                    href={job.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                  >
                    <span>{job.shortOrg} Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Brief Description & How to Apply */}
            <div className="text-xs text-slate-600 space-y-2 border-t border-slate-200 pt-4">
              <p className="font-semibold text-slate-800">Summary & Instructions:</p>
              <p className="leading-relaxed">{job.brief}</p>
              <p className="text-[11px] text-slate-500">
                Candidates are advised to read the full official notification brochure before submitting the online application. Ensure accurate details, uploaded photograph, signature, and payment receipt are preserved for document verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
