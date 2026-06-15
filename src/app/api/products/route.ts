import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, name, price, discount, images, variants } = body;

        if (id) {
            await prisma.product.update({
                where: { id },
                data: {
                    name,
                    price,
                    discount,
                    images: {
                        deleteMany: {},
                        create: images?.map((url: string, index: number) => ({
                            url,
                            order: index,
                        })),
                    },
                    variants: {
                        deleteMany: {},
                        create: variants?.map((v: { color: string; size: string; available: boolean }) => ({
                            color: v.color,
                            size: v.size,
                            available: v.available,
                        })),
                    },
                },
            });
        } else {
            await prisma.product.create({
                data: {
                    name,
                    price,
                    discount,
                    images: {
                        create: images?.map((url: string, index: number) => ({
                            url,
                            order: index,
                        })),
                    },
                    variants: {
                        create: variants?.map((v: { color: string; size: string; available: boolean }) => ({
                            color: v.color,
                            size: v.size,
                            available: v.available,
                        })),
                    },
                },
            });
        }

        return NextResponse.json(null, { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}