"use client"

import ClientOnly from "@/app/components/reusable/ClientOnly";
import EmptyState from "@/app/components/reusable/EmptyState";
import CartClient from "@/app/(pages)/cart/CartClient";
import {useCartStore} from "@/app/hooks/useCartStore";


const CartPage = () => {
    const items = useCartStore(state => state.items);

    if(items.length < 1){
        return (
            <ClientOnly>
                <EmptyState title={"Ваш кошик порожній"} subtitle={"Ви ще не додали жодних товарів до кошика"} btnTitle="На головну" showReset/>
            </ClientOnly>
        )
    }

    return (
        <ClientOnly>
            <CartClient/>
        </ClientOnly>
    );
};

export default CartPage;