"use client";

import {useRef, useState} from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import {FaHeart} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";

type BannerSlide = {
    image: string;
    alt: string;
    badge: string;
    title: string[];
    features: string[];
    ctaHref: string;
    ctaLabel: string;
};

const slides: BannerSlide[] = [
    {
        image: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1783530220/BlackBerry/Banners/IMG_1557_rd2tw9.png",
        alt: "Дівчина у панамі Teddy",
        badge: "Ручна робота з любов'ю",
        title: ["Аксесуари, які закохують у себе", "з першого дотику"],
        features: [
            "Створено з турботою",
            "Використання якісних матеріалів",
            "Індивідуальний підхід до кожного кліента",
        ],
        ctaHref: "/catalog",
        ctaLabel: "Перейти до каталогу",
    },
    {
        image: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1782129738/BlackBerry/cmaj7u3qp6w2qxtvmifz.png",
        alt: "Дівчина у панамі Ted",
        badge: "Ручна робота з любов'ю",
        title: ["Аксесуари, які закохують у себе", "з першого дотику"],
        features: [
            "Створено з турботою",
            "Використання якісних матеріалів",
            "Індивідуальний підхід до кожного кліента",
        ],
        ctaHref: "/catalog",
        ctaLabel: "Перейти до каталогу",
    },
    {
        image: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1782123652/BlackBerry/bckizdsqqp9unqmyxqwa.jpg",
        alt: "Дівчина у",
        badge: "Ручна робота з любов'ю",
        title: ["Аксесуари, які закохують у себе", "з першого дотику"],
        features: [
            "Створено з турботою",
            "Використання якісних матеріалів",
            "Індивідуальний підхід до кожного кліента",
        ],
        ctaHref: "/catalog",
        ctaLabel: "Перейти до каталогу",
    },
];

const responsive = {
    all: {breakpoint: {max: 4000, min: 0}, items: 1},
};

// function Dots({
//       count,
//       active,
//       onSelect,
//       className = '',
//   }: {
//     count: number;
//     active: number;
//     onSelect: (i: number) => void;
//     className?: string;
// }) {
//     return (
//         <div className={`flex items-center gap-2 ${className}`}>
//             {Array.from({length: count}).map((_, i) => (
//                 <button
//                     key={i}
//                     type="button"
//                     onClick={() => onSelect(i)}
//                     aria-label={`Слайд ${i + 1}`}
//                     className={`block rounded-full transition-all cursor-pointer ${
//                         i === active ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-gray-300'
//                     }`}
//                 />
//             ))}
//         </div>
//     );
// }

const CustomDot = ({ onMove, index, active }: any) => {
    return (
        <button
            onClick={() => onMove(index)}
            className={`block rounded-full transition-all ${
                active
                    ? 'w-5 h-2 bg-primary'
                    : 'w-2 h-2 bg-gray-300'
            }`}
        />
    );
};

const Hero = () => {
    const carouselRef = useRef<Carousel>(null);

    const [isSliding, setIsSliding] = useState(false);

    return (
        <section className="relative overflow-hidden rounded-xl lg:rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.10)] select-none bg-linear-to-t from-black/70 via-black/40 to-black/10  lg:bg-none lg:bg-white">
            <div className={`relative z-10 w-[calc(100%+4px)] -ml-0.5`}>
                <Carousel
                    ref={carouselRef}
                    responsive={responsive}
                    arrows={false}
                    swipeable
                    draggable
                    infinite
                    autoPlay
                    autoPlaySpeed={5000}
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
                    itemClass="overflow-hidden relative!"
                >
                    {slides.map((slide, i) => (
                        <div key={i} className={`transition-filter duration-300 ${isSliding ? 'blur-[2px]' : ''}`}>
                            {/* ── Desktop ── */}
                            <div className="hidden lg:flex items-center min-h-[650px] ">

                                {/* Текстовая колонка — сплошной белый фон */}
                                <div className="relative z-10 w-1/2 px-10 xl:px-16 ">
                                    <span className="inline-flex items-center gap-1.5 bg-white/80 shadow-[0_0_5px_rgba(130,61,154,0.50)] transition
                                                     text-gray-600 rounded-full px-4 py-1.5
                                                     border border-primary mb-7">
                                        {slide.badge}
                                        <FaHeart className="size-4 text-primary" />
                                    </span>

                                    <h1 className="text-5xl leading-[1.2] font-bold text-gray-900 mb-5">
                                        {slide.title.map((line, li) => (
                                            <span key={li}>
                                                {line}
                                                {li < slide.title.length - 1 && <br />}
                                            </span>
                                        ))}
                                    </h1>

                                    <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5 text-gray-600">
                                        {slide.features.map((f, fi) => <li key={fi}>{f}</li>)}
                                    </ul>

                                    <Link
                                        href={slide.ctaHref}
                                        className="mt-10 w-full max-w-[480px] bg-primary hover:bg-[#6e3382]
                                               text-white px-6 py-3 rounded-full transition-colors cursor-pointer block text-center">
                                        {slide.ctaLabel}
                                    </Link>

                                    {/*<Dots count={slides.length} active={active} onSelect={goTo} className="mt-12" />*/}
                                </div>

                                <div className="absolute right-0 top-0 h-full w-3/4 laptop:w-[65%]">
                                    <Image
                                        src={optimizeCloudinaryUrl(slide.image, 1500)}
                                        alt={slide.alt}
                                        fill
                                        unoptimized
                                        draggable={false}
                                        className="object-cover object-center select-none"
                                    />

                                    {/* Матовая стыковка: белый градиент + блюр самого фото под ним */}
                                    <div
                                        className="absolute inset-y-0 left-0 w-[15%] pointer-events-none
                                                   bg-linear-to-r from-white to-transparent
                                                   "
                                        style={{
                                            maskImage: 'linear-gradient(to right, black 0%, black 55%, transparent 100%)',
                                            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 55%, transparent 100%)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ── Mobile ──────────────────────────────────────────────── */}
                            <div className="relative lg:hidden min-h-[450px]">
                                <Image
                                    src={optimizeCloudinaryUrl(slide.image, 1500)}
                                    alt={slide.alt}
                                    fill
                                    priority={i === 0}
                                    unoptimized
                                    draggable={false}
                                    className="object-cover object-center select-none"
                                />

                                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/10" />

                                <div className="relative z-10 flex flex-col gap-4 justify-between min-h-[450px] px-6 pt-10 pb-12">
                                    <span className="self-start inline-flex items-center gap-1.5
                                                     bg-white/80 text-gray-700 border border-primary shadow-[0_0_5px_rgba(130,61,154,0.50)]
                                                     text-xs rounded-full px-4 py-1.5">
                                        {slide.badge}
                                        <FaHeart className="size-4 text-primary" />
                                    </span>

                                    <h1 className="text-3xl leading-tight font-bold text-white">
                                        {slide.title.map((line, li) => (
                                            <span key={li}>
                                                {line}
                                                {li < slide.title.length - 1 && <br />}
                                            </span>
                                        ))}
                                    </h1>

                                    <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5 text-white/90">
                                        {slide.features.map((f, fi) => <li key={fi}>{f}</li>)}
                                    </ul>

                                    <Link
                                        href={slide.ctaHref}
                                        className="w-full sm:max-w-[400px] bg-primary hover:bg-[#6e3382] text-white px-6 py-3 rounded-full transition-colors cursor-pointer text-center"
                                    >
                                        {slide.ctaLabel}
                                    </Link>

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