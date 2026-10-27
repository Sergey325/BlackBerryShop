import {randomUUID} from "node:crypto";
import {setTimeout as delay} from "node:timers/promises";
import type {PrismaClient} from "@prisma/client";
import {importWarehousePages, parseWarehousePage, WAREHOUSE_PAGE_SIZE} from "../lib/novaPoshtaWarehouseImport";
import {removeMissingWarehouses, upsertWarehouseBatch} from "../lib/novaPoshtaWarehouseStorage";
import {monitorDirectorySync, type SyncProgressReporter} from "../lib/novaPoshtaSyncMonitoring";

const SYNC_ID = "warehouses";
const SYNC_BUDGET_MS = 240_000;

export async function warehouseDirectoryStats(db: PrismaClient) {
    const [total, available, sync, sizes] = await Promise.all([
        db.novaPoshtaWarehouse.count(),
        db.novaPoshtaWarehouse.count({where: {available: true}}),
        db.novaPoshtaWarehouseSync.findUnique({
            where: {id: SYNC_ID},
            select: {startedAt: true, completedAt: true, lockedUntil: true, total: true},
        }),
        db.$queryRaw<{tableBytes: string; indexBytes: string; totalBytes: string; databaseBytes: string}[]>`
            SELECT pg_table_size(format('%I.%I', current_schema(), 'NovaPoshtaWarehouse')::regclass)::text AS "tableBytes",
                   pg_indexes_size(format('%I.%I', current_schema(), 'NovaPoshtaWarehouse')::regclass)::text AS "indexBytes",
                   pg_total_relation_size(format('%I.%I', current_schema(), 'NovaPoshtaWarehouse')::regclass)::text AS "totalBytes",
                   pg_database_size(current_database())::text AS "databaseBytes"
        `,
    ]);
    const size = sizes[0];
    return {
        total,
        available,
        unavailable: total - available,
        sync,
        size: {
            tableBytes: Number(size.tableBytes),
            indexBytes: Number(size.indexBytes),
            totalBytes: Number(size.totalBytes),
            totalMiB: Math.round(Number(size.totalBytes) / 1024 / 1024 * 100) / 100,
            databaseMiB: Math.round(Number(size.databaseBytes) / 1024 / 1024 * 100) / 100,
        },
    };
}

export async function syncWarehouses(db: PrismaClient) {
    return monitorDirectorySync("warehouses", report => importWarehouses(db, report));
}

async function importWarehouses(db: PrismaClient, report: SyncProgressReporter) {
    report({stage: "configuration"});
    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) throw new Error("NOVA_POSHTA_API_KEY is not configured");

    const start = Date.now();
    const token = randomUUID();
    // A lease also recovers automatically if a function is terminated without running finally.
    report({stage: "acquire_lock"});
    const locks = await db.$queryRaw<{total: number}[]>`
        INSERT INTO "NovaPoshtaWarehouseSync" ("id", "lockToken", "lockedUntil", "startedAt", "total")
        VALUES (${SYNC_ID}, ${token}::uuid, NOW() + INTERVAL '6 minutes', NOW(), 0)
        ON CONFLICT ("id") DO UPDATE
        SET "lockToken" = EXCLUDED."lockToken", "lockedUntil" = EXCLUDED."lockedUntil", "startedAt" = EXCLUDED."startedAt"
        WHERE "NovaPoshtaWarehouseSync"."lockedUntil" IS NULL OR "NovaPoshtaWarehouseSync"."lockedUntil" < NOW()
        RETURNING "total"
    `;
    const lock = locks[0];
    if (!lock) return {status: "already_running" as const};

    const deadline = start + SYNC_BUDGET_MS;
    let nextRequestAt = 0;
    let changed = 0;
    try {
        const {total, refs} = await importWarehousePages({
            previousTotal: lock.total,
            deadline,
            fetchPage: async (page) => {
                for (let attempt = 0; ; attempt++) {
                    await delay(Math.max(0, nextRequestAt - Date.now()));
                    if (Date.now() + 30_000 >= deadline) throw new Error("Warehouse sync time budget exceeded");
                    nextRequestAt = Date.now() + 600;
                    try {
                        report({stage: "fetch", page, attempt: attempt + 1});
                        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
                            method: "POST",
                            cache: "no-store",
                            headers: {"Content-Type": "application/json"},
                            signal: AbortSignal.timeout(30_000),
                            body: JSON.stringify({
                                apiKey,
                                modelName: "AddressGeneral",
                                calledMethod: "getWarehouses",
                                methodProperties: {Page: String(page), Limit: String(WAREHOUSE_PAGE_SIZE)},
                            }),
                        });
                        if (!response.ok) throw new Error(`Nova Poshta warehouse HTTP ${response.status}`);
                        const payload: unknown = await response.json();
                        report({stage: "validate_response", page});
                        return parseWarehousePage(payload);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : "invalid response";
                        if (attempt >= 2) throw new Error(`Warehouse page ${page}: ${message}`, {cause: error});
                        console.warn(`[sync-warehouses] Page ${page}, retry ${attempt + 1}: ${message}`);
                        nextRequestAt = Date.now() + 1000 * (attempt + 1);
                    }
                }
            },
            saveBatch: async (warehouses) => {
                report({stage: "write", batchSize: warehouses.length});
                changed += await db.$transaction(async (tx) => {
                    // Lock the lease row before writing, so an expired worker cannot race a new run.
                    const owned = await tx.novaPoshtaWarehouseSync.updateMany({
                        where: {id: SYNC_ID, lockToken: token, lockedUntil: {gt: new Date()}},
                        data: {lockToken: token},
                    });
                    if (owned.count !== 1) throw new Error("Warehouse sync lease expired");
                    return upsertWarehouseBatch(tx, warehouses);
                }, {timeout: 15_000});
            },
        });

        report({stage: "finalize"});
        const removed = await db.$transaction(async (tx) => {
            const owned = await tx.novaPoshtaWarehouseSync.updateMany({
                where: {id: SYNC_ID, lockToken: token, lockedUntil: {gt: new Date()}},
                data: {completedAt: new Date(), total},
            });
            if (owned.count !== 1) throw new Error("Warehouse sync lease expired before completion");
            // Only a validated full import may remove records missing from the new directory.
            report({stage: "remove_missing"});
            const deleted = await removeMissingWarehouses(tx, refs);
            report({stage: "verify_saved"});
            const saved = await tx.novaPoshtaWarehouse.count();
            if (saved !== total) throw new Error("Saved warehouse count does not match Nova Poshta total");
            return deleted;
        }, {timeout: 15_000});

        const unchanged = total - changed;
        console.info(`[sync-warehouses] Processed ${total}, changed ${changed}, unchanged ${unchanged}, removed ${removed}, duration ${Date.now() - start} ms`);
        return {status: "completed" as const, processed: total, changed, unchanged, removed, durationMs: Date.now() - start};
    } finally {
        await db.novaPoshtaWarehouseSync.updateMany({
            where: {id: SYNC_ID, lockToken: token},
            data: {lockToken: null, lockedUntil: null},
        });
    }
}
