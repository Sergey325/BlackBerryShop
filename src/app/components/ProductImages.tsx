"use client"

import Image from "next/image";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useEffect, useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { IProductColor } from "@/app/actions/getProducts";

type Props = {
    productColor: IProductColor;
};

const responsive = {
    tablet: {
        breakpoint: { max: 1023, min: 640 },
        items: 1
    },
    mobile: {
        breakpoint: { max: 639, min: 0 },
        items: 1
    }
};

const responsiveOption = {
    desktop: {
        breakpoint: {
            max: 2560,
            min: 1024,
        },
        items: 5,
    },
}

const ProductImages = ({ productColor }: Props) => {
    const [selectedImage, setSelectedImage] = useState(productColor.images[0]?.url);

    return (
        <PhotoProvider>
            <div className="block lg:hidden pb-10 w-full">
                <Carousel
                    responsive={responsive}
                    swipeable
                    draggable
                    arrows
                    keyBoardControl
                    dotListClass=""
                    customTransition="all 1s"
                    transitionDuration={500}
                    containerClass="carousel-container"
                    itemClass="carousel-item-padding-40-px">
                    {productColor.images.map((slide) => (
                        <PhotoView key={slide.url} src={slide.url}>
                            <Image
                                src={slide.url}
                                width={250}
                                height={250}
                                priority
                                className="object-contain h-full mx-auto select-none cursor-zoom-in"
                                alt={slide.url}
                            />
                        </PhotoView>
                    ))}
                </Carousel>
            </div>
            {
                productColor.images.length > 5
                    ?
                    <div className={`hidden lg:block w-[560px]`}>
                        <Carousel
                            responsive={responsiveOption}
                            swipeable
                            keyBoardControl
                            customTransition="all 0.5s"
                            transitionDuration={500}
                            containerClass="carousel-container"
                            itemClass="carousel-item-padding-20-px">
                            {productColor.images.map((slide) => (
                                <Image
                                    src={slide.url}
                                    key={slide.url}
                                    width={100} height={100}
                                    priority
                                    className="object-cover aspect-square cursor-pointer hover:shadow-xl hover:opacity-70 hover:scale-105 transition rounded-xl border-[#823D9A] border-2"
                                    alt="productImageOption"
                                    onClick={() => setSelectedImage(slide.url)}
                                />
                            ))}
                        </Carousel>
                    </div>
                    :
                    <div className="hidden lg:flex flex-row gap-4">
                        <div className="flex flex-col gap-3 shrink-0">
                            {productColor.images.map(image => (
                                <div key={image.url} className="overflow-hidden rounded-sm border-[#823D9A] border-[1.5px]">
                                    <Image
                                        src={image.url}
                                        priority
                                        width={60} height={60}
                                        quality={50}
                                        alt="productImageOption"
                                        className="object-cover aspect-square cursor-pointer hover:shadow-xl hover:opacity-70 hover:scale-105 transition"
                                        onClick={() => setSelectedImage(image.url)}
                                    />
                                </div>
                            ))}
                        </div>

                        <Image
                            src={selectedImage}
                            width={600} height={600}
                            className="object-contain aspect-square mx-auto select-none pointer-events-none py-10 px-3"
                            alt="ProductImage"
                            quality={100}
                            priority
                        />
                    </div>
            }
        </PhotoProvider>
    );
};

export default ProductImages;