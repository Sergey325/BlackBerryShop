export const TRAFFIC_SOURCES = [
    "FACEBOOK",
    "GOOGLE_SEARCH",
    "GOOGLE_FREE_LISTING",
    "INSTAGRAM",
] as const;

export type TrafficSourceValue = typeof TRAFFIC_SOURCES[number];

export const PENDING_TRAFFIC_SOURCE_COOKIE = "blackberry_pending_traffic_source";

// FACEBOOK is the shop's advertising bucket, including ads shown on Instagram.
const STORAGE_KEY = "blackberry-shop:traffic-source:v3";
const PAID_MEDIA: ReadonlySet<string> = new Set([
    "paid_social", "paid-social", "paidsocial", "paid", "cpc", "ppc", "cpm",
]);
const GOOGLE_HOSTNAME_PATTERN = /(^|\.)google\.[a-z.]+$/i;
const INSTAGRAM_HOSTNAMES: ReadonlySet<string> = new Set(["instagram.com", "www.instagram.com", "l.instagram.com"]);
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

function consumePendingTrafficSource(): TrafficSourceValue | null {
    const encodedValue = document.cookie
        .split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(`${PENDING_TRAFFIC_SOURCE_COOKIE}=`))
        ?.slice(PENDING_TRAFFIC_SOURCE_COOKIE.length + 1);

    if (!encodedValue) return null;

    document.cookie = `${PENDING_TRAFFIC_SOURCE_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;

    try {
        const value = decodeURIComponent(encodedValue);
        return isTrafficSource(value) ? value : null;
    } catch {
        return null;
    }
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
    const source = normalizeParameter(url.searchParams.get("utm_source"))
        || normalizeParameter(url.searchParams.get("source"));
    const medium = normalizeParameter(url.searchParams.get("utm_medium"));

    if (PAID_MEDIA.has(medium) || url.searchParams.get("fbclid")?.trim()) {
        return "FACEBOOK";
    }

    if (source === "instagram" || source === "ig") {
        return "INSTAGRAM";
    }

    if (source === "facebook" || source === "fb" || source === "meta") {
        return "FACEBOOK";
    }

    if (source === "google") {
        return GOOGLE_FREE_LISTING_MEDIA.has(medium) || url.searchParams.has("srsltid")
            ? "GOOGLE_FREE_LISTING"
            : "GOOGLE_SEARCH";
    }

    if (url.searchParams.has("srsltid")) return "GOOGLE_FREE_LISTING";
    if (url.searchParams.has("gclid")) return "GOOGLE_SEARCH";

    return null;
}

export function detectTrafficSource(
    url: URL,
    referrer: string,
    pendingSource: TrafficSourceValue | null = null,
): TrafficSourceValue | null {
    const source = getUrlTrafficSource(url) ?? pendingSource;
    if (source) return source;

    const referrerHostname = getReferrerHostname(referrer);

    if (!referrerHostname) return null;
    if (INSTAGRAM_HOSTNAMES.has(referrerHostname)) return "INSTAGRAM";
    if (FACEBOOK_HOSTNAMES.has(referrerHostname)) return "FACEBOOK";
    if (GOOGLE_HOSTNAME_PATTERN.test(referrerHostname)) return "GOOGLE_SEARCH";

    return null;
}

export function captureTrafficSource(): void {
    const url = new URL(window.location.href);
    // Consume the redirect marker even when URL parameters override it.
    const pendingSource = consumePendingTrafficSource();
    const source = detectTrafficSource(url, document.referrer, pendingSource);

    if (!source) return;

    try {
        window.sessionStorage.setItem(STORAGE_KEY, source);
    } catch {
        // Storage may be unavailable in privacy modes.
    }
}

export function getCheckoutTrafficSource(fbc: string | null = null): TrafficSourceValue | null {
    // Business rule: a Meta click cookie takes priority over an organic source.
    if (fbc?.trim()) return "FACEBOOK";

    try {
        const storedSource = window.sessionStorage.getItem(STORAGE_KEY);

        if (isTrafficSource(storedSource)) return storedSource;
    } catch {
        // Storage may be unavailable in privacy modes.
    }

    return null;
}
