"use client"

import CartItem from "@/app/(pages)/cart/components/CartItem";
import {useMemo, useRef, useState} from "react";
import CartSummary from "@/app/(pages)/cart/components/CartSummary";
import axios from "axios";
import {useCartStore} from "@/app/hooks/useCartStore";
import NovaPoshtaSelect from "@/app/(pages)/cart/components/NovePoshtaSelect";
import RadioGroup from "@/app/components/reusable/RadioGroup";
import {City, Warehouse} from "@/app/types";
import ContactForm from "@/app/(pages)/cart/components/ContactForm";
import CheckoutSection from "@/app/(pages)/cart/components/CheckoutSection";
import toast from "react-hot-toast";
import {calculateTotalPrice} from "@/app/utils/getTotalPrice";


const paymentOptions = [
    { value: "prepayment", label: "Оплата картою, Monopay, Google Pay або Apple Pay", shortTitle: "Передплата карткою" },
    { value: "cod", label: "Оплата при отриманні (передоплата 150 грн, решта при отриманні)", shortTitle: `Оплата при отриманні\n(Передплата 150 грн)` },
]

const CartClient = () => {
    const cart = useCartStore();
    const [payment, setPayment] = useState(paymentOptions[0]);

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

    const contactRef = useRef<HTMLDivElement | null>(null);
    const deliveryRef = useRef<HTMLDivElement | null>(null);

    const onCheckout = async () => {
        // const response = await axios.post("api/checkout")
        // window.location = response.data.url

        if (!contactData.firstName || !contactData.lastName || contactData.phone.length !== 19) {
            toast.error("Введіть ім'я, призвище, та номер телефону")
            contactRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            return;
        }
        else if (!selectedCity || !selectedWarehouse) {
            toast.error("Введіть місто та виберіть відділення")
            deliveryRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            return;
        }
        else {
            const data = {
                contact: contactData,
                delivery: {
                    city: selectedCity.name,
                    cityRef: selectedCity.ref,
                    area: selectedCity.area,
                    warehouse: selectedWarehouse.description,
                    warehouseNumber: selectedWarehouse.number,
                    warehouseRef: selectedWarehouse.ref,
                },
                paymentMethod: "MONOBANK",
                totalAmount: payment.value === "cod" ? 150 : totalPrice,
                items: cart.items.map(item => ({
                    productId: Number(item.productId),
                    name: item.productName,
                    price: calculateTotalPrice(item.price, item.quantity, item.discount),
                    quantity: item.quantity,
                    color: item.color,
                    size: item.size,
                    imageUrl: item.photoUrl,
                })),
            }
            const res = await axios.post("/api/checkout", data);
            console.log(res.data);
            if (res.data.redirectUrl) {
                window.location.href = res.data.redirectUrl; // редирект на оплату
            }
        }
    }

    const steps = [
        {
            title: "Контактні дані",
            content:
                <div ref={contactRef}>
                    <ContactForm value={contactData} onChange={setContactData} />
                </div>
        },
        {
            title: "Доставка",
            content:
                <div ref={deliveryRef}>
                    <NovaPoshtaSelect
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        selectedWarehouse={selectedWarehouse}
                        setSelectedWarehouse={setSelectedWarehouse}
                    />
                </div>

        },
        {
            title: "Способи оплати",
            content:
                <div className="text-sm md:text-base font-medium" >
                    <RadioGroup
                        value={payment.value}
                        onChange={setPayment}
                        options={paymentOptions}
                    />
                </div>

        }
    ];

    return (
        <div className="text-2xl md:text-4xl flex flex-col pt-10 gap-5 lg:gap-10 text-gray-800 mb-20 relative">
            Ваш кошик
            <div className="flex flex-col xl:flex-row gap-10 lg:gap-20 items-start">

                <div className="flex flex-col w-full xl:w-4/6 gap-10 lg:gap-20 items-start ">
                    <div className="flex flex-col  w-full gap-3 border-2 border-gray-200 rounded-md p-6 bg-white">
                        {/* Заголовок — только на десктопе */}
                        <div className="hidden lg:grid grid-cols-[80px_1fr_120px_140px_40px_120px] gap-4 items-center pb-4 border-b border-gray-400 text-gray-600 text-sm md:text-lg">
                            <div></div>
                            <div>Назва</div>
                            <div className="text-right">Ціна</div>
                            <div className="text-center">Кількість</div>
                            <div></div>
                            <div className="text-right">Усього</div>
                        </div>

                        {/* Список товаров */}
                        {cart.items.map((item) => (
                            <div key={item.productId + item.size + item.color + item.colorName} className="flex flex-col gap-4">
                                <CartItem item={item} />
                                <hr className="border-gray-400 w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col w-full gap-10 lg:gap-20">
                        {steps.map((step, index) => (
                            <CheckoutSection
                                key={step.title}
                                number={index + 1}
                                title={step.title}
                            >
                                {step.content}
                            </CheckoutSection>
                        ))}
                    </div>
                </div>
                <div className="xl:sticky w-full xl:top-10">
                    <CartSummary
                        totalPrice={totalPrice}
                        payment={payment}
                        address={
                            {
                                city: selectedCity?.name,
                                area: selectedCity?.area,
                                warehousesAddress: selectedWarehouse?.description
                            }
                        }
                        contactData={contactData}
                        onCheckout={onCheckout}
                    />
                </div>
            </div>
        </div>
    );

};

export default CartClient;