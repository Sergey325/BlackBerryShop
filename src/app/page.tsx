import {getBestSellerProducts} from "@/app/actions/getProducts";
import Hero from "@/app/components/homePage/Hero";
import BestSellers from "@/app/components/homePage/BestSellers";
import Categories from "@/app/components/homePage/Categories";
import WhyUs from "@/app/components/homePage/WhyUs";
import {Reviews} from "@/app/components/homePage/Reviews";
import EmptyState from "@/app/components/reusable/EmptyState";
import {getBanners} from "@/app/actions/getBanners";
import type {Metadata} from "next";
import {createMetadata, DEFAULT_DESCRIPTION, DEFAULT_TITLE} from "@/app/lib/seo";
import JsonLd from "@/app/components/seo/JsonLd";
import {ONLINE_STORE_JSON_LD} from "@/app/lib/structuredData";
import {getCategories} from "@/app/actions/getCategories";

export const revalidate = 300;

export const metadata: Metadata = createMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    imageAlt: "Авторські головні убори та аксесуари BlackBerry",
    absoluteTitle: true,
});

export default async function HomePage() {
    const [products, banners, categories] = await Promise.all([
        getBestSellerProducts(),
        getBanners(),
        getCategories(),
    ])

    return (
        <>
            <JsonLd data={ONLINE_STORE_JSON_LD}/>
            {!products || products.length === 0 ? (
                <EmptyState title={"Сталася помилка"} subtitle={"Товарів не знайдено, спробуйте оновити сторінку"} btnTitle="На головну" showReset/>
            ) : (
                <main className="min-h-screen bg-gray-50 font-sans flex flex-col gap-14 lg:gap-20 w-full pt-10">
                    <h1 className="sr-only">Авторські головні убори та аксесуари BlackBerry</h1>
                    <Hero banners={banners}/>

                    <BestSellers products={products} />

                    <Categories categories={categories}/>

                    <WhyUs/>

                    <Reviews/>
                </main>
            )}
        </>
    )
}
