import React from 'react';
import { ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { SectorId } from '../types/job';

interface FooterProps {
  onSelectSector: (sector: SectorId | 'all') => void;
  onOpenAgeCalculator: () => void;
  onOpenEligibility: () => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectSector,
  onOpenAgeCalculator,
  onOpenEligibility,
  onOpenAdminLogin,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                SP
              </div>
              <span>SarkariPortal</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India&apos;s premier, high-speed public recruitment notification engine. Delivering real-time alerts for Central & State Government examinations, admit cards, answer keys, and merit lists.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Official Gazette Feeds</span>
            </div>
          </div>

          {/* Quick Sectors */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Government Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectSector('upsc')}
                  className="hover:text-amber-400 transition-colors"
                >
                  UPSC & Civil Services (IAS/IPS)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSector('ssc')}
                  className="hover:text-amber-400 transition-colors"
                >
                  SSC (CGL, CHSL, MTS, CPO, GD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSector('railways')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Indian Railways (RRB NTPC & ALP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSector('banking')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Banking & Financial Institutions (IBPS, SBI, RBI)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSector('defence')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Defence Forces (Army, Navy, Air Force, CAPF)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSector('state-psc')}
                  className="hover:text-amber-400 transition-colors"
                >
                  State PSCs (UPPSC, BPSC, MPPSC, MPSC)
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Direct Official Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://upsc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>upsc.gov.in</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ssc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>ssc.gov.in</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.rrbcdg.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>rrbapply.gov.in</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ibps.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>ibps.in</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://nta.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>nta.ac.in (UGC NET & Exams)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Aspirant Tools & Disclaimer */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Aspirant Utilities
            </h4>
            <ul className="space-y-2 text-xs mb-4">
              <li>
                <button
                  onClick={onOpenAgeCalculator}
                  className="hover:text-amber-400 transition-colors"
                >
                  Govt Job Age Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEligibility}
                  className="hover:text-amber-400 transition-colors"
                >
                  Eligibility Matcher by Qualification
                </button>
              </li>
            </ul>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Disclaimer:</strong> SarkariPortal is an informational portal for employment notices. Candidates must cross-verify all details, fee rules, and exam schedules with the respective official gazette notifications.
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-center sm:text-left">
          <p>© {new Date().getFullYear()} SarkariPortal. Built for aspirants across India.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-400">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">RTI Guidance</span>
            <span className="hover:text-white cursor-pointer">Contact Desk</span>
            {onOpenAdminLogin && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-slate-500 hover:text-slate-300 cursor-pointer inline-flex items-center gap-1 transition-colors"
                title="Restricted Staff & Admin Login"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
