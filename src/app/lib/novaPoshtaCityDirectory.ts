import {Prisma, type PrismaClient} from "@prisma/client";
import {monitorDirectorySync, type SyncProgressReporter} from "./novaPoshtaSyncMonitoring";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseCityDirectory(payload: unknown) {
    if (!payload || typeof payload !== "object"
        || !("success" in payload) || payload.success !== true
        || !("data" in payload) || !Array.isArray(payload.data) || payload.data.length === 0
        || !("info" in payload) || !payload.info || typeof payload.info !== "object"
        || !("totalCount" in payload.info)) {
        throw new Error("Nova Poshta returned an invalid or empty cities response");
    }

    const rawTotal = payload.info.totalCount;
    const total = typeof rawTotal === "number" ? rawTotal
        : typeof rawTotal === "string" && /^\d+$/.test(rawTotal) ? Number(rawTotal) : NaN;
    if (!Number.isSafeInteger(total) || total !== payload.data.length) {
        throw new Error("Nova Poshta returned an incomplete cities directory");
    }

    const refs = new Set<string>();
    return payload.data.map((city: unknown) => {
        if (!city || typeof city !== "object"
            || !("Ref" in city) || typeof city.Ref !== "string" || !UUID.test(city.Ref)
            || !("Description" in city) || typeof city.Description !== "string" || !city.Description.trim()
            || !("AreaDescription" in city) || typeof city.AreaDescription !== "string" || !city.AreaDescription.trim()) {
            throw new Error("Nova Poshta returned an invalid city record");
        }
        const ref = city.Ref.toLowerCase();
        if (refs.has(ref)) throw new Error("Nova Poshta returned duplicate city refs");
        refs.add(ref);
        return {ref, name: city.Description, area: city.AreaDescription};
    });
}

type CityDirectoryRow = ReturnType<typeof parseCityDirectory>[number];

export async function reconcileCityDirectory(tx: Prisma.TransactionClient, cities: CityDirectoryRow[], report?: SyncProgressReporter) {
    report?.({stage: "validate_directory"});
    if (cities.length === 0 || new Set(cities.map(city => city.ref)).size !== cities.length) {
        throw new Error("Cannot synchronize cities using an empty or duplicate directory");
    }
    const refs = JSON.stringify(cities.map(city => city.ref));
    const [previous] = await tx.$queryRaw<{total: number; missing: number}[]>`
        SELECT count(*)::int AS total,
               count(*) FILTER (WHERE ref NOT IN (
                   SELECT value FROM jsonb_array_elements_text(${refs}::jsonb)
               ))::int AS missing
        FROM "NovaPoshtaCity"
    `;
    if (cities.length < previous.total * 0.8 || previous.missing > previous.total * 0.2) {
        throw new Error("Cities directory changed by over 20%; keeping the previous directory");
    }

    let changed = 0;
    const batchSize = 1000;
    for (let offset = 0; offset < cities.length; offset += batchSize) {
        report?.({stage: "write", batchSize: Math.min(batchSize, cities.length - offset)});
        const values = cities.slice(offset, offset + batchSize).map(city => Prisma.sql`
            (${city.ref}, ${city.name}, ${city.area}, NOW())
        `);
        changed += await tx.$executeRaw`
            INSERT INTO "NovaPoshtaCity" ("ref", "name", "area", "updatedAt")
            VALUES ${Prisma.join(values)}
            ON CONFLICT ("ref") DO UPDATE
            SET "name" = EXCLUDED."name", "area" = EXCLUDED."area", "updatedAt" = EXCLUDED."updatedAt"
            WHERE "NovaPoshtaCity"."name" IS DISTINCT FROM EXCLUDED."name"
               OR "NovaPoshtaCity"."area" IS DISTINCT FROM EXCLUDED."area"
        `;
    }

    report?.({stage: "remove_missing"});
    const removed = await tx.$executeRaw`
        DELETE FROM "NovaPoshtaCity"
        WHERE ref NOT IN (SELECT value FROM jsonb_array_elements_text(${refs}::jsonb))
    `;
    report?.({stage: "verify_saved"});
    const [saved] = await tx.$queryRaw<{total: number}[]>`SELECT count(*)::int AS total FROM "NovaPoshtaCity"`;
    if (saved.total !== cities.length) throw new Error("Saved cities count does not match Nova Poshta total");
    return {processed: cities.length, changed, unchanged: cities.length - changed, removed};
}

export async function synchronizeCityDirectory(db: PrismaClient) {
    return monitorDirectorySync("cities", report => importCityDirectory(db, report));
}

async function importCityDirectory(db: PrismaClient, report: SyncProgressReporter) {
    report({stage: "fetch"});
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        cache: "no-store",
        headers: {"Content-Type": "application/json"},
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
            apiKey: process.env.NOVA_POSHTA_API_KEY,
            modelName: "Address",
            calledMethod: "getCities",
            methodProperties: {},
        }),
    });
    if (!response.ok) throw new Error(`Nova Poshta cities HTTP ${response.status}`);
    const payload: unknown = await response.json();
    report({stage: "validate_response"});
    const cities = parseCityDirectory(payload);

    return db.$transaction(async tx => {
        report({stage: "acquire_lock"});
        const [lock] = await tx.$queryRaw<{acquired: boolean}[]>`
            SELECT pg_try_advisory_xact_lock(hashtext('nova-poshta-city-directory')) AS acquired
        `;
        if (!lock.acquired) throw new Error("Cities sync is already running");
        return reconcileCityDirectory(tx, cities, report);
    }, {timeout: 60_000});
}
