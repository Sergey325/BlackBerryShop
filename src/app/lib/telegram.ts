import type {OrderStatus, PaymentMethod, TrafficSource} from "@prisma/client";

interface TelegramOrderItem {
    id: number;
    orderId: number;
    productId: number;
    productSizeId: number | null;
    name: string;
    price: number;
    quantity: number;
    color: string;
    colorName: string | null;
    colorCode: string | null;
    size: string | null;
    imageUrl: string;
}

interface TelegramOrder {
    id: number;
    invoiceId: string | null;
    status: OrderStatus;
    totalAmount: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    comment: string | null;
    city: string;
    cityRef: string;
    warehouse: string;
    warehouseRef: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    paymentMethod: PaymentMethod;
    trafficSource: TrafficSource | null;
    area: string;
    ttnNumber: string | null;
    ttnRef: string | null;
    warehouseNumber: number;
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

export function createOrderMessage(order: TelegramOrder, receiptUrl?: string): string {
    const productsTotal: number = order.items.reduce(
        (sum: number, item: TelegramOrderItem): number => sum + item.price * item.quantity,
        0
    );
    const isCashOnDelivery: boolean = order.paymentMethod === "CASH_ON_DELIVERY";
    const remainingAmount: number = Math.max(productsTotal - order.totalAmount, 0);
    const customerLines: string[] = [
        `👤 <b>${escapeHtml(`${order.firstName} ${order.lastName}`)}</b>`,
        `📞 <code>${escapeHtml(order.phone)}</code>`,
        order.email ? `✉️ ${escapeHtml(order.email)}` : null,
        order.trafficSource ? `🔗 Джерело: ${TRAFFIC_SOURCE_LABELS[order.trafficSource]}` : null,
    ].filter((line): line is string => line !== null);
    const deliveryLines: string[] = [
        `📍 ${escapeHtml(order.city)}${order.area ? `, ${escapeHtml(order.area)} обл.` : ""}`,
        order.warehouse ? `🏢 ${escapeHtml(order.warehouse)}` : null,
        order.ttnNumber ? `📮 ТТН: <code>${escapeHtml(order.ttnNumber)}</code>` : null,
    ].filter((line): line is string => line !== null);
    const paymentLines: string[] = isCashOnDelivery
        ? [
            "💳 Накладений платіж",
            `✅ Передплата: <b>${formatPrice(order.totalAmount)} грн</b>`,
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
