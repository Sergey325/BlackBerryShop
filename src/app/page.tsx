import {getProducts} from "@/app/actions/getProducts";
import HomePageClient from "@/app/components/homePage/HomePageClient";

//export const dynamic = "force-dynamic";

export default async function HomePage() {
    const products = await getProducts();

    return (
        <HomePageClient products={products} />
    )
}