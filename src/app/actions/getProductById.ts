"use server";

import prisma from "@/app/lib/prisma";
import {availableRelatedProductWhere, relatedProductSelect} from "@/app/lib/relatedProductSelect";
import {unstable_cache} from "next/cache";
import type {IProductWithRelated, IRelatedProduct} from "@/app/types";

async function queryProductById(id: number): Promise<IProductWithRelated | null> {
    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            discount: true,
            description: true,
            hasLining: true,
            colors: {
                select: {
                    id: true,
                    color: true,
                    colorName: true,
                    colorCode: true,
                    isBestSeller: true,
                    filterColors: {
                        select: {
                            catalogColor: {
                                select: {code: true, name: true, hex: true},
                            },
                        },
                    },
                    images: {
                        select: {id: true, url: true, order: true},
                    },
                    sizes: {
                        orderBy: {id: "asc"},
                        select: {
                            id: true,
                            size: true,
                            quantity: true,
                            available: true,
                            productColorId: true,
                        },
                    },
                },
            },
            material: {select: {name: true}},
            specificationOverrides: {
                select: {
                    categorySpecificationId: true,
                    value: true,
                },
            },
            category: {
                select: {
                    name: true,
                    slug: true,
                    season: true,
                    isDecoration: true,
                    productsDescription: true,
                    sizeGuideImage: true,
                    specifications: {
                        orderBy: {order: "asc"},
                        select: {id: true, name: true, value: true},
                    },
                },
            },
            relatedTo: {
                where: availableRelatedProductWhere,
                orderBy: {order: "asc"},
                select: {
                    toProduct: {
                        select: relatedProductSelect,
                    },
                },
            },
        },
    });

    if (!product) {
        return null;
    }

    const {relatedTo, ...rest} = product;
    const relatedProducts: IRelatedProduct[] = relatedTo.map((relation): IRelatedProduct => {
        const {_count, ...relatedProduct} = relation.toProduct;

        return {
            ...relatedProduct,
            hasRelatedProducts: _count.relatedTo > 0,
        };
    });

    const response: IProductWithRelated = {
        ...rest,
        hasRelatedProducts: relatedTo.length > 0,
        relatedTo: relatedProducts,
    };

    return response;
}

const getCachedProductById = unstable_cache(
    queryProductById,
    ["storefront-product-by-id-v5"],
    {
        revalidate: 86400,
        tags: ["products"],
    }
);

export async function getProductById(productId: string): Promise<IProductWithRelated | null> {
    const id: number = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return getCachedProductById(id);
}
