import { create } from "zustand";
import { persist } from "zustand/middleware";
import {CartItem, ProductSelection} from "@/app/types";
import {IProduct, IRelatedProduct} from "@/app/actions/getProducts";

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productColorId: number, size?: string) => void;
    clearCart: () => void;
    changeQuantity: (item: CartItem, quantity: number) => void;
    changeSize: (item: CartItem, size: string) => void;
};

type LegacyCartItem = CartItem & {
    relatedProducts?: unknown;
};

function migrateCartItem(item: LegacyCartItem): CartItem {
    const migratedItem: LegacyCartItem = {...item};
    delete migratedItem.relatedProducts;
    return migratedItem;
}

export function createProductSelection(
    product: IProduct | IRelatedProduct,
    colorIndex = 0
): ProductSelection {
    const color = product.colors[colorIndex];

    return {
        productId: product.id,
        productColorId: color.id,
        sizes: color.sizes,
        color: color.color,
        colorName: color.colorName,
        discount: product.discount,
        photoUrl: color.images[0]?.url ?? "",
        price: product.price,
        productName: product.name.replace(
            /\s+(\S+)$/,
            ` ${color.colorName}, $1`
        ),
        slug: product.slug,
        categorySlug: product.category!.slug,
    };
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const items = get().items;

                const existing = items.find(
                    (i) =>
                        i.productColorId === item.productColorId &&
                        i.size === item.size
                );

                if (existing) {
                    set({
                        items: items.map((i) =>
                            i === existing
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    });
                } else {
                    set({
                        items: [...items, item],
                    });
                }
            },

            removeItem: (productColorId, size) => {
                const items = get().items;

                set({
                    items: items.filter(
                        (i) =>
                            !(
                                i.productColorId === productColorId &&
                                i.size === size
                            )
                    ),
                });
            },

            changeQuantity: (item, quantity) => {
                const items = get().items;

                const updated = items
                    .map((i) =>
                        i.productColorId === item.productColorId &&
                        i.size === item.size
                            ? { ...i, quantity }
                            : i
                    )
                    .filter((i) => i.quantity > 0);

                set({ items: updated });
            },

            changeSize: (item, newSize) => {
                const items = get().items;

                const existing = items.find(
                    i =>
                        i.productColorId === item.productColorId &&
                        i.size === newSize
                );

                if (existing) {
                    set({
                        items: items
                            .filter(
                                i =>
                                    !(
                                        i.productColorId === item.productColorId &&
                                        i.size === item.size
                                    )
                            )
                            .map(i =>
                                i === existing
                                    ? {
                                        ...i,
                                        quantity: i.quantity + item.quantity,
                                    }
                                    : i
                            ),
                    });
                } else {
                    set({
                        items: items.map(i =>
                            i.productColorId === item.productColorId &&
                            i.size === item.size
                                ? { ...i, size: newSize }
                                : i
                        ),
                    });
                }
            },

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "cart-storage",
            version: 1,
            migrate: (persistedState): CartStore => {
                const state = persistedState as CartStore & {
                    items?: LegacyCartItem[];
                };

                return {
                    ...state,
                    items: (state.items ?? []).map(migrateCartItem),
                };
            },
        }
    )
);
