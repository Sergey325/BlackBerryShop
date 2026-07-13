import ProductClient from "@/app/(pages)/catalog/[category]/[productId]/components/ProductClient";
import {getProductById} from "@/app/actions/getProductById";
import EmptyState from "@/app/components/reusable/EmptyState";
import {getCategoryBySlug} from "@/app/actions/getCategoryBySlug";

type Props = {
    params: Promise<{ category:string, productId: string }>;
};

const ProductPage = async ({ params }: Props) => {
    const { category: categorySlug, productId } = await params;

    const [product, category] = await Promise.all([
        getProductById(productId),
        getCategoryBySlug(categorySlug),
    ]);


    if (!product || !category) {
        return <EmptyState title={"Сталася помилка"} subtitle={"Такого товару чи категорії на існує, спробуйте обрати іншу"} btnTitle="До каталогу" showReset redirectUrl={"/catalog"}/>
    }

    return (
        <ProductClient product={product} category={category}/>
    );
};

export default ProductPage;