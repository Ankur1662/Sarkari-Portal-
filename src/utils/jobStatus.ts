import { JobNotification } from '../types/job';

export type JobStatusType =
  | 'Apply Now'
  | 'Last Date Soon'
  | 'Closed'
  | 'Result Out'
  | 'Admit Card Out'
  | 'Answer Key Out';

export interface JobStatusInfo {
  status: JobStatusType;
  badgeLabel: string;
  badgeClass: string;
  badgeBg: string;
  actionText: string;
  actionType: 'apply' | 'result' | 'admit' | 'answer-key' | 'closed';
  actionUrl: string;
  isActionable: boolean;
}

/**
 * Calculates accurate recruitment status based on verified category,
 * official status flags, and application start/end dates.
 */
export function getJobStatusInfo(job: JobNotification): JobStatusInfo {
  // 1. Result Declared
  if (job.categoryType === 'results' || job.status === 'Result Declared') {
    return {
      status: 'Result Out',
      badgeLabel: 'Result Out',
      badgeClass: 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
      actionText: 'Check Result',
      actionType: 'result',
      actionUrl: job.applyUrl || job.officialWebsite,
      isActionable: true,
    };
  }

  // 2. Admit Card Available
  if (job.categoryType === 'admit-card' || job.status === 'Admit Card Available') {
    return {
      status: 'Admit Card Out',
      badgeLabel: 'Admit Card Out',
      badgeClass: 'bg-blue-600 text-white border-blue-700 font-bold',
      badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
      actionText: 'Download Admit Card',
      actionType: 'admit',
      actionUrl: job.applyUrl || job.officialWebsite,
      isActionable: true,
    };
  }

  // 3. Answer Key Out
  if (job.categoryType === 'answer-key' || job.status === 'Answer Key Out') {
    return {
      status: 'Answer Key Out',
      badgeLabel: 'Answer Key Out',
      badgeClass: 'bg-purple-600 text-white border-purple-700 font-bold',
      badgeBg: 'bg-purple-50 text-purple-900 border-purple-200',
      actionText: 'Download Answer Key',
      actionType: 'answer-key',
      actionUrl: job.notificationPdfUrl || job.applyUrl || job.officialWebsite,
      isActionable: true,
    };
  }

  // 4. Closed Status
  if ((job.status as string) === 'Closed') {
    return {
      status: 'Closed',
      badgeLabel: 'Closed',
      badgeClass: 'bg-slate-700 text-slate-100 border-slate-800 font-semibold',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
      actionText: 'Application Closed',
      actionType: 'closed',
      actionUrl: job.officialWebsite,
      isActionable: false,
    };
  }

  // 5. Check if ending soonest / closing soon
  if (job.status === 'Closing Soon' || job.isUrgent) {
    return {
      status: 'Last Date Soon',
      badgeLabel: 'Last Date Soon',
      badgeClass: 'bg-rose-600 text-white border-rose-700 font-bold animate-pulse',
      badgeBg: 'bg-rose-50 text-rose-900 border-rose-300',
      actionText: 'Apply Online',
      actionType: 'apply',
      actionUrl: job.applyUrl,
      isActionable: true,
    };
  }

  // 6. Default active recruitment (Apply Now)
  return {
    status: 'Apply Now',
    badgeLabel: 'Apply Now',
    badgeClass: 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs',
    badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    actionText: 'Apply Online',
    actionType: 'apply',
    actionUrl: job.applyUrl,
    isActionable: true,
  };
}
