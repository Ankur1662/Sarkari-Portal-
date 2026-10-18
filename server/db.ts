import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  OfficialSource, 
  DetectedNotice, 
  AutomationConfig, 
  AutomationLog, 
  AutomationDashboardStats,
  ExtractedRecruitmentData,
  HindiRecruitmentArticle
} from './types';
import { JobNotification } from '../src/types/job';
import { MOCK_JOBS } from '../src/data/mockJobs';

const DATA_DIR = path.resolve(process.cwd(), '.data');

// Ensure storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create .data directory, will use in-memory store', err);
  }
}

const SOURCES_FILE = path.join(DATA_DIR, 'official_sources.json');
const NOTICES_FILE = path.join(DATA_DIR, 'detected_notices.json');
const CONFIG_FILE = path.join(DATA_DIR, 'automation_config.json');
const LOGS_FILE = path.join(DATA_DIR, 'automation_logs.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs_store.json');

// Default initial official recruitment sources (All verified government portals)
const DEFAULT_SOURCES: OfficialSource[] = [
  {
    id: 'src-ssc-gov',
    name: 'Staff Selection Commission (SSC)',
    shortName: 'SSC',
    websiteUrl: 'https://ssc.gov.in',
    noticeBoardUrl: 'https://ssc.gov.in/candidate-portal/latest-news',
    category: 'ssc',
    sourceType: 'html',
    frequencyMinutes: 30,
    isEnabled: true,
    status: 'active',
    lastChecked: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    lastSuccessfulCheck: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    notes: 'Central government SSC CGL, CHSL, GD Constable, and MTS recruitments',
    totalDetected: 3,
    totalPublished: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'src-upsc-gov',
    name: 'Union Public Service Commission (UPSC)',
    shortName: 'UPSC',
    websiteUrl: 'https://upsc.gov.in',
    noticeBoardUrl: 'https://upsc.gov.in/whats-new',
    category: 'upsc',
    sourceType: 'html',
    frequencyMinutes: 30,
    isEnabled: true,
    status: 'active',
    lastChecked: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastSuccessfulCheck: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    notes: 'Civil Services, NDA, CDS, CAPF, and Engineering Services Examination gazettes',
    totalDetected: 2,
    totalPublished: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'src-rrb-gov',
    name: 'Railway Recruitment Boards (RRB Central)',
    shortName: 'RRB',
    websiteUrl: 'https://indianrailways.gov.in',
    noticeBoardUrl: 'https://www.rrbapply.gov.in/',
    category: 'railways',
    sourceType: 'html',
    frequencyMinutes: 45,
    isEnabled: true,
    status: 'active',
    lastChecked: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    lastSuccessfulCheck: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    notes: 'Indian Railways RRB ALP, NTPC, Group D, Technician, and Junior Engineer notices',
    totalDetected: 2,
    totalPublished: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'src-uppbpb-gov',
    name: 'UP Police Recruitment & Promotion Board (UPPRPB)',
    shortName: 'UP Police',
    websiteUrl: 'https://uppbpb.gov.in',
    noticeBoardUrl: 'https://uppbpb.gov.in/Notices.aspx',
    category: 'defence',
    sourceType: 'html',
    frequencyMinutes: 60,
    isEnabled: true,
    status: 'active',
    lastChecked: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    lastSuccessfulCheck: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    notes: 'Uttar Pradesh Constable, Sub-Inspector (SI), and Computer Operator vacancies',
    totalDetected: 1,
    totalPublished: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'src-bpsc-bih-nic',
    name: 'Bihar Public Service Commission (BPSC)',
    shortName: 'BPSC',
    websiteUrl: 'https://www.bpsc.bih.nic.in',
    noticeBoardUrl: 'https://www.bpsc.bih.nic.in',
    category: 'state-psc',
    sourceType: 'html',
    frequencyMinutes: 60,
    isEnabled: true,
    status: 'active',
    lastChecked: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    lastSuccessfulCheck: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    notes: 'Combined Competitive Examination (CCE) and Teacher Recruitment Examination (TRE)',
    totalDetected: 1,
    totalPublished: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'src-uppsc-up-nic',
    name: 'Uttar Pradesh Public Service Commission (UPPSC)',
    shortName: 'UPPSC',
    websiteUrl: 'https://uppsc.up.nic.in',
    noticeBoardUrl: 'https://uppsc.up.nic.in/AllNotification.aspx',
    category: 'state-psc',
    sourceType: 'html',
    frequencyMinutes: 60,
    isEnabled: true,
    status: 'active',
    lastChecked: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    lastSuccessfulCheck: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    notes: 'UP Combined State / Upper Subordinate Services (PCS) and RO / ARO recruitment',
    totalDetected: 1,
    totalPublished: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'src-ibps-in',
    name: 'Institute of Banking Personnel Selection (IBPS)',
    shortName: 'IBPS',
    websiteUrl: 'https://www.ibps.in',
    noticeBoardUrl: 'https://www.ibps.in',
    category: 'banking',
    sourceType: 'html',
    frequencyMinutes: 45,
    isEnabled: true,
    status: 'active',
    lastChecked: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    lastSuccessfulCheck: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    notes: 'Public sector bank recruitment: PO/MT, Clerk, Specialist Officer, and RRB Officers',
    totalDetected: 1,
    totalPublished: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Config - autoPublishEnabled is strictly FALSE by default as required by rules!
const DEFAULT_CONFIG: AutomationConfig = {
  autoPublishEnabled: false,
  minConfidenceForAutoPublish: 90,
  requireApplicationUrl: true,
  monitoringIntervalMinutes: 30,
  aiModel: 'gemini-3.8-flash',
  maxDailyAiCalls: 100,
  currentDailyAiCalls: 6,
  lastMonitoringRun: new Date().toISOString(),
};

// Seed sample detected notices in the review queue to allow instant inspection
const DEFAULT_NOTICES: DetectedNotice[] = [
  {
    id: 'notice-ssc-cgl-2026',
    sourceId: 'src-ssc-gov',
    sourceName: 'Staff Selection Commission (SSC)',
    sourceUrl: 'https://ssc.gov.in/candidate-portal/latest-news',
    noticeTitle: 'Combined Graduate Level Examination (CGL) 2026 Notification',
    noticeDate: '2026-03-01',
    advtNo: 'SSC-HQ-CGL/2026',
    documentUrl: 'https://ssc.gov.in/notice-cgl-2026.pdf',
    documentHash: 'sha256-ssc-cgl-2026-v1',
    detectedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'draft-ready',
    retryCount: 0,
    lastProcessedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    extractedData: {
      recruitmentTitle: 'SSC Combined Graduate Level (CGL) Examination 2026',
      organization: 'Staff Selection Commission (SSC)',
      shortOrg: 'SSC',
      advtNo: 'SSC-HQ-CGL/2026',
      sector: 'ssc',
      categoryType: 'latest-jobs',
      postNames: ['Assistant Section Officer', 'Inspector of Income Tax', 'Sub-Inspector CBI', 'Auditor', 'Tax Assistant'],
      vacancies: 14582,
      categoryBreakdown: {
        ur: 6120,
        obc: 3890,
        ews: 1450,
        sc: 2122,
        st: 1000,
        total: 14582
      },
      importantDates: {
        startDate: '2026-03-01',
        lastDate: '2026-03-31',
        feeLastDate: '2026-04-01',
        examDate: 'June - July 2026',
        admitCardDate: 'May 2026',
        resultDate: 'August 2026'
      },
      qualification: "Bachelor's Degree in Any Discipline from a recognized University or Institute",
      qualificationLevel: 'graduate',
      ageLimit: {
        min: 18,
        max: 30,
        asOfDate: '01/08/2026',
        relaxation: 'OBC: 3 Years, SC/ST: 5 Years, PwBD: 10 Years, Ex-Servicemen: 3 Years'
      },
      applicationFee: {
        genObcEws: 100,
        scStPh: 0,
        female: 0,
        paymentModes: 'BHIM UPI, Net Banking, Visa, MasterCard, Maestro, RuPay Credit or Debit cards'
      },
      selectionProcess: ['Tier-I Computer Based Examination', 'Tier-II Computer Based Examination', 'Data Entry Skill Test (DEST)', 'Document Verification'],
      payScale: 'Level-4 to Level-8 (Rs. 25,500 to Rs. 1,51,100/-)',
      applicationInstructions: 'Apply online strictly through the official website ssc.gov.in using OTR (One Time Registration).',
      officialNotificationUrl: 'https://ssc.gov.in/notice-cgl-2026.pdf',
      officialApplicationUrl: 'https://ssc.gov.in',
      state: 'All India',
      confidenceScore: 96,
      verificationFlags: [],
      rawTextExcerpt: 'Staff Selection Commission will hold Combined Graduate Level Examination, 2026 for filling up of various Group B and Group C posts in different Ministries/Departments/Organizations of Government of India.',
      sourcePublicationDate: '2026-03-01',
      lastVerifiedDate: new Date().toISOString()
    },
    hindiArticle: {
      id: 'art-ssc-cgl-2026',
      title: 'एसएससी सीजीएल 2026 आधिकारिक अधिसूचना जारी: 14,582 पदों पर भर्ती, जानें योग्यता, तिथियां व आवेदन प्रक्रिया',
      slug: 'ssc-cgl-recruitment-2026-notification-in-hindi',
      metaDescription: 'एसएससी सीजीएल 2026 भर्ती अधिसूचना जारी कर दी गई है। स्नातक पास उम्मीदवार 14,582 विभिन्न ग्रुप बी और सी पदों के लिए ssc.gov.in पर ऑनलाइन आवेदन कर सकते हैं।',
      overview: 'कर्मचारी चयन आयोग (SSC) ने कंबाइंड ग्रेजुएट लेवल (CGL) 2026 परीक्षा के लिए विस्तृत आधिकारिक विज्ञापन जारी कर दिया है। इस भर्ती अभियान के माध्यम से भारत सरकार के विभिन्न मंत्रालयों एवं विभागों में 14,582 पदों पर योग्य उम्मीदवारों का चयन किया जाएगा।',
      importantDatesHindi: [
        { label: 'ऑनलाइन आवेदन प्रारंभ', date: '01 मार्च 2026' },
        { label: 'आवेदन की अंतिम तिथि', date: '31 मार्च 2026 (रात 11:00 बजे तक)' },
        { label: 'शुल्क भुगतान की अंतिम तिथि', date: '01 अप्रैल 2026' },
        { label: 'टीयर-1 सीबीटी परीक्षा तिथि', date: 'जून - जुलाई 2026 (प्रस्तावित)' }
      ],
      vacancyDetailsHindi: 'कुल 14,582 पदों में अनारक्षित (UR): 6,120, ओबीसी: 3,890, ईडब्ल्यूएस: 1,450, एससी: 2,122 तथा एसटी वर्ग के लिए 1,000 पद आरक्षित हैं। प्रमुख पदों में असिस्टेंट सेक्शन ऑफिसर, इनकम टैक्स इंस्पेक्टर, सब-इंस्पेक्टर (CBI) एवं टैक्स असिस्टेंट शामिल हैं।',
      eligibilityCriteriaHindi: 'मान्यता प्राप्त विश्वविद्यालय से किसी भी संकाय में स्नातक (Graduation) डिग्री उत्तीर्ण होना अनिवार्य है। अंतिम वर्ष के अभ्यर्थी भी निर्धारित कट-ऑफ तिथि के अधीन आवेदन कर सकते हैं।',
      ageLimitHindi: 'न्यूनतम आयु 18 वर्ष तथा अधिकतम आयु 30 वर्ष (पद के अनुसार)। आरक्षित वर्गों को सरकारी नियमानुसार छूट प्रदान की जाएगी: ओबीसी को 3 वर्ष, एससी/एसटी को 5 वर्ष तथा दिव्यांगजनों को 10 वर्ष की छूट।',
      applicationFeeHindi: 'सामान्य, ओबीसी एवं ईडब्ल्यूएस वर्ग के पुरुष उम्मीदवारों के लिए आवेदन शुल्क मात्र 100 रुपये है। सभी महिला उम्मीदवारों एवं एससी, एसटी, दिव्यांग अभ्यर्थियों को आवेदन शुल्क से पूर्ण छूट प्रदान की गई है।',
      selectionProcessHindi: 'चयन प्रक्रिया दो चरणों में संपन्न होगी: (1) टीयर-I सीबीटी परीक्षा, (2) टीयर-II मुख्य सीबीटी परीक्षा एवं कंप्यूटर टाइपिंग दक्षता परीक्षण (DEST), इसके बाद दस्तावेज सत्यापन किया जाएगा।',
      salaryHindi: 'सातवें वेतन आयोग (7th CPC) के तहत पे-लेवल 4 से पे-लेवल 8 तक (लगभग ₹25,500 से ₹1,51,100 प्रतिमाह + भत्ते)।',
      howToApplyHindi: [
        'सर्वप्रथम एसएससी की आधिकारिक वेबसाइट ssc.gov.in पर जाएं।',
        'यदि आपने पूर्व में ओटीआर (OTR) नहीं किया है, तो "New User? Register Now" पर क्लिक करके पंजीकरण पूरा करें।',
        'अपने लॉगिन क्रेडेंशियल्स दर्ज कर CGL 2026 एप्लिकेशन लिंक पर क्लिक करें।',
        'व्यक्तिगत एवं शैक्षणिक विवरण ध्यानपूर्वक भरें तथा लाइव वेबकैम फोटो एवं हस्ताक्षर अपलोड करें।',
        'निर्धारित परीक्षा शुल्क का भुगतान ऑनलाइन माध्यम से करें और अंतिम सबमिट किए गए आवेदन पत्र का प्रिंटआउट सुरक्षित रखें।'
      ],
      importantDocumentsHindi: [
        '10वीं एवं 12वीं की अंकतालिका व प्रमाण पत्र',
        'स्नातक अंतिम वर्ष की डिग्री या प्रोविजनल सर्टिफिकेट',
        'आधार कार्ड या सरकार द्वारा मान्य वैध फोटो पहचान पत्र',
        'आरक्षण का लाभ लेने हेतु जाति / ईडब्ल्यूएस / दिव्यांगता प्रमाण पत्र'
      ],
      importantLinks: [
        { title: 'आधिकारिक भर्ती अधिसूचना (PDF)', url: 'https://ssc.gov.in/notice-cgl-2026.pdf', isOfficial: true },
        { title: 'ऑनलाइन आवेदन पोर्टल (SSC OTR)', url: 'https://ssc.gov.in', isOfficial: true }
      ],
      officialNoticeSource: 'Staff Selection Commission Official Gazette Notice No. SSC-HQ-CGL/2026',
      faqs: [
        { question: 'एसएससी सीजीएल 2026 के लिए आवेदन की अंतिम तिथि क्या है?', answer: 'आवेदन करने की अंतिम तिथि 31 मार्च 2026 रात 11:00 बजे तक निर्धारित है।' },
        { question: 'क्या अंतिम वर्ष के छात्र आवेदन कर सकते हैं?', answer: 'हाँ, बशर्ते परिणाम अधिसूचना में निर्धारित कट-ऑफ तारीख से पूर्व घोषित हो चुका हो।' }
      ],
      disclaimer: 'यह भर्ती विवरण केवल परीक्षार्थियों के मार्गदर्शन हेतु तैयार किया गया है। नियम, पात्रता व शर्तों की पूर्ण सत्यता के लिए आधिकारिक अधिसूचना अवश्य पढ़ें।',
      fullArticleMarkdown: `# एसएससी सीजीएल 2026 आधिकारिक भर्ती अधिसूचना\n\nकर्मचारी चयन आयोग (SSC) ने कंबाइंड ग्रेजुएट लेवल (CGL) 2026 के लिए 14,582 पदों पर भर्ती जारी की है।`,
      generatedAt: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 105).toISOString()
    }
  },
  {
    id: 'notice-rrb-ntpc-2026',
    sourceId: 'src-rrb-gov',
    sourceName: 'Railway Recruitment Boards (RRB Central)',
    sourceUrl: 'https://www.rrbapply.gov.in/',
    noticeTitle: 'CEN 04/2026 Non-Technical Popular Categories (NTPC) Graduate & Under Graduate Posts',
    noticeDate: '2026-02-28',
    advtNo: 'CEN 04/2026',
    documentUrl: 'https://www.rrbapply.gov.in/notices/cen-04-2026-ntpc.pdf',
    documentHash: 'sha256-rrb-ntpc-2026-v1',
    detectedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'verification-required',
    retryCount: 0,
    lastProcessedAt: new Date(Date.now() - 1000 * 60 * 170).toISOString(),
    extractedData: {
      recruitmentTitle: 'RRB NTPC (Graduate & Undergraduate) Recruitment 2026',
      organization: 'Railway Recruitment Boards (Ministry of Railways)',
      shortOrg: 'RRB',
      advtNo: 'CEN 04/2026',
      sector: 'railways',
      categoryType: 'latest-jobs',
      postNames: ['Station Master', 'Goods Train Manager', 'Junior Account Assistant', 'Senior Clerk Cum Typist', 'Commercial Apprentice'],
      vacancies: 11558,
      categoryBreakdown: {
        ur: 4620,
        obc: 3120,
        ews: 1150,
        sc: 1730,
        st: 938,
        total: 11558
      },
      importantDates: {
        startDate: '2026-02-28',
        lastDate: '2026-03-22',
        feeLastDate: '2026-03-24',
        examDate: 'August - September 2026',
        admitCardDate: 'July 2026'
      },
      qualification: '12th Pass for Under Graduate Posts / Degree from Recognized University for Graduate Posts',
      qualificationLevel: 'graduate',
      ageLimit: {
        min: 18,
        max: 33,
        asOfDate: '01/07/2026',
        relaxation: 'OBC: 3 Years, SC/ST: 5 Years'
      },
      applicationFee: {
        genObcEws: 500,
        scStPh: 250,
        female: 250,
        paymentModes: 'Online Banking, UPI, Cards (Partial refund after CBT-1)'
      },
      selectionProcess: ['1st Stage CBT', '2nd Stage CBT', 'CBAT/Typing Skill Test', 'Document Verification & Medical Exam'],
      payScale: 'Level-2 to Level-6 (7th CPC)',
      applicationInstructions: 'Submit applications only through rrbapply.gov.in.',
      officialNotificationUrl: 'https://www.rrbapply.gov.in/notices/cen-04-2026-ntpc.pdf',
      officialApplicationUrl: 'https://www.rrbapply.gov.in/',
      state: 'All India',
      confidenceScore: 84,
      verificationFlags: [
        'Tentative exam date window pending zone-wise roster confirmation',
        'Undergraduate and graduate post bifurcation requires regional verification'
      ],
      sourcePublicationDate: '2026-02-28',
      lastVerifiedDate: new Date().toISOString()
    }
  }
];

// Helper to read JSON file safely
function readJson<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON file safely
function writeJson<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}

