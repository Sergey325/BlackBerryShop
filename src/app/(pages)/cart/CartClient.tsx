"use client"

import {Product} from "@prisma/client";
import Container from "@/app/components/Container";
import CartItem from "@/app/(pages)/cart/components/CartItem";
import {useCallback, useEffect, useMemo, useState} from "react";
import CartSummary from "@/app/(pages)/cart/components/CartSummary";
import axios from "axios";
import {useCartStore} from "@/app/hooks/useCartStore";
import {CartItem as CartItemType} from "@/app/hooks/useCartStore";
import NovaPoshtaSelect from "@/app/(pages)/cart/components/NovePoshtaSelect";
import RadioGroup from "@/app/components/RadioGroup";
import {City, Warehouse} from "@/app/types";
import ContactForm from "@/app/(pages)/cart/components/ContactForm";
import CheckoutSection from "@/app/(pages)/cart/components/CheckoutSection";

// type Props = {
//     currentUser?: User | null
// };

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const paymentOptions = [
    { value: "prepayment", label: "Оплата картою, Google Pay або Apple Pay, Monopay" },
    { value: "cod", label: "Оплата при отриманні (передоплата 150 грн, решта при отриманні)" },
]

export const calculateTotalPrice = (price: number, quantity: number, discount: number): number => Math.round((price-price/100*discount) * quantity * 100) / 100

const CartClient = () => {
    const cart = useCartStore();
    const [payment, setPayment] = useState(paymentOptions[0].value);

    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    const [contactData, setContactData] = useState({
        firstName: "", lastName: "", phone: "", email: "", comment: ""
    });

    const totalPrice = useMemo(() => {
        const total = cart.items.reduce((sum, item) => {
            return sum + calculateTotalPrice(item.price, item.quantity, item.discount);
        }, 0);

        return Math.round(total * 100) / 100;
    }, [cart.items]);

    // const onChangeQuantity = useCallback(() => {
    //     const total = (cart.items).reduce((total, item) => {
    //         const itemCost = calculateTotalPrice(item);
    //         return total + itemCost;
    //     }, 0);
    //
    //     setTotalPrice(Math.round(total * 100) / 100)
    // }, [cart.items.length])
    //
    // useEffect(() => {
    //     onChangeQuantity()
    // }, [cart.items.length])

    const onCheckout = async () => {
        const response = await axios.post("api/checkout")
        window.location = response.data.url
    }

    const steps = [
        {
            title: "Контактні дані",
            content: <ContactForm value={contactData} onChange={setContactData} />
        },
        {
            title: "Доставка",
            content: <NovaPoshtaSelect
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        selectedWarehouse={selectedWarehouse}
                        setSelectedWarehouse={setSelectedWarehouse}
                    />
        },
        {
            title: "Оплата",
            content: <div className="text-base font-medium">
                        <RadioGroup
                            value={payment}
                            onChange={setPayment}
                            options={paymentOptions}
                        />
                     </div>

        }
    ];

    return (
        <div className="text-2xl md:text-4xl flex flex-col pt-10 gap-10 lg:gap-15 text-gray-800 mb-20">
            Ваш кошик
            <div className="flex flex-col xl:flex-row gap-10 xl:gap-20 items-start -mt-4">
                <div className="flex flex-col w-full xl:w-4/6  gap-3 border-2 border-gray-200 rounded-md p-6 bg-white">
                    {/* Заголовок — только на десктопе */}
                    <div className="hidden md:grid grid-cols-[80px_1fr_120px_140px_40px_120px] gap-4 items-center pb-4 border-b border-gray-400 text-gray-600 text-sm md:text-lg">
                        <div></div>
                        <div>Назва</div>
                        <div className="text-right">Ціна</div>
                        <div className="text-center">Кількість</div>
                        <div></div>
                        <div className="text-right">Усього</div>
                    </div>

                    {/* Список товаров */}
                    {cart.items.map((item) => (
                        <div key={item.productId + item.size + item.color} className="flex flex-col gap-4">
                            <CartItem item={item} onChangeQuantity={() => {}} />
                            <hr className="border-gray-400 w-full" />
                        </div>
                    ))}
                </div>
                <CartSummary totalPrice={totalPrice} onCheckout={onCheckout}/>
            </div>
            {steps.map((step, index) => (
                <CheckoutSection
                    key={step.title}
                    number={index + 1}
                    title={step.title}
                >
                    {step.content}
                </CheckoutSection>
            ))}
            {/*<div className="2xl:-ml-13">*/}
            {/*    <div className="flex items-center gap-6 mb-3">*/}
            {/*        <div className="relative w-7 h-8 [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)] bg-gray-300">*/}
            {/*            <span className="absolute inset-0 flex items-center justify-center text-base lg:text-lg font-semibold">*/}
            {/*                1*/}
            {/*            </span>*/}
            {/*        </div>*/}
            {/*        <p className="text-xl lg:text-2xl font-medium ">Контактні дані</p>*/}
            {/*    </div>*/}
            {/*    <div className="2xl:pl-13">*/}
            {/*        <ContactForm value={contactData} onChange={setContactData} />*/}

            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className="">*/}
            {/*    <NovaPoshtaSelect*/}
            {/*        selectedCity={selectedCity}*/}
            {/*        setSelectedCity={setSelectedCity}*/}
            {/*        selectedWarehouse={selectedWarehouse}*/}
            {/*        setSelectedWarehouse={setSelectedWarehouse}*/}
            {/*    />*/}
            {/*</div>*/}
            {/*<div className="text-base font-medium">*/}
            {/*    <RadioGroup*/}
            {/*        value={payment}*/}
            {/*        onChange={setPayment}*/}
            {/*        options={paymentOptions}*/}
            {/*    />*/}
            {/*</div>*/}
        </div>
    );

};

export default CartClient;