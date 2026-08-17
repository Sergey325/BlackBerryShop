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
import CarouselWrapper from "@/app/components/reusable/CarouselWrapper";
import Accordion from "@/app/components/reusable/Accordion";
import {FiTrash2} from "react-icons/fi";
import type {IRelatedProduct} from "@/app/actions/getProducts";
import {getCartItemMaximum} from "@/app/utils/inventory";
import toast from "react-hot-toast";
import {getProductPath} from "@/app/lib/productUrl";

type Props = {
    item: CartItemType,
    defaultExpanded: boolean,
    related: IRelatedProduct[],
    isLoading: boolean,
};

function RelatedAndCustomizationSkeleton(): React.JSX.Element {
    return (
        <div
            className="mt-3 flex min-h-[396px] flex-col gap-4 ml-1 animate-pulse"
            aria-hidden="true"
        >
            {/* Скелетон списка связанных товаров */}
            <div className="flex h-[168px] flex-col gap-2 overflow-hidden pr-1">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div
                        key={`related-skeleton-${i}`}
                        className="flex h-20 shrink-0 items-center gap-3 rounded-lg border border-primary/25 pr-2"
                    >
                        <div className="size-20 shrink-0 rounded-l-lg bg-primary/25" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="h-3.5 w-3/4 rounded bg-primary/25" />
                            <div className="h-3 w-1/3 rounded bg-primary/25" />
                        </div>
                        <div className="h-7 w-16 shrink-0 rounded-md bg-primary/25" />
                    </div>
                ))}
            </div>

            {/* Скелетон карусели кастомизации */}
            <div className="flex h-[184px] gap-3 overflow-hidden px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={`custom-skeleton-${i}`}
                        className="flex w-[110px] shrink-0 flex-col items-center gap-2 rounded-lg border border-primary/25 p-3"
                    >
                        <div className="size-[100px] rounded-md bg-primary/25" />
                        <div className="h-3 w-full rounded bg-primary/25" />
                        <div className="h-3 w-2/3 rounded bg-primary/25" />
                        <div className="mt-1 h-7 w-full rounded-md bg-primary/25" />
                    </div>
                ))}
            </div>
        </div>
    );
}