// DB Class maintaining in-memory cache synchronized with disk
class AutomationDatabase {
  private sources: OfficialSource[];
  private notices: DetectedNotice[];
  private config: AutomationConfig;
  private logs: AutomationLog[];
  private jobs: JobNotification[];

  constructor() {
    this.sources = readJson<OfficialSource[]>(SOURCES_FILE, DEFAULT_SOURCES);
    this.notices = readJson<DetectedNotice[]>(NOTICES_FILE, DEFAULT_NOTICES);
    this.config = readJson<AutomationConfig>(CONFIG_FILE, DEFAULT_CONFIG);
    if (!this.config.aiModel || this.config.aiModel.includes('2.5') || this.config.aiModel.includes('2.0') || this.config.aiModel.includes('1.5')) {
      this.config.aiModel = 'gemini-3.8-flash';
    }
    this.logs = readJson<AutomationLog[]>(LOGS_FILE, [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        level: 'info',
        action: 'SYSTEM_STARTUP',
        details: 'SarkariPortal AI Monitoring and Auto-Publishing Engine initialized successfully with 7 configured official sources.',
      }
    ]);
    // Jobs: load existing jobs, initialize from MOCK_JOBS if empty to preserve all existing records
    this.jobs = readJson<JobNotification[]>(JOBS_FILE, MOCK_JOBS);

