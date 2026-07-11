"use client"

import {FiGrid, FiList, FiSliders, FiX} from "react-icons/fi";
import Dropdown from "@/app/components/reusable/DropDown";
import {BiSearch} from "react-icons/bi";
import InputFilter from "@/app/components/reusable/InputFilter";
import ProductCard from "@/app/(pages)/catalog/[category]/components/ProductCard";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {Suspense, useEffect, useState} from "react";
import {IProduct} from "@/app/actions/getProducts";
import {ICategory} from "@/app/actions/getCategories";
import FiltersContent from "@/app/(pages)/catalog/[category]/components/FiltersContent";
import {getFilterOptions} from "@/app/(pages)/catalog/[category]/page";
import {useClearFilters} from "@/app/hooks/useClearFilters";


type Props = {
    products: IProduct[];
    categories: ICategory[];
    selectedCategorySlug: string;
};

const ProductsGrid = ({products, categories, selectedCategorySlug}: Props) => {
    const params = useSearchParams();
    const pathnameParams = useParams();

    const category = pathnameParams.category;
    const router = useRouter();
    const [filterOpen, setFilterOpen] = useState(false);
    const currentSort = params.get("sorting") ?? "Featured";
    const view = params.get("view") ?? "grid";

    const { clearFilters } = useClearFilters(`/catalog/${selectedCategorySlug}`);

    // const [perPage, setPerPage]       = useState('24');

    useEffect(() => {
        if (filterOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [filterOpen]);

    const sortOptions = [
        { value: "Featured", label: "Популярні", onClick: function() { handleClick("sorting", this.value) }, },
        { value: "newest", label: "Новинки", onClick: function() { handleClick("sorting", this.value) }},
        { value: "asc", label: "Ціна ↑", onClick: function() { handleClick("sorting", this.value)}},
        { value: "desc", label: "Ціна ↓", onClick: function() { handleClick("sorting", this.value) }},
    ]

    const handleClick = (name: string, value: string) => {
        const currentQuery = new URLSearchParams(params.toString());

        currentQuery.set(name, value);

        router.replace(
            `/catalog/${category}?${currentQuery.toString()}`,
            {
                scroll: false,
            }
        );
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className="flex gap-4 w-full">
                <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-4 lg:justify-between">
                    <div className="flex gap-2 lg:gap-4 order-2">
                        <button
                            onClick={() => setFilterOpen(true)}
                            className="sm:hidden flex items-center gap-1.5 text-sm font-medium bg-white border border-primary/30 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-xl transition-colors"
                        >
                            <FiSliders className="size-4" />
                        </button>

                        {/*gridView*/}
                        <div className="flex items-center bg-white border border-primary/30 rounded-xl p-1 gap-2">
                            {(['grid', 'list'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => handleClick("view", m)}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        view === m ? 'bg-primary/20 shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {m === 'grid' ? <FiGrid className="size-5" /> : <FiList className="size-5" />}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <div className="w-full lg:w-40">
                            <Dropdown
                                placeholder="Сортування"
                                options={sortOptions}
                                value={currentSort}
                                onChange={() => {}}
                                className=""
                            />
                        </div>
                    </div>
                    <div className="flex items-center bg-white border border-primary/30 rounded-xl shadow-sm px-2 py-2 lg:py-1 lg:w-[220px] focus-within:border-primary/80 order-1 transition">
                        <BiSearch className="size-6 min-w-6"/>
                        <InputFilter id={"title"} type={"text"} baseUrl={`/catalog/${category}`} styles={"border-none w-full"} placeholder="Пошук..."/>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className={`grid gap-3 sm:gap-4 ${
                    view === 'list'
                        ? 'grid-cols-1'
                        : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                    {products.map(p =>
                        <Suspense key={p.id} fallback={null}>
                            <ProductCard product={p} list={view === 'list'} />
                        </Suspense>
                    )}
                </div>
                {/*<Pagination />*/}
            </div>
            {filterOpen && (
                <div className="absolute">
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
                            <FiltersContent categories={categories} selectedCategorySlug={selectedCategorySlug} options={getFilterOptions(products)} />
                        </div>

                        {/* Apply button */}
                        <div className="px-4 pb-6 pt-3 border-t border-gray-100 shrink-0">
                            <button
                                onClick={clearFilters}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl font-semibold text-sm transition-colors"
                            >
                                Прибрати фільтри
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsGrid;