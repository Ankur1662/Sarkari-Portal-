import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { NotificationAlert } from '../types/job';

interface MarqueeAlertsProps {
  alerts: NotificationAlert[];
  onSelectAlert: (alert: NotificationAlert) => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const MarqueeAlerts: React.FC<MarqueeAlertsProps> = ({
  alerts,
  onSelectAlert,
  isMuted,
  onToggleSound,
}) => {
  return (
    <aside aria-label="Real-time Government Job Alerts" className="bg-slate-900 text-white text-xs border-b border-slate-800 overflow-hidden relative flex items-center h-10 select-none">
      {/* Fixed Flash Label */}
      <div className="shrink-0 z-10 flex items-center gap-1.5 sm:gap-2 bg-amber-500 text-slate-950 font-bold px-2.5 sm:px-3 py-1.5 h-full tracking-wider text-[10px] sm:text-[11px] uppercase shadow-md whitespace-nowrap">
        <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
        <span>Flash Alerts</span>
      </div>

      {/* Scrolling Alerts Stream */}
      <div className="overflow-hidden relative w-full h-full flex items-center">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap pl-4">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className="inline-flex items-center gap-2.5 text-slate-200 hover:text-amber-300 transition-colors cursor-pointer group"
            >
              {alert.isUrgent ? (
                <span className="bg-red-500/20 text-red-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-red-500/30">
                  URGENT
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-700">
                  NEW
                </span>
              )}
              <span className="font-medium group-hover:underline">{alert.title}</span>
              <span className="text-slate-400 text-[11px]">({alert.timestamp})</span>
              <span className="text-slate-600">/</span>
            </button>
          ))}
          {/* Duplicate set for seamless loop */}
          {alerts.map((alert) => (
            <button
              key={`dup-${alert.id}`}
              onClick={() => onSelectAlert(alert)}
              className="inline-flex items-center gap-2.5 text-slate-200 hover:text-amber-300 transition-colors cursor-pointer group"
            >
              {alert.isUrgent ? (
                <span className="bg-red-500/20 text-red-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-red-500/30">
                  URGENT
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-700">
                  NEW
                </span>
              )}
              <span className="font-medium group-hover:underline">{alert.title}</span>
              <span className="text-slate-400 text-[11px]">({alert.timestamp})</span>
              <span className="text-slate-600">/</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sound toggle button */}
      <div className="shrink-0 z-10 bg-slate-900 pl-2 pr-3 h-full flex items-center border-l border-slate-800">
        <button
          onClick={onToggleSound}
          className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors"
          title={isMuted ? 'Turn Sound On for Alerts' : 'Mute Alert Sounds'}
          aria-label={isMuted ? 'Turn Sound On' : 'Mute Alerts'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
        </button>
      </div>
    </aside>
  );
};
