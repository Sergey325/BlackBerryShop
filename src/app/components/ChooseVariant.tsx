import {IProduct} from "@/app/actions/getProducts";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import qs from "query-string";
import Accordion from "@/app/components/Accordion";

type Props = {
    product: IProduct
}

const ChooseVariant = ({product}: Props) => {
    const params = useSearchParams()
    const router = useRouter()
    const productNameFromUrl = params?.get("product")
    const selectedSize = params.get("size") ?? product.variants[0].size;
    const selectedColor = params.get("color") ?? product.variants[0].color;

    const uniqueSizes = [...new Set(product.variants.map(v => v.size))];

    const uniqueColors = [
        ...new Set(
            product.variants
                .filter(v => v.size === selectedSize)
                .map(v => v.color)
        )
    ];

    useEffect(() => {
        if (!product?.slug) return;

        if (!productNameFromUrl) {
            router.replace(
                qs.stringifyUrl({
                    url: '/',
                    query: {
                        product: product.slug,
                        size: selectedSize,
                        color: selectedColor,
                    },
                }, { skipNull: true })
            );
        }
    }, [product?.slug, productNameFromUrl, router, selectedColor, selectedSize]);

    return (
        <>
            <div className="flex justify-between text-sm font-medium text-zinc-600">
                <p className="">Виберіть варіант:</p>
                <p className="text-sm text-[#823D9A] font-medium underline decoration-[1.5px] cursor-pointer">Розмірна сітка</p>
            </div>
            <div className="flex gap-2">
                {uniqueSizes.map((size, index) => {
                    return (
                        <div
                            style={{
                                borderWidth: selectedSize === size ? "2px" : "1px",
                                borderColor: selectedSize === size ? "#823D9A" : "#454649",
                                color: selectedSize === size ? "#823D9A" : "#454649"
                            }}
                            className="border border-[#823D9A] rounded-sm py-0.5 px-4  font-medium text-[#823D9A] cursor-pointer"
                            key={size+index}
                            onClick={() => {
                                const qs = new URLSearchParams(params);
                                qs.set("size", size);
                                qs.set("color", product?.variants?.find(v => v.size === size)?.color ?? "");
                                router.push(`?${qs.toString()}`);
                            }}
                        >
                            {size}
                        </div>
                    )
                })}
            </div>
            <div className="flex gap-4 mt-4">
                {uniqueColors.map((color) => {
                    console.log(product.variants.find(v => v.color === color));
                    return (
                        <div
                            style={{
                                borderWidth: selectedColor === color ? "2px" : "1px",
                                borderColor: selectedColor === color ? "#823D9A" : "#000000",
                                color: selectedColor === color ? "#823D9A" : "#000000",
                                backgroundColor: color,
                                transform: selectedColor === color ? "scale(1.4)" : "scale(1)",
                                transition: "transform 0.15s ease"
                            }}
                            className="border border-[#823D9A] rounded-full size-5 text-[#823D9A] cursor-pointer scale-100 "
                            key={color}
                            onClick={() => {
                                const qs = new URLSearchParams(params);
                                qs.set("color", color);

                                router.push(`?${qs.toString()}`);
                            }}
                        >
                        </div>
                    )
                })}
            </div>

        </>
    );
};

export default ChooseVariant;