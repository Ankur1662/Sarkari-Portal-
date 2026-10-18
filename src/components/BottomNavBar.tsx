import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Briefcase, 
  ClipboardCheck, 
  Ticket, 
  Menu, 
  X, 
  KeyRound, 
  BookOpen, 
  Calculator, 
  Sparkles, 
  Bookmark, 
  ShieldAlert, 
  MessageCircle, 
  Send,
  Layers,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { JobCategory } from '../types/job';

interface BottomNavBarProps {
  activeCategory: JobCategory | 'all';
  onSelectCategory: (category: JobCategory | 'all') => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenAgeCalculator: () => void;
  onOpenEligibility: () => void;
  onOpenSavedJobs: () => void;
  onOpenAdmin: () => void;
  onOpenAdminLogin?: () => void;
  isAdminAuthenticated?: boolean;
  savedJobsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeCategory,
  onSelectCategory,
  onScrollToSection,
  onOpenAgeCalculator,
  onOpenEligibility,
  onOpenSavedJobs,
  onOpenAdmin,
  onOpenAdminLogin,
  isAdminAuthenticated = false,
  savedJobsCount,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Prevent background scroll when More menu bottom sheet is open
  useEffect(() => {
    if (isMoreMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMoreMenuOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMoreMenuOpen) {
        setIsMoreMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoreMenuOpen]);

  // Helper for Home navigation
  const handleHomeClick = () => {
    setIsMoreMenuOpen(false);
    onSelectCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper for Category navigation
  const handleCategoryClick = (cat: JobCategory) => {
    setIsMoreMenuOpen(false);
    onSelectCategory(cat);
    onScrollToSection('all-listings');
  };

  // Determine active state for each primary bottom nav tab
  const isHomeActive = activeCategory === 'all' && !isMoreMenuOpen;
  const isJobsActive = activeCategory === 'latest-jobs' && !isMoreMenuOpen;
  const isResultsActive = activeCategory === 'results' && !isMoreMenuOpen;
  const isAdmitCardActive = activeCategory === 'admit-card' && !isMoreMenuOpen;
  const isMoreActive = isMoreMenuOpen;

  return (
    <>
      {/* 1. Slide-up "More" Menu Sheet for Mobile (Z-50) */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="More website sections and utilities"
        >
          {/* Backdrop with smooth blur */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMoreMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal with Red & Gold theme */}
          <div 
            className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-slate-900 border-t-2 border-amber-500/40 text-white shadow-[0_-12px_40px_rgba(0,0,0,0.7)] p-4 sm:p-5 pb-28 animate-in slide-in-from-bottom duration-250 ease-out"
            style={{
              paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 64px)',
            }}
          >
            {/* Sheet Handle */}
            <div className="flex justify-center pb-2">
              <span className="w-12 h-1.5 rounded-full bg-slate-700/80 block" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-800 to-red-950 border border-amber-400/50 flex items-center justify-center text-amber-400 font-extrabold text-base shadow-sm">
                  S
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Sarkari<span className="text-red-400">Portal</span> Hub</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/20 text-amber-300 font-semibold uppercase">Menu</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Quick access to exams, utilities & government desks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Links Content */}
            <div className="space-y-4 text-xs">
              {/* Section 1: Exams & Papers */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2 px-1">
                  Exams & Papers
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCategoryClick('answer-key')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      activeCategory === 'answer-key'
                        ? 'bg-gradient-to-r from-red-950 to-red-900 border-amber-400/80 text-amber-300 shadow-xs'
                        : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-snug">Answer Keys</div>
                        <div className="text-[10px] text-slate-400">Official keys</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleCategoryClick('syllabus')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      activeCategory === 'syllabus'
                        ? 'bg-gradient-to-r from-red-950 to-red-900 border-amber-400/80 text-amber-300 shadow-xs'
                        : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-snug">Syllabus 2026</div>
                        <div className="text-[10px] text-slate-400">Pattern & PDF</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Section 2: Aspirant Utilities */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2 px-1">
                  Aspirant Utilities & Tools
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenAgeCalculator();
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:bg-slate-800 text-slate-200 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-red-900/40 text-rose-300">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-snug">Age Calculator</div>
                        <div className="text-[10px] text-slate-400">Official cut-off</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenEligibility();
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:bg-slate-800 text-slate-200 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-snug">Job Matcher</div>
                        <div className="text-[10px] text-slate-400">Find eligible jobs</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenSavedJobs();
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:bg-slate-800 text-slate-200 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-900/40 text-emerald-300">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-snug">Saved Jobs</div>
                        <div className="text-[10px] text-slate-400">
                          {savedJobsCount > 0 ? `${savedJobsCount} saved posts` : '0 saved posts'}
                        </div>
                      </div>
                    </div>
                    {savedJobsCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
                        {savedJobsCount}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onScrollToSection('sectors-section');
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:bg-slate-800 text-slate-200 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-sky-900/40 text-sky-300">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-snug">Govt Sectors</div>
                        <div className="text-[10px] text-slate-400">UPSC, SSC, Rly</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Section 3: Admin Desk & Social Channels */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between gap-2.5">
                  {isAdminAuthenticated ? (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-slate-700 hover:to-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-400/30 transition-colors cursor-pointer shadow-xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Admin Control Desk</span>
                    </button>
                  ) : onOpenAdminLogin ? (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenAdminLogin();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Staff Admin Login</span>
                    </button>
                  ) : null}

                  <a
                    href="https://whatsapp.com/channel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1.5 font-bold text-xs shadow-xs"
                    title="Join WhatsApp Alerts"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span className="hidden xs:inline">WhatsApp</span>
                  </a>

                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition-colors flex items-center justify-center gap-1.5 font-bold text-xs shadow-xs"
                    title="Join Telegram Channel"
                  >
                    <Send className="w-4 h-4 fill-current" />
                    <span className="hidden xs:inline">Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fixed Bottom Navigation Bar (Mobile Viewport Only: md:hidden) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-gradient-to-b from-[#6b0f0f] via-[#540808] to-[#3b0404] border-t border-[#8B0000] shadow-[0_-4px_16px_rgba(0,0,0,0.35)] select-none touch-manipulation overflow-hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Subtle golden accent hairline along the top border */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

        <div className="w-full max-w-lg mx-auto h-[64px] sm:h-[68px] grid grid-cols-5 items-stretch px-1">
          {/* Item 1: Home */}
          <button
            type="button"
            onClick={handleHomeClick}
            aria-label="Home"
            aria-current={isHomeActive ? 'page' : undefined}
            className="relative flex flex-col items-center justify-center h-full w-full py-1 px-0.5 transition-colors cursor-pointer min-w-0 select-none group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400/80 active:scale-95"
          >
            {/* Active Golden Tab Indicator at top */}
            {isHomeActive && (
              <span 
                className="absolute top-0 inset-x-0 mx-auto w-8 sm:w-10 h-[3px] rounded-b-full bg-amber-400 shadow-[0_1px_4px_rgba(251,191,36,0.5)] transition-all duration-200" 
                aria-hidden="true" 
              />
            )}

            <div className="relative flex items-center justify-center shrink-0">
              <Home
                className={`w-[23px] h-[23px] sm:w-[24px] sm:h-[24px] transition-colors duration-150 ${
                  isHomeActive
                    ? 'text-amber-400'
                    : 'text-rose-100/75 group-hover:text-white'
                }`}
                strokeWidth={isHomeActive ? 2.2 : 1.8}
              />
            </div>

            <span
              className={`text-[11px] sm:text-[12px] leading-tight font-medium tracking-tight mt-1 truncate max-w-full px-0.5 transition-colors duration-150 ${
                isHomeActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-white/80 group-hover:text-white'
              }`}
            >
              Home
            </span>
          </button>

          {/* Item 2: Jobs */}
          <button
            type="button"
            onClick={() => handleCategoryClick('latest-jobs')}
            aria-label="Jobs"
            aria-current={isJobsActive ? 'page' : undefined}
            className="relative flex flex-col items-center justify-center h-full w-full py-1 px-0.5 transition-colors cursor-pointer min-w-0 select-none group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400/80 active:scale-95"
          >
            {/* Active Golden Tab Indicator at top */}
            {isJobsActive && (
              <span 
                className="absolute top-0 inset-x-0 mx-auto w-8 sm:w-10 h-[3px] rounded-b-full bg-amber-400 shadow-[0_1px_4px_rgba(251,191,36,0.5)] transition-all duration-200" 
                aria-hidden="true" 
              />
            )}

            <div className="relative flex items-center justify-center shrink-0">
              <Briefcase
                className={`w-[23px] h-[23px] sm:w-[24px] sm:h-[24px] transition-colors duration-150 ${
                  isJobsActive
                    ? 'text-amber-400'
                    : 'text-rose-100/75 group-hover:text-white'
                }`}
                strokeWidth={isJobsActive ? 2.2 : 1.8}
              />
            </div>

            <span
              className={`text-[11px] sm:text-[12px] leading-tight font-medium tracking-tight mt-1 truncate max-w-full px-0.5 transition-colors duration-150 ${
                isJobsActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-white/80 group-hover:text-white'
              }`}
            >
              Jobs
            </span>
          </button>

          {/* Item 3: Results */}
          <button
            type="button"
            onClick={() => handleCategoryClick('results')}
            aria-label="Results"
            aria-current={isResultsActive ? 'page' : undefined}
            className="relative flex flex-col items-center justify-center h-full w-full py-1 px-0.5 transition-colors cursor-pointer min-w-0 select-none group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400/80 active:scale-95"
          >
            {/* Active Golden Tab Indicator at top */}
            {isResultsActive && (
              <span 
                className="absolute top-0 inset-x-0 mx-auto w-8 sm:w-10 h-[3px] rounded-b-full bg-amber-400 shadow-[0_1px_4px_rgba(251,191,36,0.5)] transition-all duration-200" 
                aria-hidden="true" 
              />
            )}

            <div className="relative flex items-center justify-center shrink-0">
              <ClipboardCheck
                className={`w-[23px] h-[23px] sm:w-[24px] sm:h-[24px] transition-colors duration-150 ${
                  isResultsActive
                    ? 'text-amber-400'
                    : 'text-rose-100/75 group-hover:text-white'
                }`}
                strokeWidth={isResultsActive ? 2.2 : 1.8}
              />
            </div>

            <span
              className={`text-[11px] sm:text-[12px] leading-tight font-medium tracking-tight mt-1 truncate max-w-full px-0.5 transition-colors duration-150 ${
                isResultsActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-white/80 group-hover:text-white'
              }`}
            >
              Results
            </span>
          </button>

          {/* Item 4: Admit Card */}
          <button
            type="button"
            onClick={() => handleCategoryClick('admit-card')}
            aria-label="Admit Card"
            aria-current={isAdmitCardActive ? 'page' : undefined}
            className="relative flex flex-col items-center justify-center h-full w-full py-1 px-0.5 transition-colors cursor-pointer min-w-0 select-none group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400/80 active:scale-95"
          >
            {/* Active Golden Tab Indicator at top */}
            {isAdmitCardActive && (
              <span 
                className="absolute top-0 inset-x-0 mx-auto w-8 sm:w-10 h-[3px] rounded-b-full bg-amber-400 shadow-[0_1px_4px_rgba(251,191,36,0.5)] transition-all duration-200" 
                aria-hidden="true" 
              />
            )}

            <div className="relative flex items-center justify-center shrink-0">
              <Ticket
                className={`w-[23px] h-[23px] sm:w-[24px] sm:h-[24px] transition-colors duration-150 ${
                  isAdmitCardActive
                    ? 'text-amber-400'
                    : 'text-rose-100/75 group-hover:text-white'
                }`}
                strokeWidth={isAdmitCardActive ? 2.2 : 1.8}
              />
            </div>

            <span
              className={`text-[11px] sm:text-[12px] leading-tight font-medium tracking-tight mt-1 truncate max-w-full px-0.5 transition-colors duration-150 ${
                isAdmitCardActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-white/80 group-hover:text-white'
              }`}
            >
              Admit Card
            </span>
          </button>

          {/* Item 5: More */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            aria-label="More"
            aria-expanded={isMoreActive}
            className="relative flex flex-col items-center justify-center h-full w-full py-1 px-0.5 transition-colors cursor-pointer min-w-0 select-none group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400/80 active:scale-95"
          >
            {/* Active Golden Tab Indicator at top */}
            {isMoreActive && (
              <span 
                className="absolute top-0 inset-x-0 mx-auto w-8 sm:w-10 h-[3px] rounded-b-full bg-amber-400 shadow-[0_1px_4px_rgba(251,191,36,0.5)] transition-all duration-200" 
                aria-hidden="true" 
              />
            )}

            <div className="relative flex items-center justify-center shrink-0">
              <Menu
                className={`w-[23px] h-[23px] sm:w-[24px] sm:h-[24px] transition-colors duration-150 ${
                  isMoreActive
                    ? 'text-amber-400'
                    : 'text-rose-100/75 group-hover:text-white'
                }`}
                strokeWidth={isMoreActive ? 2.2 : 1.8}
              />
            </div>

            <span
              className={`text-[11px] sm:text-[12px] leading-tight font-medium tracking-tight mt-1 truncate max-w-full px-0.5 transition-colors duration-150 ${
                isMoreActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-white/80 group-hover:text-white'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
