
type ColorWithSizes = {
    sizes: SizeAvailability[];
};

type SizeAvailability = {
    available: boolean;
    quantity: number | null;
};

export function isProductSizeAvailable(size: SizeAvailability): boolean {
    return size.available && (size.quantity === null || size.quantity > 0);
}

export function isProductColorAvailable(color: ColorWithSizes): boolean {
    return color.sizes.some(isProductSizeAvailable);
}

export function sortColorsByAvailability<T extends ColorWithSizes>(
    colors: readonly T[],
): T[] {
    return [...colors].sort(
        (a: T, b: T): number =>
            Number(isProductColorAvailable(b)) -
            Number(isProductColorAvailable(a))
    );
}
