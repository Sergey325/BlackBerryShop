"use client"

import EmptyState from "@/app/components/reusable/EmptyState";
import CartClient from "@/app/(pages)/cart/CartClient";
import {useCartStore} from "@/app/hooks/useCartStore";
import {useLayoutEffect, useSyncExternalStore} from "react";

function subscribeToCartHydration(onStoreChange: () => void): () => void {
    return useCartStore.persist.onFinishHydration(onStoreChange);
}

function getCartHydrationSnapshot(): boolean {
    return useCartStore.persist.hasHydrated();
}

function getServerCartHydrationSnapshot(): boolean {
    return false;
}

const CartPage = () => {
    const items = useCartStore(state => state.items);
    const isCartHydrated: boolean = useSyncExternalStore(
        subscribeToCartHydration,
        getCartHydrationSnapshot,
        getServerCartHydrationSnapshot
    );

    useLayoutEffect((): void => {
        if (!isCartHydrated) return;

        window.scrollTo({top: 0, left: 0, behavior: "auto"});
    }, [isCartHydrated]);

    return (
        <div className="min-h-screen">
            {isCartHydrated && (
                items.length < 1 ? (
                    <EmptyState title={"Ваш кошик порожній"} subtitle={"Ви ще не додали жодних товарів до кошика"} btnTitle="На головну" showReset/>
                ) : (
                    <CartClient/>
                )
            )}
        </div>
    );
};

export default CartPage;
