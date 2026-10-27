import {NextResponse} from "next/server";
import prisma from "@/app/lib/prisma";
import {syncWarehouses, warehouseDirectoryStats} from "@/app/scripts/syncWarehouses";
import {reportDirectoryStatsError} from "@/app/lib/novaPoshtaSyncMonitoring";

export const maxDuration = 300;

export async function GET(request: Request) {
    const authorization = request.headers.get("authorization");
    const authorized = [process.env.CRON_SECRET, process.env.INTERNAL_API_SECRET]
        .some(secret => Boolean(secret) && authorization === `Bearer ${secret}`);
    if (!authorized) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    let stage = "sync";
    try {
        if (new URL(request.url).searchParams.get("stats") === "1") {
            stage = "stats";
            return NextResponse.json(await warehouseDirectoryStats(prisma), {headers: {"Cache-Control": "no-store"}});
        }
        const result = await syncWarehouses(prisma);
        if (result.status === "already_running") {
            return NextResponse.json(result, {status: 409, headers: {"Cache-Control": "no-store"}});
        }
        stage = "stats";
        return NextResponse.json({success: true, ...result, ...await warehouseDirectoryStats(prisma)}, {
            headers: {"Cache-Control": "no-store"},
        });
    } catch (error) {
        if (stage === "stats") await reportDirectoryStatsError(error);
        console.error("[sync-warehouses]", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({error: "Warehouse sync failed; the previous directory is retained"}, {
            status: 500, headers: {"Cache-Control": "no-store"},
        });
    }
}
