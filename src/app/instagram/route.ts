import {NextResponse} from "next/server";
import {
    INSTAGRAM_ROUTE_PARAMETER,
    INSTAGRAM_ROUTE_SOURCE,
    TRAFFIC_SOURCE_COOKIE,
    TRAFFIC_SOURCE_MAX_AGE,
} from "@/app/lib/analytics/trafficSource";

export function GET(request: Request): NextResponse {
    const incomingUrl = new URL(request.url);
    const destination = new URL("/", incomingUrl);
    destination.search = incomingUrl.search;
    // Keep the marker in the URL too, for browsers that block cookies.
    destination.searchParams.set(INSTAGRAM_ROUTE_PARAMETER, "instagram");
    const response = NextResponse.redirect(destination);

    response.cookies.set({
        name: TRAFFIC_SOURCE_COOKIE,
        value: INSTAGRAM_ROUTE_SOURCE,
        httpOnly: false,
        maxAge: TRAFFIC_SOURCE_MAX_AGE,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return response;
}
