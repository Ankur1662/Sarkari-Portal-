import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  GraduationCap
} from 'lucide-react';

import { MOCK_JOBS } from './data/mockJobs';
import { INITIAL_NOTIFICATIONS } from './data/initialNotifications';
import { SECTORS } from './data/sectors';
import { 
  JobNotification, 
  NotificationAlert, 
  SectorId, 
  JobCategory, 
  QualificationLevel 
} from './types/job';

import { Header } from './components/Header';
import { MarqueeAlerts } from './components/MarqueeAlerts';
import { NotificationDrawer } from './components/NotificationDrawer';
import { HeroSection } from './components/HeroSection';
import { SarkariQuickBoard } from './components/SarkariQuickBoard';
import { SarkariSidebar } from './components/SarkariSidebar';
import { SectorFilterGrid } from './components/SectorFilterGrid';
import { JobCard } from './components/JobCard';
import { JobTableView } from './components/JobTableView';
import { JobDetailModal } from './components/JobDetailModal';
import { AgeCalculatorModal } from './components/AgeCalculatorModal';
import { EligibilityFinderModal } from './components/EligibilityFinderModal';
import { SavedJobsModal } from './components/SavedJobsModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { BottomNavBar } from './components/BottomNavBar';
import { Footer } from './components/Footer';
import { getJobStatusInfo, JobStatusType } from './utils/jobStatus';
import { automationService } from './services/automationService';
import { HindiArticleModal } from './components/HindiArticleModal';
import { HindiRecruitmentArticle } from './types/automation';
import { generatePublicHindiArticle } from './utils/hindiArticleHelper';
import { getRouteSEO, updateDOMHead } from './utils/seo';

