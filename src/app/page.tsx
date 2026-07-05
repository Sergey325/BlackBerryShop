import {getProducts} from "@/app/actions/getProducts";
import Hero from "@/app/components/homePage/Hero";
import BestSellers from "@/app/components/homePage/BestSellers";
import Categories from "@/app/components/homePage/Categories";
import WhyUs from "@/app/components/homePage/WhyUs";
import {Reviews} from "@/app/components/homePage/Reviews";

export const dynamic = "force-dynamic";

// ─── Data ──────────────────────────────────────────────────────────────────
const categories = [
    { id: 1, name: 'Балаклави на голову',    count: 48, emoji: '☀️'},
    { id: 2, name: 'Балаклави на шолом',      count: 23, emoji: '🧢'},
    { id: 3, name: 'Шапки',  count: 36, emoji: '❄️'},
    { id: 4, name: 'Повʼязки',      count: 28, emoji: '🩷'},
];

export default async function HomePage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-gray-50 font-sans flex flex-col gap-14 lg:gap-20 w-full mt-10">
            <Hero/>

            <BestSellers products={products} />

            <Categories categories={categories}/>

            <WhyUs/>

            <Reviews/>
        </main>
    )
}