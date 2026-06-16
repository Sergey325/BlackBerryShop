import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { cityRef } = await request.json();

        const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            body: JSON.stringify({
                modelName: "AddressGeneral",
                calledMethod: "getWarehouses",
                methodProperties: { CityRef: cityRef },
            }),
        });

        const data = await res.json();

        const warehouses = data.data.map((w: any) => ({
            ref: w.Ref,
            number: w.Number,
            description: w.Description,
        }));
        console.log("server",warehouses, data, process.env.NOVA_POSHTA_API_KEY);
        return NextResponse.json(warehouses, { status: 200 });
    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }

}