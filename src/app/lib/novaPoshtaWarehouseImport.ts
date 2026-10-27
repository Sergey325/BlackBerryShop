const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const WAREHOUSE_PAGE_SIZE = 1000;
const WRITE_BATCH_SIZE = 500;

export function parseWarehousePage(payload: unknown) {
    if (!payload || typeof payload !== "object"
        || !("success" in payload) || payload.success !== true
        || !("data" in payload) || !Array.isArray(payload.data)
        || !("info" in payload) || !payload.info || typeof payload.info !== "object"
        || !("totalCount" in payload.info)) {
        throw new Error("Invalid Nova Poshta warehouse response");
    }

    const rawTotal = payload.info.totalCount;
    const total = typeof rawTotal === "number" ? rawTotal
        : typeof rawTotal === "string" && /^\d+$/.test(rawTotal) ? Number(rawTotal) : NaN;
    if (!Number.isSafeInteger(total) || total <= 0) {
        throw new Error("Nova Poshta returned an empty or invalid warehouse total");
    }

    const warehouses = payload.data.map((item: unknown) => {
        if (!item || typeof item !== "object"
            || !("Ref" in item) || typeof item.Ref !== "string" || !UUID.test(item.Ref)
            || !("CityRef" in item) || typeof item.CityRef !== "string" || !UUID.test(item.CityRef)
            || !("Number" in item) || typeof item.Number !== "string" || !/^\d+$/.test(item.Number)
            || !("Description" in item) || typeof item.Description !== "string" || !item.Description.trim()
            || !("TypeOfWarehouse" in item) || typeof item.TypeOfWarehouse !== "string" || !UUID.test(item.TypeOfWarehouse)
            || !("WarehouseStatus" in item) || typeof item.WarehouseStatus !== "string"
            || !("DenyToSelect" in item) || !["0", "1", 0, 1, false, true].some(value => value === item.DenyToSelect)) {
            throw new Error("Invalid Nova Poshta warehouse record");
        }

        const number = Number(item.Number);
        if (!Number.isSafeInteger(number) || number <= 0 || number > 2_147_483_647) {
            throw new Error("Invalid Nova Poshta warehouse number");
        }

        return {
            ref: item.Ref.toLowerCase(),
            cityRef: item.CityRef.toLowerCase(),
            number,
            description: item.Description,
            typeRef: item.TypeOfWarehouse.toLowerCase(),
            available: item.WarehouseStatus === "Working"
                && (item.DenyToSelect === "0" || item.DenyToSelect === 0 || item.DenyToSelect === false),
        };
    });

    return {total, warehouses};
}

export type WarehouseImportRow = ReturnType<typeof parseWarehousePage>["warehouses"][number];
type WarehousePage = ReturnType<typeof parseWarehousePage>;

// Nova Poshta rate-limits concurrent requests made with the same API key.
export async function importWarehousePages({
    fetchPage,
    saveBatch,
    previousTotal,
    deadline,
}: {
    fetchPage: (page: number) => Promise<WarehousePage>;
    saveBatch: (warehouses: WarehouseImportRow[]) => Promise<void>;
    previousTotal: number;
    deadline: number;
}) {
    const first = await fetchPage(1);
    if (first.total < previousTotal * 0.8) {
        throw new Error("Warehouse total dropped by over 20%; keeping the previous directory");
    }

    const pages = Math.ceil(first.total / WAREHOUSE_PAGE_SIZE);
    const seen = new Set<string>();

    async function savePage(result: WarehousePage, page: number) {
        const expected = Math.min(WAREHOUSE_PAGE_SIZE, first.total - (page - 1) * WAREHOUSE_PAGE_SIZE);
        if (result.total !== first.total || result.warehouses.length !== expected) {
            throw new Error("Nova Poshta pagination changed or returned an incomplete page; retry the sync");
        }
        for (const warehouse of result.warehouses) {
            if (seen.has(warehouse.ref)) {
                throw new Error("Nova Poshta returned duplicate warehouses across pages; retry the sync");
            }
            seen.add(warehouse.ref);
        }
        for (let offset = 0; offset < result.warehouses.length; offset += WRITE_BATCH_SIZE) {
            if (Date.now() >= deadline) throw new Error("Warehouse sync time budget exceeded; retry the sync");
            await saveBatch(result.warehouses.slice(offset, offset + WRITE_BATCH_SIZE));
        }
    }

    await savePage(first, 1);
    for (let page = 2; page <= pages; page++) {
        // Leave enough time for the bounded requests and final database transaction.
        if (Date.now() + 35_000 >= deadline) throw new Error("Warehouse sync time budget exceeded; retry the sync");
        await savePage(await fetchPage(page), page);
    }

    if (seen.size !== first.total) throw new Error("Incomplete Nova Poshta warehouse directory");
    return {total: first.total, refs: [...seen]};
}
