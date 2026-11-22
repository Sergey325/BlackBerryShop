"use server";

import prisma from "@/app/lib/prisma";
import type {City} from "@/app/types";

const apostropheVariants = "’‘ʼ＇`´";
const canonicalApostrophes = "'".repeat(apostropheVariants.length);

export async function getCities(query: unknown) {
    if (typeof query !== "string" || query.length < 2) return [];

    return prisma.$queryRaw<(City & {score: number})[]>`
        WITH normalized_cities AS (
            SELECT ref, name, area,
                   translate(name, ${apostropheVariants}, ${canonicalApostrophes}) AS search_name
            FROM "NovaPoshtaCity"
        ), search AS (
            SELECT translate(${query}, ${apostropheVariants}, ${canonicalApostrophes}) AS term
        )
        SELECT ref, name, area, similarity(search_name, term) AS score
        FROM normalized_cities CROSS JOIN search
        WHERE search_name ILIKE term || '%' OR similarity(search_name, term) > 0.3
        ORDER BY CASE WHEN search_name ILIKE term || '%' THEN 1 ELSE 2 END, score DESC
        LIMIT 10
    `;
}
