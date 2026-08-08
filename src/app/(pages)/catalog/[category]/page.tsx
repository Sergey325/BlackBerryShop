import {getProducts, IProductsParams} from "@/app/actions/getProducts";
import {getCategories} from "@/app/actions/getCategories";
import Image from "next/image";
import {FiSliders} from "react-icons/fi";
import FiltersContent from "@/app/(pages)/catalog/[category]/components/FiltersContent";
import ProductsGrid from "@/app/(pages)/catalog/[category]/components/ProductsGrid";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import {pluralizeUk} from "@/app/utils/pluralizeUk";
import EmptyState from "@/app/components/reusable/EmptyState";
import {getCategoryBySlug} from "@/app/actions/getCategoryBySlug";
import {FaHeart} from "react-icons/fa";
import {getFilterOptions} from "@/app/utils/getFilterOptions";
import Link from "next/link";

type Props = {
    params: Promise<{ category: string }>;
    searchParams: Promise<IProductsParams>;
};

function normalizeArray(value?: string | string[]): string[] | undefined {
    if (!value) return undefined;

    const values = Array.isArray(value) ? value : [value];
    const normalizedValues = values.filter(Boolean);

    return normalizedValues.length ? Array.from(new Set(normalizedValues)) : undefined;
}

const CategoryPage = async ({ params, searchParams }: Props) => {
    const { category } = await params;
    const filters = await searchParams;

    const [selectedCategory, products, categories] = await Promise.all([
        getCategoryBySlug(category),
        getProducts({
            ...filters,
            category,
            size: normalizeArray(filters.size),
            material: normalizeArray(filters.material),
            color: normalizeArray(filters.color),
        }),
        getCategories(),
    ]);

    if (!selectedCategory) {
        return <EmptyState title={"Сталася помилка"} subtitle={"Такої категорії на існує, спробуйте обрати іншу"} btnTitle="До каталогу" showReset redirectUrl={"/catalog"}/>
    }

    return (
        <main className="relative min-h-screen">
            <div className="mx-auto py-6">

                {/* Breadcrumb — desktop */}
                <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
                    <Link href="/" className="hover:text-gray-600 transition-colors">Головна</Link>
                    <span>›</span>
                    <Link href="/catalog" className="hover:text-gray-600 transition-colors">Каталог</Link>
                    <span>›</span>
                    <span className="text-gray-700 text-nowrap truncate">{selectedCategory?.name}</span>
                </nav>

                {/* ── Banner ────────────────────────────────────────────── */}

                {/* Desktop */}
                <div className={`hidden sm:flex items-stretch rounded-3xl overflow-hidden mb-8 min-h-[220px] shadow-sm select-none ${selectedCategory.season === "SUMMER" ? "bg-summer" : "bg-winter"}`}>
                    <div className="flex-1 px-10 py-8 flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                            {selectedCategory?.name}
                            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full text-nowrap">
                            {selectedCategory?._count.products.toString()} {pluralizeUk(selectedCategory?._count.products, ["модель", "моделі", "моделей"])}
                        </span>
                        </h1>
                        <p className="text-gray-700 text-sm max-w-md leading-relaxed mb-6">
                            {selectedCategory?.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {/*//////////////////////*/}
                            {['Ручна робота', 'Якісні матеріали', 'Зручна посадка'].map(f => (
                                // <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm shadow-[0_0_5px_rgba(130,61,154,0.50)] transition
                                //          text-gray-600 rounded-full px-4 py-1.5
                                //          border border-primary mb-7">
                                //     Ручна робота з любов&apos;ю
                                //     <FaHeart className="size-4 text-primary" />
                                // </span>
                                <span
                                    key={f}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-100 text-gray-600 px-3 py-1.5 rounded-xl shadow-sm"
                                >
                                    <FaHeart className="size-3 text-primary/80" />
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Hero image — right side */}
                    <div className="relative w-[42%] shrink-0">
                        <Image src={optimizeCloudinaryUrl(selectedCategory?.coverImage, 1200)} alt={selectedCategory?.name} fill priority unoptimized
                               className="object-scale-down object-top-right" />{/* object-cover lg:object-scale-down object-top-right */}
                        {/* fade into banner bg */}
                        {/*<div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r bg-amber-50 to-transparent pointer-events-none" />*/}
                    </div>
                </div>

                {/* Mobile */}
                <div className={`sm:hidden relative h-56 rounded-2xl overflow-hidden mb-4 ${selectedCategory.season === "SUMMER" ? "bg-summer" : "bg-winter"}`}>
                    <Image src={optimizeCloudinaryUrl(selectedCategory?.coverImage, 1200)} alt={selectedCategory?.name} fill priority unoptimized className="object-scale-down object-top-right" />{/* object-cover object-top */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/30 to-black/10" />
                    <div className="absolute inset-x-0 top-[10%] w-2/3 flex flex-col justify-between h-[75%] p-4">
                        <div className="flex flex-col items-start gap-2 mb-1.5">
                            <h1 className="text-xl font-bold text-white">{selectedCategory?.name}</h1>
                            <span className="text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-nowrap">
                            {selectedCategory?._count.products.toString()} {pluralizeUk(selectedCategory?._count.products, ["модель", "моделі", "моделей"])}
                        </span>
                        </div>
                        <p className="text-white/75 text-xs leading-relaxed">{selectedCategory?.description}</p>
                    </div>
                </div>

                {
                    <div className="flex gap-6 w-full">
                        <div className="hidden sm:flex flex-col h-fit gap-4 bg-white rounded-xl px-4 md:px-6 py-2 md:py-4 shadow-sm">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900 w-52 shrink-0">
                                <FiSliders className="w-4 h-4" />
                                Фільтри
                            </div>
                            <aside className="hidden sm:block w-52 shrink-0">
                                <FiltersContent categories={categories} selectedCategorySlug={selectedCategory?.slug} options={getFilterOptions(products)} />
                            </aside>
                        </div>
                        <ProductsGrid products={products} categories={categories} selectedCategorySlug={selectedCategory.slug}/>
                    </div>
                    // products && products.length > 0 ?
                    //
                    // :
                    // <EmptyState
                    //     title={"Товарів не знайдено"}
                    //     subtitle={"за обраними фільтрами немає товарів, спробуйте скинути фільтри"}
                    //     btnTitle="Скинути фільтри"
                    //     showReset
                    //     heightStyle={"30vh"}
                    //     redirectUrl={`/catalog/${selectedCategory.slug}`}
                    // />
                }
            </div>
        </main>
    );
};

export default CategoryPage;
