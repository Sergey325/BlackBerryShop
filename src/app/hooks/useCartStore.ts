import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, ProductSelection } from "@/app/types";
import { IProduct, IRelatedProduct } from "@/app/actions/getProducts";

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productColorId: number, size?: string, lining?: boolean) => void;
    clearCart: () => void;
    changeQuantity: (item: CartItem, quantity: number) => void;
    changeSize: (item: CartItem, size: string) => void;
    replaceItems: (items: CartItem[]) => void;
};

type PersistedCartState = {
    items: CartItem[];
};

type LegacyCartItem = Omit<CartItem, "sizes" | "lining"> & {
    sizes?: CartItem["sizes"];
    lining?: boolean;
    relatedProducts?: unknown;
};

function migrateCartItem(item: LegacyCartItem): CartItem {
    const migratedItem = {
        ...item,
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        lining: item.lining === true,
    };

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
        productName: product.name,
        slug: product.slug,
        categorySlug: product.category!.slug,
        lining: false,
    };
}

export const useCartStore = create<CartStore>()(
    persist<CartStore, [], [], PersistedCartState>(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const items = get().items;

                const existing = items.find(
                    (currentItem) =>
                        currentItem.productColorId === item.productColorId &&
                        currentItem.size === item.size &&
                        Boolean(currentItem.lining) === Boolean(item.lining)
                );

                if (existing) {
                    set({
                        items: items.map((currentItem) =>
                            currentItem === existing
                                ? {
                                    ...currentItem,
                                    quantity:
                                        currentItem.quantity + item.quantity,
                                }
                                : currentItem
                        ),
                    });

                    return;
                }

                set({
                    items: [...items, item],
                });
            },

            removeItem: (productColorId, size, lining) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) =>
                            !(
                                item.productColorId === productColorId &&
                                item.size === size &&
                                Boolean(item.lining) === Boolean(lining)
                            )
                    ),
                }));
            },

            changeQuantity: (item, quantity) => {
                set((state) => ({
                    items: state.items
                        .map((currentItem) =>
                            currentItem.productColorId ===
                            item.productColorId &&
                            currentItem.size === item.size &&
                            Boolean(currentItem.lining) === Boolean(item.lining)
                                ? {
                                    ...currentItem,
                                    quantity,
                                }
                                : currentItem
                        )
                        .filter((currentItem) => currentItem.quantity > 0),
                }));
            },

            changeSize: (item, newSize) => {
                const items = get().items;

                const existing = items.find(
                    (currentItem) =>
                        currentItem.productColorId === item.productColorId &&
                        currentItem.size === newSize &&
                        Boolean(currentItem.lining) === Boolean(item.lining)
                );

                if (existing) {
                    set({
                        items: items
                            .filter(
                                (currentItem) =>
                                    !(
                                        currentItem.productColorId ===
                                        item.productColorId &&
                                        currentItem.size === item.size &&
                                        Boolean(currentItem.lining) === Boolean(item.lining)
                                    )
                            )
                            .map((currentItem) =>
                                currentItem === existing
                                    ? {
                                        ...currentItem,
                                        quantity:
                                            currentItem.quantity +
                                            item.quantity,
                                    }
                                    : currentItem
                            ),
                    });

                    return;
                }

                set({
                    items: items.map((currentItem) =>
                        currentItem.productColorId === item.productColorId &&
                        currentItem.size === item.size &&
                        Boolean(currentItem.lining) === Boolean(item.lining)
                            ? {
                                ...currentItem,
                                size: newSize,
                            }
                            : currentItem
                    ),
                });
            },

            replaceItems: (items) => set({ items }),

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "cart-storage",
            version: 3,

            partialize: (state): PersistedCartState => ({
                items: state.items,
            }),

            migrate: (persistedState): PersistedCartState => {
                const state = (persistedState ?? {}) as {
                    items?: LegacyCartItem[];
                };

                return {
                    items: Array.isArray(state.items)
                        ? state.items.map(migrateCartItem)
                        : [],
                };
            },
        }
    )
);
