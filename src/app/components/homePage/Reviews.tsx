'use client';

import Image from 'next/image';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import TestimonialCard from "@/app/components/homePage/TestimonialCard";
import {useRef} from "react";
import {CustomNext, CustomPrev} from "@/app/components/homePage/BestSellers";
import {GoHeartFill} from "react-icons/go";

// ─── Data ──────────────────────────────────────────────────────────────────
const reviews = [
    {
        id: 1,
        name: 'Вікторія',
        date: '17 січня',
        text: 'Вітаю) дякую за шапки❤️\n' +
            'Всі на Буковелі питали де ми їх брали, ми всім роздали посилання на ваш інста👌',
        image: '/reviews/review-1.jpg',
    },
    {
        id: 2,
        name: 'Олена',
        date: '4 лютого',
        text: 'Спасибо большое за такого зайца😻\n' +
            'Каждый день от людей слышала  комплименты за наряд такой🤭',
        image: '/reviews/review-2.jpg',
    },
    {
        id: 3,
        name: 'Анна',
        date: '21 березня',
        text: 'Доброго дня❤️😍 \n' +
            'Дякую вам за неймовірну роботу і красу😍❤️',
        image: '/reviews/review-3.jpg',
    },
    {
        id: 4,
        name: 'Марина',
        date: '5 квітня',
        text: 'Доброго вечора ❤️\n' +
            'Посилку сьогодні отримали . Дуже дякуємо, діти задоволені 🥰👌🏻',
        image: '/reviews/review-4.jpg',
    },
    {
        id: 5,
        name: 'Катерина',
        date: '12 травня',
        text: 'Добрий день. Отримали замовлення. Якщо чесно - то я в шоці…\n' +
            '\n' +
            'Наша шапуля- неймовірна 🥰\n' +
            'Така стильна ❤️❤️❤️❤️❤️\n' +
            'Вона просто неймовірна)\n' +
            'Дитина з пошти так у ній і вийшла)\n' +
            'Донечка безмежно задоволена! Саме така яку вона і хотіла)\n' +
            '\n' +
            'Дужеееее дякуююю Вам🤗🤗🤗\n' +
            '\n' +
            'Дуже-дуже сподобалась))))))',
        image: '/reviews/review-5.jpg',
    },
    {
        id: 6,
        name: 'Катерина',
        date: '12 травня',
        text: 'Отримали замовлення☺️\n' +
            'Дуже мʼякенька,тепла та стильна балаклава ! Донечка у захваті! 🤩 Дякуємо!',
        image: '/reviews/review-6.jpg',
    },
    {
        id: 7,
        name: 'Катерина',
        date: '12 травня',
        text: 'Добрий день! Стічей отримали, малі в захваті!\n' +
            'Дякую',
        image: '/reviews/review-7.jpg',
    },{
        id: 8,
        name: 'Катерина',
        date: '12 травня',
        text: 'Добрый день,спасибо огромное за шапочки,дочка в восторге',
        image: '/reviews/review-8.jpg',
    },{
        id: 9,
        name: 'Катерина',
        date: '12 травня',
        text: 'добрий день \n' +
            'забрали\n' +
            'клієнт задоволений ☺️ \n' +
            'дякуємо!!',
        image: '/reviews/review-9.jpg',
    },{
        id: 10,
        name: 'Катерина',
        date: '12 травня',
        text: 'Добрый день. Неожиданно пришла раньше балаклава, как раз на праздник доченьке. Она очень довольна. Спасибо Вам большое 💛💙',
        image: '/reviews/review-10.jpg',
    },{
        id: 11,
        name: 'Катерина',
        date: '12 травня',
        text: 'Ця шапка привертала увагу кожного перехожого',
        image: '/reviews/review-11.png',
    },{
        id: 12,
        name: 'Катерина',
        date: '12 травня',
        text: 'Дякую, в нас сталась любов )',
        image: '/reviews/review-12.jpg',
    },{
        id: 13,
        name: 'Катерина',
        date: '12 травня',
        text: 'Дитина дуже задоволена, все супер❤️ Дуже вам дякуємо😊',
        image: '/reviews/review-13.jpg',
    },{
        id: 14,
        name: 'Катерина',
        date: '12 травня',
        text: 'Щиро дякую за вашу працю♥️',
        image: '/reviews/review-14.jpg',
    },{
        id: 15,
        name: 'Катерина',
        date: '12 травня',
        text: 'Добрий день, отримали посилку. \n' +
            'Дякую вам за таку красу!!! Дитина дуже задоволена і щаслива🥰🥰🥰',
        image: '/reviews/review-15.jpg',
    },{
        id: 16,
        name: 'Катерина',
        date: '12 травня',
        text: 'Красива, затишна та тепла, дякую!',
        image: '/reviews/review-16.png',
    },{
        id: 17,
        name: 'Катерина',
        date: '12 травня',
        text: 'Дякуємо за шапочки ❤️',
        image: '/reviews/review-17.jpg',
    },{
        id: 18,
        name: 'Катерина',
        date: '12 травня',
        text: 'Доброго дня) дякуємо за чудовий головний убір. 🤠\n' +
            'Нам дуже сподобалася балаклава.\n' +
            'При таких погодніх умовах, саме те що треба 👍',
        image: '/reviews/review-18.jpg',
    },{
        id: 19,
        name: 'Катерина',
        date: '12 травня',
        text: 'Балаклава просто супер! Витримала морози -20 і хуртовину в горах! Дитина у теплі і вона не промокла жодного разу. Якісна і тримає форму та колір! І виглядає круто! Дякую)',
        image: '/reviews/review-19.jpg',
    },{
        id: 20,
        name: 'Катерина',
        date: '12 травня',
        text: 'Доброго дня, забрали посилочку.\n' +
            'Це просто щось неймовірне!!! Дитина задоволенна і я теж 🫶\n' +
            'Велике при велике Вам дякую ❤️🥰',
        image: '/reviews/review-20.jpg',
    },
];

