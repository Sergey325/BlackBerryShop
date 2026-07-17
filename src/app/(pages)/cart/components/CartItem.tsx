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
import Dropdown from "@/app/components/reusable/DropDown";

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

    const sizeOptions = useMemo(() => {
        if (!item.sizes) return []
        return item.sizes.map((s) => ({
            value: s.size,
            label: s.size,
            onClick: function () {
                cart.changeSize(item, this.value);
            },
        }))  
    }, [cart, item]);

    return (
        <>
            {/*<hr className="h-px bg-primary/30 border-0 w-full lg:hidden"/>*/}

            <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_120px_140px_40px_120px] gap-4 items-center text-base lg:text-lg pb-4">

                {/* Картинка + название — клик ведёт на товар */}
                <div
                    className="flex lg:contents gap-3 items-center cursor-pointer"
                >
                    <Image
                        src={item.photoUrl}
                        alt="productImage"
                        width={80}
                        height={80}
                        draggable={false}
                        className="object-contain select-none"
                        onClick={() => router.push(`/catalog/${item.categorySlug}/${item.productId}?&size=${item.size}&color=%23${item.color?.slice(1)}&colorName=${item.colorName}`)}
                    />

                    <div className="flex flex-col gap-1">
                        <span
                            onClick={() => router.push(`/catalog/${item.categorySlug}/${item.productId}?&size=${item.size}&color=%23${item.color?.slice(1)}&colorName=${item.colorName}`)}
                            className="font-medium text-base lg:text-base hover:text-primary transition-colors duration-300"
                        >
                            {item.productName}
                        </span>
                        <div className="flex  items-center gap-2 sm:gap-8 text-base flex-wrap lg:flex-nowrap">
                            {
                                item.size ?
                                    // <p className="text-nowrap text-sm">Розмір: <span className="text-base font-semibold">{item.size}</span></p>

                                    <Dropdown
                                        placeholder="Виберіть розмір"
                                        options={sizeOptions}
                                        value={item.size}
                                        textCenter
                                        className="max-w-min"
                                        buttonClassName={"px-2! py-1! rounded-md!"}

                                    />
                                    :
                                    <Dropdown
                                        placeholder="Виберіть розмір"
                                        options={sizeOptions}
                                        className="max-w-min"
                                        buttonClassName={"px-2! py-1.5! rounded-md!"}
                                    />
                            }
                            <div className="flex items-center gap-2">
                                <span className="text-nowrap text-sm">Колір:</span>
                                <div className="size-4 rounded-sm border border-gray-500" style={{ backgroundColor: item.color }} />
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
                        <Counter key={item.quantity} onChange={handleChangeQuantity} initialNumber={item.quantity}/>
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