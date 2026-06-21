import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/app/types";

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productColorId: number, size: string) => void;
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

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "cart-storage",
        }
    )
);