"use server";

import prisma from "@/app/lib/prisma";

export interface IProductVariant {
    id: number;
    color: string;
    size: string;
    available: boolean;
    productId: number;
}

export interface IProductImage {
    id: number;
    url: string;
    order: number;
    productId: number;
}

export interface IProduct {
    id: number;
    name: string;
    slug: string | null;
    price: number;
    discount: number | null;
    createdAt: Date;
    updatedAt: Date;
    images: IProductImage[];
    variants: IProductVariant[];
}

export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            include: { images: true, variants: true },
            orderBy: { createdAt: "desc" },
        });
        return products;
    }
    catch (e: any) {
        throw new Error(e);
    }
}