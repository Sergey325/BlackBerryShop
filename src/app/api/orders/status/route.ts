import {NextResponse} from "next/server";

import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

const UUID_PATTERN: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request): Promise<NextResponse> {
    const token: string = new URL(request.url).searchParams.get("token")?.trim() ?? "";

    if (!UUID_PATTERN.test(token)) {
        return NextResponse.json({error: "Некоректний токен замовлення"}, {status: 400});
    }

    const order = await prisma.order.findUnique({
        where: {publicToken: token},
        select: {
            status: true,
            checkboxReceiptStatus: true,
            checkboxReceiptUrl: true,
        },
    });

    if (!order) {
        return NextResponse.json({error: "Замовлення не знайдено"}, {status: 404});
    }

    return NextResponse.json(order, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
