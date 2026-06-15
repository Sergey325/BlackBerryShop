import Image from "next/image";
import {useRouter, useSearchParams} from "next/navigation";
import {useCallback} from "react";
import qs from "query-string";
import useUrlParam from "@/app/hooks/useUrlParams";
import {IProduct} from "@/app/actions/getProducts";

type Props = {
    product: IProduct
    isSelected: boolean;
}

const ProductCard = ({product, isSelected}: Props) => {
    const params = useSearchParams()
    const router = useRouter()

    // const handleClick = useCallback(() => {
    //     // let currentQuery = {};
    //     //
    //     // if (params) {
    //     //     currentQuery = qs.parse(params.toString());
    //     // }
    //
    //     const query: any = {
    //         product: product.slug,
    //         size: product.variants[0].size,
    //         color: product.variants[0].color,
    //
    //     };
    //
    //     const url = qs.stringifyUrl(
    //         {
    //             url: '/',
    //             query: query,
    //         },
    //         { skipNull: true }
    //     );
    //
    //     router.push(url);
    // }, [product, params, router]);

    return (
        <div
            onClick={() => {
                const qs = new URLSearchParams(params);

                qs.set("product", product.slug || "");
                qs.set("size", product.variants[0].size);
                qs.set("color", product.variants[0].color);

                router.push(`?${qs.toString()}`);
            }}
            className="border rounded-xl overflow-hidden cursor-pointer "
            style={{
                borderWidth: isSelected ? "2px" : "1px",
                borderColor: isSelected ? "#823D9A" : "#000000",
            }}>
            <Image
                src={product.images[0].url}
                width={70} height={70}

                className="object-contain aspect-square mx-auto select-none hover:scale-110 transition"
                alt="ProductImage"
                quality={100}
                priority
            />
        </div>
    );
};

export default ProductCard;