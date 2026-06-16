import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    productId: string;
    productName: string;
    quantity: number;
    photoUrl: string;
    size?: string;
    color?: string;
    price: number;
    discount: number;
    slug: string;
};

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, size?: string, color?: string) => void;
    clearCart: () => void;
    changeQuantity: (item: CartItem, quantity: number) => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const items = get().items;

                const existing = items.find(
                    (i) =>
                        i.productId === item.productId &&
                        i.size === item.size &&
                        i.color === item.color
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

            removeItem: (productId, size, color) => {
                const items = get().items;

                set({
                    items: items.filter(
                        (i) =>
                            !(
                                i.productId === productId &&
                                i.size === size &&
                                i.color === color
                            )
                    ),
                });
            },

            changeQuantity: (item, quantity) => {
                const items = get().items;

                const updated = items
                    .map((i) =>
                        i.productId === item.productId &&
                        i.size === item.size &&
                        i.color === item.color
                            ? { ...i, quantity }
                            : i
                    )
                    .filter((i) => i.quantity > 0);

                set({ items: updated });
            },

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "cart-storage",
        }
    )
);