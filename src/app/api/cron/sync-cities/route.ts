import { NextResponse } from "next/server";
import {syncCities} from "@/app/scripts/syncCities";


export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await syncCities();

        return NextResponse.json({
            success: true,
            updated: result,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Sync failed" },
            { status: 500 }
        );
    }
}