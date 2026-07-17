"use client"

import {IProduct} from "@/app/actions/getProducts";
import ProductImages from "@/app/(pages)/catalog/[category]/[productId]/components/ProductImages";
import {useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import ChooseVariant from "@/app/(pages)/catalog/[category]/[productId]/components/ChooseVariant";
import Accordion from "@/app/components/reusable/Accordion";
import Link from "next/link";
import {ICategory} from "@/app/actions/getCategories";
import ProductCarouselRow from "@/app/(pages)/catalog/[category]/[productId]/components/ProductCarouselRow";

type Props = {
    product: IProduct
    category: ICategory;
    products: IProduct[];
}


const ProductClient = ({ product, category, products }: Props) => {
    const params = useSearchParams();

    const [tab, setTab] = useState<"description" | "specifications">("description");

    // Выбранный цвет — на уровне родителя, чтобы шарить между ProductImages и ChooseVariant
    const selectedColorHex = params.get("color") ?? product.colors[0]?.color;
    const selectedColorName = params.get("colorName") ?? product.colors[0]?.colorName;
    const selectedProductColor = useMemo(() => {
        return product.colors.find(c => c.color === selectedColorHex && c.colorName === selectedColorName) ?? product.colors[0];
    }, [product, selectedColorHex, selectedColorName]);

    return (
        <div className="max-w-[1366px] mx-auto flex flex-col items-center mt-6 gap-4">
            <nav className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 self-start">
                <Link href="/" draggable={false} className="hover:text-gray-600 transition-colors">Головна</Link>
                <span>›</span>
                <Link href="/catalog" draggable={false} className="hover:text-gray-600 transition-colors">Каталог</Link>
                <span>›</span>
                <Link href={`/catalog/${category.slug}`} draggable={false} className="hover:text-gray-600 transition-colors">{category.name}</Link>
                <span>›</span>
                <span className="text-gray-700">{product.name}</span>
            </nav>
            <div className="border border-gray-200 rounded-xl py-3 px-2 lg:p-4 w-full bg-white shadow-xs">
                <p className="text-lg lg:text-[28px] font-medium">
                    {product.name.replace(
                    /\s+(\S+)$/,
                    ` ${selectedProductColor.colorName}, $1`
                    )}
                </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 md:gap-10 lg:gap-4 items-stretch w-full bg-transparent">
                <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs basis-1/2">
                    <ProductImages key={selectedProductColor.id} productColor={selectedProductColor} />
                </div>
                <div className="flex flex-col basis-1/2 self-stretch rounded-xl shadow-xs">
                    <div className="bg-white border border-b-2 border-gray-200 rounded-t-xl flex flex-col p-4 gap-2 w-full">
                        <div className="px-1 border border-gray-400 rounded-md max-w-min font-medium text-sm md:text-base">
                            <p>Унісекс</p>
                        </div>
                        {/*<StarRating rating={rating} onChange={setRating} />*/}
                        <p className="text-sm md:text-base text-green-700 font-medium">В наявності</p>
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col p-4 gap-1 w-full">
                        <ChooseVariant
                            product={product}
                            selectedProductColor={selectedProductColor}
                            hasLining={category.hasLining || false}// hasLining={category.specifications.some(s => s.name === "Підкладка")}
                        />
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col gap-2 w-full p-4">
                        <Accordion
                            title={"Способи доставки"}
                            content={["Доставка у відділення або поштомат - Нова Пошта"]}
                        />
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 rounded-b-xl flex flex-col gap-2 w-full p-4">
                        <Accordion
                            title={"Способи оплати"}
                            content={[
                                "Оплата карткою через Monopay",
                                "Apple pay, Google pay",
                                "Оплата післяплатою (Передплата 150 грн)",
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full gap-10">
                <ProductCarouselRow
                    title="Часто купують разом"
                    products={products}
                />
                <ProductCarouselRow
                    title="Варіанти кастомізації"
                    products={products}
                />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col w-full mt-5">
                {/* Tab bar */}
                <div className="flex border-b-2 border-gray-200">
                    <button
                        onClick={() => setTab('description')}
                        className={`py-4 text-center flex-1 text-base font-semibold transition-colors cursor-pointer
                            ${tab === 'description'
                                ? 'border-b-2 -mb-[2px] border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="hidden md:block text-sm md:text-base">Опис</span>
                        <span className="block md:hidden text-sm md:text-base">Опис</span>
                    </button>
                    <button
                        onClick={() => setTab('specifications')}
                        className={`py-4 text-center flex-1 font-semibold transition-colors text-sm md:text-base
                ${tab === 'specifications'
                            ? 'border-b-2 -mb-[2px] border-primary text-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Характеристики
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 w-full">
                    {tab === 'description' && (
                        <p className="text-sm lg:text-base whitespace-pre-line">
                            {category.productsDescription}
                        </p>
                    )}
                    {tab === 'specifications' && (() => {
                        const specs = [{ name: 'Матеріал', value: product.material?.name }, ...category.specifications];
                        const half = Math.ceil(specs.length / 2);
                        const col = (items: typeof specs) => (
                            <div className="flex-1 flex flex-col">
                                {items.map((p, i) => (
                                    <div key={i}>
                                        <div className="flex flex-col gap-1 py-1.5 text-sm md:text-base">
                                            <p className="text-gray-500 text-xs">{p.name}</p>
                                            <p className="font-normal">{p.value}</p>
                                        </div>
                                        <hr className="border-gray-200" />
                                    </div>
                                ))}
                            </div>
                        );
                        return (
                            <div className="flex flex-col md:flex-row md:gap-x-12">
                                {col(specs.slice(0, half))}
                                {col(specs.slice(half))}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

export default ProductClient;