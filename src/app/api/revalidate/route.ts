import {timingSafeEqual} from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import {revalidateTag} from "next/cache";
import {NextResponse} from "next/server";

const ALLOWED_CACHE_TAGS = ["products", "categories", "banners"] as const;

type CacheTag = typeof ALLOWED_CACHE_TAGS[number];

interface RevalidationRequestBody {
    tags?: unknown;
}

interface RevalidationSuccessResponse {
    revalidated: true;
    tags: CacheTag[];
}

interface RevalidationErrorResponse {
    error: string;
}

function isAuthorized(request: Request, expectedSecret: string): boolean {
    const authorization: string | null = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) return false;

    const receivedSecret: Buffer = Buffer.from(authorization.slice("Bearer ".length));
    const expectedSecretBuffer: Buffer = Buffer.from(expectedSecret);

    return receivedSecret.length === expectedSecretBuffer.length
        && timingSafeEqual(receivedSecret, expectedSecretBuffer);
}

function parseCacheTags(body: unknown): CacheTag[] | null {
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return null;
    }

    const {tags} = body as RevalidationRequestBody;

    if (!Array.isArray(tags) || tags.length === 0) return null;

    const allowedCacheTags: ReadonlySet<string> = new Set(ALLOWED_CACHE_TAGS);
    const uniqueTags: string[] = [...new Set(tags)];

    if (
        uniqueTags.length > ALLOWED_CACHE_TAGS.length
        || uniqueTags.some((tag: unknown): boolean =>
            typeof tag !== "string" || !allowedCacheTags.has(tag)
        )
    ) {
        return null;
    }

    return uniqueTags as CacheTag[];
}

export async function POST(request: Request): Promise<NextResponse> {
    const expectedSecret: string | undefined = process.env.REVALIDATE_SECRET;

    if (!expectedSecret) {
        const configurationError = new Error("REVALIDATE_SECRET is not configured");

        Sentry.captureException(configurationError, {
            tags: {
                error_type: "storefront_cache_revalidation_configuration_error",
            },
        });

        return NextResponse.json<RevalidationErrorResponse>(
            {error: "Cache revalidation is not configured"},
            {status: 500}
        );
    }

    if (!isAuthorized(request, expectedSecret)) {
        return NextResponse.json<RevalidationErrorResponse>(
            {error: "Unauthorized"},
            {status: 401}
        );
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json<RevalidationErrorResponse>(
            {error: "Request body must be valid JSON"},
            {status: 400}
        );
    }

    const tags: CacheTag[] | null = parseCacheTags(body);

    if (!tags) {
        return NextResponse.json<RevalidationErrorResponse>(
            {error: `tags must contain one or more of: ${ALLOWED_CACHE_TAGS.join(", ")}`},
            {status: 400}
        );
    }

    try {
        tags.forEach((tag: CacheTag): void => {
            revalidateTag(tag, {expire: 0});
        });

        return NextResponse.json<RevalidationSuccessResponse>({
            revalidated: true,
            tags,
        });
    } catch (error: unknown) {
        Sentry.withScope((scope): void => {
            scope.setTag("error_type", "storefront_cache_invalidation_failed");
            scope.setContext("cache_revalidation", {
                tags,
                userAgent: request.headers.get("user-agent"),
            });
            scope.captureException(error);
        });

        return NextResponse.json<RevalidationErrorResponse>(
            {error: "Failed to revalidate storefront cache"},
            {status: 500}
        );
    }
}