// ─── Full card (desktop / tablet) ───────────────────────────────────────────
// function ReviewCardFull({ review }: { review: typeof reviews[0] }) {
//     return (
//         <div className="bg-[#faf9f9] rounded-3xl overflow-hidden flex h-[260px] sm:h-[200px] shadow-sm select-none">
//
//             {/* Photo column */}
//             <div className="relative w-[42%] shrink-0">
//                 <Image
//                     src={review.image}
//                     alt={review.name}
//                     fill
//                     draggable={false}
//                     className="object-cover object-center"
//                 />
//                 {/* Heart badge */}
//                 {/*<div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shadow-sm">*/}
//                 {/*    <FaHeart className="w-4 h-4 text-rose-400 fill-rose-400" />*/}
//                 {/*</div>*/}
//                 {/* Decorative pink scribble */}
//                 <svg
//                     viewBox="0 0 60 30"
//                     className="absolute bottom-3 right-3 w-14 opacity-70"
//                     fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round"
//                 >
//                     <path d="M4 22 C12 6 28 26 40 10 C48 0 56 18 56 18" />
//                     <path d="M10 28 C18 14 30 24 44 16" />
//                 </svg>
//             </div>
//
//             {/* Text column */}
//             <div className="flex flex-col justify-between p-3 flex-1 min-w-0">
//                 {/* Quote icon + sparkle */}
//                 {/*<div className="flex items-start justify-between">*/}
//                 {/*    <span className="text-rose-300 text-4xl font-serif leading-none select-none">&quot;</span>*/}
//                 {/*    /!* Small decorative dashes *!/*/}
//                 {/*    <svg viewBox="0 0 28 20" className="w-7 opacity-60 mt-1" fill="none"*/}
//                 {/*         stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round">*/}
//                 {/*        <line x1="14" y1="2" x2="26" y2="2" />*/}
//                 {/*        <line x1="8"  y1="10" x2="20" y2="10" />*/}
//                 {/*    </svg>*/}
//                 {/*</div>*/}
//
//                 {/* Review text */}
//                 <p className="text-gray-700 text-sm sm:text-base -mt-1 overflow-x-auto thin-scrollbar">
//                     {review.text}
//                 </p>
//
//                 {/* Divider + author */}
//                 <div>
//                     <div className="flex items-center gap-1">
//                         <div className="h-px flex-1 bg-gray-200" />
//                         <FaHeart className="w-3.5 h-3.5 text-rose-300 fill-rose-300 shrink-0" />
//                     </div>
//                     <p className="font-bold text-gray-900 text-sm">{review.name}</p>
//                     <p className="text-gray-400 text-xs mt-0.5">{review.date}</p>
//                 </div>
//             </div>
//
//         </div>
//     );
// }

