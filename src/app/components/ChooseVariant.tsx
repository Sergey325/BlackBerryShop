"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {IProduct, IProductColor} from "@/app/actions/getProducts";
import {calculatePriceWithDiscount} from "@/app/utils/getTotalPrice";
import Counter from "@/app/components/reusable/Counter";
import Button from "@/app/components/reusable/Button";
import useCartModal from "@/app/hooks/useCartModal";
import {useCartStore} from "@/app/hooks/useCartStore";
import useSizesModal from "@/app/hooks/useSizesModal";
import {trackMetaEvent} from "@/app/lib/analytics/meta";
import toast from "react-hot-toast";

type Props = {
    product: IProduct;
    selectedProductColor: IProductColor;
};

const ChooseVariant = ({ product, selectedProductColor }: Props) => {
    const params = useSearchParams();
    const router = useRouter();

    const sizesModal = useSizesModal()

    // Цвет — главный селектор
    const selectedColorHex = selectedProductColor.color;

    // Размер зависит от выбранного цвета
    const selectedSize = params.get("size") ?? "";
    const productNameFromUrl = params?.get("product");

    const cartModal = useCartModal();
    const cart = useCartStore();
    const [count, setCount] = useState(1);

    const selectedSizeObj = selectedProductColor.sizes.find(
        (s) => s.size === selectedSize
    );

    useEffect(() => {
        if (!productNameFromUrl) {
            const qs = new URLSearchParams(params);
            qs.set("product", product.slug);
            qs.set("productId", product.id.toString());
            qs.set("color", selectedColorHex);
            if (selectedSize) qs.set("size", selectedSize);
            router.replace(`?${qs.toString()}`);
        }
    }, [productNameFromUrl]);

    const handleColorChange = (colorItem: IProductColor) => {
        const qs = new URLSearchParams(params);
        qs.set("color", colorItem.color);
        qs.set("colorName", colorItem.colorName);
        qs.delete("size");
        router.push(`?${qs.toString()}`);
    };

    const handleSizeChange = (size: string) => {
        const qs = new URLSearchParams(params);
        qs.set("size", size);
        router.push(`?${qs.toString()}`);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast("Виберіть розмір", {
                icon: "⚠️",
            })
            return
        }
        else if (!selectedSizeObj?.available) return;

        cart.addItem({
            productId: product.id,
            productColorId: selectedProductColor.id,
            quantity: count,
            size: selectedSize!,
            color: selectedColorHex,
            colorName: selectedProductColor.colorName,
            discount: product.discount,
            photoUrl: selectedProductColor.images[0]?.url ?? "",
            price: product.price,
            productName: product.name.replace(/\s+(\S+)$/,` ${selectedProductColor.colorName}, $1`),
            slug: product.slug,
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
            <div className="flex justify-between text-sm font-medium text-zinc-600">
                <p>Виберіть колір:</p>
                <p
                    className="text-sm text-[#823D9A] font-medium underline decoration-[1.5px] cursor-pointer"
                   onClick={() => sizesModal.onOpen()}
                >
                    Розмірна сітка
                </p>
            </div>

            <div className="flex mt-5 gap-4">
                {product.colors.map((c) => (
                    <div
                        key={c.id+c.colorName}
                        style={{
                            borderWidth: selectedProductColor.color === c.color && selectedProductColor.colorName === c.colorName ? "2px" : "1px",
                            borderColor: selectedProductColor.color === c.color && selectedProductColor.colorName === c.colorName ? "#823D9A" : "#000000",
                            backgroundColor: c.color,
                            transform: selectedProductColor.color === c.color && selectedProductColor.colorName === c.colorName ? "scale(1.4)" : "scale(1)",
                            transition: "transform 0.15s ease",
                        }}
                        className="rounded-full size-6 cursor-pointer"
                        onClick={() => handleColorChange(c)}
                    />
                ))}
            </div>

            <div className="flex justify-between text-sm font-medium text-zinc-600 mt-6">
                <p>Виберіть розмір:</p>
            </div>

            <div className="flex gap-2">
                {selectedProductColor.sizes.map((s) => (
                    <div
                        key={s.id}
                        style={{
                            borderWidth: selectedSize === s.size ? "2px" : "1px",
                            borderColor: selectedSize === s.size ? "#823D9A" : "#454649",
                            color: selectedSize === s.size ? "#823D9A" : "#454649",
                            opacity: s.available ? 1 : 0.4,
                            cursor: s.available ? "pointer" : "not-allowed",
                        }}
                        className="rounded-sm py-0.5 px-4 font-medium select-none"
                        onClick={() => s.available && handleSizeChange(s.size)}
                    >
                        {s.size}
                    </div>
                ))}
            </div>

            <div className="flex gap-4 items-center mt-12">
                <div className="flex gap-3 items-end">
                    <div className="flex gap-1.5 items-center">
                        <span className="text-2xl lg:text-[36px] font-medium">
                        {calculatePriceWithDiscount(product.price, product.discount ?? 0).toFixed()}
                        </span>
                        <span className="text-[13px] lg:text-base lg:pt-1 self-start font-medium">грн</span>
                    </div>
                        {product.discount && product.discount > 0 ? (
                        <div className="flex flex-col items-start pb-1">
                            <span className="text-lg md:text-xl text-red-500 font-semibold">-{product.discount}%</span>
                            <span className="text-sm md:text-base text-gray-400 line-through">
                                {product.price.toFixed()} грн
                            </span>
                        </div>
                    ) : null}
                </div>
                <Counter initialNumber={count} onChange={setCount} />
            </div>

            <div className="flex justify-between mt-4 mb-1">
                <Button
                    label="Додати до кошика"
                    onClick={() => handleAddToCart()}
                />
            </div>
        </>
    );
};

export default ChooseVariant;