export const CATALOG_BRAND = "Black Berry";

export function buildCatalogItemId(
    productId: number,
    productColorId: number,
    productSizeId: number,
): string {
    const ids: number[] = [productId, productColorId, productSizeId];

    if (ids.some((id: number): boolean => !Number.isInteger(id) || id <= 0)) {
        throw new Error("Catalog item IDs must be positive integers");
    }

    return `${productId}-${productColorId}-${productSizeId}`;
}

export function buildCatalogMpn(
    productId: number,
    productColorId: number,
    productSizeId: number,
): string {
    return `BB-${buildCatalogItemId(productId, productColorId, productSizeId)}`;
}

export function buildCatalogVariantUrl(
    productUrl: string,
    productColorId: number,
    size: string,
): string {
    const url: URL = new URL(productUrl);

    url.searchParams.set("colorId", String(productColorId));
    url.searchParams.set("size", size);

    return url.toString();
}
