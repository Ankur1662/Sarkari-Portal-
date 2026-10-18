import { SectorId, JobCategory, QualificationLevel, JobNotification } from '../src/types/job';

export interface OfficialSource {
  id: string;
  name: string;
  shortName: string;
  websiteUrl: string;
  noticeBoardUrl: string;
  rssFeedUrl?: string;
  apiUrl?: string;
  category: SectorId;
  sourceType: 'html' | 'rss' | 'api' | 'pdf';
  frequencyMinutes: number;
  isEnabled: boolean;
  status: 'active' | 'paused' | 'error' | 'rate-limited';
  lastChecked?: string;
  lastSuccessfulCheck?: string;
  lastErrorMessage?: string;
  notes?: string;
  totalDetected: number;
  totalPublished: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedRecruitmentData {
  recruitmentTitle: string;
  organization: string;
  shortOrg: string;
  advtNo: string;
  sector: SectorId;
  categoryType: JobCategory;
  postNames: string[];
  vacancies: number;
  categoryBreakdown: {
    ur: number;
    obc: number;
    ews: number;
    sc: number;
    st: number;
    total: number;
  };
  importantDates: {
    startDate: string;
    lastDate: string;
    feeLastDate: string;
    examDate: string;
    admitCardDate?: string;
    resultDate?: string;
  };
  qualification: string;
  qualificationLevel: QualificationLevel;
  ageLimit: {
    min: number;
    max: number;
    asOfDate: string;
    relaxation: string;
  };
  applicationFee: {
    genObcEws: number;
    scStPh: number;
    female: number;
    paymentModes: string;
  };
  selectionProcess: string[];
  payScale: string;
  applicationInstructions: string;
  officialNotificationUrl: string;
  officialApplicationUrl: string;
  state: string;
  confidenceScore: number;
  verificationFlags: string[];
  rawTextExcerpt?: string;
  sourcePublicationDate?: string;
  lastVerifiedDate: string;
}

export interface HindiRecruitmentArticle {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  overview: string;
  importantDatesHindi: { label: string; date: string }[];
  vacancyDetailsHindi: string;
  eligibilityCriteriaHindi: string;
  ageLimitHindi: string;
  applicationFeeHindi: string;
  selectionProcessHindi: string;
  salaryHindi: string;
  howToApplyHindi: string[];
  importantDocumentsHindi: string[];
  importantLinks: { title: string; url: string; isOfficial: boolean }[];
  officialNoticeSource: string;
  faqs: { question: string; answer: string }[];
  disclaimer: string;
  fullArticleMarkdown: string;
  generatedAt: string;
  updatedAt: string;
}

export interface DetectedNotice {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  noticeTitle: string;
  noticeDate: string;
  advtNo?: string;
  documentUrl?: string;
  documentHash: string;
  detectedAt: string;
  status: 'detected' | 'processing' | 'draft-ready' | 'verification-required' | 'approved' | 'published' | 'rejected' | 'failed';
  extractedData?: ExtractedRecruitmentData;
  hindiArticle?: HindiRecruitmentArticle;
  autoPublishDecision?: {
    eligible: boolean;
    reason: string;
    decidedAt: string;
    published: boolean;
  };
  publishedJobId?: string;
  errorMessage?: string;
  retryCount: number;
  lastProcessedAt?: string;
}

export interface AutomationConfig {
  autoPublishEnabled: boolean;
  minConfidenceForAutoPublish: number;
  requireApplicationUrl: boolean;
  monitoringIntervalMinutes: number;
  aiModel: string;
  maxDailyAiCalls: number;
  currentDailyAiCalls: number;
  lastMonitoringRun?: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  action: string;
  details: string;
  sourceId?: string;
  noticeId?: string;
}

export interface AutomationDashboardStats {
  sourcesMonitored: number;
  activeSources: number;
  notificationsDetected: number;
  documentsProcessed: number;
  draftArticlesReady: number;
  duplicatesSkipped: number;
  verificationRequired: number;
  failedProcessing: number;
  publishedArticles: number;
  autoPublishEnabled: boolean;
  lastRunTime?: string;
}