// ─── Compact card (mobile — 3 per row) ──────────────────────────────────────
function ReviewCardCompact({ review }: { review: typeof reviews[0] }) {
    return (
        <div className="bg-primary/7 rounded-2xl overflow-hidden flex flex-col shadow-sm h-full">
            {/* Photo */}
            <div className="relative w-full aspect-3/4">
                <Image src={review.image} alt={review.name} fill draggable={false} className="object-cover object-center" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/20 to-transparent" />
            </div>

            {/* Text */}
            <div className="p-1.5 flex flex-col ">
                <p className="text-gray-700 text-[10px] leading-snug line-clamp-6">{review.text}</p>
            </div>
        </div>
    );
}

// ─── Section ────────────────────────────────────────────────────────────────

export function Reviews() {
    const carouselDesktopRef = useRef<Carousel | null>(null);
    const carouselMobileRef = useRef<Carousel | null>(null);

    return (
        <section className="pb-12 sm:pb-16">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 lg:mb-8 -mx-2 flex items-center gap-2">
                    Відгуки наших клієнтів
                    {/*<span className="text-rose-400">💜</span>*/}
                    <GoHeartFill className="text-primary size-7" />

                </h2>

                {/* ── Desktop / tablet carousel (hidden on mobile) ── */}
                <div className="hidden lg:block relative px-5">
                    <CustomPrev onClick={() => carouselDesktopRef.current?.previous(1)} />

                    <Carousel
                        responsive={{
                            desktop: { breakpoint: { max: 3000, min: 1280 }, items: 3, slidesToSlide: 1 },
                            tablet:  { breakpoint: { max: 1280, min: 640  }, items: 2, slidesToSlide: 1 },
                        }}
                        ref={carouselDesktopRef}
                        infinite
                        swipeable
                        draggable
                        arrows={false}
                        showDots={false}
                        itemClass="px-2"
                        containerClass="py-2"
                    >
                        {reviews.map((r) => <TestimonialCard key={r.id} photoSrc={r.image} date={r.date} author={r.name} photoAlt={r.image} quote={r.text}/>)}
                        {/*{reviews.map((r) => <ReviewCardFull key={r.id} review={r} />)}*/}
                    </Carousel>

                    <CustomNext onClick={() => carouselDesktopRef.current?.next(1)} />
                </div>

                {/* ── Mobile carousel (3 compact cards) ── */}
                <div className="lg:hidden relative">
                    <CustomPrev onClick={() => carouselMobileRef.current?.previous(1)} />

                    <Carousel
                        responsive={{
                            mobile: { breakpoint: { max: 1024, min: 0 }, items: 3, slidesToSlide: 1 },
                        }}
                        infinite
                        swipeable
                        draggable
                        ref={carouselMobileRef}
                        showDots={false}
                        arrows={false}
                        itemClass="px-1"
                        containerClass="py-2"
                    >
                        {reviews.map((r) => <ReviewCardCompact key={r.id} review={r} />)}
                    </Carousel>

                    <CustomNext onClick={() => carouselMobileRef.current?.next(1)} />
                </div>
            </div>
        </section>
    );
}