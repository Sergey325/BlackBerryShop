"use client"


import FilterSection from "@/app/(pages)/catalog/[category]/components/FilterSection";
import {useState} from "react";
import Link from "next/link";
import PriceRange from "@/app/(pages)/catalog/[category]/components/PriceRange";

const SIZES     = ['XS (48-50)', 'S (50-52)', 'M (52-54)', 'L (54-56)', 'XL (56-58)'];
const SIZES_CNT = [12, 18, 16, 10, 6];
const MATS      = ['Бавовна', 'Акрил', 'Велюр', 'Плюшева пряжа'];
const MATS_CNT  = [32, 12, 6, 9];
const COLORS    = ['#f5c6cb','#f9a8d4','#c4b5fd','#6ee7b7','#1c1c1c','#bfdbfe','#fde68a','#fed7aa'];

type Props = {
    categories: {
        name: string
        slug: string
        description: string
        icon: string
        coverImage: string
        season: "SUMMER"
        features: string[]
        count: number
        active: boolean
    }[]
}

const FiltersContent = ({categories}: Props) => {
    const [activeColors, setActiveColors]       = useState<string[]>([]);
    const [activeSizes, setActiveSizes]         = useState<string[]>([]);
    const [activeMaterials, setActiveMaterials] = useState<string[]>([]);

    const toggle = <T,>(set: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
        set(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

    return (
        <>
            {/* Categories */}
            <FilterSection title="Категорії">
                <ul className="space-y-0.5">
                    {categories.map(cat => (
                        <li key={cat.slug}>
                            <Link
                                href={`/catalog/${cat.slug}`}
                                className={`flex items-center justify-between text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                                    cat.active
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {cat.name}
                                <span className="text-xs text-gray-400">{cat.count}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </FilterSection>

            {/* Colors */}
            <FilterSection title="Колір">
                <div className="flex flex-wrap gap-2.5">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => toggle(setActiveColors, c)}
                            title={c}
                            className={`w-7 h-7 rounded-full shadow-sm border-2 transition-all hover:scale-110 ${
                                activeColors.includes(c) ? 'border-primary scale-110' : 'border-white/80'
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
                {activeColors.length > 0 && (
                    <button onClick={() => setActiveColors([])}
                            className="text-[11px] text-gray-400 hover:text-primary mt-2">
                        Скинути
                    </button>
                )}
            </FilterSection>

            {/* Sizes */}
            <FilterSection title="Розмір">
                <ul className="space-y-2">
                    {SIZES.map((s, i) => (
                        <li key={s} className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={activeSizes.includes(s)}
                                    onChange={() => toggle(setActiveSizes, s)}
                                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">{s}</span>
                            </label>
                            <span className="text-xs text-gray-400">{SIZES_CNT[i]}</span>
                        </li>
                    ))}
                </ul>
            </FilterSection>

            {/* Materials */}
            <FilterSection title="Матеріал">
                <ul className="space-y-2">
                    {MATS.map((m, i) => (
                        <li key={m} className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={activeMaterials.includes(m)}
                                    onChange={() => toggle(setActiveMaterials, m)}
                                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">{m}</span>
                            </label>
                            <span className="text-xs text-gray-400">{MATS_CNT[i]}</span>
                        </li>
                    ))}
                </ul>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Ціна">
                <PriceRange />
            </FilterSection>
        </>
    );
};

export default FiltersContent;