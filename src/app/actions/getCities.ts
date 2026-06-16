"use server";

import prisma from "@/app/lib/prisma";

export async function getCities(query: string) {
    try {
        if (!query || query.length < 2) return [];

        const cities = await prisma.$queryRaw<{ ref: string; name: string; area: string }[]>`
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

        return cities;
    }
    catch (e: any) {
        throw new Error(e);
    }
}