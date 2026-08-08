import type {Prisma} from "@prisma/client";

export const relatedProductSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    discount: true,
    material: true,
    category: {
        select: {
            id: true,
            name: true,
            slug: true,
            season: true,
            isDecoration: true,
        },
    },
    colors: {
        include: {
            images: {
                take: 1,
                orderBy: {order: "asc"},
            },
            sizes: true,
        },
    },
} satisfies Prisma.ProductSelect;
