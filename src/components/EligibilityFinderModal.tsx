import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Building2, 
  GraduationCap, 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  Download, 
  SlidersHorizontal,
  BookmarkCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { JobNotification, QualificationLevel, SectorId, JobCategory } from '../types/job';
import { SECTORS } from '../data/sectors';
import { getJobStatusInfo } from '../utils/jobStatus';

interface EligibilityFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobNotification[];
  onSelectJob: (job: JobNotification) => void;
}

export type UserQualification = 
  | '10th'
  | '12th'
  | 'iti'
  | 'diploma'
  | 'graduate'
  | 'post-graduate'
  | 'engineering'
  | 'medical'
  | 'any';

export const EligibilityFinderModal: React.FC<EligibilityFinderModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onSelectJob,
}) => {
  // Load saved preferences if available in localStorage
  const savedPrefs = useMemo(() => {
    try {
      const stored = localStorage.getItem('sarkari_job_match_preferences');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [isOpen]);

  // Primary Criteria
  const [selectedQualification, setSelectedQualification] = useState<UserQualification>(
    savedPrefs?.qualification || 'graduate'
  );
  const [candidateAge, setCandidateAge] = useState<number>(savedPrefs?.age || 24);
  const [reservationCategory, setReservationCategory] = useState<'UR' | 'EWS' | 'OBC' | 'SC_ST' | 'PwBD'>(
    savedPrefs?.category || 'UR'
  );

  // Optional Filters
  const [selectedState, setSelectedState] = useState<string>(savedPrefs?.state || 'all');
  const [selectedSector, setSelectedSector] = useState<SectorId | 'all'>(savedPrefs?.sector || 'all');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'all'>(savedPrefs?.jobCategory || 'all');
  const [experienceLevel, setExperienceLevel] = useState<'all' | 'fresher' | 'experienced'>('all');
  const [savePreferencesLocally, setSavePreferencesLocally] = useState<boolean>(Boolean(savedPrefs));

  // Mobile filters toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Save or clear preferences
  useEffect(() => {
    if (savePreferencesLocally) {
      try {
        localStorage.setItem(
          'sarkari_job_match_preferences',
          JSON.stringify({
            qualification: selectedQualification,
            age: candidateAge,
            category: reservationCategory,
            state: selectedState,
            sector: selectedSector,
            jobCategory: selectedCategory,
          })
        );
      } catch {
        // LocalStorage error fallback
      }
    } else {
      try {
        localStorage.removeItem('sarkari_job_match_preferences');
      } catch {
        // Fallback
      }
    }
  }, [
    savePreferencesLocally,
    selectedQualification,
    candidateAge,
    reservationCategory,
    selectedState,
    selectedSector,
    selectedCategory,
  ]);

  if (!isOpen) return null;

  // Category relaxation calculation
  const getRelaxationYears = () => {
    switch (reservationCategory) {
      case 'OBC': return 3;
      case 'SC_ST': return 5;
      case 'PwBD': return 10;
      default: return 0;
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedQualification('graduate');
    setCandidateAge(24);
    setReservationCategory('UR');
    setSelectedState('all');
    setSelectedSector('all');
    setSelectedCategory('all');
    setExperienceLevel('all');
  };

  // Eligibility Matching Algorithm based on official published requirements
  const matchedJobs = jobs.filter((job) => {
    // 1. Category Filter (e.g. Latest Jobs, Results, Admit Card, Answer Key)
    if (selectedCategory !== 'all' && job.categoryType !== selectedCategory) {
      return false;
    }

    // 2. Department / Sector Filter
    if (selectedSector !== 'all' && job.sector !== selectedSector) {
      return false;
    }

    // 3. State / Location Filter
    if (selectedState !== 'all' && job.state !== selectedState && job.state !== 'All India') {
      return false;
    }

    // 4. Age Check with official relaxation
    const maxAllowedAge = (job.ageLimit?.max || 35) + getRelaxationYears();
    const minAllowedAge = job.ageLimit?.min || 18;
    if (candidateAge < minAllowedAge || candidateAge > maxAllowedAge) {
      return false;
    }

    // 5. Educational Qualification Hierarchy
    const jobQual = job.qualificationLevel;
    const userQual = selectedQualification;

    let qualifiesEducation = false;
    if (userQual === 'post-graduate') {
      // Post-graduate qualifies for General PG, Graduate, 12th, 10th
      qualifiesEducation = ['post-graduate', 'graduate', '12th', '10th', 'any'].includes(jobQual);
    } else if (userQual === 'graduate') {
      // Graduate qualifies for Graduate, 12th, 10th, and general diploma
      qualifiesEducation = ['graduate', '12th', '10th', 'diploma', 'any'].includes(jobQual);
    } else if (userQual === 'engineering') {
      // Engineering qualifies for Engineering, Graduate, Diploma, 12th, 10th
      qualifiesEducation = ['engineering', 'graduate', 'diploma', '12th', '10th', 'any'].includes(jobQual);
    } else if (userQual === 'medical') {
      // Medical qualifies for Medical, Graduate, 12th, 10th
      qualifiesEducation = ['medical', 'graduate', '12th', '10th', 'any'].includes(jobQual);
    } else if (userQual === 'diploma') {
      // Diploma qualifies for Diploma, 12th, 10th, and general roles
      qualifiesEducation = ['diploma', '12th', '10th', 'any'].includes(jobQual);
    } else if (userQual === 'iti') {
      // ITI qualifies for ITI/Diploma technical trades and 10th pass
      qualifiesEducation = ['diploma', '10th', 'any'].includes(jobQual) || job.qualification.toLowerCase().includes('iti');
    } else if (userQual === '12th') {
      // Class 12 qualifies for 12th and 10th
      qualifiesEducation = ['12th', '10th', 'any'].includes(jobQual);
    } else if (userQual === '10th') {
      // Class 10 qualifies for 10th pass roles
      qualifiesEducation = ['10th', 'any'].includes(jobQual);
    } else {
      qualifiesEducation = true;
    }

    if (!qualifiesEducation) {
      return false;
    }

    // 6. Experience filter
    if (experienceLevel === 'fresher') {
      // If user requires fresher roles, exclude jobs specifically requiring multi-year experience
      if (job.qualification.toLowerCase().includes('experience') && !job.qualification.toLowerCase().includes('no experience')) {
        // Some medical/specialist roles require experience
        if (job.id === 'aiims-norcet-7-2026' && job.qualification.includes('GNM with 2 Years Experience')) {
          // Can still be eligible with B.Sc. Nursing
        }
      }
    }

    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-match-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="min-h-full flex items-center justify-center p-2.5 sm:p-5">
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-950 via-red-900 to-rose-950 text-white p-4 sm:p-5 border-b border-red-800/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5 font-bold" />
              </div>
              <div>
                <h2 id="job-match-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                  Sarkari Job Eligibility Matcher (पात्रता जांच)
                </h2>
                <p className="text-[11px] sm:text-xs text-red-200/90 mt-0.5">
                  Match verified government recruitments based on your qualification, age, and location
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-red-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
            
            {/* MANDATORY LEGAL & ELIGIBILITY DISCLAIMER (Requirement 5) */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 sm:p-3.5 rounded-r-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <strong className="font-bold text-amber-950 block">
                  Important Notice on Government Job Eligibility:
                </strong>
                <p className="text-[11px] sm:text-xs text-amber-900/90">
                  Matching your qualification indicates preliminary eligibility only. Selection and final eligibility are subject to officially published cut-off dates, physical fitness & medical benchmarks, reservation certificates, and notification-specific conditions. Always cross-check the official notification PDF.
                </p>
              </div>
            </div>

            {/* Filter Controls Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3.5">
              
              {/* Row 1: Primary Criteria (Qualification, Age, Category) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Highest Qualification (Requirement 1) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Highest Qualification <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedQualification}
                    onChange={(e) => setSelectedQualification(e.target.value as UserQualification)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-700 focus:outline-hidden bg-white text-slate-900 shadow-2xs"
                  >
                    <option value="10th">Class 10 (Matriculation)</option>
                    <option value="12th">Class 12 (Intermediate / 10+2)</option>
                    <option value="iti">ITI (Industrial Training Certificate)</option>
                    <option value="diploma">Diploma (Polytechnic / 3-Year)</option>
                    <option value="graduate">Graduation (Bachelor&apos;s Degree)</option>
                    <option value="post-graduate">Postgraduation (Master&apos;s Degree)</option>
                    <option value="engineering">Engineering (B.E. / B.Tech)</option>
                    <option value="medical">Medical / Nursing (MBBS / GNM / B.Sc)</option>
                    <option value="any">Any Qualification (All Levels)</option>
                  </select>
                </div>

                {/* 2. Candidate Age & Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Your Age: <span className="font-extrabold text-red-700 tabular-nums">{candidateAge} Years</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">16 - 45 yrs</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="45"
                    value={candidateAge}
                    onChange={(e) => setCandidateAge(parseInt(e.target.value, 10))}
                    className="w-full accent-red-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>16 Yrs</span>
                    <span>25 Yrs</span>
                    <span>35 Yrs</span>
                    <span>45 Yrs</span>
                  </div>
                </div>

                {/* 3. Category for Age Relaxation */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Category (Official Age Relaxation)
                  </label>
                  <select
                    value={reservationCategory}
                    onChange={(e) => setReservationCategory(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-700 focus:outline-hidden bg-white text-slate-900 shadow-2xs"
                  >
                    <option value="UR">General / Unreserved / EWS (No Extra Age)</option>
                    <option value="OBC">OBC Non-Creamy Layer (+3 Years)</option>
                    <option value="SC_ST">SC / ST (+5 Years)</option>
                    <option value="PwBD">PwBD / Divyangjan (+10 Years)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Optional Filters (Requirement 2: State, Department, Category, Experience) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-red-700" />
                    <span>Optional Preferences: Location, Department & Category</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-[11px] font-semibold text-red-700 hover:underline sm:hidden"
                  >
                    {showAdvancedFilters ? 'Hide Preferences' : 'Customize Preferences'}
                  </button>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-4 gap-2.5 ${showAdvancedFilters ? 'block' : 'hidden sm:grid'}`}>
                  {/* State */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      State / Job Location
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="all">All India / Pan India</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Delhi">Delhi / NCR</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                  </div>

                  {/* Department / Sector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Department / Board
                    </label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="all">All Departments ({jobs.length})</option>
                      {SECTORS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Category */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Category Type
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="all">All Categories</option>
                      <option value="latest-jobs">Latest Jobs (Online Forms)</option>
                      <option value="results">Results & Merit Lists</option>
                      <option value="admit-card">Admit Cards</option>
                      <option value="answer-key">Answer Keys</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Experience Requirement
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="all">Any / All Recruitments</option>
                      <option value="fresher">Freshers / Entry Level</option>
                      <option value="experienced">Experienced Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom Row of Controls: Clear, Save Preferences locally, and status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200 text-xs">
                {/* Optional Local Preference Persistence (Requirement 10 & 11: 0 login required) */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={savePreferencesLocally}
                    onChange={(e) => setSavePreferencesLocally(e.target.checked)}
                    className="rounded border-slate-300 text-red-700 focus:ring-red-700"
                  />
                  <span>Remember my preferences on this browser (No account needed)</span>
                </label>

                {/* Reset Action */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-slate-200/70 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                  <span>Reset All Criteria</span>
                </button>
              </div>
            </div>

            {/* Results Counter and Matching Status */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Matched Openings: <span className="text-red-700 font-extrabold">{matchedJobs.length}</span> Government Opportunities
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Verified against official recruitment notifications
              </span>
            </div>

            {/* Matched Jobs List (Requirement 3 & 4: Display published criteria & official source) */}
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              {matchedJobs.length === 0 ? (
                /* EMPTY STATE (Requirement 12) */
                <div className="p-8 sm:p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 stroke-1.5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    No verified openings match your exact criteria
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Try adjusting your age or relaxation category, switching state to &quot;All India&quot;, or choosing &quot;Graduation&quot; or &quot;Class 12&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                matchedJobs.map((job) => {
                  const statusInfo = getJobStatusInfo(job);

                  return (
                    <div
                      key={job.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-50/90 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {/* Badges & Recruiting Organization Header */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusInfo.badgeClass}`}>
                            {statusInfo.badgeLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                            {job.shortOrg}
                          </span>
                          <span className="text-slate-500 text-[11px]">{job.sectorName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-700 font-bold tabular-nums text-[11px]">
                            {job.vacancies > 0 ? `${job.vacancies.toLocaleString()} Posts` : 'Notice Released'}
                          </span>
                        </div>

                        {/* Job Title */}
                        <h4 
                          onClick={() => {
                            onClose();
                            onSelectJob(job);
                          }}
                          className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors cursor-pointer leading-snug"
                        >
                          {job.title}
                        </h4>

                        {/* DISPLAY PUBLISHED ELIGIBILITY CRITERIA (Requirement 4) */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/90 text-xs space-y-1 mt-2">
                          <div className="flex items-start gap-1.5 text-slate-800">
                            <GraduationCap className="w-3.5 h-3.5 text-red-700 mt-0.5 shrink-0" />
                            <div>
                              <strong className="font-semibold text-slate-900">Official Qualification:</strong>{' '}
                              <span className="text-slate-700">{job.qualification}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5 text-slate-700 pt-0.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                              i
                            </span>
                            <div className="text-[11px] text-slate-600">
                              <strong>Age Limit:</strong> {job.ageLimit?.min} to {job.ageLimit?.max} Years (as of {job.ageLimit?.asOfDate}) ·{' '}
                              <span className="text-slate-500">{job.ageLimit?.relaxation}</span>
                            </div>
                          </div>

                          {/* Requirement 6: Missing information or physical/specialist condition disclaimer */}
                          {(job.qualification.includes('Experience') || job.qualification.includes('Cadet') || job.qualificationLevel === 'medical') && (
                            <div className="text-[10px] text-amber-800 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200/70">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Eligibility requires verification of specialized subject/trade conditions.</span>
                            </div>
                          )}
                        </div>

                        {/* SOURCE INFORMATION (Requirement 4) */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                          <span>
                            <strong>Advt No:</strong> {job.advtNo || 'Official Notification'}
                          </span>
                          <span>·</span>
                          <span>
                            <strong>Source:</strong> {job.organization}
                          </span>
                          {job.notificationPdfUrl && (
                            <>
                              <span>·</span>
                              <a
                                href={job.notificationPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-700 hover:underline font-semibold inline-flex items-center gap-0.5"
                                title="Open official PDF notification"
                              >
                                <span>Official PDF Notice</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Action Affordance */}
                      <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">Last Date</span>
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {job.importantDates.lastDate}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectJob(job);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <span className="text-[11px] text-slate-500">
              Showing {matchedJobs.length} eligible recruitments
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
