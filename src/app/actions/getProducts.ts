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
    productId: number;
    images: IProductImage[];
    sizes: IProductSize[];
}

export interface IProduct {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    discount: number;
    createdAt: Date;
    updatedAt: Date;
    colors: IProductColor[];
}

export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            include: {
                colors: {
                    include: { images: true, sizes: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return products;
    } catch (e: any) {
        throw new Error(e);
    }
}