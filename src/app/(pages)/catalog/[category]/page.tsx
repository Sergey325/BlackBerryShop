import {getProducts, IProductsParams} from "@/app/actions/getProducts";
import {getCategories} from "@/app/actions/getCategories";
import Image from "next/image";
import {FiSliders} from "react-icons/fi";
import FiltersContent from "@/app/(pages)/catalog/[category]/components/FiltersContent";
import ProductsGrid from "@/app/(pages)/catalog/[category]/components/ProductsGrid";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import {pluralizeUk} from "@/app/utils/pluralizeUk";
import {getCategoryBySlug} from "@/app/actions/getCategoryBySlug";
import {FaHeart} from "react-icons/fa";
import {getFilterOptions} from "@/app/utils/getFilterOptions";
import Link from "next/link";
import type {Metadata} from "next";
import {createMetadata} from "@/app/lib/seo";
import {cache} from "react";
import JsonLd from "@/app/components/seo/JsonLd";
import {BreadcrumbListJsonLd, createBreadcrumbJsonLd} from "@/app/lib/structuredData";
import {notFound} from "next/navigation";

type Props = {
    params: Promise<{ category: string }>;
    searchParams: Promise<IProductsParams>;
};

const getCachedCategoryBySlug = cache(getCategoryBySlug);

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {category: categorySlug} = await params;
    const category = await getCachedCategoryBySlug(categorySlug);

    if (!category) {
        notFound();
    }

    const description: string = [category.description, category.productsDescription]
        .map((value: string) => value.trim())
        .filter(Boolean)
        .join(" ");

    return createMetadata({
        title: category.name,
        description,
        path: `/catalog/${encodeURIComponent(category.slug)}`,
        image: category.coverImage,
        imageAlt: category.name,
    });
}

function normalizeArray(value?: string | string[]): string[] | undefined {
    if (!value) return undefined;

    const values = Array.isArray(value) ? value : [value];
    const normalizedValues = values.filter(Boolean);

    return normalizedValues.length ? Array.from(new Set(normalizedValues)) : undefined;
}

const CategoryPage = async ({ params, searchParams }: Props) => {
    const { category } = await params;
    const filters = await searchParams;

    const selectedCategory = await getCachedCategoryBySlug(category);

    if (!selectedCategory) {
        notFound();
    }

    const [products, categories] = await Promise.all([
        getProducts({
            ...filters,
            category,
            size: normalizeArray(filters.size),
            material: normalizeArray(filters.material),
            color: normalizeArray(filters.color),
        }),
        getCategories(),
    ]);

    const breadcrumbJsonLd: BreadcrumbListJsonLd = createBreadcrumbJsonLd([
        {name: "Головна", path: "/"},
        {name: "Каталог", path: "/catalog"},
        {name: selectedCategory.name, path: `/catalog/${encodeURIComponent(selectedCategory.slug)}`},
    ]);

    return (
        <>
            <JsonLd data={breadcrumbJsonLd}/>
            <main className="relative min-h-screen">
                <h1 className="sr-only">{selectedCategory.name}</h1>
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
                        <div className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2" aria-hidden="true">
                            {selectedCategory?.name}
                            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full text-nowrap">
                            {selectedCategory?._count.products.toString()} {pluralizeUk(selectedCategory?._count.products, ["модель", "моделі", "моделей"])}
                        </span>
                        </div>
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
                        <Image src={optimizeCloudinaryUrl(selectedCategory.coverImage, 1200)} alt={`Категорія ${selectedCategory.name}`} fill fetchPriority="high" loading="eager" sizes="(min-width: 640px) 42vw, 1px" unoptimized
                               className="object-scale-down object-top-right" />{/* object-cover lg:object-scale-down object-top-right */}
                        {/* fade into banner bg */}
                        {/*<div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r bg-amber-50 to-transparent pointer-events-none" />*/}
                    </div>
                </div>

                {/* Mobile */}
                <div className={`sm:hidden relative h-56 rounded-2xl overflow-hidden mb-4 ${selectedCategory.season === "SUMMER" ? "bg-summer" : "bg-winter"}`}>
                    <Image src={optimizeCloudinaryUrl(selectedCategory.coverImage, 1200)} alt={`Категорія ${selectedCategory.name}`} fill fetchPriority="high" loading="eager" sizes="(max-width: 639px) 100vw, 1px" unoptimized className="object-scale-down object-top-right" />{/* object-cover object-top */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/30 to-black/10" />
                    <div className="absolute inset-x-0 top-[10%] w-2/3 flex flex-col justify-between h-[75%] p-4">
                        <div className="flex flex-col items-start gap-2 mb-1.5">
                            <div className="text-xl font-bold text-white" aria-hidden="true">{selectedCategory?.name}</div>
                            <span className="text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-nowrap">
                            {selectedCategory?._count.products.toString()} {pluralizeUk(selectedCategory?._count.products, ["модель", "моделі", "моделей"])}
                        </span>
                        </div>
                        <p className="text-white/85 text-xs leading-relaxed">{selectedCategory?.description}</p>
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
        </>
    );
};

export default CategoryPage;