const CartItem = ({item, related, defaultExpanded = false, isLoading}: Props) => {
    const router = useRouter()
    const cart = useCartStore()
    const productUrl: string = `${getProductPath(item.categorySlug, item.productId, item.slug)}?size=${item.size ?? ""}&colorId=${item.productColorId}${item.lining ? "&lining=true" : ""}`;
    const cartItem = cart.items.find(
        i =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color &&
        Boolean(i.lining) === Boolean(item.lining)
    )

    const { relatedProducts, customizationOptions } = related.reduce(
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
            relatedProducts: [] as typeof related,
            customizationOptions: [] as typeof related,
        }
    );

    const totalAmount = useMemo(() => {
        return calculateTotalPrice(cartItem?.price ?? 1, cartItem?.quantity ?? 1, cartItem?.discount ?? 0)
    }, [cartItem?.price, cartItem?.quantity, cartItem?.discount]);
    const maximumQuantity: number | null | undefined = getCartItemMaximum(item, cart.items);

    const handleChangeQuantity = useCallback((quantity: number) => {
        cart.changeQuantity(item, quantity);

    }, [cart, item]);

    const sizeOptions = useMemo(() => {
        if (!item.sizes) return []
        return item.sizes
            .filter((s) => s.available && (s.quantity === null || s.quantity > 0))
            .map((s) => ({
            value: s.size,
            label: s.size,
            onClick: function () {
                cart.changeSize(item, this.value);
            },
            }))
    }, [cart, item]);

    const hasRelatedContent: boolean = relatedProducts.length > 0 || customizationOptions.length > 0;
    const accordionTitle: string = isLoading
        ? "Супутні товари та кастомізація"
        : relatedProducts.length > 0 && customizationOptions.length > 0
            ? "Супутні товари та кастомізація"
            : relatedProducts.length > 0
                ? "Супутні товари"
                : "Варіанти кастомізації";

    return (
        <div className="mb-0">
            {/*<hr className="h-px bg-primary/30 border-0 w-full lg:hidden"/>*/}

            <div className="grid grid-cols-1 lg:grid-cols-[80px_minmax(0,1fr)_120px_140px_30px_100px] gap-4 items-center text-base lg:text-lg pb-4">

                {/* Картинка + название — клик ведёт на товар */}
                <div
                    className="flex lg:contents gap-3 items-center cursor-pointer"
                >
                    <Image
                        src={item.photoUrl}
                        alt={`${item.productName}, колір ${item.colorName ?? item.color}`}
                        width={80}
                        height={80}
                        draggable={false}
                        className="object-cover self-stretch sm:self-auto sm:aspect-square select-none rounded-lg"
                        // onClick={() => router.push(`/catalog/${item.categorySlug}/${item.productId}?&size=${item.size}&color=%23${item.color?.slice(1)}&colorName=${item.colorName}`)}
                        onClick={() => router.push(productUrl)}
                    />

                    <div className="flex flex-col justify-between self-stretch min-w-0">
                        <span
                            // onClick={() => router.push(`/catalog/${item.categorySlug}/${item.productId}?&size=${item.size}&color=%23${item.color?.slice(1)}&colorName=${item.colorName}`)}
                            onClick={() => router.push(productUrl)}
                            className="font-medium text-base lg:text-base hover:text-primary transition-colors duration-300"
                        >
                            {item.productName}
                        </span>
                        {
                            item.sizes.length > 1 &&
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
                                            buttonClassName={"pl-2! pr-1.5! py-1! rounded-md!"}
                                        />
                                        :
                                        <Dropdown
                                            placeholder="Виберіть розмір"
                                            options={sizeOptions}
                                            className="max-w-min"
                                            buttonClassName={"pl-2! pr-1.5! py-1.5! rounded-md!"}
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
                    <div className="flex items-center justify-between lg:justify-center gap-5">
                        <Counter
                            key={`${item.quantity}-${maximumQuantity ?? "unlimited"}`}
                            onChange={handleChangeQuantity}
                            initialNumber={item.quantity}
                            max={maximumQuantity}
                            disabled={maximumQuantity === 0}
                            onMaxReached={() => toast.error("Більше товару зараз немає в наявності")}
                        />
                        <div className="lg:hidden block justify-self-center">
                            <FiTrash2
                                className="text-red-500 hover:text-red-300 transition cursor-pointer size-6"
                                onClick={() => cart.removeItem(item.productColorId, item.size, item.lining)}
                            />
                        </div>
                    </div>

                    {/* На мобайле итог тоже тут */}
                    <span className="lg:hidden text-right font-medium">{totalAmount} грн</span>
                </div>

                {/* Удалить */}

                <div className="hidden lg:block mt-2">
                    <ToolTip label="Видалити">
                        <FiTrash2
                            className="text-red-500 hover:text-red-300 transition cursor-pointer size-7"
                            onClick={() => cart.removeItem(item.productColorId, item.size, item.lining)}
                        />
                    </ToolTip>
                </div>
                {/* Итог — десктоп */}
                <span className="hidden lg:inline text-right font-medium text-nowrap w-fit justify-self-end">{totalAmount} грн</span>

            </div>
            {(isLoading || hasRelatedContent) && (
                <Accordion
                    key={defaultExpanded ? "expanded" : "collapsed"}
                    title={accordionTitle}
                    buttonClass="text-sm text-primary hover:text-primary/70 transition-colors duration-300 gap-2! justify-normal cursor-pointer ml-1"
                    containerClass="pb-3"
                    initialState={defaultExpanded}
                >
                    {isLoading ? (
                        <RelatedAndCustomizationSkeleton />
                    ) : (
                    <div className="mt-3 flex flex-col gap-4 ml-1">
                        {/* Связанные товары — список */}
                        {relatedProducts.length > 0 && (
                            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                                {relatedProducts.map((related) => (
                                    <div
                                        key={related.id}
                                        className="flex items-center gap-3 pr-2 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors duration-300"
                                    >
                                        <Image
                                            src={optimizeCloudinaryUrl(related.colors[0].images[0].url, 100)}
                                            alt={related.name}
                                            width={80}
                                            height={80}
                                            draggable={false}
                                            unoptimized
                                            className="object-contain rounded-l-lg shrink-0 select-none"
                                        />
                                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                                                <span
                                                    onClick={() => router.push(`${getProductPath(related.category?.slug ?? "", related.id, related.slug)}?colorId=${related.colors[0].id}`)}
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
                                carouselClass=""
                                containerClass="px-6"
                                arrowClass="translate-x-0!"
                            >
                                {customizationOptions.map((variant) => (
                                    <div
                                        key={variant.id}
                                        className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors duration-300 h-full select-none"
                                    >
                                        <Image
                                            src={optimizeCloudinaryUrl(variant.colors[0].images[0].url, 200)}
                                            alt={variant.name}
                                            width={100}
                                            height={100}
                                            draggable={false}
                                            unoptimized
                                            className="object-contain rounded-md select-none"
                                        />
                                        <span
                                            //router.push(`/catalog/${item.categorySlug}/${item.productId}?size=${item.size}&colorId=${item.productColorId}`)
                                            onClick={() => router.push(`${getProductPath(variant.category?.slug ?? "", variant.id, variant.slug)}?colorId=${variant.colors[0].id}`)}
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
                                                isDecoration: true
                                            })}
                                            className="text-xs font-medium w-full px-2 py-1.5 rounded-md bg-primary text-white hover:bg-primary/80 transition-colors duration-300 cursor-pointer"
                                        >
                                            Додати
                                        </button>
                                    </div>
                                ))}
                            </CarouselWrapper>
                        )}
                    </div>
                    )}
                </Accordion>
            )}
        </div>
    );
};

export default CartItem;
