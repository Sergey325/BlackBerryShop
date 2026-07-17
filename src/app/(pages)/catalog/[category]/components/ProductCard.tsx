"use client"

import {useEffect, useMemo, useRef, useState} from "react";
import {IProduct} from "@/app/actions/getProducts";
import Image from "next/image";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import {MdOutlineShoppingCart} from "react-icons/md";
import { pluralizeUk } from "@/app/utils/pluralizeUk";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import useCartModal from "@/app/hooks/useCartModal";
import {useCartStore} from "@/app/hooks/useCartStore";

type Props = {
    product: IProduct;
    list?: boolean;
    colors?: boolean;
};

const ProductCard = ({ product, list = false, colors = false }: Props) => {
    const searchParams = useSearchParams();

    const cartModal = useCartModal();
    const cart = useCartStore();

    const start = useRef({ x: 0, y: 0 });
    const dragged = useRef(false);

    const THRESHOLD = 8;

    const initialIdx = useMemo(() => {
        const colors = searchParams.getAll('color');          // все color-параметры
        if (!colors.length) return 0;
        const last = colors[colors.length - 1];               // берём последний
        const idx = product.colors.findIndex(c => c.color.toLowerCase() === last.toLowerCase());
        return idx !== -1 ? idx : 0;
    }, [searchParams, product.colors]);

    const [activeIdx, setActiveIdx] = useState(initialIdx);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveIdx(initialIdx);
    }, [initialIdx]);

    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const update = () => setVisibleCount(window.innerWidth < 640 ? list ? 7 : 4 : list ? 10 : 7);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [list]);

    const visibleColors = product.colors.slice(0, visibleCount);
    const hasMoreColors = product.colors.length > visibleColors.length;

    const handleAddToCart = () => {
        // if (!selectedSize) {
        //     toast("Виберіть розмір", {
        //         icon: "⚠️",
        //     })
        //     return
        // }
        // else if (!selectedSizeObj?.available) return;

        cart.addItem({
            productId: product.id,
            productColorId: product.colors[activeIdx].id,
            quantity: 1,
            sizes: product.colors[activeIdx].sizes,
            color: product.colors[activeIdx].color,
            colorName: product.colors[activeIdx].colorName,
            discount: product.discount,
            photoUrl: product.colors[activeIdx].images[0]?.url ?? "",
            price: product.price,
            productName: product.name.replace(/\s+(\S+)$/,` ${product.colors[activeIdx].colorName}, $1`),
            slug: product.slug,
            categorySlug: product.category!.slug
        });
        cartModal.onOpen();

        // trackMetaEvent("AddToCart", {
        //     content_ids: [product.id.toString()],
        //     content_name: product.name,
        //     content_type: "product",
        //     value: product.price,
        //     currency: "UAH",
        //     color: selectedProductColor.colorName,
        //     size: selectedSize,
        // });
    }

    if (list) {
        return (
            <div className="flex gap-4 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow px-3 pt-2 pb-1 sm:p-3 group">
                <Link href={`/catalog/${product.category?.slug || ""}/${product.id}`} className="relative size-24 sm:size-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 cursor-pointer">
                    <Image src={optimizeCloudinaryUrl(product.colors[activeIdx].images[0].url, 200)} alt={product.name} fill unoptimized draggable={false} className="object-cover select-none group-hover:scale-105 transition-transform"/>
                </Link>
                <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                    <Link href={`/catalog/${product.category?.slug || ""}/${product.id}`}>
                        <p className="font-semibold text-gray-900 text-sm hover:text-primary transition-colors">{product.name}</p>
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
                        <p className="font-bold text-gray-900 self-end">{product.price} грн</p>
                        <button
                            onClick={() => handleAddToCart()}
                            className="shrink-0 flex items-center justify-center size-8 sm:size-auto sm:gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold sm:px-3 sm:py-2 rounded-full sm:rounded-xl transition-colors"
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
            draggable={false}
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
                }
            }}
            href={`/catalog/${product.category?.slug || ""}/${product.id}`}
            className="bg-primary/7 rounded-2xl overflow-hidden border border-primary/50
               shadow-sm hover:shadow-md hover:-translate-y-0.5
               transition-all duration-200 group select-none cursor-pointer
               w-full max-w-[280px]  mx-auto flex flex-col justify-between
            "
        >
            {/* Product image */}
            <div
                className="aspect-square relative bg-white rounded-t-lg flex items-center justify-center ">
                <Image
                    src={optimizeCloudinaryUrl(product.colors[activeIdx].images[0].url, 500)}
                    alt={product.name}
                    fill unoptimized
                    draggable={false}
                    className="object-contain w-full h-full rounded-lg p-3"
                />
                {/* Color swatches */}
                {
                    visibleColors.length > 1 && colors &&
                    <div className="absolute bottom-0 left-2.5">
                        <div className="flex gap-1.5 items-center">
                            {visibleColors.map((c, i) => (
                                <button
                                    key={c.id}
                                    onMouseEnter={() => setActiveIdx(i)}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        // e.stopPropagation();
                                        setActiveIdx(i)
                                    }}
                                    className={`size-4 rounded-full cursor-pointer border shadow-sm transition-transform hover:scale-125 ${
                                        activeIdx === i
                                            ? 'border-primary border-2 scale-125'
                                            : 'border-gray-800'
                                    }`}
                                    style={{ backgroundColor: c.color }}
                                    aria-label={`Колір ${i + 1}`}
                                />
                            ))}

                            {hasMoreColors && (
                                <span className="text-gray-600 text-xl leading-none">
                                    ...
                                </span>
                            )}
                        </div>


                        <p className="text-[11px] text-gray-600 mt-1 -ml-1">
                            Доступно {product.colors.length} {pluralizeUk(product.colors.length,["колір", "кольори", "кольорів"])}
                        </p>
                    </div>
                }
            </div>

            {/* Info row */}
            <div className="p-1 sm:py-2 sm:px-3 flex justify-between w-full h-full">
                <div className="min-w-0 flex flex-col w-full h-full justify-between">

                    <p className="text-[12px] sm:text-sm text-slate-800 font-medium min-h-[32px]">
                        {product.name}
                    </p>

                    <div className="flex justify-between items-center w-full">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">
                            {product.price} грн
                        </p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart()
                            }}
                            className="
                                shrink-0 size-7 sm:w-10 sm:h-10 bg-primary hover:bg-primary/90 active:bg-primary/60
                                text-white rounded-full flex items-center justify-center shadow-md shadow-violet-200 transition-colors cursor-pointer
                            "
                        >
                            <MdOutlineShoppingCart className="size-4" />
                        </button>
                    </div>

                </div>
            </div>
        </Link>
    );
};

export default ProductCard;