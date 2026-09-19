import type {Prisma} from "@prisma/client";

const availableSizeWhere = {
    available: true,
    OR: [{quantity: null}, {quantity: {gt: 0}}],
} satisfies Prisma.ProductSizeWhereInput;

const availableColorWhere = {
    sizes: {some: availableSizeWhere},
} satisfies Prisma.ProductColorWhereInput;

export const availableRelatedProductWhere = {
    toProduct: {colors: {some: availableColorWhere}},
} satisfies Prisma.ProductRelationWhereInput;

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
            sizeGuideImage: true,
            isDecoration: true,
        },
    },
    colors: {
        where: availableColorWhere,
        include: {
            filterColors: {
                include: {
                    catalogColor: true,
                },
            },
            images: {
                take: 1,
                orderBy: {order: "asc"},
            },
            sizes: {where: availableSizeWhere},
        },
    },
    _count: {
        select: {
            relatedTo: true,
        },
    },
} satisfies Prisma.ProductSelect;
