import React, { useState } from 'react';
import { 
  Bell, 
  Bookmark, 
  Send, 
  MessageCircle, 
  Sparkles, 
  Mail, 
  X, 
  Menu,
  CheckCircle2, 
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogOut,
  ChevronRight,
  BookOpen,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import { JobCategory } from '../types/job';
import { subscribeToDailyDigest } from '../services/subscriptionService';

interface HeaderProps {
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenEligibilityFinder: () => void;
  savedJobsCount: number;
  onOpenSavedJobs: () => void;
  activeCategory: JobCategory | 'all';
  onSelectCategory: (cat: JobCategory | 'all') => void;
  onScrollToSection: (sectionId: string) => void;
  // Admin authentication & authorization
  isAdminAuthenticated: boolean;
  onOpenAdmin: () => void;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenAgeCalculator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadNotifsCount,
  onOpenNotifications,
  onOpenEligibilityFinder,
  savedJobsCount,
  onOpenSavedJobs,
  activeCategory,
  onSelectCategory,
  onScrollToSection,
  isAdminAuthenticated,
  onOpenAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenAgeCalculator,
}) => {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribedSuccess, setIsSubscribedSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeError(null);
    const result = subscribeToDailyDigest(subscribedEmail);
    if (result.success) {
      setIsSubscribedSuccess(true);
      setTimeout(() => {
        setShowSubscribeModal(false);
        setIsSubscribedSuccess(false);
        setSubscribedEmail('');
      }, 2500);
    } else {
      setSubscribeError(result.message);
    }
  };

  const handleNavClick = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <>
      {/* 1. Top Gazette & Community Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-semibold text-slate-300 overflow-x-auto scrollbar-none">
            <span className="uppercase tracking-wider text-slate-400 text-[10px] sm:text-[11px] shrink-0">Official Channels:</span>
            {/* WhatsApp Channel */}
            <a
              href="https://whatsapp.com/channel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-[11px] shadow-2xs transition-colors shrink-0"
              title="Join Official WhatsApp Channel"
            >
              <MessageCircle className="w-3 h-3 fill-current" />
              <span>WhatsApp</span>
            </a>
            {/* Telegram Channel */}
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] sm:text-[11px] shadow-2xs transition-colors shrink-0"
              title="Join Official Telegram Channel"
            >
              <Send className="w-3 h-3 fill-current" />
              <span>Telegram</span>
            </a>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Official Gazette Updates</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">100% Free Public Information</span>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
            
            {/* Logo and Brand Identity */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg sm:text-xl shadow-sm border border-slate-700 group-hover:bg-slate-800 transition-colors">
                <span>S</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Sarkari<span className="text-red-700">Portal</span>
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium whitespace-nowrap -mt-0.5">
                  Govt Jobs · Daily Verified Alerts
                </span>
              </div>
            </a>

            {/* Desktop Directory Tagline */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                Direct Official Links & Notifications
              </span>
            </div>

            {/* Right Action Affordances */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Saved Jobs Bookmark button */}
              <button
                onClick={onOpenSavedJobs}
                className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Saved Jobs"
                aria-label="View Saved Jobs"
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                {savedJobsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] text-[9px] sm:text-[10px] font-bold text-white bg-slate-900 rounded-full flex items-center justify-center px-1 tabular-nums">
                    {savedJobsCount}
                  </span>
                )}
              </button>

              {/* Real-time Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Real-Time Alerts"
                aria-label="Open Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] text-[9px] sm:text-[10px] font-bold text-white bg-amber-600 rounded-full flex items-center justify-center px-1 tabular-nums ring-2 ring-white">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Working Subscribe Button (Desktop) */}
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="hidden md:inline-flex px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                Subscribe
              </button>

              {/* Authorized Admin Controls - Only shown to authenticated administrators */}
              {isAdminAuthenticated ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-amber-400/40 shrink-0 cursor-pointer shadow-xs"
                    title="Authorized Admin Desk"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Desk</span>
                  </button>
                  <button
                    onClick={onAdminLogout}
                    className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out of Admin"
                    aria-label="Sign Out of Admin"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              {/* Compact Menu Trigger for Mobile and secondary actions */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sub-Nav Bar (Important Visitor Navigation) */}
        <div className="bg-slate-950 text-white text-xs font-semibold border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between overflow-x-auto py-2 sm:py-2.5 gap-4 sm:gap-6 scrollbar-none [overflow-scrolling:touch]">
              <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap shrink-0">
                {/* 1. Home */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`hover:text-amber-400 transition-colors py-1 cursor-pointer ${
                    activeCategory === 'all' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  Home
                </button>

                {/* 2. Latest Jobs */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('latest-jobs');
                    onScrollToSection('all-listings');
                  }}
                  className={`hover:text-amber-400 transition-colors py-1 cursor-pointer ${
                    activeCategory === 'latest-jobs' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  Latest Jobs
                </button>

                {/* 3. Results */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('results');
                    onScrollToSection('all-listings');
                  }}
                  className={`hover:text-amber-400 transition-colors py-1 cursor-pointer ${
                    activeCategory === 'results' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  Results
                </button>

                {/* 4. Admit Cards */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('admit-card');
                    onScrollToSection('all-listings');
                  }}
                  className={`hover:text-amber-400 transition-colors py-1 cursor-pointer ${
                    activeCategory === 'admit-card' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  Admit Cards
                </button>

                {/* 5. Answer Keys */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('answer-key');
                    onScrollToSection('all-listings');
                  }}
                  className={`hover:text-amber-400 transition-colors py-1 cursor-pointer ${
                    activeCategory === 'answer-key' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  Answer Keys
                </button>

                {/* 6. Syllabus */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('syllabus');
                    onScrollToSection('all-listings');
                  }}
                  className={`hover:text-amber-400 transition-colors py-1 cursor-pointer ${
                    activeCategory === 'syllabus' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  Syllabus
                </button>

                {/* 7. Admission & State */}
                <button
                  type="button"
                  onClick={() => {
                    onScrollToSection('sectors-section');
                  }}
                  className="hover:text-amber-400 transition-colors py-1 text-slate-300 cursor-pointer"
                  title="Explore State Recruitment & Admission Notifications"
                >
                  Admission & State
                </button>
              </div>

              {/* 8. ✨ Job Match button */}
              <button
                type="button"
                onClick={onOpenEligibilityFinder}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/30 transition-colors font-bold text-xs shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>JOB MATCH</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Compact Slide-Down Menu for Secondary Actions */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="max-w-7xl mx-auto p-4 space-y-4">
              
              {/* Primary visitor links in mobile menu */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Portal Navigation
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleNavClick(() => {
                      onSelectCategory('all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    })}
                    className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>Home</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => {
                      onSelectCategory('latest-jobs');
                      onScrollToSection('all-listings');
                    })}
                    className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>Latest Jobs</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => {
                      onSelectCategory('results');
                      onScrollToSection('all-listings');
                    })}
                    className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>Results</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => {
                      onSelectCategory('admit-card');
                      onScrollToSection('all-listings');
                    })}
                    className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>Admit Cards</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => {
                      onSelectCategory('answer-key');
                      onScrollToSection('all-listings');
                    })}
                    className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>Answer Keys</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => {
                      onSelectCategory('syllabus');
                      onScrollToSection('all-listings');
                    })}
                    className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>Syllabus</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(() => {
                      onScrollToSection('sectors-section');
                    })}
                    className="p-2.5 rounded-lg text-left text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>Admission & State</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNavClick(onOpenEligibilityFinder)}
                    className="p-2.5 rounded-lg text-left text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-current" />
                      Job Match
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>

              {/* Utilities & Secondary Actions */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Aspirant Tools & Digest
                </h4>
                <div className="flex flex-wrap gap-2">
                  {onOpenAgeCalculator && (
                    <button
                      onClick={() => handleNavClick(onOpenAgeCalculator)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Govt Age Calculator</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavClick(() => setShowSubscribeModal(true))}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Subscribe to Daily Job Digest</span>
                  </button>

                  <a
                    href="https://whatsapp.com/channel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Alerts</span>
                  </a>

                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-600" />
                    <span>Telegram Channel</span>
                  </a>
                </div>
              </div>

              {/* Administrative Access Area */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {isAdminAuthenticated ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-900">
                        Admin Session Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleNavClick(onOpenAdmin)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-amber-300 hover:bg-slate-800 flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Open Admin Desk</span>
                      </button>
                      <button
                        onClick={() => handleNavClick(onAdminLogout)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-slate-400">
                      SarkariPortal Staff / Authorized Reviewers
                    </span>
                    <button
                      onClick={() => handleNavClick(onOpenAdminLogin)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold py-1 px-2.5 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Staff Admin Login</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Subscribe Modal with genuine functional subscription */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowSubscribeModal(false)}
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Subscribe to Daily Job Digest
                    </h3>
                    <p className="text-xs text-slate-500">
                      Get verified notifications directly to your inbox
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  aria-label="Close Subscribe Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSubscribedSuccess ? (
                <div className="py-6 text-center text-emerald-700">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                  <p className="font-bold text-sm">Successfully Subscribed!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    You will now receive morning digests of new govt job vacancies.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} noValidate className="mt-4 space-y-4">
                  {subscribeError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{subscribeError}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      value={subscribedEmail}
                      onChange={(e) => {
                        setSubscribedEmail(e.target.value);
                        if (subscribeError) setSubscribeError(null);
                      }}
                      placeholder="e.g. aspirant@gmail.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Zero spam. Unsubscribe anytime in 1-click.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
