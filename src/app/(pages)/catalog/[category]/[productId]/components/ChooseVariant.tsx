"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {IProductColor} from "@/app/actions/getProducts";
import {calculatePriceWithDiscount} from "@/app/utils/getTotalPrice";
import Counter from "@/app/components/reusable/Counter";
import Button from "@/app/components/reusable/Button";
import useCartModal from "@/app/hooks/useCartModal";
import {createProductSelection, useCartStore} from "@/app/hooks/useCartStore";
import useSizesModal from "@/app/hooks/useSizesModal";
import toast from "react-hot-toast";
import Image from "next/image";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import CheckBox from "@/app/components/reusable/CheckBox";
import {IProductWithRelated} from "@/app/actions/getProductById";

type Props = {
    product: IProductWithRelated;
    selectedProductColor: IProductColor;
    hasLining: boolean;
    isAvailable: boolean;
};

const ChooseVariant = ({ product, selectedProductColor, hasLining, isAvailable }: Props) => {
    const params = useSearchParams();
    const router = useRouter();

    const sizesModal = useSizesModal()

    const [includeLining, setIncludeLining] = useState(false);

    const basePrice = product.price + (includeLining ? 150 : 0);
    const discountedPrice = calculatePriceWithDiscount(basePrice, product.discount ?? 0);

    // Цвет — главный селектор
    const selectedColorHex = selectedProductColor.color;

    // Размер зависит от выбранного цвета
    const selectedSize = params.get("size") ?? "";
    const colorIdFromUrl = params.get("colorId");
    const searchParamsString = params.toString();

    const cartModal = useCartModal();
    const cart = useCartStore();
    const [count, setCount] = useState(1);

    const selectedSizeObj = selectedProductColor.sizes.find(
        (s) => s.size === selectedSize
    ) ?? (selectedProductColor.sizes.length === 1 ? selectedProductColor.sizes[0] : undefined);
    const selectedSizeAvailable: boolean = Boolean(
        selectedSizeObj?.available
        && (selectedSizeObj.quantity === null || (selectedSizeObj.quantity ?? 0) > 0)
    );
    const existingCartQuantity: number = useMemo((): number => {
        return cart.items.find(item =>
            item.productColorId === selectedProductColor.id
            && item.size === selectedSize
        )?.quantity ?? 0;
    }, [cart.items, selectedProductColor.id, selectedSize]);
    const maximumToAdd: number | null | undefined = selectedSizeObj?.quantity === null
        ? null
        : selectedSizeObj?.quantity === undefined
            ? undefined
            : Math.max(0, selectedSizeObj.quantity - existingCartQuantity);

    useEffect(() => {
        if (colorIdFromUrl) return;

        const qs = new URLSearchParams(searchParamsString);
        qs.set("colorId", selectedProductColor.id.toString());
        router.replace(`?${qs.toString()}`, {scroll: false});
    }, [colorIdFromUrl, router, searchParamsString, selectedProductColor.id]);

    const handleColorChange = (colorItem: IProductColor) => {
        setCount(1);
        const qs = new URLSearchParams(params);
        // qs.set("color", colorItem.color);
        // qs.set("colorName", colorItem.colorName);
        qs.set("colorId", colorItem.id.toString());
        qs.delete("size");
        router.push(`?${qs.toString()}`, {scroll: false});
    };

    const handleSizeChange = (size: string) => {
        setCount(1);
        const qs = new URLSearchParams(params);
        qs.set("size", size);
        router.push(`?${qs.toString()}`, {scroll: false});
    };

    const handleAddToCart = () => {
        if (!selectedSize && selectedProductColor.sizes.length > 1) {
            toast("Виберіть розмір", {
                icon: "⚠️",
            })
            return
        }
        else if (!selectedSizeAvailable) {
            toast.error("Цього варіанта вже немає в наявності");
            return;
        }
        else if (maximumToAdd !== null && maximumToAdd !== undefined && count > maximumToAdd) {
            setCount(Math.max(1, maximumToAdd));
            toast.error("Обрана кількість недоступна. Кількість скориговано");
            return;
        }

        cart.addItem({
            ...createProductSelection(
                product,
                product.colors.findIndex(
                    c => c.id === selectedProductColor.id
                )
            ),
            quantity: count,
            size: selectedSize,
            isDecoration: product.category?.isDecoration || false
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

    return (
        <>
            <div className="text-sm font-medium text-zinc-600 ">
                <p>Виберіть колір:</p>
            </div>

            <div className="flex mt-2 gap-4">
                <div className="flex flex-wrap gap-1.5">
                    {product.colors.map((c, index) => (
                        <div
                            key={c.color+index}
                            onClick={() => handleColorChange(c)}
                            className="border rounded-xl overflow-hidden cursor-pointer"
                            style={{
                                borderWidth: selectedColorHex === c.color ? "2px" : "1px",
                                borderColor: selectedColorHex === c.color ? "#823D9A" : "#000000",
                            }}>
                            <Image
                                src={optimizeCloudinaryUrl(c.images[0].url, 140)}
                                width={70} height={70}
                                draggable={false}
                                className="object-contain aspect-square mx-auto select-none hover:scale-110 transition"
                                alt="ProductImage"
                                quality={100}
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
            </div>

            {
                selectedProductColor.sizes.length > 1 &&
                <div className="mt-auto">
                    <div className="flex justify-between text-sm font-medium text-zinc-600 mt-6">
                        <p>Виберіть розмір:</p>
                        <p
                            className="text-sm text-primary font-medium underline decoration-[1.5px] cursor-pointer"
                            onClick={() => sizesModal.onOpen()}
                        >
                            Розмірна сітка
                        </p>
                    </div>

                    <div className="flex gap-2 mt-2">
                        {selectedProductColor.sizes.map((s) => (
                            <div
                                key={s.id}
                                style={{
                                    borderWidth: selectedSize === s.size ? "2px" : "1px",
                                    borderColor: selectedSize === s.size ? "#823D9A" : "#454649",
                                    color: selectedSize === s.size ? "#823D9A" : "#454649",
                                    opacity: s.available && (s.quantity === null || s.quantity > 0) ? 1 : 0.4,
                                    cursor: s.available && (s.quantity === null || s.quantity > 0) ? "pointer" : "not-allowed",
                                }}
                                className="rounded-lg py-0.5 px-4 font-medium select-none"
                                onClick={() => s.available && (s.quantity === null || s.quantity > 0) && handleSizeChange(s.size)}
                            >
                                {s.size}
                            </div>
                        ))}
                    </div>
                </div>
            }
            {
                hasLining &&
                <div className="mt-5">
                    <div className="flex gap-2 mb-3">
                        <CheckBox
                            label="Додати підкладку"
                            colorOnChecked={"text-primary"}
                            // labelStyle="text-sm"
                            onChange={() => setIncludeLining(value => !value)}
                        />
                        {/*<ToolTip label="z vkjrwlkfglwrfwfwf">*/}
                        {/*    <BiSolidInfoCircle className="size-6 text-primary"/>*/}
                        {/*</ToolTip>*/}
                    </div>
                    <hr className="text-gray-300 -mx-4 mt-2"/>
                </div>
            }

            <div
                style={{
                    marginTop:
                        !hasLining && selectedProductColor.sizes.length <= 1
                            ? "auto"
                            : selectedProductColor.sizes.length > 1
                                ? "8px"
                                : "24px",
                }}
                className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-center">
                <div className="flex gap-5 items-end">

                    <div className="flex gap-1.5 items-center">
                    <span className="text-2xl lg:text-[36px] font-medium">
                    {discountedPrice.toFixed()}
                    </span>
                        <span className="text-[13px] lg:text-base lg:pt-1 self-start font-medium">грн</span>
                    </div>
                    {product.discount && product.discount > 0 ? (
                        <div className="flex flex-col items-start pb-1">
                            <span className="text-lg md:text-xl text-red-500 font-semibold">-{product.discount}%</span>
                            <span className="text-sm md:text-base text-gray-400 line-through">
                            {basePrice.toFixed()} грн
                        </span>
                        </div>
                    ) : null}
                    <Counter
                        initialNumber={count}
                        max={maximumToAdd === 0 ? 1 : maximumToAdd}
                        disabled={!selectedSizeAvailable || maximumToAdd === 0}
                        onChange={setCount}
                        onMaxReached={() => toast.error("Більше товару зараз немає в наявності")}
                    />

                </div>
                <div className="flex justify-between w-full mt-1">
                    <Button
                        label="Додати до кошика"
                        disabled={!isAvailable || maximumToAdd === 0}
                        onClick={() => handleAddToCart()}
                    />
                </div>
            </div>
        </>
    );
};

export default ChooseVariant;
