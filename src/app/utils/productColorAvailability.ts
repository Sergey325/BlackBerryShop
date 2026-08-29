
type ColorWithSizes = {
    sizes: Array<{
        available: boolean;
        quantity: number | null;
    }>;
};

export function isProductColorAvailable(color: ColorWithSizes): boolean {
    return color.sizes.some(
        (size): boolean =>
            size.available &&
            (size.quantity === null || size.quantity > 0)
    );
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