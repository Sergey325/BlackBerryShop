"use client"

import Image from "next/image";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import {Product, ProductImage} from "@prisma/client";
import {useState} from "react";

type ProductWithImages = Product & {
    images: ProductImage[];
};

type Props = {
    product: ProductWithImages;
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

const ProductImages = ({product}: Props) => {
    const [selectedImage, setSelectedImage] = useState(product.images[0].url)

    return (
        <>
            <div className="block lg:hidden pb-10 w-full">
                <Carousel
                    responsive={responsive}
                    swipeable
                    draggable
                    arrows
                    infinite
                    keyBoardControl
                    dotListClass=""
                    customTransition="all 1s"
                    transitionDuration={500}
                    containerClass="carousel-container"
                    // removeArrowOnDeviceType={["tablet", "mobile"]}
                    itemClass="carousel-item-padding-40-px">
                    {product.images.map((slide) => (
                        <Image src={slide.url} key={slide.url} width={250} height={250} priority className="object-contain h-full mx-auto select-none pointer-events-none" alt=""/>
                    ))}
                </Carousel>
            </div>
            {
                product.images.length > 5
                ?
                <div className={`hidden lg:block w-[560px]`}>
                    <Carousel
                        responsive={responsiveOption}
                        swipeable
                        infinite
                        keyBoardControl
                        customTransition="all 0.5s"
                        transitionDuration={500}
                        containerClass="carousel-container"
                        // removeArrowOnDeviceType={["tablet", "mobile"]}
                        itemClass="carousel-item-padding-20-px">
                        {product.images.map((slide) => (
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
                    {/* Миниатюры слева */}
                    <div className="flex flex-col gap-3 shrink-0">
                        {product?.images.map(image => (
                            <div key={image.url} className="overflow-hidden rounded-sm border-[#823D9A] border-[1.5px]">
                                <Image
                                    src={image.url}
                                    priority={true}
                                    width={60} height={60}
                                    alt="productImageOption"
                                    className="object-cover aspect-square cursor-pointer hover:shadow-xl hover:opacity-70 hover:scale-105 transition"
                                    onClick={() => setSelectedImage(image.url)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Большая картинка */}
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
        </>
    );
};

export default ProductImages;