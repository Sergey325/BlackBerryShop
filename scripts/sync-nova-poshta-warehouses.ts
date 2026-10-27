import "dotenv/config";
import "../sentry.server.config";
import {PrismaClient} from "@prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import {syncWarehouses, warehouseDirectoryStats} from "../src/app/scripts/syncWarehouses";

const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});

async function main() {
    if (!process.argv.includes("--stats")) {
        const result = await syncWarehouses(db);
        console.info(JSON.stringify(result, null, 2));
        if (result.status !== "completed") process.exitCode = 1;
    }
    console.info(JSON.stringify(await warehouseDirectoryStats(db), null, 2));
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Warehouse directory command failed");
    process.exitCode = 1;
}).finally(() => db.$disconnect());
