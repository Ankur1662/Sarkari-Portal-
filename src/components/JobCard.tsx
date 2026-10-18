import React from 'react';
import { 
  Heart, 
  ExternalLink, 
  Download, 
  MessageCircle, 
  Calendar, 
  Users, 
  Clock, 
  ShieldCheck, 
  Building2, 
  GraduationCap,
  FileText,
  ArrowRight,
  Award,
  CreditCard,
  FileEdit
} from 'lucide-react';
import { JobNotification } from '../types/job';
import { getJobStatusInfo } from '../utils/jobStatus';

interface JobCardProps {
  job: JobNotification;
  onSelect: (job: JobNotification) => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  isSaved,
  onToggleSave,
}) => {
  const statusInfo = getJobStatusInfo(job);

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vacanciesText = job.vacancies > 0 ? `${job.vacancies.toLocaleString()} Posts` : 'Notice Out';
    const text = encodeURIComponent(
      `🚨 *SarkariPortal Alert:*\n*${job.title}*\n🏛️ *Board:* ${job.organization}\n📋 *Advt No:* ${job.advtNo}\n👥 *Vacancies:* ${vacanciesText}\n📅 *Last Date:* ${job.importantDates.lastDate}\n⚡ *Status:* ${statusInfo.badgeLabel}\n\nOfficial verified update link:\n${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const getActionIcon = () => {
    switch (statusInfo.actionType) {
      case 'result':
        return <Award className="w-3.5 h-3.5" />;
      case 'admit':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'answer-key':
        return <FileEdit className="w-3.5 h-3.5" />;
      default:
        return <ExternalLink className="w-3.5 h-3.5" />;
    }
  };

  return (
    <article 
      onClick={() => onSelect(job)}
      className="bg-white rounded-xl border border-slate-200/90 hover:border-red-400 hover:shadow-md transition-all duration-200 p-4 sm:p-4.5 flex flex-col justify-between group relative cursor-pointer"
    >
      <div>
        {/* Row 1: Status Badge, Organization Pill, and Save Button */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {/* Distinguishable Status Badge (Apply Now, Last Date Soon, Closed, Result Out, Admit Card Out, Answer Key Out) */}
            <span 
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wide border shadow-2xs ${statusInfo.badgeClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-ping shrink-0" />
              <span>{statusInfo.badgeLabel}</span>
            </span>

            {/* Recruiting Org Short Badge */}
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 shrink-0">
              {job.shortOrg}
            </span>

            {/* Advt / Notification No. */}
            {job.advtNo && (
              <span className="text-[10px] text-slate-500 font-mono hidden xs:inline truncate max-w-[120px]" title={`Advt: ${job.advtNo}`}>
                {job.advtNo}
              </span>
            )}
          </div>

          {/* Bookmark / Save Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job.id);
            }}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-colors shrink-0 ${
              isSaved
                ? 'text-red-700 bg-red-50 hover:bg-red-100'
                : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save notification'}
            aria-label={isSaved ? 'Saved notification' : 'Save notification'}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
            <span className="hidden sm:inline text-[11px]">{isSaved ? 'SAVED' : 'SAVE'}</span>
          </button>
        </div>

        {/* Row 2: Job Title with crawlable URL */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
          <a
            href={`/job/${job.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(job);
            }}
            className="hover:underline"
          >
            {job.title}
          </a>
        </h3>

        {/* Row 3: Recruiting Organization & Sector */}
        <p className="text-xs text-slate-600 mt-1 line-clamp-1 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{job.organization}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 shrink-0">{job.sectorName}</span>
        </p>

        {/* Row 4: Total Vacancies & Application Key Dates Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
          {/* Vacancies */}
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Vacancies
            </span>
            <span className="font-extrabold text-slate-900 tabular-nums text-xs sm:text-sm mt-0.5 block">
              {job.vacancies > 0 ? `${job.vacancies.toLocaleString()} Posts` : 'As per Rules'}
            </span>
          </div>

          {/* Last Date */}
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Last Date
            </span>
            <span className={`font-extrabold tabular-nums text-xs sm:text-sm mt-0.5 block ${
              job.isUrgent || statusInfo.status === 'Last Date Soon' ? 'text-red-600 font-bold' : 'text-slate-900'
            }`}>
              {job.importantDates.lastDate}
            </span>
          </div>
        </div>

        {/* Row 5: Required Qualification & Start Date */}
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          <div className="flex items-start gap-1 line-clamp-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-700 font-semibold">Eligibility:</strong> {job.qualification}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              <strong>Started:</strong> {job.importantDates.startDate}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Verified: {job.datePosted}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 6: Action Buttons Row (WhatsApp, Official PDF, Apply/Result/Admit/Key, and View Details) */}
      <div 
        className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Action: WhatsApp Share & Official PDF */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1 min-h-[36px]"
            title="Share vacancy update on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span className="hidden sm:inline text-[11px]">Share</span>
          </button>

          {/* Official Notification PDF Button */}
          {job.notificationPdfUrl && (
            <a
              href={job.notificationPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-1 border border-slate-200 min-h-[36px]"
              title="Download Official Notification PDF"
              aria-label="Download Official Notification PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline text-[11px]">PDF</span>
            </a>
          )}
        </div>

        {/* Right Actions: Specific External Link (Apply/Result/Admit/Key) + View Details */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Dedicated External Button based on category: Apply Online / Check Result / Download Admit Card / Download Answer Key */}
          {statusInfo.isActionable && statusInfo.actionUrl && (
            <a
              href={statusInfo.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-2xs min-h-[36px] ${
                statusInfo.actionType === 'result'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : statusInfo.actionType === 'admit'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : statusInfo.actionType === 'answer-key'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {getActionIcon()}
              <span className="text-[11px]">{statusInfo.actionText}</span>
            </a>
          )}

          {/* View Details Button (Opens Comprehensive Modal) */}
          <button
            type="button"
            onClick={() => onSelect(job)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer min-h-[36px]"
          >
            <span className="text-[11px]">Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
