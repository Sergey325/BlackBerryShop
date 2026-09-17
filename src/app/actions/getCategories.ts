"use server";

import prisma from "@/app/lib/prisma";
import {getActiveSeasonType} from "@/app/utils/sortSeasons";
import type {Season} from "@prisma/client";
import {unstable_cache} from "next/cache";
import type {ICategory, IHomeCategory} from "@/app/types";

interface ICategorySortData {
    season: Season;
    isDecoration: boolean | null;
}

function compareCategories<T extends ICategorySortData>(a: T, b: T): number {
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
        revalidate: 86400,
        tags: ["categories"],
    }
);

const getCachedHomeCategories = unstable_cache(
    async (): Promise<IHomeCategory[]> => {
        return prisma.category.findMany({
            orderBy: {
                id: "asc",
            },
            select: {
                id: true,
                name: true,
                slug: true,
                coverImage: true,
                season: true,
                isOnMainPage: true,
                isDecoration: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    },
    ["storefront-home-categories-v1"],
    {
        revalidate: 86400,
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

export async function getHomeCategories(): Promise<IHomeCategory[]> {
    try {
        const categories: IHomeCategory[] = await getCachedHomeCategories();

        return [...categories].sort(compareCategories);
    } catch (error) {
        console.error("Failed to get home categories:", error);

        throw new Error("Failed to get home categories");
    }
}
