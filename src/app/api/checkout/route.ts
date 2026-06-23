import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {PaymentMethod} from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contact, delivery, paymentMethod, items, totalAmount } = body;

        // Создаём заказ в БД
        const order = await prisma.order.create({
            data: {
                status: "PENDING",
                totalAmount,
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
                paymentMethod: paymentMethod as PaymentMethod,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        color: item.color,
                        size: item.size,
                        imageUrl: item.imageUrl,
                    })),
                },
            },
        });


        // Создаём инвойс в Monobank
        const monobankRes = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
            method: "POST",
            headers: {
                "X-Token": process.env.MONOBANK_TOKEN!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: Math.round(totalAmount * 100), // в копейках
                ccy: 980, // UAH
                merchantPaymInfo: {
                    reference: String(order.id),
                    destination: `Замовлення #${order.id}`,
                },
                basketOrder: items.map((item: any) => ({
                    name: item.name,
                    qty: item.quantity,
                    sum: Math.round(item.price * 100),
                    icon: item.imageUrl,
                    unit: "шт",
                })),
                redirectUrl: `${process.env.BASE_URL}/successfulPayment?id=${order.id}`,
                webHookUrl: `${process.env.BASE_URL}/api/webhook/monobank`,
                // https://suspense-unvocal-tripping.ngrok-free.dev
                // redirectUrl: `${process.env.NEXT_PUBLIC_URL}/order/success?id=${order.id}`,
                // webHookUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhook/monobank`,https://black-berry.shop/successfulPayment
            }),
        });

        const monobankData = await monobankRes.json();
        console.log(monobankData);
        // Сохраняем invoiceId
        await prisma.order.update({
            where: { id: order.id },
            data: { invoiceId: monobankData.invoiceId },
        });

        return NextResponse.json({
            orderId: order.id,
            redirectUrl: monobankData.pageUrl, // редирект на страницу оплаты
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}