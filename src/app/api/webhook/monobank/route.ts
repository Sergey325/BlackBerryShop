import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { invoiceId, status } = body;

        // Маппинг статусов Monobank → наши статусы
        const statusMap: Record<string, string> = {
            success: "PAID",
            failure: "CANCELLED",
            reversed: "REFUNDED",
        };

        const newStatus = statusMap[status];
        if (!newStatus) return NextResponse.json(null, { status: 200 });

        await prisma.order.update({
            where: { invoiceId },
            data: { status: newStatus as any },
        });

        return NextResponse.json(null, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}