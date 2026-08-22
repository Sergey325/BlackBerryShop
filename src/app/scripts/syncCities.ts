import prisma from "@/app/lib/prisma";
import {Prisma} from "@prisma/client";

interface INovaPoshtaCity {
    Ref: string;
    Description: string;
    AreaDescription: string;
}

interface INovaPoshtaCitiesResponse {
    success: boolean;
    data: INovaPoshtaCity[];
}

export async function syncCities() {
    try {
        const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            body: JSON.stringify({
                modelName: "Address",
                calledMethod: "getCities",
                methodProperties: {},
            }),
        });

        if (!res.ok) {
            throw new Error(`Nova Poshta returned HTTP ${res.status}`);
        }

        const data: INovaPoshtaCitiesResponse = await res.json() as INovaPoshtaCitiesResponse;
        const cities: INovaPoshtaCity[] = data.data;

        if (!data.success || !Array.isArray(cities)) {
            throw new Error("Nova Poshta returned an invalid cities response");
        }

        //first time
        // await prisma.novaPoshtaCity.createMany({
        //     data: cities.map((city: any) => ({
        //         ref: city.Ref,
        //         name: city.Description,
        //         area: city.AreaDescription,
        //     })),
        //     skipDuplicates: true,
        // });
        const BATCH_SIZE = 1000;

        for (let i = 0; i < cities.length; i += BATCH_SIZE) {
            const batch: INovaPoshtaCity[] = cities.slice(i, i + BATCH_SIZE);
            const values: Prisma.Sql[] = batch.map((city: INovaPoshtaCity): Prisma.Sql => Prisma.sql`
                (${city.Ref}, ${city.Description}, ${city.AreaDescription}, NOW())
            `);

            await prisma.$executeRaw`
                INSERT INTO "NovaPoshtaCity" ("ref", "name", "area", "updatedAt")
                VALUES ${Prisma.join(values)}
                ON CONFLICT ("ref") DO UPDATE
                SET "name" = EXCLUDED."name",
                    "area" = EXCLUDED."area",
                    "updatedAt" = NOW()
                WHERE "NovaPoshtaCity"."name" IS DISTINCT FROM EXCLUDED."name"
                   OR "NovaPoshtaCity"."area" IS DISTINCT FROM EXCLUDED."area"
            `;

            console.log(`Processed ${Math.min(i + BATCH_SIZE, cities.length)} / ${cities.length}`);
        }

        console.log(`Successfully synchronized ${cities.length} cities.`);
        return cities.length;
    } catch (e) {
        console.error("Failed to synchronize Nova Poshta cities:", e);
        throw e;
    }

}
