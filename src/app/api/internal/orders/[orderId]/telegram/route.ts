import * as Sentry from "@sentry/nextjs";
import {NextResponse} from "next/server";
import prisma from "@/app/lib/prisma";
import {notifyTelegramAdmins} from "@/app/lib/telegram";

type RouteContext = {
    params: Promise<{orderId: string}>;
};

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
    const secret: string | undefined = process.env.INTERNAL_API_SECRET;

    if (!secret) {
        Sentry.captureMessage("INTERNAL_API_SECRET is not configured", "error");
        return NextResponse.json({error: "Server configuration error"}, {status: 500});
    }

    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {orderId: rawOrderId} = await context.params;
    const orderId: number = Number(rawOrderId);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return NextResponse.json({error: "Invalid order ID"}, {status: 400});
    }

    try {
        const order = await prisma.order.findUnique({
            where: {id: orderId},
            include: {items: true},
        });

        if (!order) {
            return NextResponse.json({error: "Order not found"}, {status: 404});
        }

        await notifyTelegramAdmins(order, order.checkboxReceiptUrl ?? undefined);

        return NextResponse.json({ok: true});
    } catch (error: unknown) {
        Sentry.withScope((scope) => {
            scope.setContext("order", {orderId});
            scope.setTag("error_type", "telegram_notification_failed");
            Sentry.captureException(error);
        });

        const message: string = error instanceof Error
            ? error.message
            : "Telegram notification failed";

        return NextResponse.json({error: message}, {status: 500});
    }
}
