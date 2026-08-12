import type { MetadataRoute } from "next";
import prisma from "@/app/lib/prisma";
import {absoluteUrl} from "@/app/lib/seo";
import {getProductPath} from "@/app/lib/productUrl";

export const revalidate = 3600;

interface SitemapCategory {
    slug: string;
}

interface SitemapProduct {
    id: number;
    slug: string;
    updatedAt: Date;
    category: SitemapCategory | null;
    colors: Array<{
        images: Array<{
            url: string;
        }>;
    }>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [categories, products]: [SitemapCategory[], SitemapProduct[]] = await Promise.all([
        prisma.category.findMany({
            select: {
                slug: true,
            },
        }),
        prisma.product.findMany({
            where: {
                categoryId: {
                    not: null,
                },
            },
            select: {
                id: true,
                slug: true,
                updatedAt: true,
                category: {
                    select: {
                        slug: true,
                    },
                },
                colors: {
                    select: {
                        images: {
                            select: {
                                url: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: absoluteUrl("/"),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: absoluteUrl("/catalog"),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: absoluteUrl("/about"),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: absoluteUrl("/delivery"),
            changeFrequency: "yearly",
            priority: 0.5,
        },
        {
            url: absoluteUrl("/exchange"),
            changeFrequency: "yearly",
            priority: 0.5,
        },
        {
            url: absoluteUrl("/offer"),
            changeFrequency: "yearly",
            priority: 0.4,
        },
    ];

    const categoryPages: MetadataRoute.Sitemap = categories.map((category: SitemapCategory) => ({
        url: absoluteUrl(`/catalog/${encodeURIComponent(category.slug)}`),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const productPages: MetadataRoute.Sitemap = products.flatMap((product: SitemapProduct) => {
        if (!product.category) {
            return [];
        }

        const images: string[] = Array.from(new Set(
            product.colors.flatMap((color: SitemapProduct["colors"][number]) =>
                color.images.map((image: { url: string }) => image.url),
            ),
        ));

        return [{
            url: absoluteUrl(getProductPath(product.category.slug, product.id, product.slug)),
            lastModified: product.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
            ...(images.length > 0 ? { images } : {}),
        }];
    });

    return [...staticPages, ...categoryPages, ...productPages];
}
