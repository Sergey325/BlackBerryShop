"use client"

import ProductImages from "@/app/(pages)/catalog/[category]/[productId]/components/ProductImages";
import {useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import ChooseVariant from "@/app/(pages)/catalog/[category]/[productId]/components/ChooseVariant";
import Accordion from "@/app/components/reusable/Accordion";
import {ICategory} from "@/app/actions/getCategories";
import {IProductWithRelated} from "@/app/actions/getProductById";
import RelatedAndCustomization from "@/app/(pages)/catalog/[category]/[productId]/components/RelatedAndCustomization";
import Link from "next/link";

type Props = {
    product: IProductWithRelated
    category: ICategory;
}


const ProductClient = ({ product, category }: Props) => {
    const params = useSearchParams();
    const displayedDescription: string = product.description || category.productsDescription;
    const firstSentenceMatch: RegExpMatchArray | null = displayedDescription.match(/^[\s\S]*?[.!?](?=\s|$)/);
    const snippetDescription: string = firstSentenceMatch?.[0] ?? displayedDescription;
    const remainingDescription: string = displayedDescription.slice(snippetDescription.length);
    const specifications: ICategory["specifications"] = useMemo(() => {
        const overrideBySpecificationId: Map<number, string> = new Map(
            product.specificationOverrides.map((override): [number, string] => [
                override.categorySpecificationId,
                override.value,
            ])
        );

        return category.specifications.map((specification) => ({
            ...specification,
            value: overrideBySpecificationId.get(specification.id) ?? specification.value,
        }));
    }, [category.specifications, product.specificationOverrides]);

    const [tab, setTab] = useState<"description" | "specifications">("description");

    // ProductColor.id uniquely identifies the variant. Catalog color codes do
    // not: one multicolor variant can have several of them.
    const colorIdParam: string | null = params.get("colorId");
    const selectedColorId: number | null = colorIdParam !== null && /^\d+$/.test(colorIdParam)
        ? Number(colorIdParam)
        : null;
    const legacyColorHex: string | null = params.get("color");
    const selectedSize: string | null = params.get("size");
    const [selectedProductColor, isAvailable, lowStockQuantity] = useMemo(() => {
        const color =
            product.colors.find((productColor) => productColor.id === selectedColorId)
            ?? product.colors.find((productColor) => productColor.color === legacyColorHex)
            ?? product.colors[0];
        const size = color.sizes.find(item => item.size === selectedSize)
            ?? (color.sizes.length === 1 ? color.sizes[0] : undefined);

        return [
            color,
            size
                ? size.available && (size.quantity === null || size.quantity > 0)
                : color.sizes.some(item => item.available && (item.quantity === null || item.quantity > 0)),
            size?.quantity !== null && size?.quantity !== undefined && size.quantity <= 10 && size.quantity > 0
                ? size.quantity
                : null,
        ] as const;
    }, [legacyColorHex, product.colors, selectedColorId, selectedSize]);

    return (
        <div className="max-w-[1366px] mx-auto flex flex-col items-center mt-6 gap-4">
            <nav className="flex items-center gap-1.5 text-sm text-gray-400 self-start max-w-full">
                <Link href="/" className="hover:text-gray-600 transition-colors">Головна</Link>
                <span>›</span>
                <Link href="/catalog" className="hover:text-gray-600 transition-colors">Каталог</Link>
                <span>›</span>
                <Link href={`/catalog/${category.slug}`} className="hover:text-gray-600 transition-colors text-nowrap truncate">{category.name}</Link>
                <span>›</span>
                <span className="text-gray-700 truncate">{product.name}</span>
            </nav>
            <div className="border border-gray-200 rounded-xl py-3 px-2 lg:p-4 w-full bg-white shadow-xs">
                <h1 className="text-lg lg:text-[28px] font-medium">
                    {product.name}
                    {/*{product.name.includes(" ")*/}
                    {/*    ? product.name.replace(*/}
                    {/*        /\s+(\S+)$/,*/}
                    {/*        ` ${selectedProductColor.colorName}, $1`*/}
                    {/*    )*/}
                    {/*    : `${product.name} ${selectedProductColor.colorName}`*/}
                    {/*}*/}
                </h1>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 md:gap-10 lg:gap-4 items-stretch w-full bg-transparent">
                <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs basis-1/2">
                    <ProductImages
                        key={selectedProductColor.id}
                        productName={product.name}
                        productColor={selectedProductColor}
                    />
                </div>
                <div className="flex flex-col basis-1/2 self-stretch rounded-xl shadow-xs">
                    <div className="bg-white border border-b-2 border-gray-200 rounded-t-xl flex flex-col p-4 gap-2 w-full">
                        <div className="px-1 border border-gray-400 rounded-md max-w-min font-medium text-sm md:text-base">
                            <p>Унісекс</p>
                        </div>
                        {/*<StarRating rating={rating} onChange={setRating} />*/}
                        {
                            isAvailable
                                ?
                                <p className="text-sm md:text-base text-green-700 font-medium">
                                    {lowStockQuantity !== null
                                        ? `В наявності — залишилося ${lowStockQuantity} шт.`
                                        : "В наявності"}
                                </p>
                                :
                                <p className="text-sm md:text-base text-red-700 font-medium">Не в наявності</p>

                        }
                    </div>
                    <div className="bg-white flex-1 border border-y-2 border-gray-200 flex flex-col p-4 gap-1 w-full">
                        <ChooseVariant
                            product={product}
                            selectedProductColor={selectedProductColor}
                            hasLining={product.hasLining}
                            isAvailable={isAvailable}
                        />
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col gap-2 w-full p-4">
                        <Accordion
                            title={"Способи доставки"}
                            content={["Доставка у відділення або поштомат - Нова Пошта"]}
                            initialState={product.category?.isDecoration || false}
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
                            initialState={product.category?.isDecoration || false}
                        />
                    </div>
                </div>
            </div>

            <RelatedAndCustomization
                related={product.relatedTo}
                selectedCatalogColorCodes={selectedProductColor.filterColors.map(
                    (filterColor): string => filterColor.catalogColor.code
                )}
            />

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
                        className={`py-4 text-center flex-1 font-semibold transition-colors text-sm md:text-base cursor-pointer
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
                            {snippetDescription}
                            {remainingDescription && <span data-nosnippet>{remainingDescription}</span>}
                        </p>
                    )}
                    {tab === 'specifications' && (() => {
                        const specs = [{ name: 'Матеріал', value: product.material?.name }, ...specifications];
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
