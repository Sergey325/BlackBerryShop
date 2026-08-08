"use client"

import Image from "next/image";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { IProductColor } from "@/app/actions/getProducts";
import { optimizeCloudinaryUrl } from "@/app/utils/optimizeCloudinaryImage";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

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

const DESKTOP_THUMBNAILS_COUNT = 7;

const ProductImages = ({ productColor }: Props) => {
    const [selectedImage, setSelectedImage] = useState(productColor.images[0]?.url);
    const [firstVisibleImage, setFirstVisibleImage] = useState(0);
    const lastFirstVisibleImage = Math.max(
        productColor.images.length - DESKTOP_THUMBNAILS_COUNT,
        0
    );
    const visibleImages = productColor.images.slice(
        firstVisibleImage,
        firstVisibleImage + DESKTOP_THUMBNAILS_COUNT
    );

    const showPreviousImages = (): void => {
        setFirstVisibleImage(current => Math.max(current - 1, 0));
    };

    const showNextImages = (): void => {
        setFirstVisibleImage(current => Math.min(current + 1, lastFirstVisibleImage));
    };

    return (
        <PhotoProvider>
            <div className="block lg:hidden w-full">
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
            <div className="hidden lg:flex min-w-0 flex-row gap-4">
                <div className="flex w-[64px] shrink-0 flex-col items-center gap-1">
                    {productColor.images.length > DESKTOP_THUMBNAILS_COUNT && (
                        <button
                            type="button"
                            onClick={showPreviousImages}
                            disabled={firstVisibleImage === 0}
                            aria-label="Показати попередні фото"
                            className="flex h-7 w-full cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-primary disabled:cursor-default disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        >
                            <FiChevronUp className="h-5 w-5" />
                        </button>
                    )}

                    <div className="flex flex-col gap-2">
                        {visibleImages.map(image => (
                            <button
                                type="button"
                                key={image.url}
                                aria-label="Обрати фото товару"
                                onClick={() => setSelectedImage(image.url)}
                                className={`overflow-hidden rounded-lg border-[1.5px] transition ${
                                    selectedImage === image.url
                                        ? "border-primary shadow-sm"
                                        : "border-gray-200 hover:border-primary"
                                }`}
                            >
                                <Image
                                    src={optimizeCloudinaryUrl(image.url, 120)}
                                    width={60}
                                    height={60}
                                    unoptimized
                                    priority
                                    draggable={false}
                                    className="aspect-square object-cover transition hover:scale-105 hover:opacity-80"
                                    alt="productImageOption"
                                />
                            </button>
                        ))}
                    </div>

                    {productColor.images.length > DESKTOP_THUMBNAILS_COUNT && (
                        <button
                            type="button"
                            onClick={showNextImages}
                            disabled={firstVisibleImage === lastFirstVisibleImage}
                            aria-label="Показати наступні фото"
                            className="flex h-7 w-full cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-primary disabled:cursor-default disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        >
                            <FiChevronDown className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {selectedImage && (
                    <div className="flex min-w-0 flex-1 items-center justify-center py-2">
                        <PhotoView src={optimizeCloudinaryUrl(selectedImage, 2000)}>
                            <Image
                                src={optimizeCloudinaryUrl(selectedImage, 1000)}
                                width={550}
                                height={550}
                                draggable={false}
                                className="mx-auto aspect-square w-full max-w-[500px] cursor-zoom-in select-none rounded-lg object-contain"
                                alt="ProductImage"
                                priority
                                unoptimized
                            />
                        </PhotoView>
                    </div>
                )}
            </div>
        </PhotoProvider>
    );
};

export default ProductImages;
