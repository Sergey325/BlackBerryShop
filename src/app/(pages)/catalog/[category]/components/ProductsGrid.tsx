"use client"

import {FiGrid, FiList, FiSliders, FiX} from "react-icons/fi";
import Dropdown from "@/app/components/reusable/DropDown";
import {BiSearch} from "react-icons/bi";
import InputFilter from "@/app/(pages)/catalog/[category]/components/InputFilter";
import ProductCard from "@/app/(pages)/catalog/[category]/components/ProductCard";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {IProduct} from "@/app/actions/getProducts";
import {ICategory} from "@/app/actions/getCategories";
import FiltersContent from "@/app/(pages)/catalog/[category]/components/FiltersContent";
import {useClearFilters} from "@/app/hooks/useClearFilters";
import EmptyState from "@/app/components/reusable/EmptyState";
import {getFilterOptions} from "@/app/utils/getFilterOptions";
import {useModalHistory} from "@/app/hooks/useModalHistory";
import Button from "@/app/components/reusable/Button";


type Props = {
    products?: IProduct[];
    categories: ICategory[];
    selectedCategorySlug: string;
};

const ProductsGrid = ({products, categories, selectedCategorySlug}: Props) => {
    const params = useSearchParams();
    const pathnameParams = useParams();

    const category = pathnameParams.category;
    const router = useRouter();
    const [filterOpen, setFilterOpen] = useState(false);

    const closeFilter = useModalHistory(filterOpen, () => setFilterOpen(false));

    const currentSort = params.get("sorting") ?? "Featured";
    const view = params.get("view") ?? "grid";

    // The URL is updated before the new RSC payload with `products` arrives.
    // While that navigation is pending, do not render products from the previous
    // color combination that no longer match the current URL.
    const selectedColors: Set<string> = new Set(
        params.getAll("color").map((color: string) => color.toLowerCase())
    );
    const visibleProducts: IProduct[] = (products ?? []).filter((product: IProduct) => {
        if (selectedColors.size === 0) return true;

        return product.colors.some((productColor) =>
            selectedColors.has(productColor.color.toLowerCase())
        );
    });
    const productsRenderKey: string = `${params.toString()}::${visibleProducts
        .map((product: IProduct) => product.id)
        .join(",")}`;

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
                        {/*gridView*/}
                        <div className="flex items-center bg-white border border-primary/30 rounded-xl p-1 gap-2">
                            {(['grid', 'list'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => handleClick("view", m)}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        view === m ? 'bg-primary/20 shadow-sm text-primary' : 'text-gray-600 hover:text-primary'
                                    }`}
                                >
                                    {m === 'grid' ? <FiGrid className="size-5" /> : <FiList className="size-5" />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setFilterOpen(true)}
                            className="sm:hidden flex items-center gap-1.5 text-sm bg-white border border-primary/30 hover:bg-gray-300 text-gray-800 px-1.5 sm:px-3 py-2 rounded-xl transition-colors"
                        >
                            <FiSliders className="size-4 text-primary" />
                            Фільтри
                        </button>

                        {/* Sort */}
                        <div className="w-full lg:w-40">
                            <Dropdown
                                placeholder="Сортування"
                                options={sortOptions}
                                value={currentSort}
                                onChange={() => {}}
                                className=""
                                buttonClassName="pl-2! pr-1.5! sm:pl-4! sm:pr-3! gap-0! sm:gap-2!"
                            />
                        </div>
                    </div>
                    <div className="flex items-center bg-white border border-primary/30 rounded-xl shadow-sm px-2 py-2 lg:py-1 lg:w-[220px] focus-within:border-primary/80 order-1 transition">
                        <BiSearch className="size-6 min-w-6"/>
                        <InputFilter id={"title"} type={"text"} baseUrl={`/catalog/${category}`} styles={"border-none w-full"} placeholder="Пошук..." debounced/>
                    </div>
                </div>
            </div>
            {
                visibleProducts.length > 0  ?
                    <div className="flex-1 min-w-0">
                        <div key={productsRenderKey} className={`grid gap-4 sm:gap-6 ${
                            view === 'list'
                                ? 'grid-cols-1'
                                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}>
                            {visibleProducts.map(p =>
                                <ProductCard key={p.id} product={p} list={view === 'list'} colors/>
                            )}
                        </div>
                        {/*<Pagination />*/}
                    </div>
                    : <EmptyState
                        title={"Товарів не знайдено"}
                        subtitle={"за обраними фільтрами немає товарів, спробуйте скинути фільтри"}
                        btnTitle="Скинути фільтри"
                        showReset
                        heightStyle={"30vh"}
                        redirectUrl={`/catalog/${selectedCategorySlug}`}
                />
            }

            {filterOpen && (
                <div className="absolute">
                    <div className="sm:hidden fixed inset-0 z-50 flex flex-col bg-white">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                <FiSliders className="w-4 h-4" />
                                Фільтри
                            </div>
                            <button onClick={closeFilter} className="p-2 -mr-2 text-gray-400 hover:text-gray-900">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable filter content */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4">
                            <FiltersContent categories={categories} selectedCategorySlug={selectedCategorySlug} options={getFilterOptions(visibleProducts)} />
                        </div>

                        {/* Apply button */}
                        <div className="px-4 pb-6 pt-3 border-t border-gray-100 shrink-0 flex gap-3 text-sm">
                            <Button label="Скинути" onClick={clearFilters} outline />
                            <Button label="Застосувати" onClick={closeFilter} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsGrid;
