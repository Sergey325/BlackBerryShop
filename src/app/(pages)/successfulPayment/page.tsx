import prisma from "@/app/lib/prisma";
import Link from "next/link";
import { FaTimesCircle } from "react-icons/fa";
import SuccessfulClient from "./SuccessfulClient";

type Props = {
    searchParams: Promise<{ id?: string }>;
};

export default async function SuccessfulPayment({ searchParams }: Props) {
    const { id } = await searchParams;

    const order = id
        ? await prisma.order.findUnique({
            where: {
                id: Number(id),
            },
            include: { items: true }
        })
        : null;



    if (!order) {
        return (
            <div className="max-w-md mx-auto py-20 px-6 text-center">
                <FaTimesCircle
                    size={48}
                    className="text-red-500 mx-auto mb-4"
                />

                <h1 className="text-2xl font-bold mb-2">
                    Замовлення не знайдено
                </h1>

                <p className="text-gray-500 mb-6">
                    Перевірте посилання або зверніться до підтримки.
                </p>

                <Link
                    href="/"
                    className="text-purple-600 hover:underline"
                >
                    На головну
                </Link>
            </div>
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