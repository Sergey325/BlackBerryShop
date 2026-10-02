import "server-only";

export function getLiningPrice(): number {
    const configuredPrice = process.env.LINING_PRICE;

    if (configuredPrice === undefined) return 150;

    if (!/^\d+(?:\.\d{1,2})?$/.test(configuredPrice)) {
        throw new Error("LINING_PRICE must be a non-negative amount with at most two decimal places");
    }

    const price = Number(configuredPrice);
    if (!Number.isFinite(price)) {
        throw new Error("LINING_PRICE must be a finite number");
    }

    return price;
}
