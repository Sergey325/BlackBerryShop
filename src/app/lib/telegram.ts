import "server-only";

import type {PaymentMethod, TrafficSource} from "@prisma/client";
import prisma from "@/app/lib/prisma";

interface TelegramOrderItem {
    name: string;
    price: number;
    quantity: number;
    colorName: string | null;
    colorCode: string | null;
    size: string | null;
}

interface TelegramOrder {
    id: number;
    totalAmount: number;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
    comment: string | null;
    city: string | null;
    warehouse: string | null;
    createdAt: Date | string;
    paymentMethod: PaymentMethod;
    trafficSource: TrafficSource | null;
    area: string | null;
    ttnNumber: string | null;
    items: TelegramOrderItem[];
}

type TelegramResponse = {
    ok: boolean;
    description?: string;
};

const formatPrice = (value: number): string => new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
}).format(value);

const escapeHtml = (value: string | number): string => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const TRAFFIC_SOURCE_LABELS: Record<NonNullable<TelegramOrder["trafficSource"]>, string> = {
    FACEBOOK: "Facebook",
    GOOGLE_SEARCH: "Google пошук",
    GOOGLE_FREE_LISTING: "Google безкоштовна картка товару",
    INSTAGRAM: "Instagram",
    TELEGRAM: "Telegram",
    PROM: "Prom",
};

const formatOrderDate = (value: Date | string): string => new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
}).format(new Date(value));

const formatOrderItem = (item: TelegramOrderItem, index: number): string => {
    const details: string[] = [
        item.colorName ? `Колір: ${escapeHtml(item.colorName)}` : null,
        item.colorCode ? `<code>${escapeHtml(item.colorCode)}</code>` : null,
        item.size ? `Розмір: ${escapeHtml(item.size)}` : null,
    ].filter((detail): detail is string => detail !== null);
    const lineTotal: number = item.price * item.quantity;

    return [
        `<b>${index + 1}. ${escapeHtml(item.name)}</b>`,
        details.length > 0 ? details.join(" · ") : null,
        `${item.quantity} × ${formatPrice(item.price)} грн = <b>${formatPrice(lineTotal)} грн</b>`,
    ].filter((line): line is string => line !== null).join("\n");
};

export async function sendTelegramMessage(chatId: string, text: string, id: number): Promise<void> {
    const token: string | undefined = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    const response: Response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔎 Відкрити замовлення",
                                url: `${process.env.ADMIN_URL}/orders?tab=AllOrders&search=${id.toString()}`,
                            },
                        ],
                    ],
                },
            }),
        }
    );
    const data: TelegramResponse = await response.json() as TelegramResponse;

    if (!response.ok || !data.ok) {
        throw new Error(`Telegram API error: ${data.description ?? response.statusText}`);
    }
}

export async function notifyTelegramAdmins(order: TelegramOrder, receiptUrl?: string): Promise<void> {
    const admins: Array<{chatId: string}> = await prisma.telegramUser.findMany({
        where: {
            role: "ADMIN",
        },
        select: {
            chatId: true,
        },
    });
    const message: string = createOrderMessage(order, receiptUrl);

    await Promise.all(
        admins.map((admin: {chatId: string}): Promise<void> => sendTelegramMessage(
            admin.chatId,
            message,
            order.id,
        )),
    );
}

export function createOrderMessage(order: TelegramOrder, receiptUrl?: string): string {
    const productsTotal: number = order.items.reduce(
        (sum: number, item: TelegramOrderItem): number => sum + item.price * item.quantity,
        0
    );
    const isCashOnDelivery: boolean = order.paymentMethod === "CASH_ON_DELIVERY";
    const paidAmount: number = isCashOnDelivery
        ? Math.min(150, productsTotal)
        : order.totalAmount;
    const remainingAmount: number = Math.max(productsTotal - paidAmount, 0);
    const customerName: string = [order.firstName, order.lastName]
        .filter((value): value is string => Boolean(value))
        .join(" ");
    const customerLines: string[] = [
        customerName ? `👤 <b>${escapeHtml(customerName)}</b>` : null,
        order.phone ? `📞 <code>${escapeHtml(order.phone)}</code>` : null,
        order.email ? `✉️ ${escapeHtml(order.email)}` : null,
        order.trafficSource ? `🔗 Джерело: ${TRAFFIC_SOURCE_LABELS[order.trafficSource]}` : null,
    ].filter((line): line is string => line !== null);
    const deliveryLines: string[] = [
        order.city ? `📍 ${escapeHtml(order.city)}${order.area ? `, ${escapeHtml(order.area)} обл.` : ""}` : null,
        order.warehouse ? `🏢 ${escapeHtml(order.warehouse)}` : null,
        order.ttnNumber ? `📮 ТТН: <code>${escapeHtml(order.ttnNumber)}</code>` : null,
    ].filter((line): line is string => line !== null);
    const paymentLines: string[] = isCashOnDelivery
        ? [
            "💳 Накладений платіж",
            `✅ Передплата: <b>${formatPrice(paidAmount)} грн</b>`,
            `💵 До сплати при отриманні: <b>${formatPrice(remainingAmount)} грн</b>`,
        ]
        : [
            "💳 Оплата карткою",
            `✅ Сплачено: <b>${formatPrice(order.totalAmount)} грн</b>`,
        ];
    const items: string = order.items.map(formatOrderItem).join("\n\n");

    return [
        `🛍 <b>НОВЕ ЗАМОВЛЕННЯ #${escapeHtml(order.id)}</b>`,
        `🕒 ${formatOrderDate(order.createdAt)}`,
        "",
        "<b>ПОКУПЕЦЬ</b>",
        ...customerLines,
        "",
        "<b>ДОСТАВКА</b>",
        ...deliveryLines,
        "",
        `<b>ТОВАРИ · ${order.items.length}</b>`,
        items,
        "",
        "━━━━━━━━━━━━━━",
        `📦 Сума товарів: <b>${formatPrice(productsTotal)} грн</b>`,
        ...paymentLines,
        ...(receiptUrl
            ? [`🧾 <a href="${escapeHtml(receiptUrl)}">Переглянути фіскальний чек</a>`]
            : []),
        ...(order.comment
            ? ["", "💬 <b>Коментар покупця</b>", `<blockquote>${escapeHtml(order.comment)}</blockquote>`]
            : []),
    ].join("\n");
}
