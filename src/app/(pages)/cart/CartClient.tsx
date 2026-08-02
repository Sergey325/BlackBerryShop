"use client"

import CartItem from "@/app/(pages)/cart/components/CartItem";
import {useEffect, useMemo, useRef, useState} from "react";
import CartSummary from "@/app/(pages)/cart/components/CartSummary";
import axios from "axios";
import {useCartStore} from "@/app/hooks/useCartStore";
import NovaPoshtaSelect from "@/app/(pages)/cart/components/NovePoshtaSelect";
import RadioGroup from "@/app/components/reusable/RadioGroup";
import {City, Warehouse} from "@/app/types";
import ContactForm from "@/app/(pages)/cart/components/ContactForm";
import CheckoutSection from "@/app/(pages)/cart/components/CheckoutSection";
import toast from "react-hot-toast";
import {calculatePriceWithDiscount, calculateTotalPrice} from "@/app/utils/getTotalPrice";
import {trackMetaEvent} from "@/app/lib/analytics/meta";
import {isValidUAPhone, validateName} from "@/app/utils/validation";
import {getCookie} from "@/app/utils/getCookie";
import type {IRelatedProduct} from "@/app/actions/getProducts";

type RelatedProductsByProductId = Record<number, IRelatedProduct[]>;


const paymentOptions = [
    { value: "MONOBANK", label: "Оплата картою, Monopay, Google Pay або Apple Pay", shortTitle: "Оплата карткою" },
    { value: "CASH_ON_DELIVERY", label: "Оплата при отриманні (передоплата 150 грн, решта при отриманні)", shortTitle: `Оплата при отриманні\n(Передплата 150 грн)` },
]

const CartClient = () => {
    const cart = useCartStore();
    const [payment, setPayment] = useState(paymentOptions[0]);
    const productIdsKey = useMemo((): string => {
        return [...new Set(cart.items.map(item => item.productId))]
            .sort((a, b) => a - b)
            .join(",");
    }, [cart.items]);

    const [relatedByProductId, setRelatedByProductId] = useState<RelatedProductsByProductId>({});
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const isRelatedLoading = !!productIdsKey && loadedKey !== productIdsKey && !hasLoadedOnce;

    useEffect(() => {
        if (!productIdsKey) return;

        const controller = new AbortController();
        const productIds: number[] = productIdsKey.split(",").map(Number);

        axios.post<RelatedProductsByProductId>(
            "/api/products/related",
            { productIds },
            { signal: controller.signal }
        ).then(response => {
            setRelatedByProductId(response.data);
        }).catch(error => {
            if (!axios.isCancel(error)) {
                console.error(error);
            }
        }).finally(() => {
            setLoadedKey(productIdsKey);
            setHasLoadedOnce(true);
        });

        return () => controller.abort();
    }, [productIdsKey]);

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
        if (cart.items.find(item => !item.size && !item.isDecoration)) {
            toast.error("Виберіть розмір")
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        else if (!contactData.firstName || !contactData.lastName || contactData.phone.length !== 19) {
            toast.error("Введіть ім'я, призвище, та номер телефону")
            contactRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            return;
        }
        else if (!validateName(contactData.firstName) || !validateName(contactData.lastName)) {
            toast.error("Ім'я та прізвище повинні містити тільки українські літери");
            contactRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            return;
        }
        else if (!isValidUAPhone(contactData.phone)) {
            toast.error("Номер телефону введено неправильно");
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
            const fbp = getCookie('_fbp');
            const fbc = getCookie('_fbc');

            const data = {
                contact: {
                    ...contactData,
                    firstName: contactData.firstName.trim(),
                    lastName: contactData.lastName.trim(),
                    phone: contactData.phone.replace(/\D/g, ""),
                },
                delivery: {
                    city: selectedCity.name,
                    cityRef: selectedCity.ref,
                    area: selectedCity.area,
                    warehouse: selectedWarehouse.description,
                    warehouseNumber: selectedWarehouse.number,
                    warehouseRef: selectedWarehouse.ref,
                },
                paymentMethod: payment.value,
                totalAmount: payment.value === "CASH_ON_DELIVERY" ? 150 : totalPrice,
                items: cart.items.map(item => ({
                    productId: Number(item.productId),
                    name: item.productName,
                    price: calculatePriceWithDiscount(item.price, item.discount),
                    quantity: item.quantity,
                    color: item.color,
                    colorName: item.colorName,
                    size: item.size,
                    imageUrl: item.photoUrl,
                    colorId: item.productColorId
                })),
                fbp,
                fbc,
            }

            // trackMetaEvent("InitiateCheckout", {
            //     content_ids: cart.items.map(item => item.productId.toString()),
            //     content_type: "product",
            //     value: totalPrice,
            //     currency: "UAH",
            //     contents: cart.items.map(item => ({
            //         id: item.productId,
            //         quantity: item.quantity,
            //         color: item.colorName,
            //         size: item.size,
            //     })),
            // });

            const res = await axios.post("/api/checkout", data);

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
                <div className="text-sm font-medium" >
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

                <div className="flex flex-col min-w-0 w-full xl:w-[60%] xl:shrink-0 gap-10 lg:gap-20 items-start ">
                    <div className="flex flex-col  w-full gap-3 border border-primary/30  rounded-2xl px-3 py-6 bg-white shadow-xs divide-y divide-gray-300">
                        {/* Заголовок — только на десктопе */}
                        <div className="hidden lg:grid grid-cols-[80px_1fr_120px_140px_30px_100px] gap-4 items-center pb-4 text-gray-600 text-sm md:text-base">
                            <div></div>
                            <div>Назва</div>
                            <div className="text-center">Ціна</div>
                            <div className="text-center">Кількість</div>
                            <div></div>
                            <div className="text-right">Усього</div>
                        </div>

                        {/* Список товаров */}
                        {cart.items.map((item, i) => (
                            <div
                                key={`${item.productColorId}-${item.size ?? ""}`}
                                className="flex flex-col gap-4"
                            >
                                <CartItem
                                    item={item}
                                    related={relatedByProductId[item.productId] ?? []}
                                    defaultExpanded={i === 0}
                                    isLoading={isRelatedLoading}
                                />
                                {/*<div className="w-full border-t border-gray-300" style={{visibility: i === cart.items.length-1 ? "hidden" : "visible"}}/>*/}
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
                <div className="xl:sticky w-full min-w-0 xl:flex-1 xl:top-20">
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
