'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FiSliders, FiGrid, FiList,
    FiX, FiChevronDown
} from 'react-icons/fi';
import slugifyUa from "@/app/utils/slugify";
import {Season} from "@prisma/client";
import {useParams} from "next/navigation";
import FiltersContent from "@/app/(pages)/catalog/[category]/components/FiltersContent";
import ProductCard from "@/app/(pages)/catalog/[category]/components/ProductCard";
import Pagination from "@/app/(pages)/catalog/[category]/components/Pagination";
import {IProduct} from "@/app/actions/getProducts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ColorVariant { color: string; image: string; }
interface Product { id: number; name: string; price: number; variants: ColorVariant[]; }

// ─── Mock data ───────────────────────────────────────────────────────────────

// const CATEGORY = {
//     name: 'Панамки',
//     count: 48,
//     desc: 'Стильні панамки ручної роботи для дітей і підлітків. Легкі, зручні та яскраві — ідеальні для сонячних днів ☀️',
//     image: '/cat-banner-panamky.jpg',
//     features: ['Ручна робота', 'Якісні матеріали', 'Зручна посадка'],
// };

const ALL_CATEGORIES = [
    {
        name: "Панами",
        slug: slugifyUa("Панами"),
        description: "Стильні панамки ручної роботи для дітей і підлітків. Легкі, зручні та яскраві — ідеальні для сонячних днів ☀️",
        icon: "/IMG_1590.PNG",
        coverImage: "/IMG_1590.PNG",
        season: Season.SUMMER,
        features: ['Ручна робота', 'Якісні матеріали', 'Зручна посадка'],
        count: 17,
        active: false
    },
    {
        name: "Кепки",
        slug: slugifyUa("Кепки"),
        description: "Стильні кепки ручної роботи для дітей і підлітків. Легкі, зручні та яскраві — ідеальні для сонячних днів ☀️",
        icon: "/icons/beanie.svg",
        coverImage: "/IMG_1576.PNG",
        season: Season.SUMMER,
        features: ['Ручна робота', 'Якісні матеріали', 'Зручна посадка'],
        count: 36,
        active: false
    },
    {
        name: "Балаклави",
        slug: slugifyUa("Балаклави"),
        description: "Стильні панамки ручної роботи для дітей і підлітків. Легкі, зручні та яскраві — ідеальні для сонячних днів ☀️",
        icon: "/IMG_1590.PNG",
        coverImage: "/IMG_1590.PNG",
        season: Season.SUMMER,
        features: ['Ручна робота', 'Якісні матеріали', 'Зручна посадка'],
        count: 17,
        active: false
    },
    {
        name: "Шапки",
        slug: slugifyUa("Шапки"),
        description: "Стильні панамки ручної роботи для дітей і підлітків. Легкі, зручні та яскраві — ідеальні для сонячних днів ☀️",
        icon: "/IMG_1590.PNG",
        coverImage: "/IMG_1590.PNG",
        season: Season.SUMMER,
        features: ['Ручна робота', 'Якісні матеріали', 'Зручна посадка'],
        count: 17,
        active: false
    },
    {
        name: "Мітенки",
        slug: slugifyUa("Мітенки"),
        description: "Стильні панамки ручної роботи для дітей і підлітків. Легкі, зручні та яскраві — ідеальні для сонячних днів ☀️",
        icon: "/IMG_1590.PNG",
        coverImage: "/IMG_1590.PNG",
        season: Season.SUMMER,
        features: ['Ручна робота', 'Якісні матеріали', 'Зручна посадка'],
        count: 17,
        active: false
    },
];

// const PRODUCTS: Product[] = [
//     'Панама "Teddy"', 'Панама "Рожева мрія"', 'Панама "Mint"', 'Панама "Лаванда"',
//     'Панама "Kuromi"', 'Панама "Stitch"', 'Панама "Capybara"', 'Панама "Cherry"',
//     'Панама "Duck"', 'Панама "Hello Kitty"', 'Панама "Frog"', 'Панама "Cow"',
// ].map((name, i) => ({
//     id: i + 1, name, price: 590,
//     variants: [
//         { color: '#f5c6cb', image: `/products/p${i + 1}-1.jpg` },
//         { color: '#c3e6cb', image: `/products/p${i + 1}-2.jpg` },
//         { color: '#b8daff', image: `/products/p${i + 1}-3.jpg` },
//     ],
// }));


// ─── Page ────────────────────────────────────────────────────────────────────
type Props = {
    products: IProduct[];
};

