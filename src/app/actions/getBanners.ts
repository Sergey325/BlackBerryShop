"use server";

import prisma from "@/app/lib/prisma";
import {unstable_cache} from "next/cache";
import type {IBanner} from "@/app/types";


const getCachedBanners = unstable_cache(
    async (): Promise<IBanner[]> => {
        return prisma.banner.findMany({
            orderBy: [{ order: "asc" }, { id: "asc" }],
            select: {
                image: true,
                mobileImage: true,
                badge: true,
                title: true,
                features: true,
                ctaHref: true,
                ctaLabel: true,
            },
        });
    },
    ["storefront-banners-v2"],
    {
        revalidate: 86400,
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
