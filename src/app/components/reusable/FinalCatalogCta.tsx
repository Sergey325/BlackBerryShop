import Image from "next/image";
import Link from "next/link";
import {FaArrowRightLong} from "react-icons/fa6";
import type {JSX} from "react";
import Reveal from "@/app/components/reusable/Reveal";

type Props = {
    className?: string;
};

const FinalCatalogCta = ({className = ""}: Props): JSX.Element => {
    return (
        <Reveal>
            <section
                aria-labelledby="final-catalog-cta-title"
                className={`px-2 ${className}`}
            >
            <div className="relative isolate overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-[#fdf2f8] via-white to-[#ede9fe] px-6 py-10 shadow-[0_12px_35px_rgba(60,34,72,0.08)] sm:px-10 sm:py-12 lg:px-14">
                <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-24 size-64 rounded-full bg-primary/10 blur-2xl"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-28 left-1/3 size-56 rounded-full bg-pink-200/35 blur-3xl"
                />

                <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
                    <div className="max-w-3xl">
                        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
                            <Image
                                src="/header-logo.png"
                                alt=""
                                width={24}
                                height={24}
                                className="size-6 object-contain"
                            />
                            Авторські речі ручної роботи
                        </div>

                        <h2
                            id="final-catalog-cta-title"
                            className="text-2xl font-semibold leading-tight text-gray-950 sm:text-3xl lg:text-4xl"
                        >
                            Знайди річ, яка підкреслить саме твій характер
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
                            Обирай особливі головні убори та аксесуари для дітей і дорослих —
                            з турботою про комфорт, деталі та індивідуальність.
                        </p>
                    </div>

                    <Link
                        href="/catalog"
                        className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(130,61,154,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6e3382] hover:shadow-[0_12px_26px_rgba(130,61,154,0.32)] sm:w-fit sm:text-base"
                    >
                        Перейти до каталогу
                        <FaArrowRightLong className="size-4 transition-transform duration-300 group-hover:translate-x-1"/>
                    </Link>
                </div>
            </div>
            </section>
        </Reveal>
    );
};

export default FinalCatalogCta;
