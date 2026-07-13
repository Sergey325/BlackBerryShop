"use server";

import prisma from "@/app/lib/prisma";

export async function getCategoryBySlug(slug: string) {
    try {
        return prisma.category.findUnique({
            where: {
                slug,
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
    } catch (e) {
        console.error(e);
    }
}