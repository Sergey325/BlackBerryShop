"use client"

import {useEffect, useMemo, useRef, useState} from "react";
import {IRelatedProduct} from "@/app/actions/getProducts";
import Image from "next/image";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import {MdOutlineShoppingCart} from "react-icons/md";
import { pluralizeUk } from "@/app/utils/pluralizeUk";
import {useSearchParams} from "next/navigation";
import useCartModal from "@/app/hooks/useCartModal";
import {createProductSelection, useCartStore} from "@/app/hooks/useCartStore";
import {IProductWithRelated} from "@/app/actions/getProductById";
import Link from "next/link";
import {trackMetaEvent} from "@/app/lib/analytics/meta";
import {getProductPath} from "@/app/lib/productUrl";

type Props = {
    product: IProductWithRelated | IRelatedProduct;
    list?: boolean;
    colors?: boolean;
};

const ProductCard = ({ product, list = false, colors = false }: Props) => {
    const searchParams = useSearchParams();
    const productPath: string = getProductPath(product.category?.slug ?? "", product.id, product.slug);

    const isAvailable: boolean = product.colors.some(color =>
        color.sizes.some(size =>
            size.available && (size.quantity === null || size.quantity > 0)
        )
    );

    const cartModal = useCartModal();
    const cart = useCartStore();

    const start = useRef({ x: 0, y: 0 });
    const dragged = useRef(false);

    const THRESHOLD = 8;

    const initialIdx = useMemo(() => {
        const colors = searchParams.getAll('color');          // все color-параметры
        if (!colors.length) return 0;

        for (let i = colors.length - 1; i >= 0; i--) {
            const idx = product.colors.findIndex(
                c => c.color.toLowerCase() === colors[i].toLowerCase()
            );
            if (idx !== -1) return idx;
        }

        return 0;
    }, [searchParams, product.colors]);

    const [activeIdx, setActiveIdx] = useState(initialIdx);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveIdx(initialIdx);
    }, [initialIdx]);

    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const update = () => setVisibleCount(window.innerWidth < 640 ? list ? 7 : 4 : list ? 10 : 6);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [list]);

    const visibleColors = product.colors.slice(0, visibleCount);
    const hasMoreColors = product.colors.length > visibleColors.length;

    const handleAddToCart = (): void => {
        if (!isAvailable) return;

        cart.addItem({
            ...createProductSelection(product, activeIdx),
            quantity: 1,
            isDecoration: product.category?.isDecoration || false
        });
        cartModal.onOpen();

        trackMetaEvent("AddToCart", {
            content_ids: [product.id.toString()],
            content_name: product.name,
            content_type: "product",
            value: product.price,
            currency: "UAH",
            color: product.colors[activeIdx].colorName,
        });
    }

    const handleViewContent = (): void => {
        trackMetaEvent("ViewContent", {
            content_ids: [product.id.toString()],
            content_name: product.name,
            content_type: "product",
            value: product.price,
            currency: "UAH",
        });
    };

    if (list) {
        return (
            <div className="flex gap-4 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow px-3 pt-2 pb-1 sm:p-3 group">
                <Link href={productPath} className="relative size-24 sm:size-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 cursor-pointer">
                    <Image
                        src={optimizeCloudinaryUrl(product.colors[activeIdx].images[0].url, 200)}
                        alt={product.name}
                        fill
                        unoptimized
                        draggable={false}
                        className={`object-cover select-none transition-all ${isAvailable ? "group-hover:scale-105" : "grayscale opacity-60"}`}
                    />
                    {!isAvailable && (
                        <div className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-slate-900/80 px-1.5 py-1 text-center text-[10px] font-semibold leading-tight text-white backdrop-blur-sm">
                            Немає в наявності
                        </div>
                    )}
                </Link>
                <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                    <Link href={productPath}>
                        <p className="text-sm font-medium leading-[18px] text-slate-700  sm:text-base sm:leading-5 hover:text-primary transition-colors">{product.name}</p>
                    </Link>
                    {
                        visibleColors.length > 1 && colors &&
                        <div className="-mb-4">
                            <div className="flex gap-1.5 mt-2 items-center">
                                {visibleColors.map((c, i) => (
                                    <button
                                        key={c.id}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        onClick={() => setActiveIdx(i)}
                                        className={`size-4 cursor-pointer rounded-full border transition-transform hover:scale-110 ${
                                            activeIdx === i ? 'border-2 border-primary scale-110' : 'border-gray-800'
                                        } shadow-sm`}
                                        style={{ backgroundColor: c.color }}
                                    />
                                ))}
                                {hasMoreColors && (
                                    <span className="text-gray-500 text-xl leading-none">...</span>
                                )}
                            </div>
                            <p className="text-[12px] text-gray-500 mt-1">
                                Доступно {product.colors.length} {pluralizeUk(product.colors.length,["колір", "кольори", "кольорів"])}
                            </p>
                        </div>
                    }

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold leading-none text-slate-950 sm:text-base self-end">{product.price} грн</p>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!isAvailable}
                            className={`shrink-0 flex items-center justify-center size-8 sm:size-auto sm:gap-1.5 text-white text-xs font-semibold sm:px-3 sm:py-2 rounded-full sm:rounded-xl transition-colors ${
                                isAvailable
                                    ? "bg-primary hover:bg-primary/90 cursor-pointer"
                                    : "bg-slate-300 cursor-not-allowed"
                            }`}
                            aria-label={isAvailable ? `Додати ${product.name} до кошика` : `${product.name} немає в наявності`}
                        >
                            <MdOutlineShoppingCart className="size-4"/>
                            <span className="hidden sm:block">До кошика</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            key={product.id}
            onMouseDown={(e) => {
                start.current = { x: e.clientX, y: e.clientY };
                dragged.current = false;
            }}
            onMouseMove={(e) => {
                if (
                    Math.abs(e.clientX - start.current.x) > THRESHOLD ||
                    Math.abs(e.clientY - start.current.y) > THRESHOLD
                ) {
                    dragged.current = true;
                }
            }}
            onClick={(e) => {
                if (dragged.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                handleViewContent();
            }}
            href={productPath}
            className={`group mx-auto flex h-full w-full max-w-[300px] cursor-pointer select-none flex-col overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-md  transition-all duration-300 hover:-translate-y-1 hover:border-primary/35  ${colors ? "sm:shadow-[0_3px_14px_rgba(15,23,42,0.09)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]" : "sm:shadow-sm"}`}
        >
            {/* Product image */}
            <div className="relative aspect-square w-full min-w-0 shrink-0 overflow-hidden bg-white">
                <div className="absolute inset-2 overflow-hidden rounded-lg sm:inset-4">
                    <Image
                        src={optimizeCloudinaryUrl(product.colors[activeIdx].images[0].url, 500, 18)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 300px"
                        unoptimized
                        draggable={false}
                        className={`object-contain transition-all duration-500 ease-out ${
                            isAvailable ? "group-hover:scale-[1.04]" : "grayscale opacity-55"
                        }`}
                    />
                    {!isAvailable && (
                        <div className="absolute inset-0 flex items-end justify-center bg-white/10 p-1 sm:p-2 sm:items-center">
                            <span className="rounded-lg sm:rounded-full bg-slate-900/80 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm sm:text-xs">
                                Немає в наявності
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Product details */}
            <div className={`flex flex-1 flex-col px-2 pb-3 pt-2.5 sm:py-4 sm:px-3 ${product.category?.season === "WINTER" ? "bg-winter" : "bg-summer"}`}>
                <p className="line-clamp-2 mb-1 text-xs font-medium leading-[18px] text-slate-700 transition-colors group-hover:text-slate-950 sm:text-sm sm:leading-5">
                    {product.name}
                </p>

                {visibleColors.length > 1 && colors && (
                    <div className="mt-auto flex min-h-6 items-center gap-1.5" aria-label="Доступні кольори">
                        {visibleColors.map((c, i) => (
                            <button
                                key={c.id}
                                type="button"
                                onMouseEnter={() => setActiveIdx(i)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveIdx(i);
                                }}
                                className={`size-4 shrink-0 cursor-pointer rounded-full transition-all hover:scale-110 ${
                                    activeIdx === i
                                        ? ' border-2 border-primary'
                                        : ' border border-slate-500'
                                }`}
                                style={{ backgroundColor: c.color }}
                                aria-label={`Колір ${i + 1}`}
                            />
                        ))}

                        {hasMoreColors && (
                            <span className="ml-0.5 shrink-0 text-[12px] font-medium text-slate-700">
                                +{product.colors.length - visibleColors.length}
                            </span>
                        )}

                        <span
                            className="ml-auto hidden min-w-0 truncate text-[11px] text-slate-500 md:inline"
                            title={product.colors[activeIdx].colorName}
                        >
                            {product.colors[activeIdx].colorName}
                        </span>
                    </div>
                )}

                <div className={`${product.colors.length > 1 ? "mt-1" : "mt-auto pt-1"} flex w-full items-end justify-between gap-2 `}>
                    <p className="text-sm font-semibold leading-none text-slate-950 sm:text-base">
                        {product.price} <span className="text-xs font-medium text-slate-600 sm:text-sm">грн</span>
                    </p>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart();
                        }}
                        disabled={!isAvailable}
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-colors sm:size-10 ${
                            isAvailable
                                ? "cursor-pointer bg-primary hover:bg-primary/90 active:bg-primary/80"
                                : "cursor-not-allowed bg-slate-300 shadow-none"
                        }`}
                        aria-label={isAvailable ? `Додати ${product.name} до кошика` : `${product.name} немає в наявності`}
                    >
                        <MdOutlineShoppingCart className="size-[18px] sm:size-5" />
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
