"use client"

import CartItem from "@/app/(pages)/cart/components/CartItem";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import CartSummary, {AppliedPromoCode} from "@/app/(pages)/cart/components/CartSummary";
import axios from "axios";
import {useCartStore} from "@/app/hooks/useCartStore";
import NovaPoshtaSelect from "@/app/(pages)/cart/components/NovePoshtaSelect";
import RadioGroup from "@/app/components/reusable/RadioGroup";
import {City, Warehouse} from "@/app/types";
import ContactForm from "@/app/(pages)/cart/components/ContactForm";
import CheckoutSection from "@/app/(pages)/cart/components/CheckoutSection";
import toast from "react-hot-toast";
import {calculatePriceWithDiscount, calculateTotalPrice} from "@/app/utils/getTotalPrice";
import {isValidUAPhone, validateName} from "@/app/utils/validation";
import {getCookie} from "@/app/utils/getCookie";
import {trackMetaEvent} from "@/app/lib/analytics/meta";
import type {IRelatedProduct} from "@/app/actions/getProducts";
import type {IProductSize} from "@/app/actions/getProducts";
import type {CartItem as CartItemType} from "@/app/types";
import {buildCatalogItemId} from "@/app/lib/catalogItemId";
import {getSelectedProductSize} from "@/app/utils/inventory";
import {getCheckoutTrafficSource} from "@/app/lib/analytics/trafficSource";

type RelatedProductsByProductId = Record<number, IRelatedProduct[]>;
type InventoryResponse = {
    items: {
        productColorId: number;
        sizes: IProductSize[];
    }[];
};

const paymentOptions = [
    { value: "MONOBANK", label: "Оплата картою, Monopay, Google Pay або Apple Pay", shortTitle: "Оплата карткою" },
    { value: "CASH_ON_DELIVERY", label: "Оплата при отриманні (передоплата 150 грн, решта при отриманні)", shortTitle: `Оплата при отриманні\n(Передплата 150 грн)` },
]

