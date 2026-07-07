import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {createTTN} from "@/app/lib/novaposhta";
import {createOrderMessage, sendTelegramMessage} from "@/app/lib/telegram";
import {hashSha256} from "@/app/lib/fbHash";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
    let orderId: number | null = null;
    let invoiceId: string | null = null;

    try {
        const body = await request.json();
        console.log("Webhook received:", body);

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
            console.log("Unknown status, skipping:", status);
            return NextResponse.json(null, { status: 200 });
        }



        let order = await prisma.order.update({
            where: { invoiceId },
            data: { status: newStatus as any },
            include: { items: true },
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
                                contents: order.items.map(i => ({ id: i.id, quantity: i.quantity })),
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
