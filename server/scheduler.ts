import { db } from './db';
import { checkOfficialSource } from './sourceMonitor';

let schedulerInterval: NodeJS.Timeout | null = null;
let isJobRunning = false;

/**
 * Initializes server-side background scheduler.
 * Runs on Node.js server authority and does not depend on frontend browser tabs.
 */
export function initServerScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  console.log('[Scheduler] Initializing Government Job Monitoring Cron Engine...');

  // Periodic heartbeat every 60 seconds to inspect active source schedules
  schedulerInterval = setInterval(async () => {
    await runScheduledMonitoringCycle();
  }, 60 * 1000);

  // Run an initial check 5 seconds after startup
  setTimeout(async () => {
    await runScheduledMonitoringCycle();
  }, 5000);
}

/**
 * Executes a single scheduled monitoring sweep across due sources.
 */
export async function runScheduledMonitoringCycle(): Promise<{ checkedSources: number; newNotices: number }> {
  if (isJobRunning) {
    console.log('[Scheduler] Prior monitoring cycle still running, skipping overlap.');
    return { checkedSources: 0, newNotices: 0 };
  }

  isJobRunning = true;
  let checkedCount = 0;
  let totalNewNotices = 0;

  try {
    const sources = db.getSources();
    const enabledSources = sources.filter((s) => s.isEnabled);
    const now = Date.now();

    for (const source of enabledSources) {
      // Determine if source is due based on frequencyMinutes
      const lastCheckTime = source.lastChecked ? new Date(source.lastChecked).getTime() : 0;
      const intervalMs = (source.frequencyMinutes || 60) * 60 * 1000;

      if (now - lastCheckTime >= intervalMs) {
        console.log(`[Scheduler] Checking source due for scan: ${source.shortName} (${source.websiteUrl})`);
        const result = await checkOfficialSource(source);
        checkedCount++;
        totalNewNotices += result.newNoticesCount;

        // Small delay between sources to avoid burst requests
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    db.updateConfig({ lastMonitoringRun: new Date().toISOString() });

    if (checkedCount > 0) {
      console.log(`[Scheduler] Cycle complete: ${checkedCount} sources checked, ${totalNewNotices} new notices detected.`);
    }
  } catch (err: any) {
    console.error('[Scheduler] Error during scheduled cycle:', err);
  } finally {
    isJobRunning = false;
  }

  return { checkedSources: checkedCount, newNotices: totalNewNotices };
}

/**
 * Manually trigger an immediate check for a specific source.
 */
export async function triggerSourceCheck(sourceId: string): Promise<{ success: boolean; newNoticesCount: number; error?: string }> {
  const source = db.getSource(sourceId);
  if (!source) {
    return { success: false, newNoticesCount: 0, error: 'Source not found' };
  }

  return await checkOfficialSource(source);
}

/**
 * Manually trigger an immediate check for all enabled sources.
 */
export async function triggerAllSourcesCheck(): Promise<{ checked: number; totalNew: number }> {
  const sources = db.getSources().filter((s) => s.isEnabled);
  let totalNew = 0;
  for (const src of sources) {
    const res = await checkOfficialSource(src);
    totalNew += res.newNoticesCount;
  }
  db.updateConfig({ lastMonitoringRun: new Date().toISOString() });
  return { checked: sources.length, totalNew };
}
