import {Prisma} from "@prisma/client";
import prisma from "@/app/lib/prisma";
import {
    buildGoogleMerchantFeed,
    GoogleMerchantFeedProduct,
} from "@/app/lib/googleMerchantFeed";

export const revalidate = 86400;

const CACHE_CONTROL = "public, s-maxage=86400, stale-while-revalidate=3600";

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

export async function GET(): Promise<Response> {
    try {
        const rows: GoogleMerchantProductRow[] = await prisma.product.findMany({
            where: {
                categoryId: {
                    not: null,
                },
                category: {
                    isNot: null,
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
        const xml: string = buildGoogleMerchantFeed(products);

        return new Response(xml, {
            status: 200,
            headers: {
                "Cache-Control": CACHE_CONTROL,
                "Content-Type": "application/xml; charset=utf-8",
            },
        });
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
