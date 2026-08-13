"use client";

import type {ReactElement, ReactNode} from "react";
import {useEffect} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import type {OrderStatus, Prisma} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import {FaInstagram, FaTelegram} from "react-icons/fa";
import {
    FiArrowRight,
    FiCheck,
    FiClock,
    FiHome,
    FiPackage,
    FiRefreshCw,
    FiShield,
    FiTruck,
    FiX,
} from "react-icons/fi";

import {useCartStore} from "@/app/hooks/useCartStore";

type Props = {
    id: string;
    order: Prisma.OrderGetPayload<{
        include: {
            items: true;
        };
    }>;
    status: OrderStatus;
};

type StatusCardProps = {
    children: ReactNode;
    tone: "success" | "pending" | "error";
};

const SuccessfulClient = ({id, status, order}: Props): ReactElement => {
    const router = useRouter();
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect((): (() => void) | undefined => {
        if (status === "PAID") {
            Sentry.withScope((scope) => {
                scope.setTag("event", "payment_success_page");
                scope.setContext("order", {
                    orderId: id,
                    totalAmount: order.totalAmount,
                    paymentMethod: order.paymentMethod,
                });
                Sentry.captureMessage("User viewed successful payment page", "info");
            });

            clearCart();
            return;
        }

        if (status !== "PENDING") {
            return;
        }

        const interval: ReturnType<typeof setInterval> = setInterval(() => {
            router.refresh();
        }, 2000);

        return () => clearInterval(interval);
    }, [status, clearCart, id, order.paymentMethod, order.totalAmount, router]);

    if (status === "PENDING") {
        return (
            <StatusCard tone="pending">
                <div className="flex size-20 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/60">
                    <FiRefreshCw className="size-9 animate-spin text-amber-600" aria-hidden="true"/>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                        Перевіряємо платіж
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold text-gray-950 sm:text-3xl">
                        Очікуємо підтвердження оплати
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                        Зазвичай це займає лише кілька секунд. Статус замовлення
                        <span className="font-semibold text-gray-900"> №{id}</span> оновиться автоматично.
                    </p>
                </div>

                <div className="mt-8 flex w-full max-w-md items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 text-left">
                    <FiClock className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true"/>
                    <p className="text-sm leading-6 text-amber-950">
                        Будь ласка, не закривайте цю сторінку. Якщо підтвердження затримується,
                        перевірте списання у застосунку банку.
                    </p>
                </div>
            </StatusCard>
        );
    }

    if (status === "CANCELLED" || status === "REFUNDED") {
        const isRefunded: boolean = status === "REFUNDED";

        return (
            <StatusCard tone="error">
                <div className="flex size-20 items-center justify-center rounded-full bg-rose-50 ring-8 ring-rose-50/60">
                    <FiX className="size-10 text-rose-600" aria-hidden="true"/>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                        Замовлення №{id}
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold text-gray-950 sm:text-3xl">
                        {isRefunded ? "Оплату повернено" : "Оплата не пройшла"}
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                        {isRefunded
                            ? "Кошти повернено на картку, з якої була здійснена оплата. Термін зарахування залежить від банку."
                            : "Можна спробувати оплатити ще раз або обрати інший спосіб оплати під час оформлення."}
                    </p>
                </div>

                <div className="mt-8 grid w-full max-w-md gap-3 sm:grid-cols-2">
                    {!isRefunded && (
                        <Link
                            href="/cart"
                            className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-[#6e3382]"
                        >
                            Спробувати ще раз
                            <FiArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true"/>
                        </Link>
                    )}
                    <HomeLink className={isRefunded ? "sm:col-span-2" : ""}/>
                </div>

                <SocialLinks/>
            </StatusCard>
        );
    }

    const isCashOnDelivery: boolean = order.paymentMethod === "CASH_ON_DELIVERY";

    return (
        <StatusCard tone="success">
            <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                <FiCheck className="size-10 stroke-[2.5] text-emerald-600" aria-hidden="true"/>
                <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary/70"/>
                <span className="absolute -left-2 bottom-1 size-2 rounded-full bg-amber-400"/>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Оплату підтверджено
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-gray-950 sm:text-4xl">
                    Дякуємо за замовлення!
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                    Ми вже отримали замовлення <span className="font-semibold text-gray-900">№{id}</span> і
                    незабаром почнемо готувати його до відправлення.
                </p>
            </div>

            <div className="mt-8 grid w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/80 sm:grid-cols-3">
                <OrderDetail icon={<FiPackage/>} label="Замовлення" value={`№${id}`}/>
                <OrderDetail
                    icon={<FiShield/>}
                    label={isCashOnDelivery ? "Передоплата" : "Сплачено"}
                    value={formatAmount(order.totalAmount)}
                />
                <OrderDetail icon={<FiTruck/>} label="Відправлення" value="1–4 робочі дні"/>
            </div>

            {isCashOnDelivery && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3 text-sm leading-5 text-gray-700">
                    <FiCheck className="size-4 shrink-0 text-primary" aria-hidden="true"/>
                    Решту суми ви сплатите у відділенні Нової Пошти під час отримання.
                </p>
            )}

            <div className="mt-8 w-full max-w-sm">
                <Link
                    href="/"
                    className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-[#6e3382]"
                >
                    Продовжити покупки
                    <FiArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true"/>
                </Link>
            </div>

            <SocialLinks/>
        </StatusCard>
    );
};

function StatusCard({children, tone}: StatusCardProps): ReactElement {
    const glowColor: string = tone === "success"
        ? "bg-emerald-200/40"
        : tone === "pending"
            ? "bg-amber-200/40"
            : "bg-rose-200/40";

    return (
        <main className="relative isolate flex min-h-[70vh] items-center overflow-hidden px-1 py-12 sm:px-6 sm:py-16">
            <div className={`hidden tablet:block absolute left-[12%] top-[12%] -z-10 size-48 rounded-full blur-3xl ${glowColor}`}/>
            <div className="hidden tablet:block absolute bottom-[8%] right-[10%] -z-10 size-56 rounded-full bg-primary/15 blur-3xl"/>

            <section className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-4xl border border-white/80 bg-white/90 px-5 py-10 shadow-md tablet:shadow-[0_24px_70px_-32px_rgba(48,24,56,0.35)] backdrop-blur-sm sm:px-10 sm:py-12">
                {children}
            </section>
        </main>
    );
}

function OrderDetail({icon, label, value}: {icon: ReactNode; label: string; value: string}): ReactElement {
    return (
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 last:border-b-0 sm:flex-col sm:gap-2 sm:border-b-0 sm:border-r sm:px-3 sm:text-center sm:last:border-r-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-primary shadow-sm">
                {icon}
            </span>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function formatAmount(amount: number): string {
    const [wholePart, decimalPart]: string[] = (Math.round(amount * 100) / 100).toFixed(2).split(".");
    const groupedWholePart: string = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    const formattedNumber: string = decimalPart === "00"
        ? groupedWholePart
        : `${groupedWholePart},${decimalPart}`;

    return `${formattedNumber} грн`;
}

function SocialLinks(): ReactElement {
    return (
        <div className="mt-9 w-full border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">Є питання? Ми поруч</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
                <Link
                    href="https://www.instagram.com/blackberry.shop.ua"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Написати нам в Instagram"
                    className="flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50/70 px-4 py-2 text-sm font-semibold text-pink-700 transition hover:border-pink-200 hover:bg-pink-50"
                >
                    <FaInstagram className="size-5"/>
                    Instagram
                </Link>
                <Link
                    href="https://t.me/blackberryshopua"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Написати нам у Telegram"
                    className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/70 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-50"
                >
                    <FaTelegram className="size-5"/>
                    Telegram
                </Link>
            </div>
        </div>
    );
}

function HomeLink({className = ""}: {className?: string}): ReactElement {
    return (
        <Link
            href="/"
            className={`flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-primary/30 hover:text-primary ${className}`}
        >
            <FiHome className="size-4" aria-hidden="true"/>
            На головну
        </Link>
    );
}

export default SuccessfulClient;
