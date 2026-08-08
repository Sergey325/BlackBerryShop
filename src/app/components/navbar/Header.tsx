"use client"

import Image from "next/image";import {useEffect, useState} from "react";import { FaInstagram, FaTelegram } from "react-icons/fa";import Cart from "@/app/components/Cart";import {MdEmail, MdPhone} from "react-icons/md";import SearchBar from "@/app/components/navbar/SearchBar";import {BiSearch} from "react-icons/bi";import MobileSearchOverlay from "@/app/components/navbar/MobileSearchOverlay";import useMobileSearchModal from "@/app/hooks/useMobileSearchModal";import { vladimir } from "@/app/fonts";import Link from "next/link";import {usePathname} from "next/navigation";import {FiGrid, FiInfo, FiRefreshCw, FiTruck} from "react-icons/fi";

const mobileNavigationOptions = [{href: "/catalog", label: "Каталог", icon: FiGrid},{href: "/about", label: "Про нас", icon: FiInfo},{href: "/delivery", label: "Доставка та оплата", icon: FiTruck},{href: "/exchange", label: "Обмін та повернення", icon: FiRefreshCw},];

const ContactDropdown = () => {return (<div className="relative group"><button className="hover:opacity-60 hover:-translate-y-0.5 transition">Контакти</button>

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

export default function Header() {const pathname = usePathname();const [menuOpen, setMenuOpen] = useState(false);const mobileSearch = useMobileSearchModal();

    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
        return () => document.body.classList.remove("no-scroll");
    }, [menuOpen]);

    return (
        <>
        <header className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white px-4 lg:px-6 text-base select-none ${menuOpen ? "shadow-none" : "shadow-sm"}`}>
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

                            <span className={`mt-0.5 text-3xl tablet:text-4xl font-bold ${vladimir.className}`}>
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
                            <BiSearch className="size-[27px] md:size-8" />
                        </button>
                        <div className="-mt-1">
                            <Cart/>
                        </div>
                        <button
                            type="button"
                            className="flex size-10 flex-col items-center justify-center gap-1.5 rounded-lg transition hover:bg-gray-100"
                            onClick={() => setMenuOpen((current) => !current)}
                            aria-label="Меню"
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                        >
                            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Мобильное меню */}
            <div
                className={`fixed inset-x-0 top-[72px] bottom-0 z-40 bg-white transition-all duration-300 tablet:hidden ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
            >
                <nav id="mobile-navigation" className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-4">
                    <div className="flex flex-col gap-2">
                        {mobileNavigationOptions.map(({href, label, icon: Icon}) => {
                            const isActive = pathname === href || (href === "/catalog" && pathname.startsWith("/catalog/"));

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMenuOpen(false)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${
                                        isActive
                                            ? "bg-white text-primary shadow-sm ring-1 ring-gray-200"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <Icon className="size-5 shrink-0"/>
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4 shadow-sm ring-1 ring-gray-200">
                        <p className="mb-4 text-base font-medium text-gray-800">Контакти</p>
                        <div className="flex flex-col gap-4 text-sm text-gray-700">
                            <Link href="tel:+380682787526" className="flex items-center gap-3 transition hover:text-primary">
                                <MdPhone className="size-5 shrink-0"/>
                                <span>+38 (068) 278-75-26</span>
                            </Link>
                            <Link href="mailto:blackberry.shop.kh@gmail.com" className="flex items-center gap-3 transition hover:text-primary">
                                <MdEmail className="size-5 shrink-0"/>
                                <span className="break-all">blackberry.shop.kh@gmail.com</span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link
                                    href="https://www.instagram.com/blackberry.shop.ua"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="transition hover:text-pink-500"
                                >
                                    <FaInstagram className="size-7"/>
                                </Link>
                                <Link
                                    href="https://t.me/blackberryshopua"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Telegram"
                                    className="transition hover:text-sky-500"
                                >
                                    <FaTelegram className="size-7"/>
                                </Link>
                            </div>
                            <p className="border-t border-gray-200 pt-4">ПН – ПТ: 9:00 – 18:00</p>
                        </div>
                    </div>

                    <p className="mt-auto pt-6 text-xs text-gray-600">
                        © {new Date().getFullYear()} Black Berry
                    </p>
                </nav>
            </div>
            <MobileSearchOverlay/>
        </>
    );
}
