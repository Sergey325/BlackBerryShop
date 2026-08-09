import type {CartItem} from "@/app/types";
import type {IProductSize} from "@/app/actions/getProducts";

export function getSelectedProductSize(item: CartItem): IProductSize | undefined {
    return item.sizes.find((size: IProductSize): boolean => size.size === item.size)
        ?? (item.sizes.length === 1 ? item.sizes[0] : undefined);
}

export function getCartItemMaximum(item: CartItem, cartItems: CartItem[] = [item]): number | null | undefined {
    const selectedSize: IProductSize | undefined = getSelectedProductSize(item);

    if (!selectedSize || !selectedSize.available || (selectedSize.quantity !== null && selectedSize.quantity <= 0)) {
        return selectedSize ? 0 : undefined;
    }

    if (selectedSize.quantity === null) {
        return null;
    }

    const siblingQuantity: number = cartItems
        .filter((cartItem: CartItem): boolean =>
            cartItem.productColorId === item.productColorId
            && cartItem.size === item.size
            && Boolean(cartItem.lining) !== Boolean(item.lining)
        )
        .reduce((total: number, cartItem: CartItem): number => total + cartItem.quantity, 0);

    return Math.max(0, selectedSize.quantity - siblingQuantity);
}
