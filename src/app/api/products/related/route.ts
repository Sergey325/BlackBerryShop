import {NextResponse} from "next/server";
import prisma from "@/app/lib/prisma";
import type {IRelatedProduct} from "@/app/actions/getProducts";
import {relatedProductSelect} from "@/app/lib/relatedProductSelect";

interface RelatedProductsRequest {
    productIds?: unknown;
}

export type RelatedProductsByProductId = Record<number, IRelatedProduct[]>;

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body: RelatedProductsRequest = await request.json();

        if (
            !Array.isArray(body.productIds) ||
            body.productIds.some(
                (productId: unknown) =>
                    !Number.isInteger(productId) || Number(productId) <= 0
            )
        ) {
            return NextResponse.json(
                {message: "productIds must be an array of positive integers"},
                {status: 400}
            );
        }

        const productIds: number[] = [
            ...new Set(body.productIds as number[]),
        ];

        if (productIds.length > 50) {
            return NextResponse.json(
                {message: "A maximum of 50 products can be requested"},
                {status: 400}
            );
        }

        const products = await prisma.product.findMany({
            where: {
                id: {in: productIds},
            },
            select: {
                id: true,
                relatedTo: {
                    orderBy: {order: "asc"},
                    select: {
                        toProduct: {
                            select: relatedProductSelect,
                        },
                    },
                },
            },
        });

        const relatedByProductId: RelatedProductsByProductId = {};

        for (const productId of productIds) {
            relatedByProductId[productId] = [];
        }

        for (const product of products) {
            relatedByProductId[product.id] = product.relatedTo.map(
                relation => relation.toProduct
            );
        }

        return NextResponse.json(relatedByProductId);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: "Failed to load related products"},
            {status: 500}
        );
    }
}
