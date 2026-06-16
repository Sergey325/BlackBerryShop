import prisma from "@/app/lib/prisma";

export async function syncCities() {
    try{
        const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            body: JSON.stringify({
                modelName: "Address",
                calledMethod: "getCities",
                methodProperties: {},
            }),
        });

        const data = await res.json();
        console.log(data)
        for (const city of data.data) {
            await prisma.novaPoshtaCity.upsert({
                where: { ref: city.Ref },
                update: { name: city.Description, area: city.AreaDescription },
                create: { ref: city.Ref, name: city.Description, area: city.AreaDescription },
            });
        }
        console.log("Successfully updated cities.");
        return data.data.length;
    }
    catch(e){
        console.log(e)
    }

}