export const TRAFFIC_SOURCES = [
    "FACEBOOK",
    "GOOGLE_SEARCH",
    "GOOGLE_FREE_LISTING",
    "INSTAGRAM",
] as const;

export type TrafficSourceValue = typeof TRAFFIC_SOURCES[number];

export const PENDING_TRAFFIC_SOURCE_COOKIE = "blackberry_pending_traffic_source";

const STORAGE_KEY = "blackberry-shop:traffic-source";
const GOOGLE_HOSTNAME_PATTERN = /(^|\.)google\.[a-z.]+$/i;
const INSTAGRAM_HOSTNAMES: ReadonlySet<string> = new Set(["instagram.com", "www.instagram.com", "l.instagram.com"]);
const FACEBOOK_HOSTNAMES: ReadonlySet<string> = new Set(["facebook.com", "www.facebook.com", "l.facebook.com", "lm.facebook.com"]);
const GOOGLE_FREE_LISTING_MEDIA: ReadonlySet<string> = new Set([
    "free-listing",
    "free_listing",
    "organic-shopping",
    "organic_shopping",
]);

function normalizeParameter(value: string | null): string {
    return value?.trim().toLowerCase() ?? "";
}

function isTrafficSource(value: string | null): value is TrafficSourceValue {
    return TRAFFIC_SOURCES.some((source: TrafficSourceValue): boolean => source === value);
}

function consumePendingTrafficSource(): TrafficSourceValue | null {
    const encodedValue: string | undefined = document.cookie
        .split(";")
        .map((cookie: string): string => cookie.trim())
        .find((cookie: string): boolean => cookie.startsWith(`${PENDING_TRAFFIC_SOURCE_COOKIE}=`))
        ?.slice(PENDING_TRAFFIC_SOURCE_COOKIE.length + 1);

    if (!encodedValue) return null;

    document.cookie = `${PENDING_TRAFFIC_SOURCE_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;

    const value: string = decodeURIComponent(encodedValue);
    return isTrafficSource(value) ? value : null;
}

function getReferrerHostname(referrer: string): string | null {
    if (!referrer) return null;

    try {
        return new URL(referrer).hostname.toLowerCase();
    } catch {
        return null;
    }
}

export function detectTrafficSource(url: URL, referrer: string): TrafficSourceValue | null {
    const source: string = normalizeParameter(
        url.searchParams.get("utm_source") ?? url.searchParams.get("source")
    );
    const medium: string = normalizeParameter(url.searchParams.get("utm_medium"));

    if (url.searchParams.has("srsltid")) {
        return "GOOGLE_FREE_LISTING";
    }

    if (source === "instagram" || source === "ig") {
        return "INSTAGRAM";
    }

    if (source === "google" || url.searchParams.has("gclid")) {
        return GOOGLE_FREE_LISTING_MEDIA.has(medium)
            ? "GOOGLE_FREE_LISTING"
            : "GOOGLE_SEARCH";
    }

    if (
        url.searchParams.has("fbclid")
        || source === "facebook"
        || source === "fb"
        || source === "meta"
    ) {
        return "FACEBOOK";
    }

    const referrerHostname: string | null = getReferrerHostname(referrer);

    if (!referrerHostname) return null;
    if (INSTAGRAM_HOSTNAMES.has(referrerHostname)) return "INSTAGRAM";
    if (FACEBOOK_HOSTNAMES.has(referrerHostname)) return "FACEBOOK";
    if (GOOGLE_HOSTNAME_PATTERN.test(referrerHostname)) return "GOOGLE_SEARCH";

    return null;
}

export function captureTrafficSource(): void {
    const source: TrafficSourceValue | null = consumePendingTrafficSource()
        ?? detectTrafficSource(new URL(window.location.href), document.referrer);

    if (!source) return;

    try {
        window.sessionStorage.setItem(STORAGE_KEY, source);
    } catch {
        // Storage may be unavailable in privacy modes; checkout still falls back to _fbc.
    }
}

export function getCheckoutTrafficSource(fbc: string | null): TrafficSourceValue | null {
    try {
        const storedSource: string | null = window.sessionStorage.getItem(STORAGE_KEY);

        if (isTrafficSource(storedSource)) return storedSource;
    } catch {
        // Fall through to the Facebook click cookie.
    }

    return fbc ? "FACEBOOK" : null;
}
