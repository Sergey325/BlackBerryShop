"use client"

import Link from "next/link";
import Image from "next/image";
import { Great_Vibes } from "next/font/google";
import {useEffect, useState} from "react";
import { FaInstagram, FaTelegram } from "react-icons/fa";
import {useCartStore} from "@/app/hooks/useCartStore";
import Cart from "@/app/components/Cart";
import Container from "@/app/components/reusable/Container";
import {MdEmail, MdPhone} from "react-icons/md";

const greatVibes = Great_Vibes({
    weight: "400",
    subsets: ["latin"],
});
export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [menuOpen]);

    return (
        <header className="w-full border-b border-gray-200 text-base bg-gray-50 relative z-20 select-none px-6">
            <div className="max-w-[1366px] mx-auto flex items-center justify-between h-18">
                {/* Логотип */}
                <div className="flex items-center gap-2 cursor-pointer">
                    <Link href="/" className="overflow-hidden">
                        <Image src="/img.png" alt="BlackBerry" width={60} height={80} className="h-8 w-auto object-contain" />
                    </Link>
                    <Link href="/" className={`text-2xl md:text-3xl bold mt-1 ${greatVibes.className}`}>
                        Black Berry
                    </Link>
                </div>

                {/* Десктоп навигация */}
                {/*<nav className="hidden md:flex items-center text-lg gap-8">*/}
                {/*    <Link href="/about" className="hover:opacity-60 hover:-translate-y-0.5 transition ">Про нас</Link>*/}
                {/*    /!*<Link href="/about" className="hover:opacity-60 hover:-translate-y-0.5 transition ">Контакти</Link>*!/*/}
                {/*    /!*<Link href="/contact" className="hover:opacity-60 hover:-translate-y-0.5 transition ">Умови</Link>*!/*/}
                {/*</nav>*/}

                {/* Десктоп телефон */}
                <div className="flex gap-6 items-start self-start mr-3">
                    <div className="hidden md:block relative group rounded-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:bg-white transition-all duration-300 mt-2 py-3 px-4">
                        <div className="flex items-center gap-2">
                            <p className="">Зв&apos;язок з нами</p>
                            <a href="https://github.com/Sergey325">
                                <FaInstagram size={30} className="group-hover:text-pink-500 transition-all cursor-pointer hover:scale-115"/>
                            </a>
                            <a href="https://github.com/Sergey325">
                                <FaTelegram size={30} className="group-hover:text-sky-500 transition-all cursor-pointer hover:scale-115" />
                            </a>
                        </div>
                        <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300">
                            <div className="pt-3 flex flex-col gap-2 text-sm">
                                <a href="mailto:gigmilitary@gmail.com" className="hover:underline underline-offset-4 hover:-translate-y-0.5 transition">blackberry.shop.kh@gmail.com</a>
                                <a href="tel:+380123456789" className="hover:-translate-y-0.5 transition">+38 (068) 278-75-26</a>
                                <div className="text-gray-500">
                                    <p>Режим роботи магазину:</p>
                                    <p>ПН - ПТ: з 9:00 до 18:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-[19px] hidden md:block">
                        <Cart/>
                    </div>

                </div>


                {/* Бургер кнопка — только мобайл */}
                <div className="md:hidden flex items-center gap-6">
                    <div className="-mt-1">
                        <Cart/>
                    </div>
                    <button
                        className="flex flex-col gap-1.5 p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Меню"
                    >
                        <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Мобильное меню */}
            <div className={`md:hidden fixed inset-0 top-[72px] bg-gray-50 z-20 transition-all duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <nav className="flex flex-col h-full px-6 pt-8 pb-10 gap-0 overflow-y-auto">

                    {/* Навигация */}
                    <div className="flex flex-col gap-1">
                        {[
                            { href: "/about", label: "Про нас" },
                            { href: "/delivery", label: "Доставка та оплата" },
                            { href: "/exchange", label: "Обмін та повернення" },
                        ].map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                className="text-lg font-medium py-3 border-b border-gray-800 hover:text-gray-600 transition"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Контакты */}
                    <div className="mt-4 flex flex-col gap-4">
                        <p className="text-lg">
                            Контакти
                        </p>
                        <a href="tel:+380682787526" className="flex items-center gap-3 transition">
                            <MdPhone size={18} />
                            <span>+38 (068) 278-75-26</span>
                        </a>
                        <a href="mailto:blackberry.shop.kh@gmail.com" className="flex items-center gap-3 hover:text-gray-600 transition">
                            <MdEmail size={18} />
                            <span>blackberry.shop.kh@gmail.com</span>
                        </a>
                        <div className="flex items-center gap-4">
                            <a href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
                               className=" hover:text-pink-500 transition">
                                <FaInstagram className="size-8"/>
                            </a>
                            <a href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
                               className=" hover:text-sky-500 transition">
                                <FaTelegram className="size-[30.5px]"/>
                            </a>
                        </div>
                    </div>

                    <div className="mt-4">
                        <hr className=" border-gray-800 mb-4" />
                        <div className="text-sm mt-1">
                            <p>ПН – ПТ: 9:00 – 18:00</p>
                        </div>
                    </div>

                    {/* Копирайт */}
                    <p className="mt-auto pt-10 text-xs text-gray-700">
                        © {new Date().getFullYear()} Black Berry
                    </p>

                </nav>
            </div>

        </header>
    );
}