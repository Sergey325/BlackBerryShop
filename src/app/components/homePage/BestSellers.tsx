"use client"

import {IProduct} from "@/app/actions/getProducts";
import {GoHeartFill} from "react-icons/go";
import ProductCard from "@/app/(pages)/catalog/[category]/components/ProductCard";
import CarouselWrapper from "@/app/components/reusable/CarouselWrapper";

type Props = {
    products: IProduct[];
};

// ─── Carousel config ────────────────────────────────────────────────────────
const carouselResponsive = {
    desktop:  { breakpoint: { max: 3000, min: 1280 }, items: 5, slidesToSlide: 1 },
    laptop:   { breakpoint: { max: 1280, min: 768  }, items: 4, slidesToSlide: 1 },
    tablet:   { breakpoint: { max: 768,  min: 480  }, items: 3, slidesToSlide: 1 },
    tablett:   { breakpoint: { max: 568,  min: 480  }, items: 3, slidesToSlide: 1 },
    mobile:   { breakpoint: { max: 480,  min: 0    }, items: 3, slidesToSlide: 1 },
};

const BestSellers = ({products}: Props) => {
    const bestSellerProducts = products.flatMap(product =>
        product.colors
            .filter(color => color.isBestSeller)
            .map(color => ({
                ...product,
                colors: [color],
            }))
    );

    return (
        <section className="">
            <div className="mx-auto px-4">
                <div className="flex items-center justify-between mb-4 lg:mb-6 -mx-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Хіти продажів
                        <GoHeartFill className="text-primary size-7" />
                    </h2>
                </div>

                {/* Carousel — extra horizontal padding so custom arrows don't clip */}
                <CarouselWrapper itemClass="px-1 sm:px-2" carouselClass="py-2" responsive={carouselResponsive}>
                    {bestSellerProducts.map((p, i) => (
                        <div key={p.id+i} className="py-1 h-full">
                            <ProductCard product={p}/>
                        </div>
                    ))}
                </CarouselWrapper>
            </div>
        </section>
    );
};

export default BestSellers;