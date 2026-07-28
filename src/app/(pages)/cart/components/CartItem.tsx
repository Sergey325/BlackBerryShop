"use client"

import Image from "next/image"
import React, {useCallback, useMemo} from "react";
import {useRouter} from "next/navigation";
import ToolTip from "@/app/components/reusable/ToolTip";
import {createProductSelection, useCartStore} from "@/app/hooks/useCartStore";
import {calculatePriceWithDiscount, calculateTotalPrice} from "@/app/utils/getTotalPrice";
import {CartItem as CartItemType} from "@/app/types";
import Counter from "@/app/components/reusable/Counter";
import Dropdown from "@/app/components/reusable/DropDown";
import "react-multi-carousel/lib/styles.css";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import {MdDelete} from "react-icons/md";
import CarouselWrapper from "@/app/components/reusable/CarouselWrapper";
import Accordion from "@/app/components/reusable/Accordion";

type Props = {
    item: CartItemType,
    defaultExpanded: boolean,
};

const CartItem = ({item, defaultExpanded = false}: Props) => {
    const router = useRouter()
    const cart = useCartStore()
    const cartItem = cart.items.find(
        i =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
    )

    const { relatedProducts, customizationOptions } = item.relatedProducts.reduce(
        (acc, product) => {
            if (product.category?.isDecoration) {
                acc.customizationOptions.push(product);
                return acc;
            }

            const matchingColor =
                product.colors.find(c => c.color === item.color) ??
                product.colors[0];

            acc.relatedProducts.push({
                ...product,
                colors: [matchingColor],
            });

            return acc;
        },
        {
            relatedProducts: [] as typeof item.relatedProducts,
            customizationOptions: [] as typeof item.relatedProducts,
        }
    );

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
        <div className="mb-6">
            {/*<hr className="h-px bg-primary/30 border-0 w-full lg:hidden"/>*/}

            <div className="grid grid-cols-1 lg:grid-cols-[80px_minmax(0,1fr)_120px_140px_30px_100px] gap-4 items-center text-base lg:text-lg pb-4">

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

                    <div className="flex flex-col gap-1 min-w-0">
                        <span
                            onClick={() => router.push(`/catalog/${item.categorySlug}/${item.productId}?&size=${item.size}&color=%23${item.color?.slice(1)}&colorName=${item.colorName}`)}
                            className="font-medium text-base lg:text-base hover:text-primary transition-colors duration-300"
                        >
                            {item.productName}
                        </span>
                        {
                            !item.isDecoration &&
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
                        }
                    </div>
                </div>


                {/* Цена */}
                <span className="hidden lg:inline text-center w-fit justify-self-center">
                    {calculatePriceWithDiscount(item.price, item.discount).toFixed(2)} грн
                </span>

                {/* Счётчик + удаление + цена (мобайл) */}
                <div className="flex items-center justify-between lg:justify-center gap-3">
                    <div className="flex items-center justify-between lg:justify-center gap-3">
                        <Counter key={item.quantity} onChange={handleChangeQuantity} initialNumber={item.quantity}/>
                        <div className="lg:hidden block justify-self-center">
                            <ToolTip label="Видалити">
                                <MdDelete
                                    className="text-red-500 hover:text-red-300 transition cursor-pointer size-7"
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
                        <MdDelete
                            className="text-red-500 hover:text-red-300 transition cursor-pointer size-8"
                            onClick={() => cart.removeItem(item.productColorId, item.size)}
                        />
                    </ToolTip>
                </div>
                {/* Итог — десктоп */}
                <span className="hidden lg:inline text-right font-medium text-nowrap w-fit justify-self-end">{totalAmount} грн</span>

            </div>
            {(relatedProducts.length > 0 || customizationOptions.length > 0) && (
                <Accordion
                    title={relatedProducts.length > 0 && customizationOptions.length
                        ? "Супутні товари та кастомізація"
                        : relatedProducts.length > 0
                            ? "Супутні товари"
                                : "Варіанти кастомізації"}
                    containerClass="text-sm text-primary hover:text-primary/70 transition-colors duration-300 gap-2! justify-normal cursor-pointer"
                    initialState={defaultExpanded}
                >
                    <div className="mt-3 flex flex-col gap-4">
                        {/* Связанные товары — список */}
                        {relatedProducts.length > 0 && (
                            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                                {relatedProducts.map((related) => (
                                    <div
                                        key={related.id}
                                        className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors duration-300"
                                    >
                                        <Image
                                            src={optimizeCloudinaryUrl(related.colors[0].images[0].url, 100)}
                                            alt={related.name}
                                            width={48}
                                            height={48}
                                            draggable={false}
                                            unoptimized
                                            className="object-contain rounded-md shrink-0 select-none"
                                        />
                                        <div className="flex flex-col flex-1 min-w-0">
                                                <span
                                                    onClick={() => router.push(`/catalog/${related.category?.slug}/${related.id}?&color=%23${item.color?.slice(1)}&colorName=${item.colorName}`)}
                                                    className="text-sm font-medium truncate transition-colors hover:text-primary cursor-pointer">{related.name}
                                                </span>
                                            <span className="text-xs text-gray-500">{related.price.toFixed(2)} грн</span>
                                        </div>
                                        <button
                                            onClick={() => cart.addItem({
                                                ...createProductSelection(
                                                    related,
                                                    0
                                                ),
                                                quantity: 1,
                                                relatedProducts: [],
                                                isDecoration: false
                                            })}
                                            className="text-xs font-medium px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 shrink-0 cursor-pointer"
                                        >
                                            Додати
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Кастомизация — карусель */}
                        {customizationOptions.length > 0 && (
                            <CarouselWrapper
                                responsive={{
                                    desktop: { breakpoint: { max: 4000, min: 1024 }, items: 4, partialVisibilityGutter: 16 },
                                    tablet: { breakpoint: { max: 1024, min: 640 }, items: 3, partialVisibilityGutter: 16 },
                                    mobile: { breakpoint: { max: 640, min: 0 }, items: 2, partialVisibilityGutter: 16 },
                                }}
                                itemClass="px-1.5"
                                carouselClass="pb-2"
                                containerClass="px-6"
                                arrowClass="translate-x-0!"
                            >
                                {customizationOptions.map((variant) => (
                                    <div
                                        key={variant.id}
                                        className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors duration-300 h-full select-none"
                                    >
                                        <Image
                                            src={optimizeCloudinaryUrl(variant.colors[0].images[0].url, 150)}
                                            alt={variant.name}
                                            width={64}
                                            height={64}
                                            draggable={false}
                                            unoptimized
                                            className="object-contain rounded-md select-none"
                                        />
                                        <span
                                            onClick={() => router.push(`/catalog/${variant.category?.slug}/${variant.id}?&color=%23${variant.colors[0].color?.slice(1)}&colorName=${variant.colors[0].colorName}`)}
                                            className="text-xs font-medium text-center line-clamp-2 hover:text-primary cursor-pointer transition-colors"
                                        >
                                            {variant.name}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-auto">
                                            +{variant.price.toFixed(2)} грн
                                        </span>
                                        <button
                                            onClick={() => cart.addItem({
                                                ...createProductSelection(
                                                    variant,
                                                    0
                                                ),
                                                quantity: 1,
                                                relatedProducts: [],
                                                isDecoration: true
                                            })}
                                            className="text-xs font-medium w-full px-2 py-1.5 rounded-md bg-primary text-white hover:bg-primary/80 transition-colors duration-300 cursor-pointer"
                                        >
                                            Обрати
                                        </button>
                                    </div>
                                ))}
                            </CarouselWrapper>
                        )}
                    </div>
                </Accordion>
            )}
        </div>
    );
};

export default CartItem;
