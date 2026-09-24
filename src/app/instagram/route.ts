import {NextResponse} from "next/server";
import {PENDING_TRAFFIC_SOURCE_COOKIE} from "@/app/lib/analytics/trafficSource";

export function GET(request: Request): NextResponse {
    const incomingUrl = new URL(request.url);
    const destination = new URL("/", incomingUrl);
    destination.search = incomingUrl.search;
    const response = NextResponse.redirect(destination);

    response.cookies.set({
        name: PENDING_TRAFFIC_SOURCE_COOKIE,
        value: "INSTAGRAM",
        httpOnly: false,
        maxAge: 300,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return response;
}