export default function App() {
  // State for Jobs and Notifications with LocalStorage persistence
  const [jobs, setJobs] = useState<JobNotification[]>(() => {
    try {
      const stored = localStorage.getItem('sarkari_all_jobs');
      return stored ? JSON.parse(stored) : MOCK_JOBS;
    } catch {
      return MOCK_JOBS;
    }
  });
  const [notifications, setNotifications] = useState<NotificationAlert[]>(INITIAL_NOTIFICATIONS);
  
  // Admin authentication & authorization state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sarkari_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sarkari_saved_jobs');
      return stored ? JSON.parse(stored) : ['upsc-cse-2026', 'ssc-cgl-2026'];
    } catch {
      return ['upsc-cse-2026', 'ssc-cgl-2026'];
    }
  });
  const [publicHindiArticle, setPublicHindiArticle] = useState<HindiRecruitmentArticle | null>(null);

  // Sound settings
  const [isMuted, setIsMuted] = useState(false);

  // Subscribed sectors for real-time alerts
  const [subscribedSectors, setSubscribedSectors] = useState<SectorId[]>([
    'upsc', 'ssc', 'banking', 'railways', 'defence', 'teaching', 'state-psc', 'psu', 'healthcare'
  ]);

  // Active Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'all'>('all');
  const [selectedQualification, setSelectedQualification] = useState<QualificationLevel | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<JobStatusType | 'all'>('all');
  const [onlyUrgent, setOnlyUrgent] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'latest' | 'deadline' | 'vacancies'>('latest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);

  // UI View Mode (Grid vs Table)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [activeJobModal, setActiveJobModal] = useState<JobNotification | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isAgeCalculatorOpen, setIsAgeCalculatorOpen] = useState(false);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [isSavedJobsOpen, setIsSavedJobsOpen] = useState(false);
  const [presetJobForAge, setPresetJobForAge] = useState<JobNotification | null>(null);

  // Live Toast for newly pushed alerts
  const [liveToast, setLiveToast] = useState<NotificationAlert | null>(null);

  // Audio synthesizer for notification chimes
  const playAlertSound = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext could be blocked by autoplay rules
    }
  };

  // Persist saved jobs
  useEffect(() => {
    try {
      localStorage.setItem('sarkari_saved_jobs', JSON.stringify(savedJobIds));
    } catch {
      // Ignore
    }
  }, [savedJobIds]);

  // Persist jobs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sarkari_all_jobs', JSON.stringify(jobs));
    } catch {
      // Ignore
    }
  }, [jobs]);

  // Fetch live jobs from backend server authority on mount
  useEffect(() => {
    automationService.getJobs().then((serverJobs) => {
      if (serverJobs && serverJobs.length > 0) {
        setJobs(serverJobs);
      }
    }).catch(() => {
      // Offline fallback: existing localStorage / MOCK_JOBS remains active
    });
  }, []);

  // Browser History & Deep URL Routing Synchronization (SEO Canonical Routes)
  useEffect(() => {
    const syncRouteWithState = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      const hash = window.location.hash.replace('#', '');

      // Check /job/:id
      const match = path.match(/^\/job\/([^/]+)/);
      if (match) {
        const jobId = decodeURIComponent(match[1]);
        const found = jobs.find((j) => j.id === jobId) || MOCK_JOBS.find((j) => j.id === jobId);
        if (found) {
          setActiveJobModal(found);
          updateDOMHead(getRouteSEO(path, found));
          return;
        }
      }

      // Check category paths or legacy hashes
      if (path === '/latest-jobs' || hash === 'latest-jobs') {
        setSelectedCategory('latest-jobs');
        setActiveJobModal(null);
        updateDOMHead(getRouteSEO('/latest-jobs', null));
        return;
      }
      if (path === '/results' || hash === 'results') {
        setSelectedCategory('results');
        setActiveJobModal(null);
        updateDOMHead(getRouteSEO('/results', null));
        return;
      }
      if (path === '/admit-card' || hash === 'admit-card') {
        setSelectedCategory('admit-card');
        setActiveJobModal(null);
        updateDOMHead(getRouteSEO('/admit-card', null));
        return;
      }
      if (path === '/answer-key' || hash === 'answer-key') {
        setSelectedCategory('answer-key');
        setActiveJobModal(null);
        updateDOMHead(getRouteSEO('/answer-key', null));
        return;
      }
      if (path === '/syllabus' || hash === 'syllabus') {
        setSelectedCategory('syllabus');
        setActiveJobModal(null);
        updateDOMHead(getRouteSEO('/syllabus', null));
        return;
      }

      // Default Homepage
      setSelectedCategory('all');
      setActiveJobModal(null);
      updateDOMHead(getRouteSEO('/', null));
    };

    syncRouteWithState();
    window.addEventListener('popstate', syncRouteWithState);
    return () => window.removeEventListener('popstate', syncRouteWithState);
  }, [jobs]);

  // Unified SEO-friendly navigation handlers
  const handleOpenJob = (job: JobNotification) => {
    setActiveJobModal(job);
    window.history.pushState(null, '', `/job/${job.id}`);
    updateDOMHead(getRouteSEO(`/job/${job.id}`, job));
  };

  const handleCloseJobModal = () => {
    setActiveJobModal(null);
    const targetPath = selectedCategory === 'all' ? '/' : `/${selectedCategory}`;
    window.history.pushState(null, '', targetPath);
    updateDOMHead(getRouteSEO(targetPath, null));
  };

  const handleSelectCategory = (cat: JobCategory | 'all') => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const targetPath = cat === 'all' ? '/' : `/${cat}`;
    window.history.pushState(null, '', targetPath);
    updateDOMHead(getRouteSEO(targetPath, null));
  };

  // Admin CRUD Handlers
  const handleSaveJob = (jobToSave: JobNotification) => {
    setJobs((prev) => {
      const exists = prev.some((j) => j.id === jobToSave.id);
      if (exists) {
        return prev.map((j) => (j.id === jobToSave.id ? jobToSave : j));
      }
      return [jobToSave, ...prev];
    });
    automationService.saveJob(jobToSave).catch(() => {});
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
    if (activeJobModal?.id === jobId) {
      setActiveJobModal(null);
    }
    automationService.deleteJob(jobId).catch(() => {});
  };

  const handleResetToDefault = () => {
    setJobs(MOCK_JOBS);
    setNotifications(INITIAL_NOTIFICATIONS);
    try {
      localStorage.removeItem('sarkari_all_jobs');
      localStorage.removeItem('sarkari_notifications');
    } catch {
      // Ignore
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('sarkari_admin_auth', 'true');
    } catch {
      // ignore
    }
    setIsAdminLoginOpen(false);
    setIsAdminOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
    try {
      sessionStorage.removeItem('sarkari_admin_auth');
    } catch {
      // ignore
    }
  };

  const handleAddNotification = (newNotif: NotificationAlert) => {
    setNotifications((prev) => [newNotif, ...prev]);
    playAlertSound();
    setLiveToast(newNotif);
  };

  const handleDeleteNotification = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  // Toggle Save/Bookmark
  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  // Toggle Sector Subscription for alerts
  const handleToggleSectorSubscription = (sectorId: SectorId) => {
    setSubscribedSectors((prev) =>
      prev.includes(sectorId) ? prev.filter((id) => id !== sectorId) : [...prev, sectorId]
    );
  };

  // Mark all notifications as read
  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Simulate a real-time incoming push notification
  const handleSimulateNewAlert = () => {
    const alertTemplates = [
      {
        title: 'RRB NTPC 2026 CBT-1 Examination Schedule Published',
        description: 'Computer Based Test Phase 1 will commence from 18th August 2026 across 133 test centers.',
        sector: 'railways' as SectorId,
        categoryType: 'admit-card' as JobCategory,
        jobId: 'rrb-ntpc-2026',
        isUrgent: true,
      },
      {
        title: 'UPSC Civil Services Prelims 2026 Correction Window Active',
        description: 'Candidate photo, signature and exam center change window is now open until 12th March.',
        sector: 'upsc' as SectorId,
        categoryType: 'latest-jobs' as JobCategory,
        jobId: 'upsc-cse-2026',
        isUrgent: true,
      },
      {
        title: 'SBI PO 2026 Last Date Reminder: 48 Hours Left',
        description: 'Online application and fee payment link closes shortly for 2,000 Probationary Officer posts.',
        sector: 'banking' as SectorId,
        categoryType: 'latest-jobs' as JobCategory,
        jobId: 'sbi-po-2026',
        isUrgent: true,
      },
      {
        title: 'UPPSC PCS 2026 Prelims Exam Date Announced',
        description: 'Combined State / Upper Subordinate Services Examination rescheduled to 14th June 2026.',
        sector: 'state-psc' as SectorId,
        categoryType: 'latest-jobs' as JobCategory,
        jobId: 'uppsc-pcs-2026',
        isUrgent: false,
      },
    ];

    const randomTemplate = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
    const newAlert: NotificationAlert = {
      id: `alert-sim-${Date.now()}`,
      title: randomTemplate.title,
      description: randomTemplate.description,
      sector: randomTemplate.sector,
      categoryType: randomTemplate.categoryType,
      jobId: randomTemplate.jobId,
      timestamp: 'Just now',
      isUrgent: randomTemplate.isUrgent,
      read: false,
      actionText: 'View Notification',
    };

    setNotifications((prev) => [newAlert, ...prev]);
    playAlertSound();
    setLiveToast(newAlert);

    // Auto-dismiss toast after 6s
    setTimeout(() => {
      setLiveToast((current) => (current?.id === newAlert.id ? null : current));
    }, 6000);
  };

  // Handle clicking an alert item
  const handleSelectAlert = (alert: NotificationAlert) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === alert.id ? { ...n, read: true } : n))
    );
    // Open target job if available
    if (alert.jobId) {
      const found = jobs.find((j) => j.id === alert.jobId);
      if (found) {
        setActiveJobModal(found);
      }
    }
  };

  // Open Age calculator with specific job
  const handleOpenAgeCalculatorWithJob = (job: JobNotification) => {
    setPresetJobForAge(job);
    setIsAgeCalculatorOpen(true);
  };

  // Scroll helper
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          job.title.toLowerCase().includes(q) ||
          job.shortOrg.toLowerCase().includes(q) ||
          job.organization.toLowerCase().includes(q) ||
          job.postName.toLowerCase().includes(q) ||
          job.qualification.toLowerCase().includes(q) ||
          job.state.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Sector filter
      if (selectedSector !== 'all' && job.sector !== selectedSector) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && job.categoryType !== selectedCategory) {
        return false;
      }

      // Qualification filter
      if (selectedQualification !== 'all' && job.qualificationLevel !== selectedQualification) {
        return false;
      }

      // State filter
      if (selectedState !== 'all') {
        const qState = selectedState.toLowerCase();
        const jState = job.state.toLowerCase();
        const jTitle = job.title.toLowerCase();
        const jOrg = job.organization.toLowerCase();

        if (selectedState === 'All India') {
          if (job.state !== 'All India') return false;
        } else {
          const isMatch = 
            jState === qState || 
            jState === 'all india' || 
            jTitle.includes(qState) || 
            jOrg.includes(qState);
          if (!isMatch) return false;
        }
      }

      // Application Status filter
      if (selectedStatus !== 'all') {
        const statusInfo = getJobStatusInfo(job);
        if (statusInfo.status !== selectedStatus) {
          return false;
        }
      }

      // Only urgent
      if (onlyUrgent && !job.isUrgent) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'vacancies') {
        return b.vacancies - a.vacancies;
      }
      if (sortBy === 'deadline') {
        return a.importantDates.lastDate.localeCompare(b.importantDates.lastDate);
      }
      return b.datePosted.localeCompare(a.datePosted);
    });
  }, [
    jobs,
    searchQuery,
    selectedSector,
    selectedCategory,
    selectedQualification,
    selectedState,
    selectedStatus,
    onlyUrgent,
    sortBy,
  ]);

  // Reset pagination to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedSector,
    selectedCategory,
    selectedQualification,
    selectedState,
    selectedStatus,
    onlyUrgent,
    sortBy,
  ]);

  // Paginated/displayed items
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, currentPage * itemsPerPage);
  }, [filteredJobs, currentPage, itemsPerPage]);

  // Aggregate stats
  const totalActiveVacancies = useMemo(() => {
    return jobs.reduce((acc, curr) => acc + (curr.vacancies || 0), 0);
  }, [jobs]);

  const featuredJob = useMemo(() => {
    return jobs.find((j) => j.id === 'upsc-cse-2026') || jobs[0];
  }, [jobs]);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSector('all');
    setSelectedCategory('all');
    setSelectedQualification('all');
    setSelectedState('all');
    setSelectedStatus('all');
    setOnlyUrgent(false);
    setSortBy('latest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedSector !== 'all' ||
    selectedCategory !== 'all' ||
    selectedQualification !== 'all' ||
    selectedState !== 'all' ||
    selectedStatus !== 'all' ||
    onlyUrgent;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-24 md:pb-0">
      {/* 1. Header with Join Us on WhatsApp & Telegram, SarkariBoard Brand, Sub-Nav Bar with Job Match */}
      <Header
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenEligibilityFinder={() => setIsEligibilityOpen(true)}
        savedJobsCount={savedJobIds.length}
        onOpenSavedJobs={() => setIsSavedJobsOpen(true)}
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onScrollToSection={handleScrollToSection}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdmin={() => {
          if (isAdminAuthenticated) {
            setIsAdminOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onAdminLogout={handleAdminLogout}
        onOpenAgeCalculator={() => {
          setPresetJobForAge(null);
          setIsAgeCalculatorOpen(true);
        }}
      />

      {/* Floating Live Push Notification Toast */}
      {liveToast && (
        <div className="fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-40 max-w-sm bg-slate-950 text-white p-4 rounded-xl shadow-2xl border border-amber-500/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Live Government Alert
              </span>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-bold text-slate-100 mt-1.5 leading-snug">
            {liveToast.title}
          </p>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
            {liveToast.description}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                handleSelectAlert(liveToast);
                setLiveToast(null);
              }}
              className="font-bold text-amber-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Details</span>
              <span>→</span>
            </button>
            <span className="text-[10px] text-slate-400">{liveToast.timestamp}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-4 sm:space-y-5 flex-1 w-full">
        {/* 1. Flash Updates Marquee Ticker (Positioned directly ABOVE HeroSection as requested) */}
        <div className="rounded-xl overflow-hidden shadow-xs border border-slate-200">
          <MarqueeAlerts
            alerts={notifications}
            onSelectAlert={handleSelectAlert}
            isMuted={isMuted}
            onToggleSound={() => setIsMuted(!isMuted)}
          />
        </div>

        {/* 2. Responsive Hero Section (Royal Blue Gradient with wave curves, 14 NEW UPDATES, Hindi Headline, and 4 Square Action Cards) */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => handleScrollToSection('all-listings')}
          totalNewUpdatesCount={notifications.length}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            handleSelectCategory(cat);
            handleScrollToSection('all-listings');
          }}
          onOpenJobMatch={() => setIsEligibilityOpen(true)}
          jobs={jobs}
          onSelectJob={(job) => {
            handleOpenJob(job);
          }}
        />

        {/* 4. Multi-Column Layout: Left Sidebar (By State, By Qual, By Dept, Daily Digest) + Right Main Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start pt-2">
          {/* Left Sidebar Column (Order-2 on mobile so Main Board appears first) */}
          <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3 w-full">
            <SarkariSidebar
              selectedState={selectedState}
              onSelectState={setSelectedState}
              selectedQualification={selectedQualification}
              onSelectQualification={setSelectedQualification}
              selectedSector={selectedSector}
              onSelectSector={setSelectedSector}
              onScrollToListings={() => handleScrollToSection('all-listings')}
              onResetFilters={resetAllFilters}
            />
          </div>

          {/* Right Main Column */}
          <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9 space-y-5 sm:space-y-6 w-full">
            {/* Signature Sarkari 3-Column Fast-Board */}
            <SarkariQuickBoard
              jobs={jobs}
              onSelectJob={(job) => handleOpenJob(job)}
              onViewAllCategory={(cat) => {
                handleSelectCategory(cat);
                handleScrollToSection('all-listings');
              }}
            />

            {/* 5. Comprehensive Filterable Listings Section (Prioritized for instant access) */}
            <section id="all-listings" className="space-y-4 pt-1">
          {/* Section Heading & Category Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Directory</span>
                <span aria-hidden="true">/</span>
                <span>{selectedSector === 'all' ? 'All Government Sectors' : SECTORS.find((s) => s.id === selectedSector)?.name}</span>
                <span aria-hidden="true">/</span>
                <span className="capitalize">{selectedCategory === 'all' ? 'All Sections' : selectedCategory.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {selectedCategory === 'latest-jobs' && 'Latest Government Jobs (नवीनतम नौकरियां)'}
                  {selectedCategory === 'results' && 'Recruitment Results & Cut-Offs (सरकारी रिजल्ट)'}
                  {selectedCategory === 'admit-card' && 'Admit Cards & Hall Tickets (प्रवेश पत्र)'}
                  {selectedCategory === 'answer-key' && 'Answer Keys & Solutions (उत्तर कुंजी)'}
                  {selectedCategory === 'syllabus' && 'Exam Syllabus & Pattern (पाठ्यक्रम)'}
                  {selectedCategory === 'all' && 'Verified Government Recruitment Directory'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-200">
                  {filteredJobs.length} Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {selectedCategory === 'latest-jobs' && 'Direct online registration forms, vacancy eligibility, and official notifications across Central & State governments.'}
                {selectedCategory === 'results' && 'Direct official scorecards, merit lists, category cut-off marks, and interview selection lists.'}
                {selectedCategory === 'admit-card' && 'Verified download links for E-Call letters, examination center intimation slips, and test schedules.'}
                {selectedCategory === 'answer-key' && 'Official provisional/final answer keys, candidate response sheets, and online objection windows.'}
                {selectedCategory === 'syllabus' && 'Official syllabus blueprints, subject-wise marking schemes, and examination patterns.'}
                {selectedCategory === 'all' && 'All official notifications for online application forms, admit cards, results, and answer keys in one place.'}
              </p>
            </div>

            {/* View Mode & Sorter */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Card Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'table'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Tabular Data View"
                  aria-label="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort listings"
                className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="latest">Sort: Recently Published</option>
                <option value="deadline">Sort: Ending Soonest</option>
                <option value="vacancies">Sort: Vacancy Count (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Segmented Tabs (Latest Jobs, Results, Admit Cards, Answer Keys) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none [overflow-scrolling:touch]">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'latest-jobs', label: 'Latest Jobs' },
              { id: 'results', label: 'Results' },
              { id: 'admit-card', label: 'Admit Cards' },
              { id: 'answer-key', label: 'Answer Keys' },
              { id: 'syllabus', label: 'Syllabus' },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              const count = tab.id === 'all' ? jobs.length : jobs.filter((j) => j.categoryType === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleSelectCategory(tab.id as any);
                  }}
                  className={`px-3 py-2 font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-red-800 text-white shadow-xs ring-1 ring-red-900'
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] tabular-nums font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-red-950 text-amber-300' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Bar Controls (Department, Qualification, State, Application Status) */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase text-[11px] w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-red-700" />
              <span>Filters:</span>
            </div>

            {/* Application Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              aria-label="Filter by application status"
              className="w-full xs:w-auto flex-1 min-w-[140px] px-2.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Application Statuses</option>
              <option value="Apply Now">Apply Now (Active Form)</option>
              <option value="Last Date Soon">Last Date Soon (Ending Soon)</option>
              <option value="Result Out">Result Out</option>
              <option value="Admit Card Out">Admit Card Out</option>
              <option value="Answer Key Out">Answer Key Out</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Sector / Department Selector */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as any)}
              aria-label="Filter by department or sector"
              className="w-full xs:w-auto flex-1 min-w-[140px] px-2.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Departments ({jobs.length})</option>
              {SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Qualification Selector */}
            <select
              value={selectedQualification}
              onChange={(e) => setSelectedQualification(e.target.value as any)}
              aria-label="Filter by required qualification"
              className="w-full xs:w-auto flex-1 min-w-[140px] px-2.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Qualifications</option>
              <option value="10th">10th Matriculation Pass</option>
              <option value="12th">12th Intermediate Pass</option>
              <option value="graduate">Graduate Degree</option>
              <option value="engineering">B.E. / B.Tech</option>
              <option value="diploma">Diploma / ITI</option>
              <option value="post-graduate">Post Graduate</option>
              <option value="medical">Medical / Nursing</option>
            </select>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Filter by state"
              className="w-full xs:w-auto flex-1 min-w-[130px] px-2.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            >
              <option value="all">All Locations (Pan India)</option>
              <option value="All India">All India Level</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Haryana">Haryana</option>
              <option value="Jharkhand">Jharkhand</option>
            </select>

            {/* Bottom Row Actions for Mobile */}
            <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto gap-3 pt-1 sm:pt-0">
              {/* Urgent Deadline Checkbox */}
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyUrgent}
                  onChange={(e) => setOnlyUrgent(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span className="font-semibold text-red-700 text-xs">
                  Ending Soon Only
                </span>
              </label>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 text-slate-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ml-auto border border-slate-200"
                >
                  <RotateCcw className="w-3 h-3 text-red-600" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Summary & Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="tabular-nums">
              Showing <strong>{Math.min(displayedJobs.length, filteredJobs.length)}</strong> of <strong>{filteredJobs.length}</strong> verified recruitments
            </span>
            {hasActiveFilters && (
              <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                Filters active
              </span>
            )}
          </div>

          {/* Listings View (Grid or Table) */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 sm:p-14 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6 stroke-1.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No recruitments found matching criteria
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                We couldn't find any verified listings matching your specific combination of filters. Try changing qualification, state, or resetting all filters.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={(j) => handleOpenJob(j)}
                    isSaved={savedJobIds.includes(job.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>

              {/* Pagination & Load More Controls */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing 1 to {Math.min(displayedJobs.length, filteredJobs.length)} of {filteredJobs.length} items
                </span>

                <div className="flex items-center gap-2">
                  {displayedJobs.length < filteredJobs.length && (
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <span>Load More</span>
                      <span className="text-[11px] opacity-80">({filteredJobs.length - displayedJobs.length} more)</span>
                    </button>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            handleScrollToSection('all-listings');
                          }}
                          className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <JobTableView
                jobs={displayedJobs}
                onSelect={(j) => handleOpenJob(j)}
                savedJobs={savedJobIds}
                onToggleSave={handleToggleSave}
              />

              {/* Pagination for Table */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing 1 to {Math.min(displayedJobs.length, filteredJobs.length)} of {filteredJobs.length} items
                </span>

                <div className="flex items-center gap-2">
                  {displayedJobs.length < filteredJobs.length && (
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <span>Load More</span>
                      <span className="text-[11px] opacity-80">({filteredJobs.length - displayedJobs.length} more)</span>
                    </button>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            handleScrollToSection('all-listings');
                          }}
                          className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 6. Sector Categories Grid */}
        <section id="sectors-section" className="pt-2">
          <SectorFilterGrid
            jobs={jobs}
            selectedSector={selectedSector}
            onSelectSector={(sector) => {
              setSelectedSector(sector);
              handleScrollToSection('all-listings');
            }}
          />
        </section>

        {/* 7. Aspirant Decision Tools & Utilities Ribbon */}
        <section id="utilities-section" className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                Aspirant Decision Tools
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Government Recruitment Eligibility & Age Verification
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Calculate your exact age as of official cut-off dates with category relaxation (OBC +3 yrs, SC/ST +5 yrs, PwBD +10 yrs), or match your highest degree to all active jobs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setPresetJobForAge(null);
                  setIsAgeCalculatorOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Govt Age Calculator</span>
              </button>

              <button
                onClick={() => setIsEligibilityOpen(true)}
                className="px-4 py-2.5 rounded-xl font-medium text-xs bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Eligibility Matcher</span>
              </button>
            </div>
          </div>
        </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onSelectSector={(s) => {
          setSelectedSector(s);
          handleScrollToSection('all-listings');
        }}
        onOpenAgeCalculator={() => {
          setPresetJobForAge(null);
          setIsAgeCalculatorOpen(true);
        }}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Modals & Drawers */}
      <JobDetailModal
        job={activeJobModal}
        onClose={handleCloseJobModal}
        isSaved={activeJobModal ? savedJobIds.includes(activeJobModal.id) : false}
        onToggleSave={handleToggleSave}
        onOpenAgeCalculatorWithJob={handleOpenAgeCalculatorWithJob}
        onOpenHindiGuide={(job) => setPublicHindiArticle(generatePublicHindiArticle(job))}
      />

      <HindiArticleModal
        isOpen={Boolean(publicHindiArticle)}
        onClose={() => setPublicHindiArticle(null)}
        article={publicHindiArticle}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onNotificationClick={(alert) => {
          handleSelectAlert(alert);
          setIsNotifDrawerOpen(false);
        }}
        onMarkAllAsRead={handleMarkAllNotifsRead}
        onSimulateNewAlert={handleSimulateNewAlert}
        subscribedSectors={subscribedSectors}
        onToggleSectorSubscription={handleToggleSectorSubscription}
      />

      <AgeCalculatorModal
        isOpen={isAgeCalculatorOpen}
        onClose={() => setIsAgeCalculatorOpen(false)}
        presetJob={presetJobForAge}
        onSelectJob={(j) => {
          setIsAgeCalculatorOpen(false);
          setActiveJobModal(j);
        }}
      />

      <EligibilityFinderModal
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        jobs={jobs}
        onSelectJob={(j) => setActiveJobModal(j)}
      />

      <SavedJobsModal
        isOpen={isSavedJobsOpen}
        onClose={() => setIsSavedJobsOpen(false)}
        savedJobIds={savedJobIds}
        allJobs={jobs}
        onSelectJob={(j) => setActiveJobModal(j)}
        onRemoveSaved={handleToggleSave}
        onClearAllSaved={() => setSavedJobIds([])}
      />

      {/* Admin Control Panel with Authorization Guard */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        jobs={jobs}
        onSaveJob={handleSaveJob}
        onDeleteJob={handleDeleteJob}
        onResetToDefault={handleResetToDefault}
        notifications={notifications}
        onAddNotification={handleAddNotification}
        onDeleteNotification={handleDeleteNotification}
        onSelectJobForPreview={(job) => {
          setIsAdminOpen(false);
          setActiveJobModal(job);
        }}
        isAuthenticated={isAdminAuthenticated}
        onOpenAuth={() => setIsAdminLoginOpen(true)}
      />

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Mobile App-like Fixed Bottom Navigation Bar (5 Items: Home, Jobs, Results, Admit Card, More) */}
      <BottomNavBar
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onScrollToSection={handleScrollToSection}
        onOpenAgeCalculator={() => {
          setPresetJobForAge(null);
          setIsAgeCalculatorOpen(true);
        }}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        onOpenSavedJobs={() => setIsSavedJobsOpen(true)}
        onOpenAdmin={() => {
          if (isAdminAuthenticated) {
            setIsAdminOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
        savedJobsCount={savedJobIds.length}
      />
    </div>
  );
}