const CartClient = () => {
    const cart = useCartStore();
    const cartItemsRef = useRef<CartItemType[]>(cart.items);
    const replaceCartItems = cart.replaceItems;
    const [payment, setPayment] = useState(paymentOptions[0]);
    const [appliedPromoCode, setAppliedPromoCode] = useState<AppliedPromoCode | null>(null);
    const handlePromoCodeChange = useCallback((promoCode: AppliedPromoCode | null): void => {
        setAppliedPromoCode(promoCode);
    }, []);
    const productIdsKey = useMemo((): string => {
        return [...new Set(cart.items.map(item => item.productId))]
            .sort((a, b) => a - b)
            .join(",");
    }, [cart.items]);

    const [relatedByProductId, setRelatedByProductId] = useState<RelatedProductsByProductId>({});
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    useEffect((): void => {
        cartItemsRef.current = cart.items;
    }, [cart.items]);

    const syncCartInventory = useCallback(async (blockOnError: boolean): Promise<boolean> => {
        const currentItems: CartItemType[] = cartItemsRef.current;

        if (currentItems.length === 0) return true;

        try {
            const response = await axios.post<InventoryResponse>("/api/inventory", {
                productColorIds: [...new Set(currentItems.map((item: CartItemType): number => item.productColorId))],
            });
            const inventoryByColorId = new Map(
                response.data.items.map((item) => [item.productColorId, item.sizes] as const)
            );
            const updatedItems: CartItemType[] = [];
            let adjustedCount = 0;
            let removedCount = 0;
            let inventoryChanged = false;

            for (const item of currentItems) {
                const sizes: IProductSize[] | undefined = inventoryByColorId.get(item.productColorId);
                const selectedSize: IProductSize | undefined = sizes?.find(
                    (size: IProductSize): boolean => size.size === item.size
                ) ?? (sizes?.length === 1 ? sizes[0] : undefined);

                if (!item.size && sizes && sizes.length > 1) {
                    const hasAvailableSize: boolean = sizes.some(
                        (size: IProductSize): boolean =>
                            size.available && (size.quantity === null || size.quantity > 0)
                    );

                    if (!hasAvailableSize) {
                        removedCount += 1;
                        continue;
                    }

                    if (JSON.stringify(item.sizes) !== JSON.stringify(sizes)) inventoryChanged = true;
                    updatedItems.push({...item, sizes});
                    continue;
                }

                if (
                    !selectedSize
                    || !selectedSize.available
                    || (selectedSize.quantity !== null && selectedSize.quantity <= 0)
                ) {
                    removedCount += 1;
                    continue;
                }

                const quantity: number = selectedSize.quantity === null
                    ? item.quantity
                    : Math.min(item.quantity, selectedSize.quantity);

                if (quantity !== item.quantity) adjustedCount += 1;
                if (JSON.stringify(item.sizes) !== JSON.stringify(sizes)) inventoryChanged = true;

                updatedItems.push({...item, sizes: sizes ?? item.sizes, quantity});
            }

            if (adjustedCount > 0 || removedCount > 0 || inventoryChanged) {
                cartItemsRef.current = updatedItems;
                replaceCartItems(updatedItems);
            }

            if (adjustedCount > 0 && removedCount > 0) {
                toast.error("Залишки змінилися: кількість скориговано, недоступні товари видалено");
            } else if (adjustedCount > 0) {
                toast.error("Обрана кількість недоступна. Кількість у кошику скориговано");
            } else if (removedCount > 0) {
                toast.error("Деяких товарів вже немає в наявності. Їх видалено з кошика");
            }

            return adjustedCount === 0 && removedCount === 0;
        } catch (error: unknown) {
            console.error(error);
            if (blockOnError) {
                toast.error("Не вдалося перевірити актуальні залишки. Спробуйте ще раз");
            }
            return false;
        }
    }, [replaceCartItems]);

    useEffect(() => {
        void syncCartInventory(false);
        const handleFocus = (): void => {
            void syncCartInventory(false);
        };

        window.addEventListener("focus", handleFocus);
        return (): void => window.removeEventListener("focus", handleFocus);
    }, [syncCartInventory]);

    const isRelatedLoading = !!productIdsKey && loadedKey !== productIdsKey && !hasLoadedOnce;
    const firstItemWithRelatedIndex: number = cart.items.findIndex(
        (item: CartItemType): boolean => item.hasRelatedProducts
    );

    useEffect(() => {
        if (!productIdsKey) return;

        let isCurrent = true;
        const productIds: number[] = productIdsKey.split(",").map(Number);

        axios.post<RelatedProductsByProductId>(
            "/api/products/related",
            { productIds }
        ).then(response => {
            if (isCurrent) {
                setRelatedByProductId(response.data);

                const currentItems: CartItemType[] = cartItemsRef.current;
                let relationMetadataChanged = false;
                const updatedItems: CartItemType[] = currentItems.map(
                    (item: CartItemType): CartItemType => {
                        const hasRelatedProducts: boolean =
                            (response.data[item.productId]?.length ?? 0) > 0;

                        if (item.hasRelatedProducts === hasRelatedProducts) {
                            return item;
                        }

                        relationMetadataChanged = true;
                        return {...item, hasRelatedProducts};
                    }
                );

                if (relationMetadataChanged) {
                    cartItemsRef.current = updatedItems;
                    replaceCartItems(updatedItems);
                }
            }
        }).catch(error => {
            if (isCurrent) {
                console.error(error);
            }
        }).finally(() => {
            if (isCurrent) {
                setLoadedKey(productIdsKey);
                setHasLoadedOnce(true);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [productIdsKey, replaceCartItems]);

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
    const promoCartItems = useMemo(() => cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        lining: Boolean(item.lining),
    })), [cart.items]);

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
            const inventoryIsCurrent: boolean = await syncCartInventory(true);
            if (!inventoryIsCurrent) return;

            const fbp = getCookie('_fbp');
            const fbc = getCookie('_fbc');
            const trafficSource = getCheckoutTrafficSource(fbc);

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
                promoCode: appliedPromoCode?.code ?? null,
                items: cart.items.map(item => ({
                    productId: Number(item.productId),
                    name: item.productName,
                    price: calculatePriceWithDiscount(item.price, item.discount),
                    quantity: item.quantity,
                    color: item.color,
                    colorName: item.colorName,
                    size: item.size,
                    imageUrl: item.photoUrl,
                    colorId: item.productColorId,
                    lining: Boolean(item.lining)
                })),
                fbp,
                fbc,
                trafficSource,
            }

            const checkoutContents: Array<{
                id: string;
                quantity: number;
                color: string;
                size: string;
            }> = cart.items.flatMap((item: CartItemType) => {
                const productSize: IProductSize | undefined = getSelectedProductSize(item);

                return productSize ? [{
                    id: buildCatalogItemId(item.productId, item.productColorId, productSize.id),
                    quantity: item.quantity,
                    color: item.colorName,
                    size: productSize.size,
                }] : [];
            });

            trackMetaEvent("InitiateCheckout", {
                content_ids: checkoutContents.map((item): string => item.id),
                content_type: "product",
                value: totalPrice,
                currency: "UAH",
                contents: checkoutContents,
            });

            try {
                const res = await axios.post("/api/checkout", data);

                if (res.data.redirectUrl) {
                    window.location.href = res.data.redirectUrl; // редирект на оплату
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response?.status === 409) {
                    await syncCartInventory(false);
                }
                const message: string = axios.isAxiosError<{error?: string}>(error)
                    ? error.response?.data?.error ?? "Не вдалося оформити замовлення"
                    : "Не вдалося оформити замовлення";

                toast.error(message);
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
                                    defaultExpanded={i === firstItemWithRelatedIndex}
                                    isLoading={isRelatedLoading && i === firstItemWithRelatedIndex}
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
                        items={promoCartItems}
                        appliedPromoCode={appliedPromoCode}
                        onPromoCodeChange={handlePromoCodeChange}
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
