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
