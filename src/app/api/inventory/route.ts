import {NextResponse} from "next/server";
import prisma from "@/app/lib/prisma";

type InventoryRequest = {
    productColorIds?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body: InventoryRequest = await request.json() as InventoryRequest;
        const productColorIds: number[] = Array.isArray(body.productColorIds)
            ? [...new Set(body.productColorIds.map(Number))].filter(
                (id: number): boolean => Number.isInteger(id) && id > 0
            )
            : [];

        if (productColorIds.length === 0) {
            return NextResponse.json({items: []});
        }

        const items = await prisma.productColor.findMany({
            where: {id: {in: productColorIds}},
            select: {
                id: true,
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
        });

        return NextResponse.json({
            items: items.map((item) => ({
                productColorId: item.id,
                sizes: item.sizes,
            })),
        });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({error: "Не вдалося перевірити залишки"}, {status: 500});
    }
}
