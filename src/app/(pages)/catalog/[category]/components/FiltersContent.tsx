"use client"

import FilterSection from "@/app/(pages)/catalog/[category]/components/FilterSection";
import PriceRange from "@/app/(pages)/catalog/[category]/components/PriceRange";
import {ICategory} from "@/app/actions/getCategories";
import CheckBox from "@/app/components/reusable/CheckBox";
import {useSearchParams} from "next/navigation";
import ColorFilter from "@/app/(pages)/catalog/[category]/components/ColorFilter";
import qs from "query-string";
import {useClearFilters} from "@/app/hooks/useClearFilters";
import Link from "next/link";
import {sortColorsByShade} from "@/app/utils/sortColors";
import ToolTip from "@/app/components/reusable/ToolTip";


type Props = {
    categories: ICategory[];
    options: {
        sizes: {
            size: string,
            count: number
        }[],
        materials: {
            name: string,
            count: number
        }[],
        colors: {
            color: string,
            colorName: string,
            count: number}[]
    }
    selectedCategorySlug: string;
}

const FiltersContent = ({categories, options, selectedCategorySlug}: Props) => {
    const searchParams = useSearchParams();

    const { clearFilters } = useClearFilters(`/catalog/${selectedCategorySlug}`);

    const sortedColors = sortColorsByShade(options.colors)

    const preservedParams = {
        sorting: searchParams.get("sorting") ?? undefined,
        view: searchParams.get("view") ?? undefined,
    };

    return (
        <>
            {/* Categories */}
            <FilterSection title="Категорії" initialState={false}>
                <ul className="space-y-0.5">
                    {categories.map(cat => {
                        const href = qs.stringifyUrl({
                            url: `/catalog/${cat.slug}`,
                            query: preservedParams,
                        });

                        return (
                            <li key={cat.slug}>
                                <Link
                                    href={href}
                                    scroll={false}
                                    className={`flex items-center justify-between text-sm px-2.5 py-1.5 rounded-lg transition-colors gap-0.5 ${
                                        cat.slug === selectedCategorySlug
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {cat.name}
                                    <span className="text-xs text-gray-400">
                                        {cat._count.products}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </FilterSection>

            {/* Colors */}
            {
                options.colors.length > 0 &&
                <FilterSection title="Колір">
                    <div className="flex flex-wrap gap-1.5 p-1">
                        {sortedColors.map((c,  index) => (
                            <ToolTip label={c.colorName} key={c.color+index}>
                                <ColorFilter

                                    urlParameter="color"
                                    urlValue={c.color}
                                    color={c.color}
                                    title={c.colorName}
                                    multiplyParameter
                                    baseUrl={`/catalog/${selectedCategorySlug}`}
                                />
                            </ToolTip>

                        ))}
                    </div>
                </FilterSection>
            }

            {/* Sizes */}
            {
                options.sizes.length > 0 &&
                <FilterSection title="Розмір">
                    <ul className="space-y-2">
                        {options.sizes.map((s, i) => (
                            <li key={s.size+i} className="flex items-center justify-between">
                                <CheckBox
                                    urlParameter="size"
                                    multiplyParameter
                                    urlValue={s.size}
                                    label={s.size}
                                    colorOnChecked={"text-primary"}
                                    baseUrl={`/catalog/${selectedCategorySlug}`}
                                />
                                <span className="text-xs text-gray-400">{s.count}</span>
                            </li>
                        ))}
                    </ul>
                </FilterSection>
            }

            {/* Materials */}
            {
                options.materials.length > 0 &&
                <FilterSection title="Матеріал">
                    <ul className="space-y-2">
                        {options.materials.map((m, i) => (
                            <li key={m.name+i} className="flex items-center justify-between">
                                <CheckBox
                                    urlParameter="material"
                                    multiplyParameter
                                    urlValue={m.name}
                                    label={m.name}
                                    colorOnChecked={"text-primary"}
                                    baseUrl={`/catalog/${selectedCategorySlug}`}
                                />
                                <span className="text-xs text-gray-400">{m.count}</span>
                            </li>
                        ))}
                    </ul>
                </FilterSection>
            }
            {/* Price */}
            <FilterSection title="Ціна">
                <PriceRange
                    key={`${searchParams.get("priceMin") ?? ""}-${searchParams.get("priceMax") ?? ""}`}
                />
            </FilterSection>

            <div className="w-full hidden sm:block">
                <button
                    onClick={clearFilters}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-normal text-sm transition-colors"
                >
                    Прибрати фільтри
                </button>
            </div>
        </>
    );
};

export default FiltersContent;