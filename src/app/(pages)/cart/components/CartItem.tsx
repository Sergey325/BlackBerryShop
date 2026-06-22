"use client"

import Image from "next/image"
import React, {useCallback, useMemo} from "react";
import {useRouter} from "next/navigation";
import ToolTip from "@/app/components/reusable/ToolTip";
import {useCartStore} from "@/app/hooks/useCartStore";
import {TiDeleteOutline} from "react-icons/ti";
import {calculatePriceWithDiscount, calculateTotalPrice} from "@/app/utils/getTotalPrice";
import {CartItem as CartItemType} from "@/app/types";
import Counter from "@/app/components/reusable/Counter";

type Props = {
    item: CartItemType
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

    const totalAmount = useMemo(() => {
        return calculateTotalPrice(cartItem?.price ?? 1, cartItem?.quantity ?? 1, cartItem?.discount ?? 0)
    }, [cartItem?.price, cartItem?.quantity, cartItem?.discount]);

    const handleChangeQuantity = useCallback((quantity: number) => {
        cart.changeQuantity(item, quantity);

    }, [cart, item]);


    return (
        <>
            <hr className="border-gray-400 w-full lg:hidden" />

            <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_120px_140px_40px_120px] gap-4 items-center text-base lg:text-lg">

                {/* Картинка + название — клик ведёт на товар */}
                <div
                    className="flex lg:contents gap-3 items-center cursor-pointer"
                    onClick={() => router.push(`/?product=${item.slug}&productId=${item.productId}&size=${item.size}&color=%23${item.color?.slice(1)}&colorName=${item.colorName}`)}
                >
                    <Image src={item.photoUrl} alt="productImage" width={80} height={80} className="object-contain" />

                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-base lg:text-lg hover:text-[#823D9A] transition-colors duration-300">{item.productName}</span>
                        <div className="flex  items-center gap-2 sm:gap-8 text-base flex-wrap lg:flex-nowrap">
                            <p className="text-nowrap text-sm lg:text-lg">Розмір: <span className="text-base lg:text-lg font-semibold">{item.size}</span></p>
                            <div className="flex items-center  gap-2">
                                <span className="text-nowrap text-sm lg:text-lg">Колір:</span>
                                <div className="size-5 rounded-sm border border-gray-500" style={{ backgroundColor: item.color }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Цена */}
                <span className="hidden lg:block text-right">
                    {calculatePriceWithDiscount(item.price, item.discount).toFixed(2)} грн
                </span>

                {/* Счётчик + удаление + цена (мобайл) */}
                <div className="flex items-center justify-between lg:justify-center gap-3">
                    <div className="flex items-center justify-between lg:justify-center gap-3">
                        <Counter onChange={handleChangeQuantity} initialNumber={item.quantity}/>
                        <div className="lg:hidden block">
                            <ToolTip label="Видалити">
                                <TiDeleteOutline
                                    className="text-red-500 hover:text-red-300 transition cursor-pointer size-8"
                                    onClick={() => cart.removeItem(item.productColorId, item.size)}
                                />
                            </ToolTip>
                        </div>
                    </div>


                    {/* На мобайле итог тоже тут */}
                    <span className="lg:hidden text-right font-medium">{totalAmount} грн</span>
                </div>

                {/* Удалить */}

                <div className="hidden lg:block">
                    <ToolTip label="Видалити">
                        <TiDeleteOutline
                            className="text-red-500 hover:text-red-300 transition cursor-pointer size-9"
                            onClick={() => cart.removeItem(item.productColorId, item.size)}
                        />
                    </ToolTip>
                </div>
                {/* Итог — десктоп */}
                <span className="hidden lg:block text-right font-medium">{totalAmount} грн</span>

            </div>
        </>
    );
};

export default CartItem;