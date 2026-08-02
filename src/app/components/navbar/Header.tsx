"use client"

import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import { FaInstagram, FaTelegram } from "react-icons/fa";
import Cart from "@/app/components/Cart";
import {MdEmail, MdPhone} from "react-icons/md";
import SearchBar from "@/app/components/navbar/SearchBar";
import {BiSearch} from "react-icons/bi";
import MobileSearchOverlay from "@/app/components/navbar/MobileSearchOverlay";
import useMobileSearchModal from "@/app/hooks/useMobileSearchModal";
import { vladimir } from "@/app/fonts";
import Link from "next/link";

const ContactDropdown = () => {
    return (
        <div className="relative group">
            <button className="hover:opacity-60 hover:-translate-y-0.5 transition">
                Контакти
            </button>

            <div
                className="
                    absolute
                    left-1/2
                    -translate-x-1/2
                    top-full
                    mt-2
                    w-72
                    rounded-md
                    bg-white
                    shadow-lg
                    border
                    border-primary/30
                    opacity-0
                    invisible
                    group-hover:opacity-100
                    group-hover:visible
                    transition-all
                    duration-300
                    p-4
                "
            >
                <div className="flex flex-col gap-2 text-sm">
                    <Link href="tel:+380682787526" className="flex items-center gap-2 text-sm hover:text-primary transition">
                        <MdPhone className="size-5"/>
                        +38 (068) 278-75-26
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
                    <Link href="mailto:blackberry.shop.kh@gmail.com" className="flex items-center gap-2 text-sm hover:text-primary transition">
                        <MdEmail className="size-5"/>
                        blackberry.shop.kh@gmail.com
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const mobileSearch = useMobileSearchModal();

    const mobileMenuRef = useRef(null);

    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
        return () => document.body.classList.remove("no-scroll");
    }, [menuOpen]);

    return (
        <header className="w-full border-b border-gray-200 text-base bg-white z-50 select-none px-6 top-0 shadow-sm sticky">
            <div className="max-w-[1366px] mx-auto flex items-center justify-between h-18 bg-white">
                {/* Логотип */}
                <div className="flex items-center tablet:gap-2 cursor-pointer bg-white">
                    <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center tablet:gap-2 cursor-pointer bg-white"
                    >
                        <Image
                            src="/imgLogo.png"
                            alt="BlackBerry"
                            width={60}
                            height={80}
                            draggable={false}
                            className="h-8 w-auto object-contain bg-white"
                        />

                        <span className={`text-3xl tablet:text-4xl font-bold ${vladimir.className}`}>
        Black Berry
    </span>
                    </Link>
                </div>

                {/* Десктоп навигация */}
                <nav className="hidden tablet:flex items-center text-base gap-8">
                    <Link href="/about" className="hover:opacity-60 hover:-translate-y-0.5 transition ">Про нас</Link>
                    <Link href="/catalog" className="hover:opacity-60 hover:-translate-y-0.5 transition ">Каталог</Link>
                    <ContactDropdown/>
                </nav>

                {/* Десктоп телефон */}
                <div className="flex gap-6 items-center mr-3">
                    <div className="hidden tablet:block">
                        <SearchBar/>
                    </div>
                    <div className="hidden tablet:block">
                        <Cart/>
                    </div>

                </div>


                {/* Бургер кнопка — только мобайл */}
                <div className="tablet:hidden flex items-center gap-5">
                    <button onClick={mobileSearch.onOpen} aria-label="Пошук">
                        <BiSearch className="size-7" />
                    </button>
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
            <div
                ref={mobileMenuRef}
                className={`md:hidden fixed inset-0 top-[72px] bg-white z-20 transition-all duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            >
                <nav className="flex flex-col h-full px-6 pb-10 gap-0 overflow-y-auto">

                    {/* Навигация */}
                    <div className="flex flex-col gap-1">
                        {[
                            { href: "/catalog", label: "Каталог" },
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
                        <Link href="tel:+380682787526" className="flex items-center gap-3 transition">
                            <MdPhone size={18} />
                            <span>+38 (068) 278-75-26</span>
                        </Link>
                        <Link href="mailto:blackberry.shop.kh@gmail.com" className="flex items-center gap-3 hover:text-gray-600 transition">
                            <MdEmail size={18} />
                            <span>blackberry.shop.kh@gmail.com</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
                               className=" hover:text-pink-500 transition">
                                <FaInstagram className="size-8"/>
                            </Link>
                            <Link href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
                               className=" hover:text-sky-500 transition">
                                <FaTelegram className="size-[30.5px]"/>
                            </Link>
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
            <MobileSearchOverlay />
        </header>
    );
}
