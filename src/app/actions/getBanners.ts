"use server";

import prisma from "@/app/lib/prisma";

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


export async function getBanners() {
    try{
        const banners = await prisma.banner.findMany({
            orderBy: [{ order: "asc" }, { id: "asc" }],
        });

        return banners
    } catch (error) {
        console.error("Failed to get banners:", error);

        throw new Error("Failed to get banners");
    }
}