export default function CategoryClientPage({products}: Props) {
    const params = useParams();
    const [filterOpen, setFilterOpen] = useState(false);
    const [sort, setSort]             = useState('popular');
    const [view, setView]             = useState<'grid' | 'list'>('grid');
    const [perPage, setPerPage]       = useState('24');

    const selectedCategory = ALL_CATEGORIES.find(c => c.slug === params.category)
    console.log(slugifyUa("Панами"))
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Breadcrumb — desktop */}
                <nav className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 mb-5">
                    <Link href="/" className="hover:text-gray-600 transition-colors">Головна</Link>
                    <span>›</span>
                    <Link href="/catalog" className="hover:text-gray-600 transition-colors">Каталог</Link>
                    <span>›</span>
                    <span className="text-gray-700">{selectedCategory?.name}</span>
                </nav>

                {/* ── Banner ────────────────────────────────────────────── */}

                {/* Desktop */}
                <div className="hidden sm:flex items-stretch bg-gray-50 rounded-3xl overflow-hidden mb-8 min-h-[220px]">
                    <div className="flex-1 px-10 py-8 flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                            {selectedCategory?.name}
                            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                                {selectedCategory?.count} моделей
                            </span>
                        </h1>
                        <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
                            {selectedCategory?.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategory?.features.map(f => (
                                <span key={f}
                                      className="text-xs font-medium bg-white border border-gray-100 text-gray-600 px-3 py-1.5 rounded-xl shadow-sm">
                                    💜 {f}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Hero image — right side */}
                    <div className="relative w-[42%] shrink-0">
                        <Image src={selectedCategory?.coverImage || ""} alt={selectedCategory?.name || "gg"} fill priority
                               className="object-cover object-top" />
                        {/* fade into banner bg */}
                        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Mobile */}
                <div className="sm:hidden relative h-56 rounded-2xl overflow-hidden mb-4">
                    <Image src={selectedCategory?.coverImage || ""} alt={selectedCategory?.name || "gg"} fill priority className="object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                            <h1 className="text-xl font-bold text-white">{selectedCategory?.name}</h1>
                            <span className="text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full">
                                {selectedCategory?.count} моделей
                            </span>
                        </div>
                        <p className="text-white/75 text-xs leading-relaxed line-clamp-2">{selectedCategory?.description}</p>
                    </div>
                </div>

                {/* ── Toolbar ───────────────────────────────────────────── */}
                <div className="flex items-center gap-2 mb-5">

                    {/* Desktop: static "Фільтри" label aligned with sidebar */}
                    <div className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-700 w-52 shrink-0">
                        <FiSliders className="w-4 h-4" />
                        Фільтри
                    </div>

                    {/* Mobile: filter button */}
                    <button
                        onClick={() => setFilterOpen(true)}
                        className="sm:hidden flex items-center gap-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl transition-colors"
                    >
                        <FiSliders className="w-4 h-4" />
                        Фільтри
                    </button>

                    {/* Sort */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="hidden sm:inline shrink-0">Сортування:</span>
                        <div className="relative">
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer transition-colors"
                            >
                                <option value="popular">Популярні</option>
                                <option value="new">Новинки</option>
                                <option value="price_asc">Ціна ↑</option>
                                <option value="price_desc">Ціна ↓</option>
                            </select>
                            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Per page — desktop */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                            <span>Показати:</span>
                            <div className="relative">
                                <select
                                    value={perPage}
                                    onChange={e => setPerPage(e.target.value)}
                                    className="appearance-none bg-gray-100 text-gray-700 text-sm font-medium pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer"
                                >
                                    <option>24</option>
                                    <option>48</option>
                                    <option>96</option>
                                </select>
                                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Grid / List toggle — desktop */}
                        <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
                            {(['grid', 'list'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setView(m)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        view === m ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {m === 'grid' ? <FiGrid className="w-4 h-4" /> : <FiList className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Layout: sidebar + products ─────────────────────────── */}
                <div className="flex gap-6">

                    {/* Sidebar — desktop only */}
                    <aside className="hidden sm:block w-52 shrink-0 self-start">
                        <FiltersContent categories={ALL_CATEGORIES} />
                    </aside>

                    {/* Products */}
                    <div className="flex-1 min-w-0">
                        <div className={`grid gap-3 sm:gap-4 ${
                            view === 'list'
                                ? 'grid-cols-1'
                                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}>
                            {products.map(p => <ProductCard key={p.id} product={p} list={view === 'list'} />)}
                        </div>
                        <Pagination />
                    </div>
                </div>
            </div>

            {/* ── Mobile filter modal ────────────────────────────────────── */}
            {filterOpen && (
                <>
                    {/* backdrop */}
                    <div
                        className="sm:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                        onClick={() => setFilterOpen(false)}
                    />
                    {/* sheet */}
                    <div className="sm:hidden fixed inset-0 z-50 flex flex-col bg-white">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                <FiSliders className="w-4 h-4" />
                                Фільтри
                            </div>
                            <button onClick={() => setFilterOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable filter content */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4">
                            <FiltersContent categories={ALL_CATEGORIES} />
                        </div>

                        {/* Apply button */}
                        <div className="px-4 pb-6 pt-3 border-t border-gray-100 shrink-0">
                            <button
                                onClick={() => setFilterOpen(false)}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl font-semibold text-sm transition-colors"
                            >
                                Застосувати фільтри
                            </button>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}