import React from 'react';
import { SECTORS, SectorInfo } from '../data/sectors';
import { JobNotification, SectorId } from '../types/job';
import { 
  Landmark, 
  Briefcase, 
  Shield, 
  GraduationCap, 
  Cpu, 
  HeartPulse, 
  Train, 
  MapPin,
  Building2
} from 'lucide-react';

interface SectorFilterGridProps {
  jobs: JobNotification[];
  selectedSector: SectorId | 'all';
  onSelectSector: (sectorId: SectorId | 'all') => void;
}

const getSectorIcon = (id: SectorId) => {
  switch (id) {
    case 'upsc':
      return Landmark;
    case 'ssc':
      return Briefcase;
    case 'banking':
      return Building2;
    case 'railways':
      return Train;
    case 'defence':
      return Shield;
    case 'teaching':
      return GraduationCap;
    case 'state-psc':
      return MapPin;
    case 'psu':
      return Cpu;
    case 'healthcare':
      return HeartPulse;
    default:
      return Landmark;
  }
};

export const SectorFilterGrid: React.FC<SectorFilterGridProps> = ({
  jobs,
  selectedSector,
  onSelectSector,
}) => {
  const getSectorStats = (sectorId: SectorId) => {
    const sectorJobs = jobs.filter((j) => j.sector === sectorId);
    const totalVacancies = sectorJobs.reduce((acc, j) => acc + (j.vacancies || 0), 0);
    const activeOpenings = sectorJobs.length;
    return { totalVacancies, activeOpenings };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Government Recruitment Sectors
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore live vacancies, age relaxations, and notification alerts by ministry and department
          </p>
        </div>

        {selectedSector !== 'all' && (
          <button
            onClick={() => onSelectSector('all')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline self-start sm:self-auto"
          >
            Show All Sectors ({jobs.length} notifications)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* All Sectors Card */}
        <button
          onClick={() => onSelectSector('all')}
          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
            selectedSector === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 rounded-lg ${selectedSector === 'all' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>
              <Landmark className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-mono tabular-nums ${selectedSector === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              {jobs.length} Notifs
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-xs font-bold leading-tight">All Sectors</h3>
            <p className={`text-[11px] mt-0.5 truncate ${selectedSector === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>
              Central & State Govt
            </p>
          </div>
        </button>

        {/* Individual Sectors */}
        {SECTORS.map((sector: SectorInfo) => {
          const isSelected = selectedSector === sector.id;
          const { totalVacancies, activeOpenings } = getSectorStats(sector.id);
          const Icon = getSectorIcon(sector.id);

          return (
            <button
              key={sector.id}
              onClick={() => onSelectSector(sector.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {sector.badgeCode}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-xs font-bold leading-tight">{sector.name}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span className={`font-mono tabular-nums font-medium ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                    {totalVacancies > 0 ? `${totalVacancies.toLocaleString()} posts` : `${activeOpenings} notices`}
                  </span>
                </div>
                <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                  {sector.majorOrgs.slice(0, 3).join(', ')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
