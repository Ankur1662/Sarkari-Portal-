import React, { useState } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  Building2, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  Send,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { SectorId, QualificationLevel } from '../types/job';
import { SECTORS } from '../data/sectors';
import { subscribeToDailyDigest } from '../services/subscriptionService';

interface SarkariSidebarProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  selectedQualification: QualificationLevel | 'all';
  onSelectQualification: (qual: QualificationLevel | 'all') => void;
  selectedSector: SectorId | 'all';
  onSelectSector: (sector: SectorId | 'all') => void;
  onScrollToListings?: () => void;
  onResetFilters?: () => void;
}

export const SarkariSidebar: React.FC<SarkariSidebarProps> = ({
  selectedState,
  onSelectState,
  selectedQualification,
  onSelectQualification,
  selectedSector,
  onSelectSector,
  onScrollToListings,
  onResetFilters,
}) => {
  const [digestEmail, setDigestEmail] = useState('');
  const [digestStatus, setDigestStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'duplicate';
    message: string;
  }>({ type: 'idle', message: '' });

  const [stateOpen, setStateOpen] = useState(true);
  const [qualOpen, setQualOpen] = useState(true);
  const [deptOpen, setDeptOpen] = useState(true);

  // States as requested in specifications
  const stateOptions: { id: string; label: string; short: string }[] = [
    { id: 'all', label: 'All India Level', short: 'All India' },
    { id: 'Uttar Pradesh', label: 'Uttar Pradesh', short: 'UP' },
    { id: 'Bihar', label: 'Bihar', short: 'Bihar' },
    { id: 'Delhi', label: 'Delhi NCR', short: 'Delhi' },
    { id: 'Rajasthan', label: 'Rajasthan', short: 'Raj' },
    { id: 'Madhya Pradesh', label: 'Madhya Pradesh', short: 'MP' },
    { id: 'Haryana', label: 'Haryana', short: 'HR' },
    { id: 'Jharkhand', label: 'Jharkhand', short: 'JH' },
  ];

  // Qualifications with clear compact labels
  const qualificationOptions: { id: QualificationLevel | 'all'; label: string; badge: string }[] = [
    { id: 'all', label: 'All Qualifications', badge: 'All' },
    { id: '10th', label: '10th Pass', badge: 'Matric' },
    { id: '12th', label: '12th Pass', badge: 'Inter' },
    { id: 'graduate', label: 'Graduation', badge: 'Degree' },
    { id: 'engineering', label: 'B.E. / B.Tech', badge: 'Engg' },
    { id: 'diploma', label: 'Diploma / ITI', badge: 'ITI' },
    { id: 'post-graduate', label: 'Post Graduation', badge: 'PG' },
    { id: 'medical', label: 'Medical / Health', badge: 'MBBS' },
  ];

  // Department options preserving all official categories
  const departmentOptions: { id: SectorId | 'all'; label: string; badge: string }[] = [
    { id: 'all', label: 'All Departments', badge: 'ALL' },
    { id: 'upsc', label: 'UPSC & Civil Services', badge: 'UPSC' },
    { id: 'ssc', label: 'SSC', badge: 'SSC' },
    { id: 'banking', label: 'Banking & Insurance', badge: 'BANK' },
    { id: 'railways', label: 'Indian Railways', badge: 'RRB' },
    { id: 'defence', label: 'Defence & Paramilitary', badge: 'DEF' },
    { id: 'teaching', label: 'Teaching & Academics', badge: 'TET' },
    { id: 'state-psc', label: 'State PSC', badge: 'PSC' },
    { id: 'psu', label: 'PSU & Engineering', badge: 'PSU' },
    { id: 'healthcare', label: 'Medical & Healthcare', badge: 'MED' },
  ];

  const hasActiveFilter = 
    selectedState !== 'all' || 
    selectedQualification !== 'all' || 
    selectedSector !== 'all';

  const activeCount = 
    (selectedState !== 'all' ? 1 : 0) + 
    (selectedQualification !== 'all' ? 1 : 0) + 
    (selectedSector !== 'all' ? 1 : 0);

  const handleStateClick = (stateId: string) => {
    // If clicking current active state (other than 'all'), toggle back to 'all'
    if (selectedState === stateId && stateId !== 'all') {
      onSelectState('all');
    } else {
      onSelectState(stateId);
    }
    if (onScrollToListings) onScrollToListings();
  };

  const handleQualificationClick = (qualId: QualificationLevel | 'all') => {
    if (selectedQualification === qualId && qualId !== 'all') {
      onSelectQualification('all');
    } else {
      onSelectQualification(qualId);
    }
    if (onScrollToListings) onScrollToListings();
  };

  const handleDepartmentClick = (deptId: SectorId | 'all') => {
    if (selectedSector === deptId && deptId !== 'all') {
      onSelectSector('all');
    } else {
      onSelectSector(deptId);
    }
    if (onScrollToListings) onScrollToListings();
  };

  const handleReset = () => {
    onSelectState('all');
    onSelectQualification('all');
    onSelectSector('all');
    if (onResetFilters) onResetFilters();
    if (onScrollToListings) onScrollToListings();
  };

  const handleDigestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = subscribeToDailyDigest(digestEmail);

    if (result.success) {
      setDigestStatus({
        type: 'success',
        message: result.message,
      });
      setDigestEmail('');
    } else {
      setDigestStatus({
        type: result.isDuplicate ? 'duplicate' : 'error',
        message: result.message,
      });
    }
  };

  return (
    <aside className="space-y-3.5">
      {/* Top Filter Bar with Active Status & Quick Reset */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
            Recruitment Filters
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
              {activeCount} active
            </span>
          )}
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer border border-red-200"
            title="Clear all active filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. STATE SECTION (Compact 2-to-3 column responsive grid of selectable chips) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setStateOpen(!stateOpen)}
          className="w-full px-3.5 py-2.5 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
          aria-expanded={stateOpen}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>BY STATE / LOCATION</span>
            {selectedState !== 'all' && (
              <span className="text-[10px] lowercase font-normal px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                1 active
              </span>
            )}
          </div>
          {stateOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {stateOpen && (
          <div className="p-2.5">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {stateOptions.map((st, idx) => {
                const isSelected = selectedState === st.id || (st.id === 'all' && selectedState === 'all');
                const isAllIndia = idx === 0;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStateClick(st.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between gap-1 cursor-pointer border ${
                      isAllIndia ? 'col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-2xs ring-1 ring-blue-500/50'
                        : 'bg-slate-50/80 text-slate-700 hover:bg-blue-50/70 hover:text-blue-900 border-slate-200/90'
                    }`}
                  >
                    <span className="truncate">{st.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. QUALIFICATION SECTION (Compact 2-column selectable chips grid) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setQualOpen(!qualOpen)}
          className="w-full px-3.5 py-2.5 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
          aria-expanded={qualOpen}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>BY QUALIFICATION</span>
            {selectedQualification !== 'all' && (
              <span className="text-[10px] lowercase font-normal px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                1 active
              </span>
            )}
          </div>
          {qualOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {qualOpen && (
          <div className="p-2.5">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {qualificationOptions.map((q, idx) => {
                const isSelected = selectedQualification === q.id;
                const isAll = idx === 0;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleQualificationClick(q.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between gap-1 cursor-pointer border ${
                      isAll ? 'col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-2xs ring-1 ring-emerald-500/50'
                        : 'bg-slate-50/80 text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-900 border-slate-200/90'
                    }`}
                  >
                    <span className="truncate">{q.label}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">{q.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. DEPARTMENT / SECTOR SECTION (Compact responsive grid) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setDeptOpen(!deptOpen)}
          className="w-full px-3.5 py-2.5 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
          aria-expanded={deptOpen}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>BY DEPARTMENT</span>
            {selectedSector !== 'all' && (
              <span className="text-[10px] lowercase font-normal px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                1 active
              </span>
            )}
          </div>
          {deptOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {deptOpen && (
          <div className="p-2.5">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {departmentOptions.map((dept, idx) => {
                const isSelected = selectedSector === dept.id;
                const isAll = idx === 0;

                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentClick(dept.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between gap-1 cursor-pointer border ${
                      isAll ? 'col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-2xs ring-1 ring-indigo-500/50'
                        : 'bg-slate-50/80 text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-900 border-slate-200/90'
                    }`}
                  >
                    <span className="truncate">{dept.label}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">{dept.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Daily Job Digest Newsletter Card (Ultra-Compact, Responsive & Verified Backend) */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl p-3 sm:p-3.5 border border-blue-800 shadow-md">
        {/* Compact Heading */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">
              Daily Job Digest
            </h4>
          </div>
          <span className="text-[10px] font-semibold text-blue-200 bg-blue-800/60 px-1.5 py-0.2 rounded border border-blue-400/30 shrink-0">
            Free Alerts
          </span>
        </div>

        {/* Short, crisp description */}
        <p className="text-[11px] text-blue-100/90 leading-snug mb-2">
          Verified morning govt exam notices sent directly to your inbox.
        </p>

        {/* Status Messages: Success, Error, Duplicate */}
        {digestStatus.type === 'success' && (
          <div className="mb-2 p-2 rounded-lg bg-emerald-500/25 border border-emerald-400/40 text-emerald-100 text-xs flex items-center justify-between gap-1.5 animate-in fade-in">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{digestStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setDigestStatus({ type: 'idle', message: '' })}
              className="text-emerald-300 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {digestStatus.type === 'error' && (
          <div className="mb-2 p-2 rounded-lg bg-rose-500/25 border border-rose-400/40 text-rose-100 text-xs flex items-center justify-between gap-1.5 animate-in fade-in">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="truncate">{digestStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setDigestStatus({ type: 'idle', message: '' })}
              className="text-rose-300 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {digestStatus.type === 'duplicate' && (
          <div className="mb-2 p-2 rounded-lg bg-amber-500/25 border border-amber-400/40 text-amber-100 text-xs flex items-center justify-between gap-1.5 animate-in fade-in">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{digestStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setDigestStatus({ type: 'idle', message: '' })}
              className="text-amber-300 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Compact, responsive subscription form */}
        <form onSubmit={handleDigestSubmit} noValidate className="space-y-1.5">
          <div className="flex flex-col sm:flex-row gap-1.5">
            <input
              type="email"
              value={digestEmail}
              onChange={(e) => {
                setDigestEmail(e.target.value);
                if (digestStatus.type !== 'idle') {
                  setDigestStatus({ type: 'idle', message: '' });
                }
              }}
              placeholder="Enter your email..."
              aria-label="Email address for Daily Job Digest"
              className="w-full h-8.5 px-2.5 text-xs rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-blue-300/40 focus:ring-2 focus:ring-amber-400 focus:outline-hidden shadow-2xs"
            />
            <button
              type="submit"
              className="w-full sm:w-auto h-8.5 px-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center justify-center shrink-0 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-white"
            >
              <span>Subscribe</span>
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};
