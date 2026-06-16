"use client"

import {BiShoppingBag} from "react-icons/bi";
import {useMemo} from "react";
import {useCartStore} from "@/app/hooks/useCartStore";
import {useRouter} from "next/navigation";
import {LuShoppingCart} from "react-icons/lu";

type Props = {
    onClick?: () => void;
};

const Cart = ({onClick}: Props) => {
    const items = useCartStore(state => state.items);
    const router = useRouter()


    // const count = items.reduce(
    //     (sum, item) => sum + item.quantity,
    //     0
    // );

    const amountCart = useMemo(() => {
        return items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
    }, [items]);

    return (
        <div className="group cursor-pointer relative select-none" onClick={() => router.push("/cart")}>
            <LuShoppingCart className="text-gray-900 group-hover:text-[#823D9A] text-2xl md:text-3xl" />
            <span
                style={{
                    display: amountCart ? "block" : "none",
                }}
                className="
                text-zinc-700 text-sm
                absolute top-[-6px] right-[-16px]
                rounded-full
                group-hover:text-[#823D9A]
                border
                bg-gray-50
                px-1.5
            ">
                {amountCart ? amountCart : ""}
            </span>
        </div>
    );
};

export default Cart;