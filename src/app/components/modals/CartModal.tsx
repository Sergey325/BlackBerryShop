'use client'

import React from "react";
import Modal from "@/app/components/modals/Modal";
import useCartModal from "@/app/hooks/useCartModal";
import {useCartStore} from "@/app/hooks/useCartStore";
import Image from "next/image";
import Counter from "@/app/components/reusable/Counter";
import {calculatePriceWithDiscount, calculateTotalPrice} from "@/app/utils/getTotalPrice";
import {useRouter} from "next/navigation";
import {getCartItemMaximum} from "@/app/utils/inventory";
import toast from "react-hot-toast";
import {getProductPath} from "@/app/lib/productUrl";
import {FiTrash2} from "react-icons/fi";
import ToolTip from "@/app/components/reusable/ToolTip";


const CartModal = () => {
    const router = useRouter()
    const cartModal = useCartModal();
    const cart = useCartStore()
    const bodyContent =
        (<div className="flex flex-col gap-4 -mx-2">
            <div className="flex flex-col gap-4 divide-y divide-gray-300">
                {cart.items.map((item) => (
                    <div key={`${item.productId}-${item.color}-${item.size}-${item.colorName}-${Boolean(item.lining)}`}>
                        <div
                            className="flex gap-4 py-4 items-center"
                        >

                            {/* Картинка */}
                            <div className='relative self-stretch w-20 aspect-10/13 shrink sm:size-28 rounded-lg overflow-hidden border border-primary/50'>
                                <Image
                                    src={item.photoUrl}
                                    alt={`${item.productName}, колір ${item.colorName ?? item.color}`}
                                    fill
                                    className="object-cover"
                                />

                            </div>

                            {/* Контент */}
                            <div className="flex self-stretch flex-1 flex-col gap-3">

                                {/* Название + удалить */}
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <p
                                            className="font-medium text-sm md:text-base hover:text-primary transition-colors duration-300 cursor-pointer"
                                            onClick={() => {
                                                cartModal.onClose()
                                                router.push(`${getProductPath(item.categorySlug, item.productId, item.slug)}?size=${item.size ?? ""}&colorId=${item.productColorId}${item.lining ? "&lining=true" : ""}`)
                                            }}
                                        >
                                            {item.productName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {item.size && <span className="text-sm md:text-base text-gray-800">{item.size}</span>}
                                            <div className="w-4 h-4 rounded-sm border border-gray-400" style={{ backgroundColor: item.color }} />
                                        </div>
                                    </div>
                                    <ToolTip label="Видалити">
                                        <FiTrash2
                                            className="text-red-400 hover:text-red-600 transition shrink-0 cursor-pointer size-7"
                                            onClick={() => {
                                                if (cart.items.length === 1) {
                                                    cartModal.onClose()
                                                }
                                                cart.removeItem(item.productColorId, item.size, item.lining)
                                            }}
                                        />
                                    </ToolTip>
                                </div>

                                {/* Цена + счётчик + сумма */}
                                <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(80px,1fr)_120px_minmax(100px,1fr)]">

                                    {/* Цена за 1шт — скрыта на мобайле */}
                                    <div className="hidden min-w-0 sm:block">
                                        <span className="whitespace-nowrap text-sm font-medium tabular-nums md:text-base">
                                            {calculatePriceWithDiscount(item.price, item.discount)} <span className="text-xs font-normal text-gray-700">грн / шт.</span>
                                        </span>
                                    </div>

                                    {/* Счётчик */}
                                    <div className="w-[120px]">
                                        <Counter
                                            initialNumber={item.quantity}
                                            max={getCartItemMaximum(item, cart.items)}
                                            disabled={getCartItemMaximum(item, cart.items) === 0}
                                            onChange={(count) => cart.changeQuantity(item, count)}
                                            onMaxReached={() => toast.error("Більше товару зараз немає в наявності")}
                                        />
                                    </div>

                                    {/* Сумма */}
                                    <div className="min-w-0 text-right">
                                        <span className="whitespace-nowrap text-base font-semibold text-green-600 tabular-nums md:text-lg">
                                            {calculateTotalPrice(item.price, item.quantity, item.discount)} <span className="text-xs font-normal text-gray-700 md:text-sm">грн</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>)

    return (
        <Modal
            disabled={false}
            isOpen={cartModal.isOpen}
            title="Кошик"
            actionLabel="Оформити замовлення"
            secondaryActionLabel={"Продовжити покупки"}
            secondaryAction={cartModal.onClose}
            onClose={cartModal.onClose}
            onSubmit={() => {
                cartModal.onClose()
                router.push(`/cart`)
            }}
            body={bodyContent}
        />
    );
};

export default CartModal;
