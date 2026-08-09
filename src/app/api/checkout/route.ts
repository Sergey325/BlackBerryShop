import {NextResponse} from "next/server";
import prisma from "@/app/lib/prisma";
import {PaymentMethod} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import {
    calculateCartPricing,
    CartPricingError,
    PromoCartItemInput,
} from "@/app/lib/promoCode";

type CheckoutItem = {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    color: string;
    colorName?: string | null;
    size?: string | null;
    imageUrl: string;
    colorId: number;
};

type CheckoutRequest = {
    contact: {
        firstName: string;
        lastName: string;
        phone: string;
        email?: string;
        comment?: string;
    };
    delivery: {
        city: string;
        area: string;
        cityRef: string;
        warehouse: string;
        warehouseNumber: string | number;
        warehouseRef: string;
    };
    paymentMethod: PaymentMethod;
    items: CheckoutItem[];
    promoCode?: string | null;
    fbp?: string | null;
    fbc?: string | null;
};

type MonobankResponse = {
    invoiceId?: string;
    pageUrl?: string;
    errCode?: string;
    errText?: string;
};

type ValidatedCheckoutItem = CheckoutItem & {
    productSizeId: number;
    colorCode: string | null;
};

class InventoryConflictError extends Error {
    constructor(message = "Обраної кількості товару вже немає в наявності") {
        super(message);
        this.name = "InventoryConflictError";
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    let orderId: number | undefined;

    try {
        const body: CheckoutRequest = await request.json() as CheckoutRequest;
        const {contact, delivery, paymentMethod, items, promoCode, fbp, fbc} = body;

        if (!contact || !delivery || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({error: "Некоректні дані замовлення"}, {status: 400});
        }

        if (paymentMethod !== PaymentMethod.MONOBANK && paymentMethod !== PaymentMethod.CASH_ON_DELIVERY) {
            return NextResponse.json({error: "Некоректний спосіб оплати"}, {status: 400});
        }

        if (promoCode !== null && promoCode !== undefined && typeof promoCode !== "string") {
            return NextResponse.json({error: "Некоректний промокод"}, {status: 400});
        }

        if (items.some((item: CheckoutItem): boolean =>
            !Number.isInteger(Number(item.productId))
            || !Number.isInteger(Number(item.colorId))
            || !Number.isInteger(Number(item.quantity))
            || Number(item.quantity) <= 0
        )) {
            return NextResponse.json({error: "Некоректні товари в замовленні"}, {status: 400});
        }

        const promoItems: PromoCartItemInput[] = items.map((item: CheckoutItem): PromoCartItemInput => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
        }));
        const pricing = await calculateCartPricing(promoItems, promoCode);
        const pricedItems: CheckoutItem[] = items.map((item: CheckoutItem, index: number): CheckoutItem => ({
            ...item,
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: pricing.items[index].finalUnitPrice,
        }));
        const isCod: boolean = paymentMethod === PaymentMethod.CASH_ON_DELIVERY;
        const amountDue: number = isCod ? 150 : pricing.total;
        const forwardedFor: string | null = request.headers.get("x-forwarded-for");
        const clientIp: string | null = forwardedFor
            ? forwardedFor.split(",")[0].trim()
            : request.headers.get("x-real-ip") ?? null;
        const userAgent: string | null = request.headers.get("user-agent") ?? null;

