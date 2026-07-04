import {getProducts} from "@/app/actions/getProducts";
import ClientOnly from "@/app/components/reusable/ClientOnly";
import ProductClient from "@/app/(pages)/store/product/[productId]/components/ProductClient";

const ProductPage = async () => {
    const products = await getProducts()

    return (
        <ClientOnly>
            <ProductClient products={products}/>
        </ClientOnly>
    );
};

export default ProductPage;