"use client"

import {IProduct} from "@/app/actions/getProducts";
import ProductImages from "@/app/components/ProductImages";
import {useMemo} from "react";
import {useSearchParams} from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import ChooseVariant from "@/app/components/ChooseVariant";
import Accordion from "@/app/components/reusable/Accordion";

type Props = {
    products: IProduct[]
}


const specifications = [
    {
        name: "Матеріал",
        value: "100% бавовна",
    },
    {
        name: "Модель",
        value: "Унісекс",
    },
    {
        name: "Розміри",
        value: "Дитячий, дорослий",
    },
    {
        name: "Сезон",
        value: "Весна / літо",
    },
    {
        name: "Особливості",
        value: "Захист від сонця, унікальний дизайн",
    },
    {
        name: "Догляд",
        value: "Рекомендоване делікатне прання, при температурі не вище 30 градусів",
    },
]

const StoreClient = ({ products }: Props) => {
    const params = useSearchParams();

    const product = useMemo(() => {
        return products.find(p => p.id === Number(params.get("productId"))) ?? products[0];
    }, [params, products]);

    // Выбранный цвет — на уровне родителя, чтобы шарить между ProductImages и ChooseVariant
    const selectedColorHex = params.get("color") ?? product.colors[0]?.color;
    const selectedColorName = params.get("colorName") ?? product.colors[0]?.colorName;
    const selectedProductColor = useMemo(() => {
        return product.colors.find(c => c.color === selectedColorHex && c.colorName === selectedColorName) ?? product.colors[0];
    }, [product, selectedColorHex]);


    return (
        <div className="max-w-[1366px] mx-auto flex flex-col items-center mt-6 gap-4">
            <div className="border border-gray-200 rounded-sm py-3 px-2 lg:p-4 w-full bg-white">
                <p className="text-lg lg:text-[28px] font-medium">
                    {product.name.replace(
                    /\s+(\S+)$/,
                    ` ${selectedProductColor.colorName}, $1`
                    )}
                </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-4 w-full bg-transparent">
                <div className="bg-white p-4 border border-gray-200 rounded-sm basis-3/5">
                    <ProductImages key={selectedProductColor.id} productColor={selectedProductColor} />
                </div>
                <div className="flex flex-col basis-2/5">
                    <div className="bg-white border border-b-2 border-gray-200 rounded-t-sm flex flex-col p-4 gap-2 w-full">
                        <div className="px-1 border border-gray-400 rounded-sm max-w-min font-medium text-sm md:text-base">
                            <p>Унісекс</p>
                        </div>
                        {/*<StarRating rating={rating} onChange={setRating} />*/}
                        <p className="text-sm md:text-base text-green-700 font-medium">В наявності</p>
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col p-4 gap-2 w-full">
                        <div className="flex flex-wrap gap-1.5">
                            {products.map((p, index) => (
                                <ProductCard product={p} isSelected={p.id === product.id} key={index} />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col p-4 gap-1 w-full">
                        <ChooseVariant product={product} selectedProductColor={selectedProductColor} />
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col gap-2 w-full p-4">
                        <Accordion title={"Способи доставки"} content={["Доставка у відділення - Нова Пошта"]}/>
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 rounded-b-sm flex flex-col gap-2 w-full p-4">
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
            <div className="bg-white border border-gray-200 flex flex-col justify-center text-base font-semibold  items-center w-full">
                <div className="bg-white border-b-2 border-gray-200 flex justify-center text-base font-semibold  items-center w-full ">
                    <div
                        className={`py-4 text-center w-full border-r border-gray-200`}
                        // onClick={() => setTab("description")}
                    >
                        <span className="hidden md:block">Опис</span>
                        <span className="block md:hidden">Опис та характеристики</span>
                    </div>
                    <div
                        className={`hidden md:block py-4 text-center w-full border-l border-gray-200`}
                        // onClick={() => setTab("specifications")}
                    >
                        Характеристики
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row w-full">
                    <div className="flex-1 w-full border-r border-gray-200 p-6 flex flex-col gap-4">

                        <p className="font-normal text-sm md:text-base lg:text-lg whitespace-pre-line">
                            {product.description}
                        </p>
                    </div>
                    <div className="flex-1 w-full border-l border-gray-200 p-6 flex flex-col gap-6">
                        {
                            specifications.map((p, index) => (
                                <div key={index} className="">
                                    <div className="flex flex-row justify-between items-center w-full font-normal text-sm md:text-base">
                                        <p className="w-2/6">
                                            {p.name}
                                        </p>
                                        <p className="text-right w-4/6 font-medium">
                                            {p.value}
                                        </p>
                                    </div>
                                    <hr className="border-gray-400 mt-2"/>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StoreClient;