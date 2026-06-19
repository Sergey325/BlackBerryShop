'use client'

import React, {useState} from "react";
import Modal from "@/app/components/modals/Modal";
import useCartModal from "@/app/hooks/useCartModal";
import {useCartStore} from "@/app/hooks/useCartStore";
import {TiDeleteOutline} from "react-icons/ti";
import Image from "next/image";
import Counter from "@/app/components/reusable/Counter";
import {calculatePriceWithDiscount, calculateTotalPrice} from "@/app/utils/getTotalPrice";
import {useRouter} from "next/navigation";


const CartModal = () => {
    const router = useRouter()
    const cartModal = useCartModal();
    const cart = useCartStore()
    const [isLoading, setIsLoading] = useState(false)


    const bodyContent =
        (<div className="flex flex-col gap-4 ">
            <div className="flex flex-col gap-4">
                {cart.items.map((item) => (
                    <div key={item.productId +item.color+item.size}>
                        <div
                            className="flex gap-4 py-4 border-b border-gray-200"
                        >

                            {/* Картинка */}
                            <Image src={item.photoUrl} alt="productImage" width={80} height={80} className="object-contain shrink-0"/>

                            {/* Контент */}
                            <div className="flex flex-1 flex-col gap-2">

                                {/* Название + удалить */}
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <p
                                            className="font-medium text-sm md:text-lg hover:text-[#823D9A] transition-colors duration-300 cursor-pointer on"
                                            onClick={() => {
                                                cartModal.onClose()
                                                router.push(`/?product=${item.slug}&size=${item.size}&color=%23${item.color?.slice(1)}`)
                                            }}
                                        >{item.productName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm md:text-lg text-gray-800">{item.size}</span>
                                            <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: item.color }} />
                                        </div>
                                    </div>
                                    <TiDeleteOutline
                                        className="text-red-400 hover:text-red-600 transition shrink-0 cursor-pointer size-8"
                                        onClick={() => cart.removeItem(item.productId, item.size, item.color)}
                                    />
                                </div>

                                {/* Цена + счётчик + сумма */}
                                <div className="flex items-center gap-4 flex-wrap">

                                    {/* Цена за 1шт — скрыта на мобайле */}
                                    <div className="hidden sm:flex flex-col">
                                        <span className="text-sm md:text-sm text-gray-800">Ціна</span>
                                        <span className="text-base md:text-lg font-medium">{calculatePriceWithDiscount(item.price, item.discount)} <span className="text-xs md:text-sm text-gray-800">грн</span></span>
                                    </div>

                                    {/* Счётчик */}
                                    <div className="flex flex-col">
                                        <span className="text-sm md:text-sm text-gray-800">Кількість</span>
                                        <Counter initialNumber={item.quantity} onChange={(count) => cart.changeQuantity(item, count)}/>
                                    </div>

                                    {/* Сумма */}
                                    <div className="flex flex-col">
                                        <span className="text-sm md:text-sm text-gray-800">Сума</span>
                                        <span className="text-base md:text-lg font-bold text-green-600">
                                            {calculateTotalPrice(item.price, item.quantity, item.discount)} <span className="text-sm md:text-sm font-normal text-gray-800">грн</span>
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
            disabled={isLoading}
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