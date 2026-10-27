import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: "Некоректний JSON" }, { status: 400 });
    }

    if (!payload || typeof payload !== "object" || !("cityRef" in payload)
        || typeof payload.cityRef !== "string"
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.cityRef)) {
        return NextResponse.json({ error: "Некоректний cityRef" }, { status: 400 });
    }

    try {
        const sync = await prisma.novaPoshtaWarehouseSync.findUnique({
            where: { id: "warehouses" },
            select: { completedAt: true },
        });
        // Do not offer a partially populated directory during the first import.
        if (!sync?.completedAt) {
            return NextResponse.json({ error: "Довідник відділень оновлюється. Спробуйте пізніше." }, { status: 503 });
        }

        const warehouses = await prisma.novaPoshtaWarehouse.findMany({
            where: { cityRef: payload.cityRef, available: true },
            select: { ref: true, number: true, description: true },
            orderBy: { number: "asc" },
        });
        // Preserve the existing checkout response contract.
        return NextResponse.json(warehouses.map(warehouse => ({ ...warehouse, number: String(warehouse.number) })));
    } catch (error) {
        console.error("[warehouses] Directory lookup failed:", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json(
            { error: "Не вдалося завантажити відділення. Спробуйте ще раз." },
            { status: 500 }
        );
    }

}
