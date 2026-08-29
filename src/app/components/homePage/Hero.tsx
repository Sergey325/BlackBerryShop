"use client";

import {useRef, useState} from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import {FaHeart} from "react-icons/fa";
import Image from "next/image";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import Link from "next/link";
import {IBanner} from "@/app/actions/getBanners";


const responsive = {
    all: {breakpoint: {max: 4000, min: 0}, items: 1},
};

const CustomDot = ({ onClick, index, active }: any) => {
    return (
        <li>
            <button
                type="button"
                onClick={() => onClick(index)}
                aria-label={`Перейти до слайда ${index + 1}`}
                aria-current={active ? "true" : undefined}
                className={`block rounded-full transition-all cursor-pointer ${
                    active
                        ? 'w-5 h-2 bg-primary'
                        : 'w-2 h-2 bg-gray-300'
                }`}
            />
        </li>

    );
};

type Props = {
    banners: IBanner[]
}

const Hero = ({banners}: Props) => {
    const carouselRef = useRef<Carousel>(null);

    const [isSliding, setIsSliding] = useState(false);
    const [isTouching, setIsTouching] = useState(false);

    // const [mounted, setMounted] = useState(false);
    //
    // useEffect(() => {
    //     // eslint-disable-next-line react-hooks/set-state-in-effect
    //     setMounted(true);
    // }, []);
    //
    // if (!mounted) {
    //     return (
    //         <section className="relative overflow-hidden flex items-center rounded-xl lg:rounded-3xl min-h-[450px] lg:min-h-[650px] bg-gray-100 animate-pulse">
    //             <div className="flex items-center px-4 lg:px-16 w-full lg:w-1/2 h-full my-auto">
    //                 <div className="space-y-4 w-full">
    //                     <div className="h-6 w-40 bg-gray-200 rounded-full" />
    //                     <div className="h-10 w-3/4 bg-gray-200 rounded" />
    //                     <div className="h-10 w-2/3 bg-gray-200 rounded" />
    //                     <div className="h-4 w-1/2 bg-gray-200 rounded mt-6" />
    //                     <div className="h-4 w-1/3 bg-gray-200 rounded" />
    //                     <div className="h-12 w-48 bg-gray-200 rounded-full mt-8" />
    //                 </div>
    //             </div>
    //         </section>
    //     );
    // }

    return (
        <section className="relative overflow-hidden rounded-xl lg:rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.10)] select-none bg-linear-to-t from-black/70 via-black/40 to-black/10  lg:bg-none lg:bg-white">
            <div
                className={`relative z-10 w-[calc(100%+4px)] -ml-0.5`}
                onTouchStartCapture={() => setIsTouching(true)}
                onTouchEndCapture={() => setIsTouching(false)}
                onTouchCancelCapture={() => setIsTouching(false)}
            >
                <Carousel
                    ref={carouselRef}
                    responsive={responsive}
                    arrows={false}
                    ssr={true}
                    deviceType="all"
                    swipeable
                    draggable
                    infinite
                    autoPlay={!isTouching}
                    autoPlaySpeed={7500}
                    pauseOnHover
                    transitionDuration={400}
                    beforeChange={() => setIsSliding(true)}
                    afterChange={() => setIsSliding(false)}
                    showDots={true}
                    customDot={<CustomDot />}
                    dotListClass="
                      !absolute
                      !bottom-5
                      !left-0
                      !right-0
                      !justify-center
                      !gap-2
                      lg:!bottom-10
                      lg:!left-[4%]
                      lg:!right-auto
                      lg:!justify-start
                    "
                    // additionalTransfrom={-1}
                    containerClass="overflow-hidden"
                    itemClass="overflow-hidden relative! flex!"
                >
                    {banners.map((banner, i) => (
                        <div
                            key={i}
                            className={`flex w-full transition-filter duration-300 ${isSliding ? 'blur-[0px]' : ''}`}
                        >
                            {/* ── Desktop ── */}
                            <div className="hidden min-h-[650px] w-full items-center lg:flex">

                                {/* Текстовая колонка — сплошной белый фон */}
                                <div className="relative z-10 w-1/2 px-10 xl:px-16">
                                    {
                                        banner.badge &&
                                        <span className="inline-flex items-center gap-1.5 bg-white/80 shadow-[0_0_5px_rgba(130,61,154,0.50)] transition
                                                     text-gray-600 rounded-full px-4 py-1.5
                                                     border border-primary mb-7">
                                            {banner.badge}
                                            <FaHeart className="size-4 text-primary" />
                                        </span>
                                    }


                                    <h2 className="text-5xl leading-[1.2] font-bold text-gray-900 mb-5 whitespace-pre-line">
                                        {banner.title}
                                    </h2>

                                    {
                                        banner.features.length > 0 &&
                                        <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5 text-gray-600">
                                            {banner.features.map((f, fi) => <li key={fi}>{f}</li>)}
                                        </ul>
                                    }
                                    {
                                        banner.ctaHref && banner.ctaLabel &&
                                        <Link
                                            draggable={false}
                                            href={banner.ctaHref || ""}
                                            className="mt-10 w-full max-w-[480px] bg-primary hover:bg-[#6e3382]
                                                text-white px-6 py-3 rounded-full transition-colors cursor-pointer block text-center">
                                            {banner.ctaLabel}
                                        </Link>
                                    }


                                    {/*<Dots count={slides.length} active={active} onSelect={goTo} className="mt-12" />*/}
                                </div>

                                <div className="absolute inset-y-0 right-0 flex max-w-3/4 laptop:max-w-[65%]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={optimizeCloudinaryUrl(banner.image, 1500)}
                                        alt={""}
                                        fetchPriority={i === 0 ? "high" : "auto"}
                                        loading={i === 0 ? "eager" : "lazy"}
                                        draggable={false}
                                        className="block h-full w-auto max-w-full object-cover object-right select-none"
                                    />

                                    {/* Градиент привязан к фактическому левому краю contain-изображения. */}
                                    <div
                                        className="absolute inset-y-0 -left-0.5 w-[calc(30%+2px)] pointer-events-none
                                                   bg-linear-to-r from-white to-transparent
                                                   "
                                        style={{
                                            maskImage: 'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
                                            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ── Mobile ──────────────────────────────────────────────── */}
                            <div className="relative flex min-h-[450px] w-full lg:hidden">
                                <Image
                                    src={optimizeCloudinaryUrl(banner.image, 1500)}
                                    alt={""}
                                    fill
                                    fetchPriority={i === 0 ? "high" : "auto"}
                                    loading={i === 0 ? "eager" : "lazy"}
                                    sizes="(max-width: 1023px) 100vw, 1px"
                                    draggable={false}
                                    className="object-cover object-center select-none"
                                />

                                <div className="absolute inset-0 bg-black/10" />

                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)",
                                    }}
                                />
                                <div className="relative z-10 flex min-h-[450px] w-full flex-1 flex-col gap-4 px-6 pt-10 pb-12 sm:justify-around">
                                    {
                                        banner.badge &&
                                        <span className="self-start inline-flex items-center gap-1.5
                                                     bg-white/80 text-gray-700 border border-primary shadow-[0_0_5px_rgba(130,61,154,0.50)]
                                                     text-xs rounded-full px-4 py-1.5">
                                            {banner.badge}
                                                <FaHeart className="size-4 text-primary" />
                                        </span>
                                    }
                                    <h2 className="text-3xl leading-tight font-bold text-white whitespace-pre-line">
                                        {banner.title}
                                    </h2>

                                    {
                                        banner.features.length > 0 &&
                                        <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5 text-white/90">
                                            {banner.features.map((f, fi) => <li key={fi}>{f}</li>)}
                                        </ul>
                                    }

                                    {
                                        banner.ctaHref && banner.ctaLabel &&
                                        <Link
                                            href={banner.ctaHref || ""}
                                            className="mt-auto sm:mt-0 w-full bg-primary px-6 py-3 text-center text-white transition-colors hover:bg-[#6e3382] sm:max-w-[400px] rounded-full cursor-pointer"
                                        >
                                            {banner.ctaLabel}
                                        </Link>
                                    }
                                    {/*<Dots count={slides.length} active={active} onSelect={goTo} />*/}
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </section>
    );
};

export default Hero;
