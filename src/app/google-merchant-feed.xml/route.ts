import {Prisma} from "@prisma/client";
import {unstable_cache} from "next/cache";
import prisma from "@/app/lib/prisma";
import {
    streamGoogleMerchantFeed,
    GoogleMerchantFeedProduct,
} from "@/app/lib/googleMerchantFeed";

// Next.js buffers route bodies for ISR, so stream this feed and cache it at the CDN.
export const dynamic = "force-dynamic";

const FEED_CACHE_SECONDS = 86400;

const googleMerchantProductSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    price: true,
    discount: true,
    material: {
        select: {
            name: true,
        },
    },
    category: {
        select: {
            name: true,
            slug: true,
            productsDescription: true,
            specifications: {
                select: {
                    id: true,
                    name: true,
                    value: true,
                },
            },
        },
    },
    specificationOverrides: {
        select: {
            categorySpecificationId: true,
            value: true,
        },
    },
    colors: {
        where: {
            images: {
                some: {},
            },
            sizes: {
                some: {},
            },
        },
        orderBy: [{position: "asc"}, {id: "asc"}],
        select: {
            id: true,
            colorName: true,
            images: {
                orderBy: [{order: "asc"}, {id: "asc"}],
                select: {
                    url: true,
                },
            },
            sizes: {
                orderBy: {
                    id: "asc",
                },
                select: {
                    id: true,
                    size: true,
                    available: true,
                    quantity: true,
                },
            },
        },
    },
} satisfies Prisma.ProductSelect;

type GoogleMerchantProductRow = Prisma.ProductGetPayload<{
    select: typeof googleMerchantProductSelect;
}>;

async function buildCompressedFeed() {
    const rows: GoogleMerchantProductRow[] = await prisma.product.findMany({
        where: {
            categoryId: {
                not: null,
            },
            category: {
                isNot: null,
                // Temporary: remove this condition to include summer products in the feed again.
                is: {season: {not: "SUMMER"}},
            },
            colors: {
                some: {
                    images: {
                        some: {},
                    },
                    sizes: {
                        some: {},
                    },
                },
            },
        },
        orderBy: [{position: "asc"}, {id: "asc"}],
        select: googleMerchantProductSelect,
    });
    const products: GoogleMerchantFeedProduct[] = rows.flatMap(
        (row: GoogleMerchantProductRow): GoogleMerchantFeedProduct[] =>
            row.category ? [{...row, category: row.category}] : [],
    );
    const xml = streamGoogleMerchantFeed(products);
    const compressed = await new Response(xml.pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
    return Buffer.from(compressed).toString("base64");
}

export async function GET(request: Request): Promise<Response> {
    try {
        const day = Math.floor(Date.now() / (FEED_CACHE_SECONDS * 1000));
        const getCachedFeed = unstable_cache(buildCompressedFeed, [
            "google-merchant-feed",
            process.env.VERCEL_GIT_COMMIT_SHA ?? "",
            String(day),
        ], {revalidate: FEED_CACHE_SECONDS});
        const compressed = Buffer.from(await getCachedFeed(), "base64");

        const expiresAt = (day + 1) * FEED_CACHE_SECONDS * 1000;
        const remainingSeconds = Math.floor((expiresAt - Date.now()) / 1000);
        const headers = new Headers({
            "Vercel-CDN-Cache-Control": remainingSeconds > 0 ? `public, s-maxage=${remainingSeconds}` : "no-store",
            "Content-Type": "application/xml; charset=utf-8",
            "Vary": "Accept-Encoding",
        });
        const encodings = request.headers.get("accept-encoding")?.toLowerCase().split(",") ?? [];
        const gzip = encodings.map(value => value.trim().split(/\s*;\s*/))
            .find(([encoding]) => encoding === "gzip");

        if (gzip && !gzip.slice(1).some(parameter => /^q\s*=\s*0(?:\.0*)?$/.test(parameter))) {
            headers.set("Content-Encoding", "gzip");
            headers.set("Content-Length", String(compressed.byteLength));
            return new Response(compressed, {headers});
        }

        const xml = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
        return new Response(xml, {headers});
    } catch (error: unknown) {
        console.error("Failed to generate Google Merchant feed:", error);

        return new Response("Internal Server Error", {
            status: 500,
            headers: {
                "Cache-Control": "no-store",
                "Content-Type": "text/plain; charset=utf-8",
            },
        });
    }
}
