import Image, {type StaticImageData} from "next/image";
import Link from "next/link";
import type {JSX} from "react";
import {FaInstagram, FaTelegram} from "react-icons/fa";
import Reveal from "@/app/components/reusable/Reveal";

type HandmadeFeature = {
    number: string;
    image: string | StaticImageData;
    alt: string;
    title: string;
    description: string;
    imageClassName?: string;
};

const features: HandmadeFeature[] = [
    {
        number: "01",
        image: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1788375839/BlackBerry/IMG_6106_iwu0y0.jpg",
        alt: "Руки майстрині під час в’язання виробу",
        title: "Ручна робота",
        description: "Жодної масовості — тільки тепла ручна робота. Наші майстрині вкладають душу й уважність до кожної петельки, створюючи річ спеціально для тебе.",
    },
    {
        number: "02",
        image: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1788375384/BlackBerry/IMG_4779_1_tly19c.png",
        alt: "Унікальна синя балаклава ручної роботи",
        title: "Унікальний виріб",
        description: "Хочеш щось особливе? Ми готові втілити твою ідею в життя та адаптувати виріб під твій стиль, бо однакових нас не буває, і речі мають це підкреслювати.",
        imageClassName: "object-cover",
    },
    {
        number: "03",
        image: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1788375940/BlackBerry/photo_2026-09-02_18-24-58_2_zi6g1f.png",
        alt: "Балаклава та варіанти прикрас для кастомізації",
        title: "Кастомізація прикрасами",
        description: "Додай харизми! Обирай прикраси до смаку й міксуй їх на свій розсуд, щоб твій аксесуар став абсолютно неповторним і на 100% твоїм.",
        imageClassName: "object-contain object-center",
    },
];

const ContactOptions = (): JSX.Element => {
    return (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
            <p className="max-w-2xl text-left text-sm leading-relaxed text-gray-600 sm:text-base lg:text-[15px]">
                Маєш власну ідею? Напиши нам в Instagram або Telegram — разом оберемо модель, колір і прикраси та створимо особливий виріб саме для тебе.
            </p>
            <div className="flex flex-col gap-2 tablet:flex-row tablet:justify-end">
                <Link
                    href="https://www.instagram.com/blackberry.shop.ua"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Замовити особливий виріб в Instagram"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white text-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6e3382]"
                >
                    <FaInstagram className="size-4" aria-hidden="true"/>
                    Замовити в Instagram
                </Link>
                <Link
                    href="https://t.me/blackberryshopua"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Замовити особливий виріб у Telegram"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white/80 px-4 py-2 text-xs text-nowrap font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-white"
                >
                    <FaTelegram className="size-4" aria-hidden="true"/>
                    Замовити в Telegram
                </Link>
            </div>
        </div>
    );
};

const HandmadeFeatures = (): JSX.Element => {
    return (
        <Reveal>
            <section className="px-2" aria-labelledby="handmade-features-title">
                <div className="overflow-hidden rounded-3xl border border-primary/10 bg-linear-to-br from-[#fdf6f9] via-[#fbf9fc] to-[#f1eafa] px-4 py-8 shadow-[0_10px_30px_rgba(60,34,72,0.05)] sm:px-6 sm:py-9 lg:px-8">
                    <div className="mb-6">
                        <div className="self-start">
                            <p className="mb-3 sm:mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">
                                {/*<span className="relative block size-2 rounded-full bg-primary" aria-hidden="true">*/}
                                {/*    <span className="absolute -right-3 -top-2 size-2 rounded-full bg-primary/20"/>*/}
                                {/*</span>*/}
                                Особливості Black Berry
                            </p>
                            <h2
                                id="handmade-features-title"
                                className="max-w-2xl text-xl font-semibold leading-tight text-gray-950 sm:text-2xl lg:text-[24px]"
                            >
                                Створюємо більше, ніж просто речі.
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
                        {features.map((feature: HandmadeFeature) => (
                            <article
                                key={feature.number}
                                className="relative flex h-full flex-col rounded-[24px] border border-primary/15 bg-white/90 p-3 shadow-[0_8px_24px_rgba(75,38,89,0.04)] hover:border-primary/30 transition-colors"
                            >
                                <div className="relative aspect-4/3 overflow-hidden rounded-[18px] bg-[#f6edf9] tablet:aspect-auto tablet:h-48 lg:h-56 xl:h-60">
                                    <Image
                                        src={feature.image}
                                        alt={feature.alt}
                                        fill
                                        draggable={false}
                                        sizes="(max-width: 1023px) 100vw, 33vw"
                                        className={feature.imageClassName ?? "object-cover object-center select-none"}
                                    />
                                </div>

                                <span
                                    className="absolute left-6 top-6 z-10 flex size-11 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-md"
                                    aria-hidden="true"
                                >
                                    {feature.number}
                                </span>

                                <div className="flex flex-1 flex-col px-2 pb-3 pt-5 sm:px-3 sm:pb-4">
                                    <h3 className="text-sm font-semibold leading-tight text-gray-950 md:text-lg">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2.5 text-xs md:text-sm leading-relaxed text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-primary/10 pt-6">
                        <ContactOptions/>
                    </div>
                </div>
            </section>
        </Reveal>
    );
};

export default HandmadeFeatures;
