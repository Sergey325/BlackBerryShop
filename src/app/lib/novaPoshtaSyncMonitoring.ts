import * as Sentry from "@sentry/nextjs";
import vercelConfig from "../../../vercel.json";

type Directory = "cities" | "warehouses";
type SyncProgress = {
    stage: string;
    page?: number;
    attempt?: number;
    batchSize?: number;
};
export type SyncProgressReporter = (progress: SyncProgress) => void;

async function flushSyncEvents() {
    try {
        const sent = await Sentry.flush(2000);
        if (!sent && Sentry.isEnabled()) console.warn("[nova-poshta-sync] Sentry flush timed out");
    } catch (error) {
        // Reporting failures must not change the outcome of the database synchronization.
        console.error("[nova-poshta-sync] Sentry flush failed:", error instanceof Error ? error.message : "Unknown error");
    }
}

export function captureDirectorySyncError(error: unknown, directory: Directory, progress: SyncProgress, startedAt: number) {
    Sentry.captureException(error, {
        tags: {integration: "nova_poshta", directory, error_type: "directory_sync_failed", sync_stage: progress.stage},
        contexts: {nova_poshta_sync: {...progress, durationMs: Date.now() - startedAt}},
    });
}

export async function monitorDirectorySync<T>(directory: Directory, operation: (report: SyncProgressReporter) => Promise<T>) {
    const startedAt = Date.now();
    return Sentry.withIsolationScope(async () => {
        let progress: SyncProgress = {stage: "start"};
        const report: SyncProgressReporter = next => {
            progress = next;
            Sentry.addBreadcrumb({category: "nova_poshta.sync", message: next.stage, data: {directory, ...next}, level: "info"});
        };
        const run = async () => {
            // Persist the initial check-in so a hard function timeout can be detected by Sentry.
            await flushSyncEvents();
            try {
                return await operation(report);
            } catch (error) {
                captureDirectorySyncError(error, directory, progress, startedAt);
                throw error;
            }
        };

        try {
            const cron = vercelConfig.crons.find(entry => entry.path === `/api/cron/sync-${directory}`);
            // Vercel schedules crons only in production; preview/manual local runs must not create missed-run incidents.
            if (process.env.VERCEL_ENV !== "production" || !cron) return await run();
            return await Sentry.withMonitor(`nova-poshta-${directory}`, run, {
                schedule: {type: "crontab", value: cron.schedule},
                timezone: "UTC",
                checkinMargin: 60,
                maxRuntime: directory === "cities" ? 2 : 5,
                failureIssueThreshold: 1,
                recoveryThreshold: 1,
            });
        } finally {
            await flushSyncEvents();
        }
    });
}

export async function reportDirectoryStatsError(error: unknown) {
    captureDirectorySyncError(error, "warehouses", {stage: "stats"}, Date.now());
    await flushSyncEvents();
}
