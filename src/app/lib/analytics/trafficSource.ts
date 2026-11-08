import type {TrafficSource} from "@prisma/client";

export const TRAFFIC_SOURCES = [
    "FACEBOOK",
    "GOOGLE_SEARCH",
    "GOOGLE_FREE_LISTING",
    "INSTAGRAM",
] as const;

export type TrafficSourceValue = typeof TRAFFIC_SOURCES[number];

export const TRAFFIC_SOURCE_COOKIE = "blackberry_traffic_source";
export const INSTAGRAM_ROUTE_PARAMETER = "bb_source";
export const INSTAGRAM_ROUTE_SOURCE = "INSTAGRAM_ROUTE";
export const TRAFFIC_SOURCE_MAX_AGE = 30 * 24 * 60 * 60;

// Fallback for the current page when cookies are blocked.
let capturedSource: TrafficSourceValue | typeof INSTAGRAM_ROUTE_SOURCE | null = null;

// FACEBOOK is the shop's advertising bucket, including ads shown on Instagram.
const PAID_MEDIA: ReadonlySet<string> = new Set([
    "paid_social", "paid-social", "paidsocial", "paid", "cpc", "ppc", "cpm",
]);
const GOOGLE_HOSTNAME_PATTERN = /(^|\.)google\.[a-z.]+$/i;
const FACEBOOK_HOSTNAMES: ReadonlySet<string> = new Set(["facebook.com", "www.facebook.com", "l.facebook.com", "lm.facebook.com"]);
const GOOGLE_FREE_LISTING_MEDIA: ReadonlySet<string> = new Set([
    "free-listing",
    "free_listing",
    "organic-shopping",
    "organic_shopping",
]);

function normalizeParameter(value: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

function isTrafficSource(value: string | null): value is TrafficSourceValue {
    return TRAFFIC_SOURCES.some(source => source === value);
}

function readTrafficSourceCookie(cookies: string) {
    const value = cookies
        .split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(`${TRAFFIC_SOURCE_COOKIE}=`))
        ?.slice(TRAFFIC_SOURCE_COOKIE.length + 1) ?? null;
    // Old plain INSTAGRAM cookies could come from UTM/referrer, not /instagram.
    return value === INSTAGRAM_ROUTE_SOURCE || (value !== "INSTAGRAM" && isTrafficSource(value)) ? value : null;
}

export function resolveCheckoutTrafficSource(
    source: TrafficSource | null,
    fbc: unknown,
    cookies: string,
): TrafficSource | null {
    // The client has already applied the route override, even if cookies are blocked.
    if (source === "INSTAGRAM") return source;
    const storedSource = readTrafficSourceCookie(cookies);
    if (storedSource === INSTAGRAM_ROUTE_SOURCE) return "INSTAGRAM";
    if (typeof fbc === "string" && fbc.trim()) return "FACEBOOK";
    return source ?? storedSource;
}

function getReferrerHostname(referrer: string): string | null {
    if (!referrer) return null;

    try {
        return new URL(referrer).hostname.toLowerCase();
    } catch {
        return null;
    }
}

function getUrlTrafficSource(url: URL): TrafficSourceValue | null {
    if (url.searchParams.get(INSTAGRAM_ROUTE_PARAMETER) === "instagram") return "INSTAGRAM";

    const source = normalizeParameter(url.searchParams.get("utm_source"))
        || normalizeParameter(url.searchParams.get("source"));
    const medium = normalizeParameter(url.searchParams.get("utm_medium"));

    if (url.searchParams.get("fbclid")?.trim()) {
        return "FACEBOOK";
    }

    if (source === "google") {
        return GOOGLE_FREE_LISTING_MEDIA.has(medium) || url.searchParams.has("srsltid")
            ? "GOOGLE_FREE_LISTING"
            : "GOOGLE_SEARCH";
    }

    const isMetaSource = ["instagram", "ig", "facebook", "fb", "meta"].includes(source);
    if (PAID_MEDIA.has(medium) && (!source || isMetaSource)) return "FACEBOOK";

    if (source === "facebook" || source === "fb" || source === "meta") {
        return "FACEBOOK";
    }

    if (url.searchParams.has("srsltid")) return "GOOGLE_FREE_LISTING";
    if (url.searchParams.has("gclid")) return "GOOGLE_SEARCH";

    return null;
}

export function detectTrafficSource(
    url: URL,
    referrer: string,
): TrafficSourceValue | null {
    const source = getUrlTrafficSource(url);
    if (source) return source;

    const referrerHostname = getReferrerHostname(referrer);

    if (!referrerHostname) return null;
    if (FACEBOOK_HOSTNAMES.has(referrerHostname)) return "FACEBOOK";
    if (GOOGLE_HOSTNAME_PATTERN.test(referrerHostname)) return "GOOGLE_SEARCH";

    return null;
}

export function captureTrafficSource(): void {
    const url = new URL(window.location.href);
    capturedSource = url.searchParams.get(INSTAGRAM_ROUTE_PARAMETER) === "instagram"
        ? INSTAGRAM_ROUTE_SOURCE
        : detectTrafficSource(url, document.referrer);
    if (!capturedSource) return;

    try {
        const secure = url.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${TRAFFIC_SOURCE_COOKIE}=${capturedSource}; Max-Age=${TRAFFIC_SOURCE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    } catch {
        // The current page still has capturedSource when cookies are blocked.
    }
}

export function getCheckoutTrafficSource(fbc: string | null = null): TrafficSourceValue | null {
    let source = capturedSource;
    try {
        source ??= readTrafficSourceCookie(document.cookie);
    } catch {
        // Use the source captured on this page if cookies are blocked.
    }

    if (source === INSTAGRAM_ROUTE_SOURCE) return "INSTAGRAM";
    return fbc?.trim() ? "FACEBOOK" : source;
}
