import * as Sentry from "@sentry/nextjs";
import {NextResponse} from "next/server";
import {closeCheckboxShift} from "@/app/lib/checkbox";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
    const authorization = request.headers.get("authorization");
    const authorized = [process.env.CRON_SECRET, process.env.INTERNAL_API_SECRET]
        .some(secret => Boolean(secret) && authorization === `Bearer ${secret}`);

    if (!authorized) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    try {
        const result = await closeCheckboxShift();
        return NextResponse.json({success: true, ...result}, {
            headers: {"Cache-Control": "no-store"},
        });
    } catch (error: unknown) {
        Sentry.captureException(error, {tags: {error_type: "checkbox_cron_shift_close_failed"}});
        await Sentry.flush(2000);
        console.error("[close-checkbox-shift]", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({error: "Checkbox shift closure failed"}, {
            status: 500,
            headers: {"Cache-Control": "no-store"},
        });
    }
}
