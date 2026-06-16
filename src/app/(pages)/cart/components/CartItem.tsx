"use client"

import {Product} from "@prisma/client";
import Image from "next/image"
// import DropDown from "@/app/components/DropDown/DropDown";
import {BsFillTrashFill} from "react-icons/bs";
import {useCallback, useMemo, useState} from "react";
import {toast} from "react-hot-toast";
import axios from "axios";
import {useRouter} from "next/navigation";
// import {calculateTotalPrice} from "@/app/(pages)/cart/CartClient";
import ToolTip from "@/app/components/ToolTip";
import {CartItem as CartItemType, useCartStore} from "@/app/hooks/useCartStore";
import {calculateTotalPrice} from "@/app/(pages)/cart/CartClient";
import {TiDeleteOutline} from "react-icons/ti";
import {FaTimesCircle} from "react-icons/fa";

type Props = {
    item: CartItemType
    onChangeQuantity: () => void
};

const CartItem = ({item}: Props) => {
    const router = useRouter()
    const cart = useCartStore()
    const cartItem = cart.items.find(
        i =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
    )
    const count = cartItem?.quantity || 1

    const totalAmount = useMemo(() => {
        return calculateTotalPrice(cartItem?.price ?? 1, cartItem?.quantity ?? 1, cartItem?.discount ?? 0)
    }, [cartItem?.price, cartItem?.quantity, cartItem?.discount]);



    const handleChangeQuantity = useCallback((quantity: number) => {
        cart.changeQuantity(item, quantity);

    }, [cart, item]);

    // const handleDeleteItem = useCallback(() => {
    //     try {
    //         axios.put("/api/cart", { productId: item.product.id })
    //             .then(() => {
    //                 toast.success("Item removed from cart!");
    //             })
    //             .catch(() => {
    //                 toast.error("Something went wrong.");
    //             })
    //             .finally(() => {
    //                 // onChangeQuantity()
    //                 router.refresh()
    //             });
    //     } catch (error) {
    //         toast.error("Something went wrong");
    //     }
    // }, [item.product, router]);

    return (
        <>
            <hr className="border-gray-400 w-full md:hidden" />

            <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_120px_140px_40px_120px] gap-4 items-center text-base md:text-lg">

                {/* Картинка + название — клик ведёт на товар */}
                <div
                    className="flex md:contents gap-3 items-center cursor-pointer"
                    onClick={() => router.push(`/?product=${item.slug}&size=${item.size}&color=%23${item.color?.slice(1)}`)}
                >
                    <Image src={item.photoUrl} alt="productImage" width={80} height={80} className="object-contain" />

                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-lg md:text-xl">{item.productName}</span>
                        <div className="flex items-center gap-8 text-base">
                            <p>Розмір: <span className="text-base md:text-lg font-semibold">{item.size}</span></p>
                            <div className="flex items-center md:mt-0.75 gap-2">
                                <span>Колір:</span>
                                <div style={{ backgroundColor: item.color }} className="border border-gray-400 rounded-full size-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Цена */}
                <span className="hidden md:block text-right">
                    {item.price - (item.price / 100) * item.discount} грн
                </span>

                {/* Счётчик + удаление + цена (мобайл) */}
                <div className="flex items-center justify-between md:justify-center gap-3">
                    <div className="flex items-center justify-between md:justify-center gap-3">
                        <div className="flex items-center border border-gray-300 font-medium text-zinc-700 select-none">
                            <button onClick={() => handleChangeQuantity(Math.max(1, count - 1))} className="px-4 py-2 hover:bg-gray-100 text-xl">−</button>
                            <span className="text-[15px] px-4">{count}</span>
                            <button onClick={() => handleChangeQuantity(count + 1)} className="px-4 py-2 hover:bg-gray-100 text-xl">+</button>
                        </div>
                        <div className="md:hidden block">
                            <ToolTip label="Видалити">
                                <TiDeleteOutline
                                    className="text-red-500 hover:text-red-300 transition cursor-pointer"
                                    size={36}
                                    onClick={() => cart.removeItem(item.productId, item.size, item.color)}
                                />
                            </ToolTip>
                        </div>
                    </div>


                    {/* На мобайле итог тоже тут */}
                    <span className="md:hidden text-right font-medium">{totalAmount} грн</span>
                </div>

                {/* Удалить */}

                <div className="hidden md:block">
                    <ToolTip label="Видалити">
                        <TiDeleteOutline
                            className="text-red-500 hover:text-red-300 transition cursor-pointer"
                            size={36}
                            onClick={() => cart.removeItem(item.productId, item.size, item.color)}
                        />
                    </ToolTip>
                </div>
                {/* Итог — десктоп */}
                <span className="hidden md:block text-right font-medium">{totalAmount} грн</span>

            </div>
        </>
    );
};

export default CartItem;