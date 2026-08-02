"use server";

import prisma from "@/app/lib/prisma";
import {ICategory, IRelatedProductCategory} from "@/app/actions/getCategories";

export interface IRelatedProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount: number;
    material: IProductMaterial | null;
    category: IRelatedProductCategory | null;
    colors: {
        id: number;
        color: string;
        colorName: string;
        colorCode: string | null;
        productId: number;
        isBestSeller: boolean;
        images: IProductImage[];
        sizes: IProductSize[];
    }[];
}
export interface IProductSize {
    id: number;
    size: string;
    available: boolean;
    productColorId: number;
}

export interface IProductImage {
    id: number;
    url: string;
    order: number;
    productColorId: number;
}


export interface IProductColor {
    id: number;
    color: string;
    colorName: string;
    colorCode: string | null;
    isBestSeller: boolean;
    productId: number;
    images: IProductImage[];
    sizes: IProductSize[];
}

export interface IProductMaterial {
    id: number;
    name: string;
}

export interface IProduct {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discount: number;
    material: IProductMaterial | null;
    createdAt: Date;
    updatedAt: Date;
    colors: IProductColor[];
    category: ICategory | null;
}

export interface IProductsParams {
    title?: string;
    size?: string[];
    material?: string[];
    color?: string[];
    category?: string;
    sorting?: string;
    priceMin?: string;
    priceMax?: string;
}

export async function getProducts(params: IProductsParams = {}) {
    try {
        const { title, category, sorting, priceMin, priceMax, size, material, color } = params;

        const where: any = {};

        const searchedProducts = title ? await prisma.$queryRaw<{ id: number; score: number }[]>`
            SELECT
                id,
                GREATEST(
                    similarity(name, ${title}),
                    CASE
                        WHEN name ILIKE ${"%" + title + "%"} THEN 1
                        ELSE 0
                    END
                ) AS score
            FROM "Product"
            WHERE
                name ILIKE ${"%" + title + "%"}
                OR similarity(name, ${title}) > 0.2
            ORDER BY score DESC
            LIMIT 100
        ` : null;

        if (material?.length) {
            where.material = {
                name: {
                    in: material,
                },
            };
        }

        if (size?.length || color?.length) {
            where.colors = {
                some: {
                    ...(color?.length && {
                        color: {
                            in: color,
                        },
                    }),
                    ...(size?.length && {
                        sizes: {
                            some: {
                                size: {
                                    in: size,
                                },
                                available: true,
                            },
                        },
                    }),
                },
            };
        }

        if (category) {
            where.category = {
                slug: category,
            };
        }

        if (priceMin || priceMax) {
            where.price = {
                ...(priceMin && { gte: Number(priceMin) }),
                ...(priceMax && { lte: Number(priceMax) }),
            };
        }

        let orderBy: any = { createdAt: "asc" };

        if (searchedProducts) {
            where.id = {
                in: searchedProducts.map(p => p.id),
            };
        }

        switch (sorting) {
            case "asc":
                orderBy = { price: "asc" };
                break;

            case "desc":
                orderBy = { price: "desc" };
                break;

            case "newest":
                orderBy = { createdAt: "desc" };
                break;

            default:
                orderBy = searchedProducts
                    ? undefined
                    : { createdAt: "asc" };
        }

        const products = await prisma.product.findMany({
            where,
            orderBy,
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
                    }
                },
            },
        });

        if (title && !sorting) {
            const orderMap = new Map(
                searchedProducts!.map((item, index) => [
                    item.id,
                    index
                ])
            );

            return products.sort(
                (a, b) =>
                    (orderMap.get(a.id) ?? 999) -
                    (orderMap.get(b.id) ?? 999)
            );
        }

        return products;

    } catch (e) {
        console.error(e);
    }
}
