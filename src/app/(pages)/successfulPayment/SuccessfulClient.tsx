"use client";

import {
    FaCheckCircle,
    FaInstagram,
    FaTelegram,
    FaTimesCircle
} from "react-icons/fa";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/hooks/useCartStore";
import Loader from "@/app/components/reusable/Loader";
import {OrderStatus, Prisma} from "@prisma/client";
import Link from "next/link";
import {trackMetaEvent} from "@/app/lib/analytics/meta";


type Props = {
    id: string;
    order: Prisma.OrderGetPayload<{
        include: {
            items: true;
        };
    }>;
    status: OrderStatus;
};


const SuccessfulClient = ({ id, status, order }: Props) => {
    const router = useRouter();
    const clearCart = useCartStore(state => state.clearCart);

    useEffect(() => {

        if (status === "PAID") {
            clearCart();

            trackMetaEvent("Purchase", {
                content_ids: order.items.map(item => item.productId),
                content_type: "product",
                value: order.totalAmount,
                currency: "UAH",

                contents: order.items.map(item => ({
                    id: item.productId,
                    quantity: item.quantity,
                    color: item.colorName,
                    size: item.size,
                })),
            });

            return;
        }


        if (status !== "PENDING") {
            return;
        }


        const interval = setInterval(() => {
            router.refresh();
        }, 2000);


        return () => clearInterval(interval);

    }, [status, clearCart, router]);



    if (status === "PENDING") {
        return (
            <div className="max-w-md mx-auto py-20 px-6 text-center">

                <Loader isFullScreen={false}/>

                <h1 className="text-2xl font-bold mb-2">
                    Очікуємо підтвердження оплати
                </h1>

                <p className="text-gray-500">
                    Статус замовлення #{id} оновиться протягом кількох секунд.
                </p>

            </div>
        );
    }



    if (status === "CANCELLED") {
        return (
            <div className="max-w-md mx-auto py-20 px-6 text-center">

                <FaTimesCircle
                    size={48}
                    className="text-red-500 mx-auto mb-4"
                />

                <h1 className="text-2xl font-bold mb-2">
                    Оплата не пройшла
                </h1>

                <p className="text-gray-500">
                    Спробуйте ще раз або оберіть інший спосіб оплати.
                </p>


                <SocialLinks />

                <BackButton />

            </div>
        );
    }



    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center">

            <FaCheckCircle
                size={48}
                className="text-green-500 mx-auto mb-4"
            />

            <h1 className="text-2xl font-bold mb-2">
                Дякуємо за замовлення!
            </h1>

            <p className="text-gray-500">
                Замовлення #{id} успішно оплачено.
            </p>

            <p className="text-gray-800 mt-5">
                Термін відправлення:
                <span className="font-medium">
                    {" "}від 1 до 4 днів
                </span>
            </p>


            <SocialLinks />

            <BackButton />

        </div>
    );
};



function SocialLinks() {
    return (
        <div className="bg-gray-50 rounded-md mt-20 text-center p-4">

            <p className="text-gray-700">
                Залишилися питання — зв&apos;яжіться з нами:
            </p>


            <div className="flex justify-center gap-4 mt-4">

                <a
                    href="https://www.instagram.com/blackberry.shop.ua"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-600"
                >
                    <FaInstagram className="size-6"/>
                    Instagram
                </a>


                <a
                    href="https://t.me/blackberryshopua"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sky-600"
                >
                    <FaTelegram className="size-6"/>
                    Telegram
                </a>

            </div>

        </div>
    );
}



function BackButton() {
    return (
        <Link
            href="/"
            className="inline-block mt-8 text-purple-600 hover:underline"
        >
            Повернутися на головну
        </Link>
    );
}


export default SuccessfulClient;