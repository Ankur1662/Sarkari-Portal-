export type SectorId =
  | 'upsc'
  | 'ssc'
  | 'banking'
  | 'railways'
  | 'defence'
  | 'teaching'
  | 'state-psc'
  | 'psu'
  | 'healthcare';

export type JobCategory =
  | 'latest-jobs'
  | 'admit-card'
  | 'results'
  | 'answer-key'
  | 'syllabus';

export type QualificationLevel =
  | '10th'
  | '12th'
  | 'graduate'
  | 'post-graduate'
  | 'engineering'
  | 'diploma'
  | 'medical'
  | 'any';

export interface ImportantDates {
  startDate: string;
  lastDate: string;
  feeLastDate: string;
  correctionWindow?: string;
  examDate: string;
  admitCardDate: string;
  resultDate?: string;
}

export interface ApplicationFee {
  genObcEws: number;
  scStPh: number;
  female: number;
  paymentModes: string;
}

export interface AgeLimit {
  min: number;
  max: number;
  asOfDate: string;
  relaxation: string;
}

export interface CategoryBreakdown {
  ur: number;
  obc: number;
  ews: number;
  sc: number;
  st: number;
  total?: number;
}

export interface JobNotification {
  id: string;
  title: string;
  postName: string;
  organization: string;
  shortOrg: string;
  advtNo: string;
  sector: SectorId;
  sectorName: string;
  categoryType: JobCategory;
  vacancies: number;
  qualification: string;
  qualificationLevel: QualificationLevel;
  ageLimit: AgeLimit;
  importantDates: ImportantDates;
  applicationFee: ApplicationFee;
  state: string;
  payScale: string;
  status: 'Active' | 'Closing Soon' | 'Admit Card Available' | 'Result Declared' | 'Answer Key Out';
  isUrgent?: boolean;
  isHot?: boolean;
  notificationPdfUrl: string;
  applyUrl: string;
  officialWebsite: string;
  categoryBreakdown: CategoryBreakdown;
  selectionProcess: string[];
  brief: string;
  datePosted: string;
  articleId?: string;
  sourceUrl?: string;
}

export interface NotificationAlert {
  id: string;
  jobId?: string;
  title: string;
  description: string;
  sector: SectorId;
  categoryType: JobCategory;
  timestamp: string;
  isUrgent: boolean;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface FilterState {
  searchQuery: string;
  sector: SectorId | 'all';
  categoryType: JobCategory | 'all';
  qualification: QualificationLevel | 'all';
  state: string;
  onlyUrgent: boolean;
  sortBy: 'latest' | 'deadline' | 'vacancies';
}
