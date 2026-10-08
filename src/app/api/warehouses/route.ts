import { NextResponse } from "next/server";

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

    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) {
        console.error("[warehouses] NOVA_POSHTA_API_KEY is not configured");
        return NextResponse.json({ error: "Сервіс доставки не налаштований" }, { status: 500 });
    }

    try {
        const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(15_000),
            body: JSON.stringify({
                apiKey,
                modelName: "AddressGeneral",
                calledMethod: "getWarehouses",
                methodProperties: { CityRef: payload.cityRef },
            }),
        });

        if (!res.ok) {
            console.error("[warehouses] Nova Poshta HTTP status:", res.status);
            return NextResponse.json({ error: "Нова пошта тимчасово недоступна" }, { status: 502 });
        }

        const data: unknown = await res.json();
        if (!data || typeof data !== "object" || !("success" in data)) {
            throw new Error("Invalid Nova Poshta response");
        }

        if (data.success !== true) {
            console.error("[warehouses] Nova Poshta rejected the request");
            return NextResponse.json(
                { error: "Не вдалося отримати відділення Нової пошти" },
                { status: 502 }
            );
        }

        if (!("data" in data) || !Array.isArray(data.data)) {
            throw new Error("Invalid Nova Poshta warehouse list");
        }
        const warehouses = data.data.map((warehouse: unknown) => {
            if (!warehouse || typeof warehouse !== "object"
                || !("Ref" in warehouse) || typeof warehouse.Ref !== "string"
                || !("Number" in warehouse) || typeof warehouse.Number !== "string"
                || !("Description" in warehouse) || typeof warehouse.Description !== "string") {
                throw new Error("Invalid Nova Poshta warehouse");
            }
            return { ref: warehouse.Ref, number: warehouse.Number, description: warehouse.Description };
        });

        return NextResponse.json(warehouses, { status: 200 });
    } catch (error) {
        const cause = error instanceof Error ? error.cause : undefined;
        const causeCode = cause && typeof cause === "object" && "code" in cause ? cause.code : undefined;
        const isTimeout = (error instanceof Error && error.name === "TimeoutError")
            || causeCode === "UND_ERR_CONNECT_TIMEOUT";
        console.error("[warehouses] Nova Poshta request failed:", {
            message: error instanceof Error ? error.message : "Unknown error",
            causeCode,
        });
        return NextResponse.json(
            { error: isTimeout
                ? "Нова пошта не відповідає. Спробуйте ще раз."
                : "Не вдалося завантажити відділення. Спробуйте ще раз." },
            { status: isTimeout ? 504 : 502 }
        );
    }

}
