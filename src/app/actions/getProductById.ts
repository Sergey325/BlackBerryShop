"use server"

import prisma from "@/app/lib/prisma";

export async function getProductById(productId: string) {
    try {
        const id = Number(productId);

        if (Number.isNaN(id)) {
            return null;
        }

        return prisma.product.findUnique({
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
                    }
                }
            },
        });
    } catch (e) {
        console.error(e);
    }
}