'use client';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { IProduct } from '@/app/actions/getProducts';
import {CustomNext, CustomPrev} from "@/app/components/homePage/BestSellers";
import {useRef} from "react";
import Image from "next/image";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import Link from "next/link";

const responsive = {
    desktop:  { breakpoint: { max: 3000, min: 1280 }, items: 5 },
    laptop:   { breakpoint: { max: 1280, min: 1024 }, items: 4 },
    tablet:   { breakpoint: { max: 1024, min: 640  }, items: 3 },
    mobile:   { breakpoint: { max: 640,  min: 0    }, items: 2 },
};

type Props = {
    title: string;
    products: IProduct[];
};

export default function ProductCarouselRow({ title, products }: Props) {
    const carouselRef = useRef<Carousel | null>(null);

    const start = useRef({ x: 0, y: 0 });
    const dragged = useRef(false);

    const THRESHOLD = 8;

    if (!products.length) return null;

    return (
        <section className="w-full relative">
            <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-3">
                {title}
            </h2>
            <CustomPrev onClick={() => carouselRef.current?.previous(1)} />
            <Carousel
                responsive={responsive}
                infinite
                swipeable
                draggable
                ref={carouselRef}
                showDots={false}
                arrows={false}
                itemClass="px-1.5"
            >
                {products.map(p => (
                    <div key={p.id+title} className="py-1">
                        <Link
                            draggable={false}
                            onMouseDown={(e) => {
                                start.current = { x: e.clientX, y: e.clientY };
                                dragged.current = false;
                            }}
                            onMouseMove={(e) => {
                                if (
                                    Math.abs(e.clientX - start.current.x) > THRESHOLD ||
                                    Math.abs(e.clientY - start.current.y) > THRESHOLD
                                ) {
                                    dragged.current = true;
                                }
                            }}
                            onClick={(e) => {
                                if (dragged.current) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }}
                            href={`/catalog/${p.category?.slug || ""}/${p.id}`}
                            className="bg-white rounded-2xl overflow-hidden border border-primary/50
                               shadow-sm hover:shadow-md hover:-translate-y-0.5
                               transition-all duration-200 group select-none cursor-pointer
                               w-full max-w-[280px]  mx-auto flex flex-col justify-between relative
                            "
                        >
                            {/* Product image */}
                            <div
                                className="aspect-square relative bg-white rounded-t-lg flex items-center justify-center ">
                                <Image
                                    src={optimizeCloudinaryUrl(p.colors[0].images[0].url, 500)}
                                    alt={p.name}
                                    fill unoptimized
                                    draggable={false}
                                    className="object-contain w-full h-full rounded-lg p-0"
                                />
                            </div>

                            {/* Info row */}
                                <div className=" min-w-0 flex flex-col w-full gap-1 bg-primary/7 pb-1 px-2">

                                    <p className="text-[12px] sm:text-sm text-slate-900 font-medium min-h-[40px]">
                                        {p.name}
                                    </p>

                                    <div className="flex justify-between items-center w-full">
                                        <p className="font-bold text-gray-900 text-xs sm:text-sm">
                                            {p.price} грн
                                        </p>
                                    </div>

                                </div>
                        </Link>
                        {/*<ProductCard  product={p}/>*/}
                    </div>
                ))}
            </Carousel>
            <CustomNext onClick={() => carouselRef.current?.next(1)} />
        </section>
    );
}