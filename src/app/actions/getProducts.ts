"use server";

import prisma from "@/app/lib/prisma";

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
    description: string;
    price: number;
    discount: number;
    material: IProductMaterial | null;
    createdAt: Date;
    updatedAt: Date;
    colors: IProductColor[];
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
    const { title, category, sorting, priceMin, priceMax, size, material, color } = params;

    const where: any = {};

    if (title) {
        where.name = {
            contains: title,
            mode: "insensitive",
        };
    }

    if (size?.length) {
        where.colors = {
            some: {
                sizes: {
                    some: {
                        size: {
                            in: size,
                        },
                        available: true,
                    },
                },
            },
        };
    }

    if (material?.length) {
        where.material = {
            name: {
                in: material,
            },
        };
    }

    if (color?.length) {
        where.colors = {
            some: {
                color: {
                    in: color
                }
            }
        }
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
    }

    return prisma.product.findMany({
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
        },
    });
}