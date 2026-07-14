'use client';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { IProduct } from '@/app/actions/getProducts';
import ProductCard from "@/app/(pages)/catalog/[category]/components/ProductCard";
import {CustomNext, CustomPrev} from "@/app/components/homePage/BestSellers";
import {useRef} from "react";

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
                        <ProductCard  product={p}/>
                    </div>
                ))}
            </Carousel>
            <CustomNext onClick={() => carouselRef.current?.next(1)} />
        </section>
    );
}