"use client"

import Image from "next/image";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { IProductColor } from "@/app/actions/getProducts";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";

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
                        <PhotoView key={slide.url} src={optimizeCloudinaryUrl(slide.url, 2000)}>
                            <Image
                                src={optimizeCloudinaryUrl(slide.url, 500)}
                                width={250}
                                height={250}
                                unoptimized
                                draggable={false}
                                priority
                                className="object-contain h-full mx-auto select-none cursor-zoom-in rounded-lg"
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
                                    src={optimizeCloudinaryUrl(slide.url, 200)}
                                    key={slide.url}
                                    width={100} height={100}
                                    unoptimized
                                    draggable={false}
                                    className="object-cover aspect-square cursor-pointer hover:shadow-xl hover:opacity-70 hover:scale-105 transition rounded-xl border-primary border-2"
                                    alt="productImageOption"
                                    onClick={() => setSelectedImage(slide.url)}
                                />
                            ))}
                        </Carousel>
                    </div>
                    :
                    <div className="hidden lg:flex min-w-0 flex-row gap-4">
                        <div className="flex flex-col gap-3 shrink-0">
                            {productColor.images.map(image => (
                                <div key={image.url} className="overflow-hidden rounded-lg border-primary border-[1.5px]">
                                    <Image
                                        src={optimizeCloudinaryUrl(image.url, 120)}
                                        unoptimized priority
                                        draggable={false}
                                        width={60} height={60}
                                        alt="productImageOption"
                                        className="object-cover aspect-square cursor-pointer hover:shadow-xl hover:opacity-70 hover:scale-105 transition"
                                        onClick={() => setSelectedImage(image.url)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 items-center justify-center min-w-0 py-6">
                            <Image
                                src={optimizeCloudinaryUrl(selectedImage, 1000)}
                                width={550} height={550}
                                draggable={false}
                                className="object-contain aspect-square w-full select-none pointer-events-none mx-auto max-w-[500px] rounded-lg"
                                alt="ProductImage"
                                priority unoptimized
                            />
                        </div>
                    </div>
            }
        </PhotoProvider>
    );
};

export default ProductImages;