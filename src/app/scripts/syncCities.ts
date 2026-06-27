import prisma from "@/app/lib/prisma";

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

        const data = await res.json();
        const cities = data.data;

        //first time
        // await prisma.novaPoshtaCity.createMany({
        //     data: cities.map((city: any) => ({
        //         ref: city.Ref,
        //         name: city.Description,
        //         area: city.AreaDescription,
        //     })),
        //     skipDuplicates: true,
        // });
        const BATCH_SIZE = 500;

        for (let i = 0; i < cities.length; i += BATCH_SIZE) {
            const batch = cities.slice(i, i + BATCH_SIZE);

            await prisma.$transaction(
                batch.map((city: any) =>
                    prisma.novaPoshtaCity.upsert({
                        where: { ref: city.Ref },
                        update: { name: city.Description, area: city.AreaDescription },
                        create: { ref: city.Ref, name: city.Description, area: city.AreaDescription },
                    })
                )
            );

            console.log(`Processed ${Math.min(i + BATCH_SIZE, cities.length)} / ${cities.length}`);
        }

        console.log(`Successfully created ${cities.length} cities.`);
        return cities.length;
    } catch (e) {
        console.log(e);
    }

}