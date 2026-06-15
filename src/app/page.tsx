import Image from "next/image";
import {getProducts, IProduct} from "@/app/actions/getProducts";
import DevCreateProductBtn from "@/app/components/DevCreateProductBtn";
import ProductImages from "@/app/components/ProductImages";
import ClientOnly from "@/app/components/ClientOnly";
import StoreClient from "@/app/components/StoreClient";

type Props = {
    searchParams: IProduct
}

export default async function Home({searchParams}: Props) {
    const products = await getProducts()

    return (
        <ClientOnly>
            <StoreClient products={products}/>
        </ClientOnly>

    );
}
