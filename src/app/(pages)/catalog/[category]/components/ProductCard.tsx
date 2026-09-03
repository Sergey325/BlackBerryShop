"use client"

import {useEffect, useMemo, useRef, useState} from "react";
import type {IProductCardData} from "@/app/actions/getProducts";
import Image from "next/image";
import {MdOutlineShoppingCart} from "react-icons/md";
import { pluralizeUk } from "@/app/utils/pluralizeUk";
import {useSearchParams} from "next/navigation";
import useCartModal from "@/app/hooks/useCartModal";
import {createProductSelection, useCartStore} from "@/app/hooks/useCartStore";
import Link from "next/link";
import {trackMetaEvent} from "@/app/lib/analytics/meta";
import {getProductPath} from "@/app/lib/productUrl";
import {FaFire} from "react-icons/fa";
import {getProductColorBackground} from "@/app/utils/getProductColorBackground";
import {
    isProductColorAvailable,
    sortColorsByAvailability,
} from "@/app/utils/productColorAvailability";
import {buildCatalogItemId} from "@/app/lib/catalogItemId";

type Props = {
    product: IProductCardData;
    list?: boolean;
    colors?: boolean;
    preferredCatalogColorCodes?: string[];
};

const ProductCard = ({
    product,
    list = false,
    colors = false,
    preferredCatalogColorCodes = [],
}: Props) => {
    const searchParams = useSearchParams();

    const sortedProduct: IProductCardData = useMemo(
        (): IProductCardData => ({
            ...product,
            colors: sortColorsByAvailability(product.colors),
        }),
        [product],
    );

    const cartModal = useCartModal();
    const cart = useCartStore();

    const start = useRef({ x: 0, y: 0 });
    const dragged = useRef(false);

    const THRESHOLD = 8;

    const initialIdx = useMemo(() => {
        if (preferredCatalogColorCodes.length > 0) {
            const preferredCodes: Set<string> = new Set(
                preferredCatalogColorCodes.map((code: string): string => code.toLowerCase())
            );
            let bestIndex: number = -1;
            let bestScore: number = -1;

            sortedProduct.colors.forEach((productColor, index: number): void => {
                const colorCodes: Set<string> = new Set(
                    productColor.filterColors.map((filterColor): string =>
                        filterColor.catalogColor.code.toLowerCase()
                    )
                );
                const matchingCodes: number = Array.from(colorCodes)
                    .filter((code: string): boolean => preferredCodes.has(code))
                    .length;

                if (matchingCodes === 0) return;

                // Prefer the variant with the greatest overlap. For equal
                // overlap, prefer fewer unrelated colors (red over red/black).
                const score: number = matchingCodes * 100 - Math.abs(colorCodes.size - preferredCodes.size);

                if (score > bestScore) {
                    bestIndex = index;
                    bestScore = score;
                }
            });

            if (bestIndex !== -1) return bestIndex;
        }

        const colors = searchParams.getAll('color');          // все color-параметры
        if (!colors.length) return 0;

        for (let i = colors.length - 1; i >= 0; i--) {
            const idx = sortedProduct.colors.findIndex(
                c => c.filterColors.some(
                    filterColor => filterColor.catalogColor.code.toLowerCase() === colors[i].toLowerCase()
                )
            );
            if (idx !== -1) return idx;
        }

        return 0;
    }, [preferredCatalogColorCodes, searchParams, sortedProduct.colors]);

    const [activeSelection, setActiveSelection] = useState<{
        productId: number;
        colorIndex: number;
    }>(() => ({
        productId: product.id,
        colorIndex: initialIdx,
    }));
    const activeIdx: number = activeSelection.productId === product.id
        && sortedProduct.colors[activeSelection.colorIndex]
        ? activeSelection.colorIndex
        : initialIdx;
    const setActiveIdx = (colorIndex: number): void => {
        setActiveSelection({productId: product.id, colorIndex});
    };
    const isAvailable: boolean = isProductColorAvailable(sortedProduct.colors[activeIdx]);

    const activeImageSrc = sortedProduct.colors[activeIdx].images[0].url
    const [loadedImageSrcs, setLoadedImageSrcs] = useState<Set<string>>(() => new Set<string>());
    const isImageLoading: boolean = !loadedImageSrcs.has(activeImageSrc);

    const handleImageLoad = (imageSrc: string): void => {
        setLoadedImageSrcs((loadedSrcs: Set<string>): Set<string> => {
            if (loadedSrcs.has(imageSrc)) return loadedSrcs;

            return new Set<string>(loadedSrcs).add(imageSrc);
        });
    };

    const productPath: string = useMemo(()=> {
        return `${getProductPath(product.category?.slug ?? "", product.id, product.slug)}?colorId=${sortedProduct.colors[activeIdx].id}`
    }, [activeIdx, product.category?.slug, product.id, product.slug, sortedProduct.colors])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveSelection({productId: product.id, colorIndex: initialIdx});
    }, [initialIdx, product.id]);

    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const update = () => setVisibleCount(window.innerWidth < 640 ? list ? 7 : 4 : list ? 10 : 6);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [list]);

    const visibleColors = sortedProduct.colors.slice(0, visibleCount);
    const hasMoreColors = sortedProduct.colors.length > visibleColors.length;

    const handleAddToCart = (): void => {
        if (!isAvailable) return;

        const productColor = sortedProduct.colors[activeIdx];
        const productSize = productColor.sizes.length === 1 ? productColor.sizes[0] : undefined;

        cart.addItem({
            ...createProductSelection(sortedProduct, activeIdx),
            size: productSize?.size,
            quantity: 1,
            isDecoration: product.category?.isDecoration || false
        });
        cartModal.onOpen();

        // For multi-size products the exact catalog item is not known until
        // the customer selects a size in the cart.
        if (productSize) {
            trackMetaEvent("AddToCart", {
                content_ids: [buildCatalogItemId(product.id, productColor.id, productSize.id)],
                content_name: product.name,
                content_type: "product",
                value: product.price,
                currency: "UAH",
                color: productColor.colorName,
                size: productSize.size,
            });
        }
    };

    if (list) {
        return (
            <article className="group flex min-h-28 gap-3 overflow-hidden rounded-2xl border border-primary/15 bg-white p-2 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md sm:min-h-40 sm:gap-4 sm:p-3">
                <Link
                    href={productPath}
                    prefetch={false}
                    className="relative w-24 shrink-0 self-stretch overflow-hidden rounded-xl bg-slate-100/20 sm:w-36"
                >
                    <Image
                        key={activeImageSrc}
                        src={activeImageSrc}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 112px, 144px"
                        draggable={false}
                        onLoad={() => handleImageLoad(activeImageSrc)}
                        className={`select-none object-cover transition-[opacity,transform] duration-500 ${
                            isImageLoading ? "opacity-0" : isAvailable ? "opacity-100 group-hover:scale-[1.04]" : "opacity-60 grayscale"
                        }`}
                    />
                    {isImageLoading && (
                        <div
                            className={"absolute inset-0 motion-safe:animate-pulse"}
                            style={{
                                backgroundColor: `color-mix(in srgb, ${sortedProduct.colors[activeIdx].color} 40%, transparent)`
                            }}
                            aria-hidden="true"
                        />
                    )}
                    {colors && sortedProduct.colors[activeIdx].isBestSeller && (
                        <span
                            title="Хіт продажу"
                            aria-label="Хіт продажу"
                            className="absolute left-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-full border border-orange-200 bg-white/90 text-orange-500 shadow-sm"
                        >
                            <FaFire aria-hidden="true" className="size-3.5 motion-safe:animate-pulse" />
                        </span>
                    )}
                    {!isAvailable && (
                        <div className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-slate-900/80 px-1.5 py-1 text-center text-[10px] font-semibold leading-tight text-white backdrop-blur-sm">
                            Немає в наявності
                        </div>
                    )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col py-0.5 sm:py-1">
                    <div className="min-w-0">
                        <Link href={productPath} prefetch={false}>
                            <h3 className="line-clamp-2 text-sm font-medium leading-[18px] text-slate-700 transition-colors group-hover:text-primary sm:text-base sm:leading-5">
                                {product.name}
                            </h3>
                        </Link>
                        {product.material?.name && (
                            <p className="hidden sm:block mt-1 text-wrap text-xs text-slate-500">
                                Матеріал: <span className="text-slate-700">{product.material.name}</span>
                            </p>
                        )}
                    </div>

                    {visibleColors.length > 1 && colors && (
                        <div className="mt-2 flex min-w-0 items-center gap-1.5 sm:flex-wrap" aria-label="Доступні кольори">
                            {visibleColors.map((c, i) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onMouseEnter={() => setActiveIdx(i)}
                                    onClick={() => setActiveIdx(i)}
                                    className={`size-4 shrink-0 cursor-pointer rounded-full transition-transform hover:scale-110 ${
                                        activeIdx === i
                                            ? "border-2 border-primary scale-110"
                                            : "border border-slate-500"
                                    }`}
                                    style={{background: getProductColorBackground(c)}}
                                    aria-label={`Колір ${c.colorName}`}
                                />
                            ))}
                            {hasMoreColors && (
                                <span className="shrink-0 text-xs font-medium text-slate-500">
                                    +{sortedProduct.colors.length - visibleColors.length}
                                </span>
                            )}
                            <span className="ml-1 hidden min-w-0 truncate text-xs text-slate-500 sm:inline">
                                {sortedProduct.colors[activeIdx].colorName}
                            </span>
                        </div>
                    )}

                    <div className="mt-auto flex items-end justify-between gap-2 sm:pt-2">
                        <div>
                            <p className="text-base font-semibold leading-none text-slate-950 sm:text-lg">
                                {product.price} <span className="text-xs font-medium text-slate-600 sm:text-sm">грн</span>
                            </p>
                            {colors && sortedProduct.colors.length > 1 && (
                                <p className="mt-1 hidden text-[11px] text-slate-500 md:block">
                                    {sortedProduct.colors.length} {pluralizeUk(sortedProduct.colors.length, ["колір", "кольори", "кольорів"])}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!isAvailable}
                            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white transition-colors sm:h-10 sm:w-auto sm:gap-1.5 sm:rounded-xl sm:px-4 ${
                                isAvailable
                                    ? "bg-primary hover:bg-primary/90 cursor-pointer"
                                    : "bg-slate-300 cursor-not-allowed"
                            }`}
                            aria-label={isAvailable ? `Додати ${product.name} до кошика` : `${product.name} немає в наявності`}
                        >
                            <MdOutlineShoppingCart className="size-[18px]"/>
                            <span className="hidden sm:block">До кошика</span>
                        </button>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <Link
            key={product.id}
            prefetch={false}
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
            }}
            href={productPath}
            className={`group mx-auto flex h-full w-full max-w-[300px] cursor-pointer select-none flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-primary/15 bg-white shadow-md  transition-all duration-300 hover:-translate-y-1 hover:border-primary/35  ${colors ? "sm:shadow-[0_3px_14px_rgba(15,23,42,0.09)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]" : "sm:shadow-sm"}`}
        >
            {/* Product image */}
            <div className="relative aspect-square w-full min-w-0 shrink-0 overflow-hidden bg-white">
                <div className="absolute inset-1 overflow-hidden rounded-lg sm:inset-2">
                    <Image
                        key={activeImageSrc}
                        src={activeImageSrc}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 300px"
                        quality={75}
                        draggable={false}
                        onLoad={() => handleImageLoad(activeImageSrc)}
                        className={`object-cover transition-all duration-500 ease-out ${
                            isImageLoading ? "opacity-0" : isAvailable ? "opacity-100 group-hover:scale-[1.04]" : "opacity-55 grayscale"
                        }`}
                    />
                    {isImageLoading && (
                        <div
                            className="absolute inset-0 bg-slate-100 motion-safe:animate-pulse"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${sortedProduct.colors[activeIdx].color} 40%, transparent)`
                            }}
                            aria-hidden="true"
                        />
                    )}
                    {colors && sortedProduct.colors[activeIdx].isBestSeller && (
                        <span className="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white/90 px-2 py-1 text-[10px] font-medium leading-none text-orange-700 shadow-sm backdrop-blur-sm sm:left-2 sm:top-2 sm:px-2.5 sm:text-xs">
                            <FaFire
                                aria-hidden="true"
                                className="size-3 text-orange-500 motion-safe:animate-pulse sm:size-3.5"
                            />
                            Хіт продажу
                        </span>
                    )}
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
            <div className={`flex flex-1 flex-col px-1.5 pb-2 pt-1.5 sm:py-4 sm:px-3 ${product.category?.season === "WINTER" ? "bg-winter" : "bg-summer"}`}>
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
                                style={{background: getProductColorBackground(c)}}
                                aria-label={`Колір ${i + 1}`}
                            />
                        ))}

                        {hasMoreColors && (
                            <span className="ml-0.5 shrink-0 text-[12px] font-medium text-slate-700">
                                +{sortedProduct.colors.length - visibleColors.length}
                            </span>
                        )}

                        <span
                            className="ml-auto hidden min-w-0 truncate text-[11px] text-slate-500 md:inline"
                            title={sortedProduct.colors[activeIdx].colorName}
                        >
                            {sortedProduct.colors[activeIdx].colorName}
                        </span>
                    </div>
                )}

                <div className={`${sortedProduct.colors.length > 1 ? "mt-1" : "mt-auto"} flex w-full items-end justify-between gap-2 `}>
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
