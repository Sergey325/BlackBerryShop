import Link from "next/link";
import { FaInstagram, FaTelegram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Accordion from "@/app/components/reusable/Accordion";
import FooterSection from "@/app/components/FooterSection";

export default function Footer() {

    const navigation =
        <div className="flex flex-col gap-3 text-gray-400">
            <Link href="/about" className="text-sm md:text-base  hover:text-[#823D9A] transition">Про нас</Link>
            <Link href="/delivery" className="text-sm md:text-base hover:text-[#823D9A] transition">Доставка та оплата</Link>
            <Link href="/exchange" className="text-sm md:text-base hover:text-[#823D9A] transition">Обмін та повернення</Link>
            <Link href="/offer" className="text-sm md:text-base hover:text-[#823D9A] transition">Договір публічної оферти</Link>
        </div>

    const contacts =
        <div className="flex flex-col gap-3 text-gray-400">
            <a href="tel:+380682787526" className="flex items-center gap-2 text-sm md:text-base hover:text-[#823D9A] transition">
                <MdPhone className="size-5"/>
                +38 (068) 278-75-26
            </a>
            <a href="mailto:blackberry.shop.kh@gmail.com" className="flex items-center gap-2 text-sm md:text-base hover:text-[#823D9A] transition">
                <MdEmail className="size-5"/>
                blackberry.shop.kh@gmail.com
            </a>
            <a href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm md:text-base hover:text-[#823D9A] transition">
                <FaInstagram className="size-5"/>
                @blackberry.shop.ua
            </a>
            <a href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm md:text-base hover:text-[#823D9A] transition">
                <FaTelegram className="size-5"/>
                @blackberryshopua
            </a>
        </div>

    const operatingHours =
        <div className="flex flex-col gap-3 text-gray-400">
            <p className="text-sm md:text-base">ПН – ПТ: 9:00 – 18:00</p>
            <p className="text-sm md:text-base">СБ – НД: вихідний</p>
            <div className="mt-4 text-sm md:text-base leading-relaxed border border-gray-700 rounded-md p-3">
                <p>Відповідаємо на повідомлення в Instagram та Telegram щодня</p>
            </div>
        </div>

    return (
        <footer className="bg-black text-gray-400 mt-auto w-full">
            <div className="max-w-[1366px] mx-auto px-6 pt-12">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Логотип + описание */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="text-white text-2xl font-bold">
                            Black Berry
                        </Link>
                        <p className="text-sm md:text-base leading-relaxed">
                            Магазин якісних товарів ручної роботи. Працюємо з любов&apos;ю до кожного замовлення.
                        </p>
                        <div className="flex gap-5 mt-2">
                            <a href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
                               className="hover:text-pink-500 transition">
                                <FaInstagram className="size-10" />
                            </a>
                            <a href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
                               className="hover:text-sky-500 transition">
                                <FaTelegram className="size-[38.5px]" />
                            </a>
                        </div>
                    </div>

                    {/* Навигация */}
                    <FooterSection title="Навігація">
                        {navigation}
                    </FooterSection>

                    {/* Контакты */}
                    <FooterSection title="Контакти">
                        {contacts}
                    </FooterSection>

                    {/* Режим работы */}
                    <FooterSection title="Режим роботи">
                        {operatingHours}
                    </FooterSection>
                </div>

                {/* Нижняя строка */}
                <div className="border-t border-gray-800 mt-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
                    <p>© {new Date().getFullYear()} Black Berry. Усі права захищені.</p>
                    {/*<div className="flex gap-4">*/}
                    {/*    <Link href="/exchange" className="hover:text-white transition">Обмін та повернення</Link>*/}
                    {/*    <Link href="/offer" className="hover:text-white transition">Публічна оферта</Link>*/}
                    {/*</div>*/}
                </div>

            </div>
        </footer>
    );
}