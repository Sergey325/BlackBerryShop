"use server";

import prisma from "@/app/lib/prisma";
import {IProduct, IRelatedProduct} from "./getProducts";
import {relatedProductSelect} from "@/app/lib/relatedProductSelect";
import {unstable_cache} from "next/cache";

export interface IProductWithRelated extends IProduct {
    relatedTo: IRelatedProduct[];
    specificationOverrides: IProductSpecificationOverride[];
}

export interface IProductSpecificationOverride {
    categorySpecificationId: number;
    value: string;
}

async function queryProductById(id: number): Promise<IProductWithRelated | null> {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            colors: {
                include: {
                    filterColors: {
                        include: {
                            catalogColor: true,
                        },
                    },
                    images: true,
                    sizes: true,
                },
            },
            material: true,
            specificationOverrides: {
                select: {
                    categorySpecificationId: true,
                    value: true,
                },
            },
            category: {
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
            },
            relatedTo: {
                orderBy: { order: "asc" },
                include: {
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
    ["storefront-product-by-id-v2"],
    {
        revalidate: 300,
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
