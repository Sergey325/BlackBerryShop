import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {createTTN} from "@/app/lib/novaposhta";
import {createOrderMessage, sendTelegramMessage} from "@/app/lib/telegram";
import {hashSha256} from "@/app/lib/fbHash";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
    let orderId: number | undefined;
    let invoiceId: string | undefined;

    try {
        const body = await request.json();
        // console.log("Webhook received:", body);

        const { status } = body;

        invoiceId = body.invoiceId;

        // Маппинг статусов Monobank → наши статусы
        const statusMap: Record<string, string> = {
            success: "PAID",
            failure: "CANCELLED",
            reversed: "REFUNDED",
        };

        const newStatus = statusMap[status];
        if (!newStatus) {
            // console.log("Unknown status, skipping:", status);
            return NextResponse.json(null, { status: 200 });
        }



        let order = await prisma.$transaction(async (tx) => {
            const existingOrder = await tx.order.findUniqueOrThrow({
                where: {invoiceId},
                select: {
                    id: true,
                    promoCodeId: true,
                    items: {
                        select: {
                            productSizeId: true,
                            productId: true,
                            color: true,
                            colorCode: true,
                            colorName:true,
                            size: true,
                            quantity: true,
                        },
                    },
                },
            });
            let shouldCountPromoCode = false;

            if (newStatus === "PAID") {
                const paidTransition = await tx.order.updateMany({
                    where: {
                        id: existingOrder.id,
                        paidAt: null,
                    },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                    },
                });

                shouldCountPromoCode = paidTransition.count === 1;

                if (shouldCountPromoCode) {
                    const requestedByProductSizeId = new Map<number, number>();

                    for (const item of existingOrder.items) {
                        let productSizeId: number | null = item.productSizeId;

                        if (productSizeId === null) {
                            const legacyMatches = await tx.productSize.findMany({
                                where: {
                                    productColor: {
                                        productId: item.productId,
                                        color: item.color,
                                    },
                                    ...(item.size ? {size: item.size} : {}),
                                },
                                select: {id: true},
                                take: 2,
                            });

                            if (legacyMatches.length !== 1) {
                                throw new Error(`Order ${existingOrder.id} item has no resolvable productSizeId`);
                            }

                            productSizeId = legacyMatches[0].id;
                        }

                        requestedByProductSizeId.set(
                            productSizeId,
                            (requestedByProductSizeId.get(productSizeId) ?? 0) + item.quantity
                        );
                    }

                    for (const [productSizeId, requestedQuantity] of requestedByProductSizeId) {
                        const updatedCount = await tx.$executeRaw`
                            UPDATE "ProductSize"
                            SET
                                "quantity" = CASE
                                    WHEN "quantity" IS NULL THEN NULL
                                    ELSE "quantity" - ${requestedQuantity}
                                END,
                                "available" = CASE
                                    WHEN "quantity" IS NULL THEN "available"
                                    WHEN "quantity" - ${requestedQuantity} <= 0 THEN FALSE
                                    ELSE "available"
                                END
                            WHERE
                                "id" = ${productSizeId}
                                AND "available" = TRUE
                                AND ("quantity" IS NULL OR "quantity" >= ${requestedQuantity})
                        `;

                        if (updatedCount !== 1) {
                            throw new Error(
                                `Insufficient stock for productSize ${productSizeId} in paid order ${existingOrder.id}`
                            );
                        }
                    }
                }

                if (!shouldCountPromoCode) {
                    await tx.order.update({
                        where: {id: existingOrder.id},
                        data: {status: "PAID"},
                    });
                }
            } else {
                await tx.order.update({
                    where: {id: existingOrder.id},
                    data: {status: newStatus as "CANCELLED" | "REFUNDED"},
                });
            }

            if (shouldCountPromoCode && existingOrder.promoCodeId !== null) {
                await tx.$executeRaw`
                    UPDATE "PromoCode"
                    SET
                        "usedCount" = "usedCount" + 1,
                        "isActive" = CASE
                            WHEN "maxUses" IS NOT NULL AND "usedCount" + 1 >= "maxUses" THEN FALSE
                            ELSE "isActive"
                        END,
                        "updatedAt" = NOW()
                    WHERE "id" = ${existingOrder.promoCodeId}
                `;
            }

            return tx.order.findUniqueOrThrow({
                where: {id: existingOrder.id},
                include: {items: true},
            });
        });

        orderId = order.id;

        const prepaidAmount = 150; // или из order.paymentData

        const itemsTotal = order.items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );

        const codAmount = itemsTotal - prepaidAmount;


        // Создаём ТТН только при успешной оплате
        if (newStatus === "PAID" && !order.ttnNumber) {
            try {
                const { ttnNumber, ttnRef } = await createTTN({
                    recipientFirstName:order.firstName,
                    recipientLastName: order.lastName,
                    recipientPhone: order.phone,
                    recipientCityRef: order.cityRef,
                    recipientWarehouseRef: order.warehouseRef!,
                    recipientWarehouseNumber: order.warehouseNumber.toString(),
                    serviceType: order.warehouse?.includes("Відділення") ? "WarehouseWarehouse" : "WarehousePostomat",
                    cost: itemsTotal,
                    codAmount: order.paymentMethod === "MONOBANK" ? 0 : codAmount,
                    description: order.items.map(i => i.name).join(", "),
                });

                order = await prisma.order.update({
                    where: { id: order.id },
                    data: { ttnNumber, ttnRef },
                    include: { items: true },
                });

            } catch (ttnError) {
                console.error("Failed to create TTN for order", order.id, ttnError);

                Sentry.withScope((scope) => {
                    scope.setContext("order", {
                        orderId: order.id,
                        invoiceId: order.invoiceId,
                        status: order.status,
                    });

                    scope.setTag("error_type", "ttn_creation_failed");

                    Sentry.captureException(ttnError);
                });
            }
        }



        if (newStatus === "PAID") {
            // Отправляем событие в FBPixel
            try {
                await fetch(`https://graph.facebook.com/v20.0/${process.env.PIXEL_ID}/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: [{
                            event_name: 'Purchase',
                            event_time: Math.floor(Date.now() / 1000),
                            event_id: order.id,
                            action_source: 'website',
                            user_data: {
                                em: hashSha256(order.email),
                                ph: hashSha256(order.phone),
                                client_ip_address: order.clientIp ?? undefined,
                                client_user_agent: order.userAgent ?? undefined,
                                fbc: order.fbc ?? undefined,
                                fbp: order.fbp ?? undefined,
                            },
                            custom_data: {
                                currency: 'UAH',
                                value: itemsTotal,
                                contents: order.items.map(i => ({ id: i.productId, quantity: i.quantity })),
                                content_type: 'product',
                            },
                        }],
                        access_token: process.env.FB_CAPI_ACCESS_TOKEN,
                    }),
                });
            } catch (fbError) {
                Sentry.withScope((scope) => {
                    scope.setContext("order", {
                        orderId: order.id,
                    });

                    scope.setTag("error_type", "facebook_capi_failed");

                    Sentry.captureException(fbError);
                });
            }

            if (order.email !== process.env.EMAIL && order.email !== process.env.EMAIL2) {
                // Отправляем сообщение о заказе в бота
                const admins = await prisma.telegramUser.findMany({
                    where: {
                        role: "ADMIN",
                    },
                });

                const telegramMessage = createOrderMessage(order)

                try {
                    for (const admin of admins) {
                        await sendTelegramMessage(
                            admin.chatId,
                            telegramMessage
                        );
                    }
                } catch (telegramError) {
                    Sentry.withScope((scope) => {
                        scope.setContext("order", {
                            orderId: order.id,
                        });

                        scope.setTag("error_type", "telegram_notification_failed");

                        Sentry.captureException(telegramError);
                    });
                }
            }
        }


        // console.log("Order updated:", updated.id, newStatus);

        return NextResponse.json(null, { status: 200 });
    } catch (error) {
        console.error(error);

        Sentry.withScope((scope) => {
            scope.setContext("webhook", {
                invoiceId,
                orderId,
            });

            Sentry.captureException(error);
        });

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
