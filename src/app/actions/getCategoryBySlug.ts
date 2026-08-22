"use server";

import prisma from "@/app/lib/prisma";
import {Prisma} from "@prisma/client";
import {unstable_cache} from "next/cache";

const categoryBySlugInclude = {
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
} satisfies Prisma.CategoryInclude;

type CategoryBySlug = Prisma.CategoryGetPayload<{
    include: typeof categoryBySlugInclude;
}>;

const getCachedCategoryBySlug = unstable_cache(
    async (slug: string): Promise<CategoryBySlug | null> => {
    return prisma.category.findUnique({
        where: {
            slug,
        },
        include: categoryBySlugInclude,
    });
    },
    ["storefront-category-by-slug-v1"],
    {
        revalidate: 300,
        tags: ["categories"],
    }
);

export async function getCategoryBySlug(slug: string): Promise<CategoryBySlug | null> {
    return getCachedCategoryBySlug(slug.trim());
}
