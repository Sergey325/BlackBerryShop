"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {IProduct, IProductColor} from "@/app/actions/getProducts";
import {calculatePriceWithDiscount} from "@/app/utils/getTotalPrice";
import Counter from "@/app/components/reusable/Counter";
import Button from "@/app/components/reusable/Button";
import useCartModal from "@/app/hooks/useCartModal";
import {useCartStore} from "@/app/hooks/useCartStore";

type Props = {
    product: IProduct;
    selectedProductColor: IProductColor;
};

const ChooseVariant = ({ product, selectedProductColor }: Props) => {
    const params = useSearchParams();
    const router = useRouter();

    // Цвет — главный селектор
    const selectedColorHex = selectedProductColor.color;

    // Размер зависит от выбранного цвета
    const selectedSize = params.get("size") ?? selectedProductColor.sizes[0]?.size;
    const productNameFromUrl = params?.get("product");

    const cartModal = useCartModal();
    const cart = useCartStore();
    const [count, setCount] = useState(1);


    // const selectedColorHex = params.get("color") ?? product.colors[0].color;
    // const selectedProductColor = product.colors.find((c) => c.color === selectedColorHex) ?? product.colors[0];

    //
    // const selectedSize =
    //     params.get("size") ?? selectedProductColor.sizes[0]?.size;

    const selectedSizeObj = selectedProductColor.sizes.find(
        (s) => s.size === selectedSize
    );

    useEffect(() => {
        if (!productNameFromUrl) {
            const qs = new URLSearchParams(params);
            qs.set("product", product.slug);
            qs.set("color", selectedColorHex);
            qs.set("size", selectedSize ?? "");
            router.replace(`?${qs.toString()}`);
        }
    }, [productNameFromUrl]);

    const handleColorChange = (color: string) => {
        const newColor = product.colors.find((c) => c.color === color)!;
        const qs = new URLSearchParams(params);
        qs.set("color", color);
        qs.set("size", newColor.sizes[0]?.size ?? "");
        router.push(`?${qs.toString()}`);
    };

    const handleSizeChange = (size: string) => {
        const qs = new URLSearchParams(params);
        qs.set("size", size);
        router.push(`?${qs.toString()}`);
    };

    return (
        <>
            <div className="flex justify-between text-sm font-medium text-zinc-600">
                <p>Виберіть колір:</p>
            </div>

            <div className="flex gap-4">
                {product.colors.map((c) => (
                    <div
                        key={c.id}
                        style={{
                            borderWidth: selectedColorHex === c.color ? "2px" : "1px",
                            borderColor: selectedColorHex === c.color ? "#823D9A" : "#000000",
                            backgroundColor: c.color,
                            transform: selectedColorHex === c.color ? "scale(1.4)" : "scale(1)",
                            transition: "transform 0.15s ease",
                        }}
                        className="rounded-full size-5 cursor-pointer"
                        onClick={() => handleColorChange(c.color)}
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
                        className="rounded-sm py-0.5 px-4 font-medium"
                        onClick={() => s.available && handleSizeChange(s.size)}
                    >
                        {s.size}
                    </div>
                ))}
            </div>

            <div className="flex gap-4 items-center mt-12">
                <div className="flex gap-1.5 items-center">
          <span className="text-2xl lg:text-[36px] font-medium">
            {calculatePriceWithDiscount(product.price, product.discount ?? 0).toFixed()}
          </span>
                    <span className="text-[13px] lg:text-base lg:pt-1 self-start font-medium">грн</span>
                </div>
                <Counter initialNumber={count} onChange={setCount} />
            </div>

            <div className="flex justify-between mt-4 mb-1">
                <Button
                    label="Додати до кошика"
                    onClick={() => {
                        if (!selectedSizeObj?.available) return;

                        cart.addItem({
                            productId: product.id,
                            productColorId: selectedProductColor.id,
                            quantity: count,
                            size: selectedSize!,
                            color: selectedColorHex,
                            discount: product.discount,
                            photoUrl: selectedProductColor.images[0]?.url ?? "",
                            price: product.price,
                            productName: product.name,
                            slug: product.slug,
                        });
                        cartModal.onOpen();
                    }}
                />
            </div>
        </>
    );
};

export default ChooseVariant;