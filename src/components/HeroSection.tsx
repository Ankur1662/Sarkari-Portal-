import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Briefcase, 
  Award, 
  CreditCard, 
  FileEdit, 
  Search, 
  ArrowRight,
  Sparkles,
  Building,
  TrendingUp,
  X,
  ChevronRight,
  FileText,
  Flame
} from 'lucide-react';
import { JobCategory, JobNotification } from '../types/job';
import { MOCK_JOBS } from '../data/mockJobs';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  totalNewUpdatesCount?: number;
  selectedCategory: JobCategory | 'all';
  onSelectCategory: (category: JobCategory) => void;
  onOpenJobMatch: () => void;
  jobs?: JobNotification[];
  onSelectJob?: (job: JobNotification) => void;
}

// Substring highlighting for live search suggestions
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <span key={i} className="bg-amber-100 text-amber-950 font-bold px-0.5 rounded-xs">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

const TRENDING_SEARCHES = [
  { term: 'SSC CGL 2026', org: 'SSC', label: 'Staff Selection Commission' },
  { term: 'RRB NTPC 2026', org: 'Railways', label: 'Railway Recruitment' },
  { term: 'UPSC Civil Services Prelims 2026', org: 'UPSC', label: 'Civil Services IAS/IPS' },
  { term: 'SBI PO 2026', org: 'Banking', label: 'State Bank of India' },
  { term: 'UP Police Constable & SI', org: 'Police', label: 'Police Recruitment' },
  { term: 'NDA 2026', org: 'Defence', label: 'National Defence Academy' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  totalNewUpdatesCount,
  selectedCategory,
  onSelectCategory,
  onOpenJobMatch,
  jobs = MOCK_JOBS,
  onSelectJob,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 4 Category Cards displaying ONLY existing icon and English title (no subtitles)
  const categoryButtons = [
    {
      id: 'latest-jobs' as JobCategory,
      title: 'Latest Jobs',
      icon: Briefcase,
    },
    {
      id: 'results' as JobCategory,
      title: 'Results',
      icon: Award,
    },
    {
      id: 'admit-card' as JobCategory,
      title: 'Admit Cards',
      icon: CreditCard,
    },
    {
      id: 'answer-key' as JobCategory,
      title: 'Answer Keys',
      icon: FileEdit,
    },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute matching organizations from actual job listings
  const matchedOrgs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const map = new Map<string, { shortOrg: string; fullName: string; count: number; sector: string }>();
    jobs.forEach((job) => {
      const key = (job.shortOrg || job.organization).toUpperCase();
      if (!map.has(key)) {
        map.set(key, {
          shortOrg: job.shortOrg,
          fullName: job.organization,
          count: 1,
          sector: job.sectorName,
        });
      } else {
        map.get(key)!.count += 1;
      }
    });

    return Array.from(map.values())
      .filter((item) =>
        item.shortOrg.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q)
      )
      .slice(0, 3);
  }, [jobs, searchQuery]);

  // Compute matching job posts from actual database/mock data
  const matchedJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return jobs
      .filter((job) =>
        job.title.toLowerCase().includes(q) ||
        job.postName.toLowerCase().includes(q) ||
        job.shortOrg.toLowerCase().includes(q) ||
        job.organization.toLowerCase().includes(q) ||
        job.advtNo.toLowerCase().includes(q) ||
        job.state.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [jobs, searchQuery]);

  // Flat list of selectable suggestions for keyboard navigation
  const selectableItems = useMemo(() => {
    const list: Array<
      | { type: 'trending'; term: string }
      | { type: 'org'; org: { shortOrg: string; fullName: string; count: number } }
      | { type: 'job'; job: JobNotification }
      | { type: 'search-all'; query: string }
    > = [];

    if (!searchQuery.trim()) {
      TRENDING_SEARCHES.forEach((item) => {
        list.push({ type: 'trending', term: item.term });
      });
    } else {
      matchedOrgs.forEach((org) => {
        list.push({ type: 'org', org });
      });
      matchedJobs.forEach((job) => {
        list.push({ type: 'job', job });
      });
      list.push({ type: 'search-all', query: searchQuery.trim() });
    }

    return list;
  }, [searchQuery, matchedOrgs, matchedJobs]);

  const handleExecuteSelection = (item: (typeof selectableItems)[number]) => {
    if (item.type === 'trending') {
      onSearchChange(item.term);
      setIsOpen(false);
      setSelectedIndex(-1);
      onSearchSubmit();
    } else if (item.type === 'org') {
      onSearchChange(item.org.shortOrg);
      setIsOpen(false);
      setSelectedIndex(-1);
      onSearchSubmit();
    } else if (item.type === 'job') {
      if (onSelectJob) {
        onSelectJob(item.job);
      } else {
        onSearchChange(item.job.shortOrg);
        onSearchSubmit();
      }
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (item.type === 'search-all') {
      setIsOpen(false);
      setSelectedIndex(-1);
      onSearchSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < selectableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : selectableItems.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < selectableItems.length) {
        e.preventDefault();
        handleExecuteSelection(selectableItems[selectedIndex]);
      } else {
        setIsOpen(false);
        setSelectedIndex(-1);
        onSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleCategoryClick = (catId: JobCategory) => {
    onSelectCategory(catId);
    const target = document.getElementById('all-listings');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCategoryBadgeClass = (cat: JobCategory) => {
    switch (cat) {
      case 'latest-jobs':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'results':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'admit-card':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'answer-key':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryLabel = (cat: JobCategory) => {
    switch (cat) {
      case 'latest-jobs':
        return 'Job';
      case 'results':
        return 'Result';
      case 'admit-card':
        return 'Admit Card';
      case 'answer-key':
        return 'Answer Key';
      default:
        return 'Update';
    }
  };

  return (
    <section 
      aria-label="Hero Section"
      className="relative rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-950 via-red-900 to-rose-950 text-white shadow-md border border-red-800/60 z-30 transition-all duration-200"
    >
      {/* Background SVG subtle organic wave curves, clipped safely */}
      <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl pointer-events-none">
        <div className="absolute inset-0 opacity-15">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1200 320"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0,140 C320,240 580,40 880,180 C1040,240 1140,160 1200,140 L1200,320 L0,320 Z"
              fill="white"
              fillOpacity="0.25"
            />
            <path
              d="M0,190 C220,110 480,240 780,120 C980,50 1100,160 1200,110 L1200,320 L0,320 Z"
              fill="white"
              fillOpacity="0.12"
            />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[150px] sm:h-[200px] bg-red-600/15 blur-3xl rounded-full" />
      </div>

      {/* Compact Outer Padding: reduced vertical padding for ~20-25% lower height */}
      <div className="relative z-10 px-3.5 py-3 sm:px-5 sm:py-4.5 lg:px-6 lg:py-5 max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* A. Small LATEST UPDATES Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-200 text-[11px] sm:text-xs font-semibold mb-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>LATEST UPDATES</span>
          {typeof totalNewUpdatesCount === 'number' && totalNewUpdatesCount > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
              +{totalNewUpdatesCount}
            </span>
          )}
        </div>

        {/* B. Main Heading */}
        <div className="w-full max-w-3xl mb-1 sm:mb-1.5">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-[27px] font-extrabold text-white tracking-tight leading-[1.25] drop-shadow-xs text-balance">
            सरकारी नौकरी की हर जरूरी अपडेट, अब एक ही जगह
          </h1>

          {/* C. One-line English Description */}
          <p className="text-xs sm:text-[13.5px] text-red-100/90 font-medium mt-1 max-w-2xl mx-auto leading-normal text-balance">
            Latest Jobs • Results • Admit Cards • Answer Keys
          </p>
        </div>

        {/* D. Search Bar (Height: ~48-52px) */}
        <div ref={searchContainerRef} className="w-full max-w-2xl relative mt-1.5 sm:mt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsOpen(false);
              setSelectedIndex(-1);
              onSearchSubmit();
            }}
            className="flex items-center gap-1.5 bg-black/35 p-1 sm:p-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-inner"
          >
            <div className="relative flex-1 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsOpen(true);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="नौकरी, परीक्षा या विभाग खोजें..."
                aria-label="नौकरी, परीक्षा या विभाग खोजें"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls="live-search-suggestions"
                role="combobox"
                className="w-full h-10 sm:h-11 pl-8 sm:pl-9 pr-7 sm:pr-8 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 shadow-xs"
              />
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 top-3 sm:top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setSelectedIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-3 sm:top-3.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="h-10 sm:h-11 px-3.5 sm:px-4.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-white"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Autocomplete / Live-Search Suggestion Dropdown */}
          {isOpen && (
            <div
              id="live-search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200/95 overflow-hidden text-left max-h-[340px] sm:max-h-[380px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5"
            >
              {/* Case 1: Search Query is Active */}
              {searchQuery.trim().length > 0 ? (
                <div>
                  {/* Matching Organizations / Boards */}
                  {matchedOrgs.length > 0 && (
                    <div className="border-b border-slate-100 py-1.5 px-2 bg-slate-50/70">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <Building className="w-3 h-3 text-red-700" />
                        <span>Recruitment Boards & Departments</span>
                      </div>
                      <div className="space-y-0.5">
                        {matchedOrgs.map((org) => {
                          const itemIndex = selectableItems.findIndex(
                            (it) => it.type === 'org' && it.org.shortOrg === org.shortOrg
                          );
                          const isHighlighted = selectedIndex === itemIndex;

                          return (
                            <button
                              key={org.shortOrg}
                              type="button"
                              onClick={() =>
                                handleExecuteSelection({ type: 'org', org })
                              }
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                isHighlighted
                                  ? 'bg-amber-100/70 text-slate-950 font-semibold'
                                  : 'hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[11px] shrink-0 border border-red-200">
                                  {org.shortOrg}
                                </span>
                                <span className="text-xs truncate">
                                  <HighlightMatch text={org.fullName} query={searchQuery} />
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                                {org.count} {org.count === 1 ? 'opening' : 'openings'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Job Titles & Notifications */}
                  {matchedJobs.length > 0 && (
                    <div className="py-1.5 px-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <FileText className="w-3 h-3 text-amber-600" />
                        <span>Matching Notifications & Posts</span>
                      </div>
                      <div className="space-y-1">
                        {matchedJobs.map((job) => {
                          const itemIndex = selectableItems.findIndex(
                            (it) => it.type === 'job' && it.job.id === job.id
                          );
                          const isHighlighted = selectedIndex === itemIndex;

                          return (
                            <div
                              key={job.id}
                              onClick={() =>
                                handleExecuteSelection({ type: 'job', job })
                              }
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`group flex items-center justify-between gap-2.5 p-2 rounded-lg transition-all cursor-pointer border ${
                                isHighlighted
                                  ? 'bg-amber-50/90 border-amber-300 shadow-xs'
                                  : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-bold text-[10px] shrink-0">
                                    {job.shortOrg}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${getCategoryBadgeClass(
                                      job.categoryType
                                    )}`}
                                  >
                                    {getCategoryLabel(job.categoryType)}
                                  </span>
                                  {job.status === 'Closing Soon' && (
                                    <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1 rounded">
                                      Closing Soon
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-red-800 transition-colors line-clamp-1">
                                  <HighlightMatch text={job.title} query={searchQuery} />
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  <HighlightMatch text={job.postName} query={searchQuery} />
                                </p>
                              </div>

                              <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-amber-700 group-hover:text-red-800 pl-1">
                                <span className="hidden sm:inline">Details</span>
                                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty State: No Matches */}
                  {matchedOrgs.length === 0 && matchedJobs.length === 0 && (
                    <div className="p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        "{searchQuery}" के लिए कोई सीधा परिणाम नहीं मिला
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        विस्तृत सूची देखने के लिए खोज बटन दबाएं।
                      </p>
                    </div>
                  )}

                  {/* Footer: Search All for Current Query */}
                  <div className="p-2 bg-slate-50 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setSelectedIndex(-1);
                        onSearchSubmit();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    >
                      <Search className="w-3.5 h-3.5 text-amber-300" />
                      <span>Search all listings for "{searchQuery}"</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Case 2: Query is Empty -> Show Trending & Popular Exams */
                <div className="p-2 sm:p-2.5">
                  <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Trending & Popular Exams</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Quick Pick</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {TRENDING_SEARCHES.map((item, idx) => {
                      const isHighlighted = selectedIndex === idx;

                      return (
                        <button
                          key={item.term}
                          type="button"
                          onClick={() =>
                            handleExecuteSelection({ type: 'trending', term: item.term })
                          }
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer border ${
                            isHighlighted
                              ? 'bg-amber-100/70 border-amber-300 text-slate-950 font-semibold'
                              : 'hover:bg-slate-50 border-transparent hover:border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-900 font-bold text-[9px] shrink-0">
                                {item.org}
                              </span>
                              <span className="text-xs font-semibold truncate">
                                {item.term}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                              {item.label}
                            </span>
                          </div>
                          <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-[10px] text-slate-500">
                    <span className="hidden sm:inline">Use ↑ ↓ to navigate, Enter to select, Esc to close</span>
                    <span className="sm:hidden">Tap any exam to search directly</span>
                    <span className="font-semibold text-red-800">Verified Portals</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* E. Job Match Button (Height: ~40-44px) */}
        <div className="w-full max-w-2xl mt-1.5 sm:mt-2 mb-2 sm:mb-2.5">
          <button
            type="button"
            onClick={onOpenJobMatch}
            className="w-full sm:w-auto h-9 sm:h-10 px-3.5 sm:px-4 bg-red-950/70 hover:bg-red-950 text-amber-200 hover:text-amber-100 font-semibold text-xs sm:text-[13px] rounded-xl transition-all border border-red-500/40 hover:border-amber-400/60 inline-flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-300"
            title="Job Eligibility Matcher"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
            <span>✦ Job Match: योग्यता अनुसार नौकरियाँ देखें</span>
            <ChevronRight className="w-3 h-3 text-red-300 shrink-0" />
          </button>
        </div>

        {/* F. Four Compact Category Cards: Icon on left, English title on right, No subtitles */}
        <div className="w-full max-w-3xl">
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 w-full"
            style={{ boxSizing: 'border-box' }}
          >
            {categoryButtons.map((btn) => {
              const Icon = btn.icon;
              const isSelected = selectedCategory === btn.id;

              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleCategoryClick(btn.id)}
                  aria-pressed={isSelected}
                  className={`group flex items-center justify-start gap-2.5 px-3 py-2 rounded-xl border transition-all duration-150 cursor-pointer shadow-xs min-w-0 w-full text-left focus:outline-hidden focus:ring-2 focus:ring-amber-300 h-[58px] sm:h-[62px] ${
                    isSelected
                      ? 'bg-white text-red-950 border-white shadow-md font-bold ring-2 ring-amber-400'
                      : 'bg-red-950/60 hover:bg-red-950/85 text-white border-red-500/30 hover:border-amber-300/80 backdrop-blur-xs'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-red-100 text-red-800' : 'bg-red-900/70 text-amber-300 group-hover:bg-red-900 group-hover:text-amber-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold tracking-tight truncate flex-1 min-w-0">
                    {btn.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
