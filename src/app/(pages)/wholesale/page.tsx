import type {Metadata} from "next";
import Link from "next/link";
import {FaTelegram} from "react-icons/fa";
import {createMetadata} from "@/app/lib/seo";

export const metadata: Metadata = createMetadata({
    title: "Оптові замовлення",
    description: "Оптові замовлення пледів, головних уборів і в’язаних аксесуарів Black Berry для магазинів, шоурумів та онлайн-магазинів.",
    path: "/wholesale",
});

export default function WholesalePage() {
    return (
        <div className="max-w-[800px] mx-auto py-16 px-6 flex flex-col gap-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Оптові замовлення</h1>
                <p className="text-gray-700 leading-relaxed">
                    Ми працюємо не лише в роздріб, а й приймаємо <span className="font-semibold">оптові замовлення</span> для магазинів,
                    шоурумів, онлайн-магазинів та інших партнерів.
                </p>
            </div>

            <section className="flex flex-col gap-4">
                <p className="text-gray-700 leading-relaxed">
                    Оптові замовлення можливі на різні товари з нашого асортименту, зокрема:
                </p>

                <ul className="flex flex-col gap-3 border border-gray-300 rounded-md p-6 text-gray-700">
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        пледи ручної роботи;
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        шапки та балаклави;
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        інші в’язані аксесуари;
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        вироби під індивідуальне замовлення.
                    </li>
                </ul>
            </section>

            <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">Вартість та умови оптового замовлення розраховуються індивідуально</span> та залежать від
                кількості товару, обраних моделей, кольорів та інших побажань.
            </p>

            <p className="text-gray-700 leading-relaxed">
                Якщо вас цікавить опт, напишіть нам у <span className="font-semibold">Telegram</span>. Ми проконсультуємо, допоможемо
                підібрати товари та зробимо розрахунок саме під ваше замовлення.
            </p>

            <div className="bg-gray-50 rounded-md px-6 py-3 sm:py-6 text-center">
                <p className="text-gray-700 font-medium">
                    Напишіть нам — обговоримо ваше замовлення та умови співпраці.
                </p>
                <Link
                    href="https://t.me/blackberryshopua"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-base md:text-lg text-sky-600 hover:text-sky-700 transition"
                >
                    <FaTelegram className="size-6"/>
                    Telegram
                </Link>
            </div>
        </div>
    );
}
