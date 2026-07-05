import {useState} from "react";
import {IProduct} from "@/app/actions/getProducts";
import Image from "next/image";
import {FiShoppingCart} from "react-icons/fi";

type Props = {
    product: IProduct;
    list?: boolean
};

const ProductCard = ({ product, list = false }: Props) => {
    const [activeIdx, setActiveIdx] = useState(0);

    if (list) {
        return (
            <div
                className="flex gap-4 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-3">
                <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <Image src={product.colors[activeIdx].images[0].url} alt={product.name} fill
                           className="object-cover"/>
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                        <div className="flex gap-1.5 mt-2">
                            {product.colors.map((c, i) => (
                                <button key={i}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        onClick={() => setActiveIdx(i)}
                                        className={`size-5 rounded-full border-2 transition-transform hover:scale-110 ${activeIdx === i ? 'border-primary scale-110' : 'border-white'} shadow-sm`}
                                        style={{backgroundColor: c.color}}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900">{product.price} грн</p>
                        <button
                            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                            <FiShoppingCart className="size-4"/>
                            До кошика
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                    src={product.colors[activeIdx].images[0].url}
                    alt={product.name}
                    fill
                    quality={25}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Color swatches */}
                <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                    {product.colors.map((c, i) => (
                        <button
                            key={i}
                            onMouseEnter={() => setActiveIdx(i)}
                            onClick={() => setActiveIdx(i)}
                            className={`w-4 h-4 rounded-full border-2 shadow-sm transition-transform hover:scale-125 ${
                                activeIdx === i ? 'border-white scale-125' : 'border-white/50'
                            }`}
                            style={{ backgroundColor: c.color }}
                            aria-label={`Колір ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Info row */}
            <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{product.name}</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{product.price} грн</p>
                </div>
                <button className="shrink-0 w-9 h-9 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
                    <FiShoppingCart className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;