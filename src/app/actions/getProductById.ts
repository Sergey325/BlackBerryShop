"use server";

import prisma from "@/app/lib/prisma";
import {IProduct, IRelatedProduct} from "./getProducts"; // путь скорректируй под себя

export interface IProductWithRelated extends IProduct {
    relatedTo: IRelatedProduct[];
}

export async function getProductById(productId: string): Promise<IProductWithRelated | null> {
    try {
        const id = Number(productId);

        if (Number.isNaN(id)) {
            return null;
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                colors: {
                    include: {
                        images: true,
                        sizes: true,
                    },
                },
                material: true,
                category: {
                    include: {
                        specifications: true,
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
                            select: {
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
                                    },
                                },
                                colors: {
                                    include: {
                                        images: {
                                            take: 1,
                                            orderBy: { order: "asc" },
                                        },
                                        sizes: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            return null;
        }

        const { relatedTo, ...rest } = product;

        const response: IProductWithRelated = {
            ...rest,
            relatedTo: relatedTo.map((r) => r.toProduct),
        };

        return response;
    } catch (e) {
        console.error(e);
        return null;
    }
}