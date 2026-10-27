import {Prisma} from "@prisma/client";
import type {WarehouseImportRow} from "./novaPoshtaWarehouseImport";

export async function upsertWarehouseBatch(tx: Prisma.TransactionClient, warehouses: WarehouseImportRow[]) {
    if (warehouses.length === 0) return 0;
    const values = warehouses.map(warehouse => Prisma.sql`(
        ${warehouse.ref}::uuid, ${warehouse.cityRef}::uuid, ${warehouse.number},
        ${warehouse.description}, ${warehouse.typeRef}::uuid, ${warehouse.available}, NOW()
    )`);
    return tx.$executeRaw`
        INSERT INTO "NovaPoshtaWarehouse" ("ref", "cityRef", "number", "description", "typeRef", "available", "updatedAt")
        VALUES ${Prisma.join(values)}
        ON CONFLICT ("ref") DO UPDATE
        SET "cityRef" = EXCLUDED."cityRef", "number" = EXCLUDED."number",
            "description" = EXCLUDED."description", "typeRef" = EXCLUDED."typeRef",
            "available" = EXCLUDED."available", "updatedAt" = EXCLUDED."updatedAt"
        WHERE ("NovaPoshtaWarehouse"."cityRef", "NovaPoshtaWarehouse"."number",
               "NovaPoshtaWarehouse"."description", "NovaPoshtaWarehouse"."typeRef", "NovaPoshtaWarehouse"."available")
              IS DISTINCT FROM
              (EXCLUDED."cityRef", EXCLUDED."number", EXCLUDED."description", EXCLUDED."typeRef", EXCLUDED."available")
    `;
}

export async function removeMissingWarehouses(tx: Prisma.TransactionClient, refs: string[]) {
    if (refs.length === 0) throw new Error("Cannot prune warehouses using an empty directory");
    // One JSON parameter avoids PostgreSQL's parameter limit for a large directory.
    return tx.$executeRaw`
        DELETE FROM "NovaPoshtaWarehouse"
        WHERE "ref" NOT IN (
            SELECT value::uuid FROM jsonb_array_elements_text(${JSON.stringify(refs)}::jsonb)
        )
    `;
}
