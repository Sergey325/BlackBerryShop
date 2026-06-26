const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(chatId: string, text: string) {
    try {
        await fetch(
            `https://api.telegram.org/bot${TOKEN}/sendMessage`,
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
                                    text: "🔎 Перейти до замовлень",
                                    url: `${process.env.ADMIN_URL}/manageOrders?tab=AllOrders`,
                                },
                            ],
                        ],
                    },
                }),
            }
        );
    } catch (error) {
        console.log(error);
    }

}

export function createOrderMessage(order: any) {
    return `
        🛒 <b>Нове замовлення #${order.id}</b>

        💰 <b>Сума:</b> ${order.totalAmount} грн
        
        👤 <b>Покупець:</b>
        ${order.firstName} ${order.lastName}
        📞 ${order.phone}
        ${order.email ? `✉️ ${order.email}` : ""}
        ${order.comment ? `💬 ${order.comment}` : ""}
        
        🚚 <b>Доставка:</b>
        ${order.city}${order.area ? `, ${order.area} обл` : ""}
        ${order.warehouse ? `🏢 ${order.warehouse}` : ""}
        
        ${order.ttnNumber ? `📮 <b>ТТН:</b> ${order.ttnNumber}` : ""}
        
        📦 <b>Товари:</b>
        ${order.items.map((item: any) => `
        • <b>${item.name}</b>
            Кількість: ${item.quantity}
            Ціна: ${item.price} грн
            ${item.color ? `Колір: ${item.color}` : ""}
            ${item.size ? `Розмір: ${item.size}` : ""}
        `).join("\n")}
    `;
}