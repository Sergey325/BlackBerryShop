import {getCities} from "@/app/actions/getCities";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        const cities = await getCities(query);
        return NextResponse.json(cities, { status: 200 });

    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}
