import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {createTTN} from "@/app/lib/novaposhta";
import {createOrderMessage, sendTelegramMessage} from "@/app/lib/telegram";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Webhook received:", body);

        const { invoiceId, status } = body;

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
                // Не валим весь webhook, если ТТН не создалась — заказ всё равно оплачен
                console.error("Failed to create TTN for order", order.id, ttnError);
            }
        }


        // Отправляем сообщение о заказе в бота
        if (newStatus === "PAID") {
            const admins = await prisma.telegramUser.findMany({
                where: {
                    role: "ADMIN",
                },
            });

            const telegramMessage = createOrderMessage(order)

            for (const admin of admins) {
                await sendTelegramMessage(
                    admin.chatId,
                    telegramMessage
                );
            }
        }


        // console.log("Order updated:", updated.id, newStatus);

        return NextResponse.json(null, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
