import React, { useState } from 'react';
import { X, Bell, CheckCheck, PlusCircle, Filter } from 'lucide-react';
import { NotificationAlert, SectorId } from '../types/job';
import { SECTORS } from '../data/sectors';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationAlert[];
  onNotificationClick: (alert: NotificationAlert) => void;
  onMarkAllAsRead: () => void;
  onSimulateNewAlert: () => void;
  subscribedSectors: SectorId[];
  onToggleSectorSubscription: (sectorId: SectorId) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  onSimulateNewAlert,
  subscribedSectors,
  onToggleSectorSubscription,
}) => {
  const [filterBySector, setFilterBySector] = useState<SectorId | 'all'>('all');
  const [showSubscriptionSettings, setShowSubscriptionSettings] = useState(false);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (filterBySector === 'all') return true;
    return item.sector === filterBySector;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500 text-slate-950 rounded-md">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-tight text-white">
                    Live Notification Alerts
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {unreadCount} unread · Real-time push updates
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close notification drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={onSimulateNewAlert}
                className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-medium py-1 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Simulate Push Alert</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSubscriptionSettings(!showSubscriptionSettings)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-slate-800 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{showSubscriptionSettings ? 'Hide Filters' : 'Sector Alerts'}</span>
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1 text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-slate-800 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sector Subscription Config Panel */}
          {showSubscriptionSettings && (
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <p className="font-semibold text-slate-800 mb-2">
                Choose Sectors for Push Alert Notifications:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SECTORS.map((s) => {
                  const isSubbed = subscribedSectors.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => onToggleSectorSubscription(s.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        isSubbed
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {isSubbed ? '✓ ' : '+ '}
                      {s.badgeCode}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                You will only receive instant real-time sound & banner pings for selected sectors.
              </p>
            </div>
          )}

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium text-[11px] shrink-0">View:</span>
            <button
              onClick={() => setFilterBySector('all')}
              className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                filterBySector === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            {SECTORS.map((s) => {
              const count = notifications.filter((n) => n.sector === s.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilterBySector(s.id)}
                  className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    filterBySector === s.id
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.badgeCode} ({count})
                </button>
              );
            })}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="font-medium text-slate-700">No alerts in this category</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click &ldquo;Simulate Push Alert&rdquo; above to test real-time notification events.
                </p>
              </div>
            ) : (
              filteredNotifications.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onNotificationClick(alert)}
                  className={`p-3.5 rounded-lg transition-colors cursor-pointer group hover:bg-slate-50 ${
                    !alert.read ? 'bg-amber-50/50' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 uppercase text-[11px] tracking-wide">
                        {alert.sector.toUpperCase()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{alert.timestamp}</span>
                      {alert.isUrgent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-red-700 font-semibold text-[11px]">
                            CRITICAL
                          </span>
                        </>
                      )}
                    </div>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0 mt-1" />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mt-1.5 group-hover:text-amber-800 transition-colors leading-snug">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {alert.description}
                  </p>

                  {alert.actionText && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:text-amber-700">
                      <span>{alert.actionText}</span>
                      <span className="text-sm">→</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Real-time notifications are synced directly from official gazettes & examination boards.
          </div>
        </div>
      </div>
    </div>
  );
};
