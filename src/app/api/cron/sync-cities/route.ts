import { NextResponse } from "next/server";
import {syncCities} from "@/app/scripts/syncCities";

export const maxDuration = 120;

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");

        const secret = process.env.INTERNAL_API_SECRET;
        if (!secret || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await syncCities();

        return NextResponse.json({
            success: true,
            updated: result.processed,
            ...result,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Sync failed" },
            { status: 500 }
        );
    }
}
