"use server";

import prisma from "@/app/lib/prisma";
import {getActiveSeasonType} from "@/app/utils/sortSeasons";
import {Season} from "@prisma/client";
import {unstable_cache} from "next/cache";

export interface IRelatedProductCategory {
    id: number;
    name: string;
    slug: string;
    season: Season;
    sizeGuideImage: string | null;
    isDecoration: boolean | null;
}

export interface ICategory {
    name: string
    id: number
    slug: string
    description: string
    productsDescription: string
    coverImage: string
    sizeGuideImage: string | null
    season: Season
    isOnMainPage: boolean | null
    isDecoration: boolean | null
    specifications: {
        name: string
        id: number
        categoryId: number
        order: number
        value: string
    }[]
    _count: {
        products: number
    }
}

function compareCategories(a: ICategory, b: ICategory): number {
    const activeSeason: ReturnType<typeof getActiveSeasonType> = getActiveSeasonType();
    const seasonOrder: number =
        Number(b.season === activeSeason) - Number(a.season === activeSeason);

    if (seasonOrder !== 0) {
        return seasonOrder;
    }

    return Number(Boolean(a.isDecoration)) - Number(Boolean(b.isDecoration));
}

const getCachedCategories = unstable_cache(
    async (): Promise<ICategory[]> => {
        return prisma.category.findMany({
            orderBy: {
                id: "asc",
            },
            include: {
                specifications: {
                    orderBy: {
                        order: "asc",
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    },
    ["storefront-categories-v1"],
    {
        revalidate: 300,
        tags: ["categories"],
    }
);

export async function getCategories(): Promise<ICategory[]> {
    try {
        const categories: ICategory[] = await getCachedCategories();

        return [...categories].sort(compareCategories);
    } catch (error) {
        console.error("Failed to get categories:", error);

        throw new Error("Failed to get categories");
    }
}