    // Save initial state if files don't exist
    this.persistAll();
  }

  private persistAll() {
    writeJson(SOURCES_FILE, this.sources);
    writeJson(NOTICES_FILE, this.notices);
    writeJson(CONFIG_FILE, this.config);
    writeJson(LOGS_FILE, this.logs);
    writeJson(JOBS_FILE, this.jobs);
  }

  // --- Official Sources ---
  public getSources(): OfficialSource[] {
    return [...this.sources];
  }

  public getSource(id: string): OfficialSource | undefined {
    return this.sources.find((s) => s.id === id);
  }

  public saveSource(source: OfficialSource): OfficialSource {
    const idx = this.sources.findIndex((s) => s.id === source.id);
    if (idx >= 0) {
      this.sources[idx] = { ...source, updatedAt: new Date().toISOString() };
    } else {
      this.sources.unshift({
        ...source,
        createdAt: source.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    writeJson(SOURCES_FILE, this.sources);
    return source;
  }

  public deleteSource(id: string): boolean {
    const initialLen = this.sources.length;
    this.sources = this.sources.filter((s) => s.id !== id);
    if (this.sources.length !== initialLen) {
      writeJson(SOURCES_FILE, this.sources);
      return true;
    }
    return false;
  }

  // --- Detected Notices ---
  public getNotices(): DetectedNotice[] {
    return [...this.notices];
  }

  public getNotice(id: string): DetectedNotice | undefined {
    return this.notices.find((n) => n.id === id);
  }

  public getNoticeByHash(hash: string): DetectedNotice | undefined {
    return this.notices.find((n) => n.documentHash === hash);
  }

  public saveNotice(notice: DetectedNotice): DetectedNotice {
    const idx = this.notices.findIndex((n) => n.id === notice.id);
    if (idx >= 0) {
      this.notices[idx] = notice;
    } else {
      this.notices.unshift(notice);
    }
    writeJson(NOTICES_FILE, this.notices);
    return notice;
  }

  public deleteNotice(id: string): boolean {
    const initialLen = this.notices.length;
    this.notices = this.notices.filter((n) => n.id !== id);
    if (this.notices.length !== initialLen) {
      writeJson(NOTICES_FILE, this.notices);
      return true;
    }
    return false;
  }

  // --- Public Jobs Store ---
  public getJobs(): JobNotification[] {
    return [...this.jobs];
  }

  public getJob(id: string): JobNotification | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  public saveJob(job: JobNotification): JobNotification {
    const idx = this.jobs.findIndex((j) => j.id === job.id);
    if (idx >= 0) {
      this.jobs[idx] = job;
    } else {
      this.jobs.unshift(job);
    }
    writeJson(JOBS_FILE, this.jobs);
    return job;
  }

  public deleteJob(id: string): boolean {
    const initialLen = this.jobs.length;
    this.jobs = this.jobs.filter((j) => j.id !== id);
    if (this.jobs.length !== initialLen) {
      writeJson(JOBS_FILE, this.jobs);
      return true;
    }
    return false;
  }

  // --- Publishing workflow (Linked pair of Job and Article) ---
  public publishNoticeAsJob(noticeId: string, adminNotes?: string): { success: boolean; job?: JobNotification; error?: string } {
    const notice = this.getNotice(noticeId);
    if (!notice) return { success: false, error: 'Notice not found' };
    if (!notice.extractedData) return { success: false, error: 'Extracted recruitment data is missing' };

    const ext = notice.extractedData;
    const jobId = notice.publishedJobId || `job-auto-${Date.now()}`;

    const newJob: JobNotification = {
      id: jobId,
      title: ext.recruitmentTitle,
      postName: ext.postNames.join(', ') || ext.recruitmentTitle,
      organization: ext.organization,
      shortOrg: ext.shortOrg,
      advtNo: ext.advtNo || `ADVT-${new Date().getFullYear()}`,
      sector: ext.sector || 'upsc',
      sectorName: ext.sector ? ext.sector.toUpperCase() : 'Government Sector',
      categoryType: ext.categoryType || 'latest-jobs',
      vacancies: ext.vacancies || 0,
      qualification: ext.qualification || 'As per official recruitment notification',
      qualificationLevel: ext.qualificationLevel || 'graduate',
      ageLimit: ext.ageLimit || { min: 18, max: 35, asOfDate: '01/01/2026', relaxation: 'As per rules' },
      importantDates: {
        startDate: ext.importantDates?.startDate || new Date().toISOString().split('T')[0],
        lastDate: ext.importantDates?.lastDate || 'See official notification',
        feeLastDate: ext.importantDates?.feeLastDate || ext.importantDates?.lastDate || 'See official notification',
        examDate: ext.importantDates?.examDate || 'To be announced',
        admitCardDate: ext.importantDates?.admitCardDate || 'To be announced',
        resultDate: ext.importantDates?.resultDate,
      },
      applicationFee: ext.applicationFee || { genObcEws: 100, scStPh: 0, female: 0, paymentModes: 'Online' },
      state: ext.state || 'All India',
      payScale: ext.payScale || 'As per 7th CPC norms',
      status: 'Active',
      isUrgent: false,
      isHot: true,
      notificationPdfUrl: ext.officialNotificationUrl || notice.documentUrl || '',
      applyUrl: ext.officialApplicationUrl || notice.sourceUrl,
      officialWebsite: notice.sourceUrl,
      categoryBreakdown: ext.categoryBreakdown || { ur: 0, obc: 0, ews: 0, sc: 0, st: 0, total: ext.vacancies || 0 },
      selectionProcess: ext.selectionProcess || ['Written Examination', 'Document Verification'],
      brief: notice.hindiArticle?.overview || ext.recruitmentTitle,
      datePosted: new Date().toISOString().split('T')[0],
    };

    // Save job into public store
    this.saveJob(newJob);

    // Update notice status to published
    notice.status = 'published';
    notice.publishedJobId = jobId;
    this.saveNotice(notice);

    // Update source metrics
    const src = this.getSource(notice.sourceId);
    if (src) {
      src.totalPublished = (src.totalPublished || 0) + 1;
      this.saveSource(src);
    }

    // Add audit log
    this.addLog({
      id: `log-pub-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'success',
      action: 'NOTICE_PUBLISHED',
      details: `Recruitment notice "${ext.recruitmentTitle}" published as active job ID ${jobId}. ${adminNotes || ''}`,
      sourceId: notice.sourceId,
      noticeId: notice.id,
    });

    return { success: true, job: newJob };
  }

  // --- Automation Config ---
  public getConfig(): AutomationConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AutomationConfig>): AutomationConfig {
    this.config = { ...this.config, ...updates };
    writeJson(CONFIG_FILE, this.config);
    this.addLog({
      id: `log-cfg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      action: 'CONFIG_UPDATED',
      details: `Automation settings updated. Auto-Publish is currently: ${this.config.autoPublishEnabled ? 'ENABLED' : 'DISABLED'}.`,
    });
    return { ...this.config };
  }

  // --- Automation Logs ---
  public getLogs(limit: number = 100): AutomationLog[] {
    return this.logs.slice(0, limit);
  }

  public addLog(log: AutomationLog): void {
    this.logs.unshift(log);
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(0, 500);
    }
    writeJson(LOGS_FILE, this.logs);
  }

  // --- Dashboard Statistics ---
  public getDashboardStats(): AutomationDashboardStats {
    const sources = this.sources;
    const notices = this.notices;

    return {
      sourcesMonitored: sources.length,
      activeSources: sources.filter((s) => s.isEnabled && s.status === 'active').length,
      notificationsDetected: notices.length,
      documentsProcessed: notices.filter((n) => n.extractedData !== undefined).length,
      draftArticlesReady: notices.filter((n) => n.status === 'draft-ready').length,
      duplicatesSkipped: notices.filter((n) => n.status === 'rejected' && n.errorMessage?.includes('Duplicate')).length,
      verificationRequired: notices.filter((n) => n.status === 'verification-required').length,
      failedProcessing: notices.filter((n) => n.status === 'failed').length,
      publishedArticles: notices.filter((n) => n.status === 'published').length,
      autoPublishEnabled: this.config.autoPublishEnabled,
      lastRunTime: this.config.lastMonitoringRun,
    };
  }
}

export const db = new AutomationDatabase();
