"use client"

import Carousel from "react-multi-carousel";
import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io";
import {useRef} from "react";
import {IProduct} from "@/app/actions/getProducts";
import {GoHeartFill} from "react-icons/go";
import ProductCard from "@/app/(pages)/catalog/[category]/components/ProductCard";


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


// ─── Custom arrows ───────────────────────────────────────────────────────────
export const CustomPrev = ({ onClick }: { onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
               size-10 rounded-full bg-white shadow-md border border-primary/30
               flex items-center justify-center hover:border-primary transition-colors cursor-pointer"
    >
        <IoIosArrowBack className="size-5 text-gray-600 -translate-x-px" />
    </button>
);

export const CustomNext = ({ onClick }: { onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
               size-10 rounded-full bg-white shadow-md border border-primary/30
               flex items-center justify-center hover:border-primary transition-colors cursor-pointer"
    >
        <IoIosArrowForward className="size-5 text-gray-600 translate-x-px" />
    </button>
);

const BestSellers = ({products}: Props) => {
    const bestSellerProducts = products.flatMap(product =>
        product.colors
            .filter(color => color.isBestSeller)
            .map(color => ({
                ...product,
                colors: [color],
            }))
    );

    const carouselBestSellersRef = useRef<Carousel | null>(null);

    return (
        <section className="">
            <div className="mx-auto px-4">
                <div className="flex items-center justify-between mb-4 lg:mb-6 -mx-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Хіти продажів
                        <GoHeartFill className="text-primary size-7" />
                    </h2>
                    {/*<button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600*/}
                    {/*       hover:text-primary transition-colors cursor-pointer">*/}
                    {/*    Переглянути всі*/}
                    {/*    <FaArrowRightLong className="w-4 h-4" />*/}
                    {/*</button>*/}
                </div>

                {/* Carousel — extra horizontal padding so custom arrows don't clip */}
                <div className="relative ">
                    <CustomPrev onClick={() => carouselBestSellersRef.current?.previous(1)} />
                    <Carousel
                        responsive={carouselResponsive}
                        infinite
                        swipeable
                        draggable
                        showDots={false}
                        ref={carouselBestSellersRef}
                        arrows={false}
                        itemClass="px-1 sm:px-2 flex justify-center"
                        containerClass="py-2"
                    >
                        {bestSellerProducts.map((product, i) => (
                            <ProductCard key={product.id+i} product={product}/>
                            // <div
                            //     key={product.id}
                            //     className="bg-primary/7 rounded-2xl overflow-hidden border border-primary/50
                            //                    shadow-sm hover:shadow-md hover:-translate-y-0.5
                            //                    transition-all duration-200 group select-none cursor-pointer
                            //                    w-full max-w-[280px]  mx-auto"
                            // >
                            //     {/* Product image */}
                            //     <div className="aspect-square bg-white rounded-t-lg flex items-center justify-center p-3 sm:p-5">
                            //         <Image
                            //             src={optimizeCloudinaryUrl(product.colors[0].images[0].url, 500)}
                            //             alt={product.name}
                            //             width={250}
                            //             height={250}
                            //             unoptimized
                            //             draggable={false}
                            //             className="object-contain w-full h-full rounded-lg"
                            //         />
                            //     </div>
                            //
                            //     {/* Info row */}
                            //     <div className="p-1 sm:py-2 sm:px-3 flex justify-between w-full">
                            //         <div className="min-w-0 flex flex-col w-full">
                            //
                            //             <p className="text-[11px] sm:text-sm text-slate-800 font-medium min-h-[32px]">
                            //                 {product.name.split(".")[0]}
                            //             </p>
                            //
                            //             <div className="flex justify-between items-center w-full">
                            //                 <p className="font-bold text-gray-900 text-xs sm:text-sm">
                            //                     {product.price} грн
                            //                 </p>
                            //                 <button
                            //                     className="
                            //                             shrink-0 size-7 sm:w-10 sm:h-10 bg-primary hover:bg-primary/90 active:bg-primary/60
                            //                             text-white rounded-full flex items-center justify-center shadow-md shadow-violet-200 transition-colors cursor-pointer
                            //                         "
                            //                 >
                            //                     <MdOutlineShoppingCart className="size-4" />
                            //                 </button>
                            //             </div>
                            //
                            //         </div>
                            //     </div>
                            // </div>
                        ))}
                    </Carousel>
                    <CustomNext onClick={() => carouselBestSellersRef.current?.next(1)} />
                </div>

                {/* Mobile "view all" */}
                {/*<div className="sm:hidden flex justify-center mt-6">*/}
                {/*    <button className="flex items-center gap-1.5 text-sm text-violet-600 font-medium">*/}
                {/*        Переглянути всі*/}
                {/*        <FaArrowRightLong className="w-4 h-4" />*/}
                {/*    </button>*/}
                {/*</div>*/}
            </div>
        </section>
    );
};

export default BestSellers;