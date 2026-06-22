import prisma from "@/app/lib/prisma";
import Link from "next/link";
import {FaClock, FaInstagram, FaTelegram, FaTimesCircle} from "react-icons/fa";
import SuccessfulClient from "@/app/(pages)/successfulPayment/SuccessfulClient";

type Props = {
    searchParams: Promise<{ id?: string }>;
};

export default async function SuccessfulPayment({ searchParams }: Props) {
    const { id } = await searchParams;

    const order = id
        ? await prisma.order.findUnique({ where: { id: Number(id) } })
        : null;

    if (!order) {
        return (
            <div className="max-w-md mx-auto py-20 px-6 text-center">
                <FaTimesCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Замовлення не знайдено</h1>
                <p className="text-gray-500 mb-6">Перевірте посилання або зверніться до підтримки.</p>
                <Link href="/" className="text-purple-600 hover:underline">На головну</Link>
            </div>
        );
    }

    // Webhook может ещё не успеть прийти к моменту редиректа — статус PENDING это нормально
    const isPaid = order.status === "PAID";
    const isFailed = order.status === "CANCELLED";

    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center">

            {isPaid && (
                <SuccessfulClient id={id}/>
            )}

            {isFailed && (
                <>
                    <FaTimesCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2 text-center">Оплата не пройшла</h1>
                    <p className="text-gray-500 text-center">Спробуйте ще раз або оберіть інший спосіб оплати.</p>
                    <div className="bg-gray-50 rounded-md mt-20 text-center">
                        <p className="text-gray-700 text-center">
                            Виникли запитання — зв&apos;яжіться з нами в наших соцмережах.
                        </p>
                        <div className="flex justify-center gap-4 mt-4 text-base md:text-lg">
                            <a href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition">
                                <FaInstagram className="size-6"/>
                                Instagram
                            </a>
                            <a href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition">
                                <FaTelegram className="size-6"/>
                                Telegram
                            </a>
                        </div>
                    </div>
                </>
            )}

            {!isPaid && !isFailed && (
                <>
                    <FaClock size={48} className="text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Очікуємо підтвердження оплати</h1>
                    <p className="text-gray-500">Статус замовлення #{order.id} оновиться протягом кількох секунд. Оновіть сторінку.</p>
                </>
            )}

            <Link href="/" className="inline-block mt-8 text-purple-600 hover:underline">
                Повернутися на головну
            </Link>
        </div>
    );
}