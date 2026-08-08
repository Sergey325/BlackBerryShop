"use client"

import React, {useRef} from "react";
import Carousel, {ResponsiveType} from "react-multi-carousel";
import {useItemsPerView} from "@/app/hooks/useItemsPerView";
import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io";
import "react-multi-carousel/lib/styles.css";

type CarouselWrapperProps = {
    children: React.ReactNode;
    responsive: ResponsiveType;
    showArrows?: boolean;
    itemClass?: string;
    containerClass?: string;
    carouselClass?: string;
    arrowClass?: string;
};

// ─── Custom arrows ───────────────────────────────────────────────────────────
const CustomPrev = ({ onClick, arrowClass }: { onClick?: () => void,arrowClass: string }) => (
    <button
        onClick={onClick}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 size-10 rounded-full bg-white shadow-md border border-primary/30 flex items-center justify-center hover:border-primary transition-colors cursor-pointer ${arrowClass}`}
    >
        <IoIosArrowBack className="size-5 text-gray-600 -translate-x-px" />
    </button>
);

const CustomNext = ({ onClick, arrowClass }: { onClick?: () => void, arrowClass: string }) => (
    <button
        onClick={onClick}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 size-10 rounded-full bg-white shadow-md border border-primary/30 flex items-center justify-center hover:border-primary transition-colors cursor-pointer ${arrowClass}`}
    >
        <IoIosArrowForward className="size-5 text-gray-600 translate-x-px" />
    </button>
);

export default function CarouselWrapper({
    children,
    responsive,
    showArrows = true,
    itemClass = "",
    carouselClass = "",
    arrowClass = "",
    containerClass = "",
}: CarouselWrapperProps) {
    const carouselRef = useRef<Carousel>(null);

    const itemsPerView = useItemsPerView(responsive);
    const childrenArray = React.Children.toArray(children);

    const shouldShowArrows = showArrows && childrenArray.length >= itemsPerView!;

    return (
        <div className={`relative ${containerClass}`}>
            {shouldShowArrows && (
                <CustomPrev onClick={() => carouselRef.current?.previous(1)} arrowClass={arrowClass} />
            )}

            <Carousel
                ref={carouselRef}
                responsive={responsive}
                arrows={false}
                showDots={false}
                infinite
                swipeable
                draggable
                deviceType="desktop"
                ssr
                itemClass={itemClass}
                containerClass={carouselClass}
            >
                {children}
            </Carousel>

            {shouldShowArrows && (
                <CustomNext onClick={() => carouselRef.current?.next(1)} arrowClass={arrowClass} />
            )}
        </div>
    );
}