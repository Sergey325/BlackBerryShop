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
    productName: string;
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

const ProductImages = ({ productName, productColor }: Props) => {
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
        <>
            <PhotoProvider>
                <div className="block w-full lg:hidden">
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
                    {productColor.images.map((slide, index) => (
                        <PhotoView key={slide.url} src={optimizeCloudinaryUrl(slide.url, 2000)}>
                            <Image
                                src={optimizeCloudinaryUrl(slide.url, 500, 18)}
                                width={250}
                                height={250}
                                unoptimized
                                draggable={false}
                                fetchPriority={index === 0 ? "high" : "auto"}
                                loading={index === 0 ? "eager" : "lazy"}
                                sizes="(max-width: 1023px) 500px, 1px"
                                className="object-contain h-full mx-auto select-none cursor-zoom-in rounded-lg"
                                alt={`${productName}, колір ${productColor.colorName} — фото ${index + 1}`}
                            />
                        </PhotoView>
                    ))}
                </Carousel>
                </div>
            </PhotoProvider>

            <PhotoProvider>
                <div className="hidden min-w-0 flex-row gap-4 lg:flex">
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
                        {visibleImages.map((image) => {
                            const imageIndex: number = productColor.images.findIndex((item) => item.id === image.id);

                            return (
                            <button
                                type="button"
                                key={image.url}
                                aria-label={`Обрати фото ${imageIndex + 1} товару ${productName}`}
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
                                    loading="lazy"
                                    draggable={false}
                                    className="aspect-square object-cover transition hover:scale-105 hover:opacity-80"
                                    alt=""
                                />
                            </button>
                            );
                        })}
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
                                    src={optimizeCloudinaryUrl(selectedImage, 1000, 18)}
                                    width={550}
                                    height={550}
                                    draggable={false}
                                    fetchPriority={selectedImage === productColor.images[0]?.url ? "high" : "auto"}
                                    loading={selectedImage === productColor.images[0]?.url ? "eager" : "lazy"}
                                    sizes="(min-width: 1024px) 500px, 1px"
                                    className="mx-auto aspect-square w-full max-w-[500px] cursor-zoom-in select-none rounded-lg object-contain"
                                    alt={`${productName}, колір ${productColor.colorName} — фото ${productColor.images.findIndex((image) => image.url === selectedImage) + 1}`}
                                    unoptimized
                                />
                            </PhotoView>
                        </div>
                    )}
                </div>
            </PhotoProvider>
        </>
    );
};

export default ProductImages;
