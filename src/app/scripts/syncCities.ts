import prisma from "@/app/lib/prisma";
import {synchronizeCityDirectory} from "../lib/novaPoshtaCityDirectory";

export async function syncCities() {
    try {
        const result = await synchronizeCityDirectory(prisma);
        console.info("[sync-cities]", result);
        return result;
    } catch (e) {
        console.error("Failed to synchronize Nova Poshta cities:", e);
        throw e;
    }

}
