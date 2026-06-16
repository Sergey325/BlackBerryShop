import Image from "next/image";
import {useRouter, useSearchParams} from "next/navigation";
import {IProduct} from "@/app/actions/getProducts";

type Props = {
    product: IProduct
    isSelected: boolean;
}

const ProductCard = ({product, isSelected}: Props) => {
    const params = useSearchParams()
    const router = useRouter()

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