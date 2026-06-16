"use client"

import {IProduct} from "@/app/actions/getProducts";
import ProductImages from "@/app/components/ProductImages";
import StarRating from "@/app/components/StarRating";
import {useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import ChooseVariant from "@/app/components/ChooseVariant";
import Accordion from "@/app/components/Accordion";

type Props = {
    products: IProduct[]
}

const StoreClient =({products}: Props)=> {
    const params = useSearchParams()

    const product = useMemo(() => {
        return products.find(p => p.slug === params.get("product")) ?? products[0];
    }, [params, products]);

    const [rating, setRating] = useState(0);

    const productsDev = [...products, ...products, ...products, ...products, ...products, ...products, ...products, ...products, ...products, ...products ];


    return (
        <div className="max-w-[1366px] mx-auto flex flex-col items-center mt-6 gap-8 ">
            <div className="border border-gray-200 rounded-sm p-4 w-full bg-white">
                <p className="text-[28px] font-medium">Панама GIG Ranger Ears з вушками. Tiger Stripe Pink</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-4 w-full bg-transparent">
                <div className="bg-white p-4 border border-gray-200 rounded-sm basis-3/5">
                    <ProductImages key={product.slug} product={product}/>
                </div>
                <div className=" flex flex-col basis-2/5">
                    {/*<DevCreateProductBtn/>*/}
                    <div className="bg-white border border-b-2 border-gray-200 rounded-t-sm rounded- flex flex-col p-4 gap-2 w-full">
                        <StarRating rating={rating} onChange={setRating} />
                        <p className="text-sm text-green-700 font-medium">В наявності</p>
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col p-4 gap-2 w-full">
                        <div className="flex flex-wrap gap-1.5">
                            {productsDev.map((p, index) => {
                                return <ProductCard product={p} isSelected={p.slug === product.slug} key={index}/>
                            })}
                        </div>
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col p-4 gap-1 w-full">
                        <ChooseVariant product={product}/>

                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 flex flex-col gap-2 w-full">
                        <Accordion title={"Способи доставки"} content={["Доставка у відділення - Нова Пошта", "Доставка за адресами (кур'єром) - Нова Пошта"]}/>
                    </div>
                    <div className="bg-white border border-y-2 border-gray-200 rounded-b-sm flex flex-col gap-2 w-full">
                        <Accordion
                            title={"Способи оплати"}
                            content={[
                                "Оплата карткою через Liqpay.com",
                                "Apple pay, Google pay",
                                "Оплата післяплатою",
                                "Оплата на розрахунковий рахунок ФОП"
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StoreClient;