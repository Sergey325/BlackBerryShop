import {getProducts} from "@/app/actions/getProducts";
import ClientOnly from "@/app/components/reusable/ClientOnly";
import StoreClient from "@/app/components/StoreClient";

export const dynamic = "force-dynamic";

export default async function Home() {
    const products = await getProducts()
    // console.log( await syncCities())

    return (
        <ClientOnly>
            <StoreClient products={products}/>
        </ClientOnly>

    );
}
