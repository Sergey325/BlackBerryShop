import "dotenv/config";
import "../sentry.server.config";
import {PrismaClient} from "@prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import {synchronizeCityDirectory} from "../src/app/lib/novaPoshtaCityDirectory";

const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});

synchronizeCityDirectory(db).then(result => {
    console.info(JSON.stringify(result, null, 2));
}).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Cities directory sync failed");
    process.exitCode = 1;
}).finally(() => db.$disconnect());
