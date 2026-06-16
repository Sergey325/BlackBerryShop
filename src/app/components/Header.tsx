"use client"

import Link from "next/link";
import Image from "next/image";
import { Great_Vibes } from "next/font/google";
import {useState} from "react";
import { FaInstagram, FaTelegram } from "react-icons/fa";
import {useCartStore} from "@/app/hooks/useCartStore";
import Cart from "@/app/components/Cart";

const greatVibes = Great_Vibes({
    weight: "400",
    subsets: ["latin"],
});
export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);


    return (
        <header className="w-full border-b border-gray-200 text-base bg-gray-50 relative z-20 select-none">
            <div className="max-w-[1366px] mx-auto flex items-center justify-between h-18">
                {/* Логотип */}
                <div className="flex items-center gap-2 cursor-pointer">
                    <Link href="/" className="overflow-hidden">
                        <Image src="/img.png" alt="BlackBerry" width={60} height={80} className="h-8 w-auto object-contain" />
                    </Link>
                    <Link href="/" className={`text-xl md:text-3xl bold mt-1 ${greatVibes.className}`}>
                        Black Berry
                    </Link>
                </div>

                {/* Десктоп навигация */}
                <nav className="hidden md:flex items-center text-lg gap-8">
                    <Link href="/catalog" className="hover:opacity-60 hover:-translate-y-0.5 transition ">Каталог</Link>
                    <Link href="/about" className="hover:opacity-60 hover:-translate-y-0.5 transition ">О нас</Link>
                    <Link href="/contact" className="hover:opacity-60 hover:-translate-y-0.5 transition ">Контакти</Link>
                </nav>

                {/* Десктоп телефон */}
                <div className="flex gap-6 items-start self-start mr-3">
                    <div className="hidden md:block relative group rounded-sm hover:shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:bg-white transition-all duration-300 mt-2 py-3 px-4">
                        <div className="flex items-center gap-2">
                            <p className="">Зв'язок з нами</p>
                            <a href="https://github.com/Sergey325">
                                <FaInstagram size={30} className="group-hover:text-pink-500 transition-all cursor-pointer hover:scale-115"/>
                            </a>
                            <a href="https://github.com/Sergey325">
                                <FaTelegram size={30} className="group-hover:text-sky-500 transition-all cursor-pointer hover:scale-115" />
                            </a>
                        </div>
                        <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300 select-all">
                            <div className="pt-3 flex flex-col gap-2 text-sm">
                                <a href="mailto:gigmilitary@gmail.com" className="hover:underline underline-offset-4 hover:-translate-y-0.5 transition">gigmilitary@gmail.com</a>
                                <a href="tel:+380123456789" className="hover:-translate-y-0.5 transition">+380123456789</a>
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
            <div className={`md:hidden fixed inset-0 top-[72px] bg-gray-50 z-50 transition-all duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} z-20`}>
                <nav className="flex flex-col px-6 pt-6 pb-4 gap-6 text-lg">
                    <Link href="/catalog" onClick={() => setMenuOpen(false)}>Каталог</Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)}>О нас</Link>
                    <Link href="/contact" onClick={() => setMenuOpen(false)}>Контакти</Link>
                    <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <p>Соц. мережі</p>
                            <a href="https://github.com/Sergey325">
                                <FaInstagram size={30} className="text-pink-500 cursor-pointer hover:scale-115"/>
                            </a>
                            <a href="https://github.com/Sergey325">
                                <FaTelegram size={30} className="text-sky-500 cursor-pointer hover:scale-115" />
                            </a>
                        </div>
                        <a href="tel:+380123456789">+380123456789</a>
                        <a href="mailto:gigmilitary@gmail.com" className="text-sm">gigmilitary@gmail.com</a>
                        <div className="text-sm text-gray-500">
                            <p>Режим роботи магазину:</p>
                            <p>ПН - ПТ: з 9:00 до 18:00</p>
                        </div>
                    </div>
                </nav>
            </div>

        </header>
    );
}