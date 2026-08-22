"use server";

import prisma from "@/app/lib/prisma";
import {unstable_cache} from "next/cache";

export interface IBanner {
    id: number;
    image: string;
    badge: string | null;
    title: string;
    features: string[];
    ctaHref: string | null;
    ctaLabel: string | null;
    order: number;
}


const getCachedBanners = unstable_cache(
    async (): Promise<IBanner[]> => {
        return prisma.banner.findMany({
            orderBy: [{ order: "asc" }, { id: "asc" }],
        });
    },
    ["storefront-banners-v1"],
    {
        revalidate: 300,
        tags: ["banners"],
    }
);

export async function getBanners(): Promise<IBanner[]> {
    try{
        return await getCachedBanners();
    } catch (error) {
        console.error("Failed to get banners:", error);

        throw new Error("Failed to get banners");
    }
}
