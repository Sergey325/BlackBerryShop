import { FaInstagram, FaTelegram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import FooterSection from "@/app/components/FooterSection";
import Link from "next/link";

export default function Footer() {

    const navigation =
        <div className="flex flex-col gap-3 text-gray-400">
            <Link href="/catalog" className="text-sm  hover:text-primary transition">Каталог</Link>
            <Link href="/about" className="text-sm  hover:text-primary transition">Про нас</Link>
            <Link href="/delivery" className="text-sm hover:text-primary transition">Доставка та оплата</Link>
            <Link href="/exchange" className="text-sm hover:text-primary transition">Обмін та повернення</Link>
            <Link href="/wholesale" className="text-sm hover:text-primary transition">Оптовим покупцям</Link>
            <Link href="/offer" className="text-sm hover:text-primary transition">Договір публічної оферти</Link>
        </div>

    const contacts =
        <div className="flex flex-col gap-3 text-gray-400">
            <Link href="tel:+380682787526" className="flex items-center gap-2 text-sm hover:text-primary transition">
                <MdPhone className="size-5"/>
                +38 (068) 278-75-26
            </Link>
            <Link href="mailto:blackberry.shop.kh@gmail.com" className="flex items-center gap-2 text-sm hover:text-primary transition">
                <MdEmail className="size-5"/>
                blackberry.shop.kh@gmail.com
            </Link>
            <Link href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm hover:text-primary transition">
                <FaInstagram className="size-5"/>
                @blackberry.shop.ua
            </Link>
            <Link href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm hover:text-primary transition">
                <FaTelegram className="size-5"/>
                @blackberryshopua
            </Link>
        </div>

    const operatingHours =
        <div className="flex flex-col gap-3 text-gray-400">
            <p className="text-sm">ПН – ПТ: 9:00 – 18:00</p>
            <p className="text-sm">СБ – НД: вихідний</p>
            <div className="mt-4 text-sm leading-relaxed border border-primary/60 rounded-md p-3">
                <p>Відповідаємо на повідомлення в Instagram та Telegram щодня</p>
            </div>
        </div>

    return (
        <footer className="bg-black text-gray-400 mt-auto w-full">
            <div className="max-w-[1414px] mx-auto px-6 pt-12">
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
                            <Link href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"  aria-label="Instagram Black Berry"
                               className="hover:text-pink-500 transition">
                                <FaInstagram className="size-10" />
                            </Link>
                            <Link href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer" aria-label="Telegram Black Berry"
                               className="hover:text-sky-500 transition">
                                <FaTelegram className="size-[38.5px]" />
                            </Link>
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
                <div className="border-t border-primary/60 mt-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
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
