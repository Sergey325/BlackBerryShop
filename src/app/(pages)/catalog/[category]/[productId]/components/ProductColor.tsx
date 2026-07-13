import Image from "next/image";
import {useRouter, useSearchParams} from "next/navigation";
import {IProductColor} from "@/app/actions/getProducts";
import {trackMetaEvent} from "@/app/lib/analytics/meta";

type Props = {
    color: IProductColor
    isSelected: boolean;
}

const ProductColor = ({color, isSelected}: Props) => {
    const params = useSearchParams()
    const router = useRouter()

    const firstImage = color.images[0];

    const handleColorSelect = () => {
        const qs = new URLSearchParams(params);
        // qs.set("productId", product.id.toString() || "");
        qs.set("color", color.color);
        qs.set("colorName", color.colorName);
        qs.delete("size");

        router.push(`?${qs.toString()}`);

        // trackMetaEvent("ViewContent", {
        //     content_ids: [product.id.toString()],
        //     content_name: product.name,
        //     content_type: "product",
        //     value: product.price,
        //     currency: "UAH",
        // });
    }

    return (
        <div
            onClick={() => handleColorSelect()}
            className="border rounded-xl overflow-hidden cursor-pointer"
            style={{
                borderWidth: isSelected ? "2px" : "1px",
                borderColor: isSelected ? "#823D9A" : "#000000",
            }}>
            <Image
                src={firstImage.url || ""}
                width={70} height={70}
                className="object-contain aspect-square mx-auto select-none hover:scale-110 transition"
                alt="ProductImage"
                quality={100}
                priority
            />
        </div>
    );
};

export default ProductColor;