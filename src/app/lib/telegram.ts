import {IOrder} from "@/app/types";

export async function sendTelegramMessage(chatId: string, text: string) {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;

        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "🔎 Перейти до замовлень",
                                    url: `${process.env.ADMIN_URL}manageOrders?tab=AllOrders`,
                                },
                            ],
                        ],
                    },
                }),
            }
        );
        const data = await response.json();

        console.log({
            user: chatId,
            status: response.status,
            ok: response.ok,
            data,
        });
    } catch (error) {
        console.log(error);
    }

}


export function createOrderMessage(order: IOrder) {
    const productsTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return `
        🛒 <b>Нове замовлення #${order.id}</b>

        💰 <b>Оплачено:</b> ${order.totalAmount} грн
        💳 <b>Спосіб оплати:</b> ${order.paymentMethod === "MONOBANK" ? "Оплата карткою" : "Накладений платіж"}
        
        👤 <b>Покупець:</b>
        ${order.firstName} ${order.lastName}
        📞 <code>${order.phone}</code>
        ${order.email ? `✉️ ${order.email}` : ""}
        ${order.comment ? `💬 ${order.comment}` : ""}
        
        🚚 <b>Доставка:</b>
        ${order.city}${order.area ? `, ${order.area} обл` : ""}
        ${order.warehouse ? `🏢 ${order.warehouse}` : ""}
        
        ${order.ttnNumber ? `📮 <b>ТТН:</b> <code>${order.ttnNumber}</code>` : ""}
        
        
        📦 <b>Товари:</b>
        ${order.items.map((item) => `
        • <b>${item.name}</b>
            Кількість: ${item.quantity}
            Ціна: ${item.price * item.quantity} грн
            ${item.size ? `Розмір: ${item.size}` : ""}
        `).join("\n")}
        
        ━━━━━━━━━━━━━━
        💰 <b>Загальна сума:</b> ${productsTotal} грн
    `;
}