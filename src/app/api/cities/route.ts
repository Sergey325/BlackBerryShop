import prisma from "@/app/lib/prisma";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query || query.length < 2) {
            return Response.json([]);
        }

        const cities = await prisma.$queryRaw`
            SELECT
              ref,
              name,
              area,
              similarity(name, ${query}) as score
            FROM "NovaPoshtaCity"
            WHERE
              name ILIKE ${query + '%'}
              OR similarity(name, ${query}) > 0.3
            ORDER BY
              CASE WHEN name ILIKE ${query + '%'} THEN 1 ELSE 2 END,
              score DESC
            LIMIT 10
        `;

        return NextResponse.json(cities, { status: 200 });

    } catch (error) {
        return NextResponse.json(error, { status: 500 });
    }
}