        const order = await prisma.$transaction(async (tx) => {
            const productColorIds: number[] = [...new Set(
                pricedItems.map((item: CheckoutItem): number => Number(item.colorId))
            )];
            const productColors = await tx.productColor.findMany({
                where: {id: {in: productColorIds}},
                select: {
                    id: true,
                    productId: true,
                    colorCode: true,
                    sizes: {
                        select: {
                            id: true,
                            size: true,
                        },
                    },
                },
            });
            const productColorsById = new Map(
                productColors.map((color) => [color.id, color] as const)
            );
            const validatedItems: ValidatedCheckoutItem[] = pricedItems.map(
                (item: CheckoutItem): ValidatedCheckoutItem => {
                    const productColor = productColorsById.get(Number(item.colorId));

                    if (!productColor || productColor.productId !== Number(item.productId)) {
                        throw new InventoryConflictError("Варіант товару більше недоступний");
                    }

                    const productSize = productColor.sizes.find((size): boolean => size.size === item.size)
                        ?? (productColor.sizes.length === 1 ? productColor.sizes[0] : undefined);

                    if (!productSize) {
                        throw new InventoryConflictError("Оберіть доступний розмір товару");
                    }

                    return {
                        ...item,
                        productSizeId: productSize.id,
                        colorCode: productColor.colorCode,
                    };
                }
            );
            const requestedByProductSizeId = new Map<number, number>();

            for (const item of validatedItems) {
                requestedByProductSizeId.set(
                    item.productSizeId,
                    (requestedByProductSizeId.get(item.productSizeId) ?? 0) + item.quantity
                );
            }

            const productSizeIds: number[] = [...requestedByProductSizeId.keys()].sort((a, b) => a - b);
            for (const productSizeId of productSizeIds) {
                await tx.$queryRaw<Array<{id: number}>>`
                    SELECT "id"
                    FROM "ProductSize"
                    WHERE "id" = ${productSizeId}
                    FOR UPDATE
                `;
            }

            const currentProductSizes = await tx.productSize.findMany({
                where: {id: {in: productSizeIds}},
                select: {id: true, available: true, quantity: true},
            });
            const currentProductSizesById = new Map(
                currentProductSizes.map((size) => [size.id, size] as const)
            );

            for (const [productSizeId, requestedQuantity] of requestedByProductSizeId) {
                const currentProductSize = currentProductSizesById.get(productSizeId);

                if (
                    !currentProductSize
                    || !currentProductSize.available
                    || currentProductSize.quantity === 0
                    || (currentProductSize.quantity !== null && currentProductSize.quantity < requestedQuantity)
                ) {
                    throw new InventoryConflictError();
                }
            }

            return tx.order.create({
                data: {
                    status: "PENDING",
                    totalAmount: amountDue,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    phone: contact.phone,
                    email: contact.email,
                    comment: contact.comment,
                    city: delivery.city,
                    area: delivery.area,
                    cityRef: delivery.cityRef,
                    warehouse: delivery.warehouse,
                    warehouseNumber: Number(delivery.warehouseNumber),
                    warehouseRef: delivery.warehouseRef,
                    paymentMethod,
                    fbp: fbp ?? null,
                    fbc: fbc ?? null,
                    clientIp,
                    userAgent,
                    promoCodeId: pricing.promoCode?.id ?? null,
                    promoCodeSnapshot: pricing.promoCode?.code ?? null,
                    discountPercentApplied: pricing.promoCode?.discountPercent ?? null,
                    discountAmount: pricing.promoCode ? pricing.discountAmount : null,
                    items: {
                        create: validatedItems.map((item: ValidatedCheckoutItem) => ({
                            productId: item.productId,
                            productSizeId: item.productSizeId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            color: item.color,
                            colorName: item.colorName,
                            colorCode: item.colorCode,
                            size: item.size,
                            imageUrl: item.imageUrl,
                        })),
                    },
                },
            });
        });

        orderId = order.id;

        const customerEmails: string[] = [process.env.EMAIL!, process.env.EMAIL2!];

        if (order.email && !customerEmails.includes(order.email)) {
            customerEmails.unshift(order.email);
        }

        const basketOrder = isCod ? [
            {
                name: "Передоплата за замовлення",
                qty: 1,
                sum: 15000,
                unit: "шт",
                code: `prepayment-${order.id}`,
            },
        ] : pricedItems.map((item: CheckoutItem) => ({
            name: item.name,
            qty: item.quantity,
            sum: Math.round(item.price * 100),
            icon: item.imageUrl,
            unit: "шт",
            code: `${item.productId}${item.color.replace("#", "")}${item.size ?? ""}`,
        }));

        const monobankRes: Response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
            method: "POST",
            headers: {
                "X-Token": process.env.MONOBANK_TOKEN!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: Math.round(amountDue * 100),
                ccy: 980,
                merchantPaymInfo: {
                    reference: String(order.id),
                    destination: `Замовлення #${order.id}`,
                    basketOrder,
                    customerEmails,
                },
                redirectUrl: `${process.env.BASE_URL}/successfulPayment?id=${order.id}`,//https://suspense-unvocal-tripping.ngrok-free.dev
                webHookUrl: `${process.env.BASE_URL}/api/webhook/monobank`,
            }),
        });
        const monobankData: MonobankResponse = await monobankRes.json() as MonobankResponse;

        if (!monobankRes.ok || !monobankData.invoiceId || !monobankData.pageUrl) {
            throw new Error(monobankData.errText ?? monobankData.errCode ?? "Monobank invoice creation failed");
        }

        await prisma.order.update({
            where: {id: order.id},
            data: {invoiceId: monobankData.invoiceId},
        });

        return NextResponse.json({
            orderId: order.id,
            redirectUrl: monobankData.pageUrl,
        });
    } catch (error: unknown) {
        if (error instanceof InventoryConflictError) {
            return NextResponse.json({error: error.message}, {status: 409});
        }

        if (error instanceof CartPricingError) {
            return NextResponse.json({error: error.message}, {status: 400});
        }

        console.error(error);

        Sentry.withScope((scope) => {
            scope.setContext("order", {orderId});
            Sentry.captureException(error);
        });

        return NextResponse.json(
            {error: "Не вдалося оформити замовлення"},
            {status: 500},
        );
    }
}
