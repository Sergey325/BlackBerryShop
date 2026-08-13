import type {Metadata} from "next";
import Link from "next/link";
import {FaTelegram} from "react-icons/fa";
import {FiArrowRight, FiHome, FiSearch} from "react-icons/fi";

import prisma from "@/app/lib/prisma";
import {createNoIndexMetadata} from "@/app/lib/seo";
import SuccessfulClient from "./SuccessfulClient";

export const metadata: Metadata = createNoIndexMetadata("Статус замовлення", "/successfulPayment");

type Props = {
    searchParams: Promise<{ id?: string }>;
};

export default async function SuccessfulPayment({ searchParams }: Props) {
    const { id } = await searchParams;
    const orderId: number = Number(id);
    const hasValidOrderId: boolean = Number.isInteger(orderId) && orderId > 0;

    const order = hasValidOrderId
        ? await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: { items: true }
        })
        : null;

    if (!order) {
        return (
            <main className="relative isolate flex min-h-[70vh] items-center overflow-hidden px-1 py-12 sm:px-6 sm:py-16">
                <div className="hidden tablet:block absolute left-[12%] top-[12%] -z-10 size-48 rounded-full bg-gray-200/60 blur-3xl"/>
                <div className="hidden tablet:block absolute bottom-[8%] right-[10%] -z-10 size-56 rounded-full bg-primary/10 blur-3xl"/>

                <section className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-4xl border border-white/80 bg-white/90 px-5 py-10 shadow-md tablet:shadow-[0_24px_70px_-32px_rgba(48,24,56,0.35)] backdrop-blur-sm sm:px-10 sm:py-12">
                    <div className="flex size-20 items-center justify-center rounded-full bg-gray-100 ring-8 ring-gray-100/60">
                        <FiSearch className="size-9 text-gray-500" aria-hidden="true"/>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Не вдалося знайти
                        </p>
                        <h1 className="mt-3 text-2xl font-semibold text-gray-950 sm:text-3xl">
                            Замовлення не знайдено
                        </h1>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                            Якщо оплату вже здійснено,
                            напишіть нам — ми допоможемо знайти замовлення.
                        </p>
                    </div>

                    <div className="mt-8 grid w-full max-w-md gap-3 sm:grid-cols-2">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-[#6e3382]"
                        >
                            <FiHome className="size-4" aria-hidden="true"/>
                            На головну
                        </Link>
                        <Link
                            href="https://t.me/blackberryshopua"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-primary/30 hover:text-primary"
                        >
                            <FaTelegram className="size-4 text-sky-600" aria-hidden="true"/>
                            Написати нам
                            <FiArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true"/>
                        </Link>
                    </div>

                    <p className="mt-7 text-center text-xs leading-5 text-gray-400">
                        Підготуйте номер телефону або email, вказаний під час оформлення.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <SuccessfulClient
            id={String(order.id)}
            status={order.status}
            order={order}
        />
    );
}
