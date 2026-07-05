import {getProducts, IProductsParams} from "@/app/actions/getProducts";
import CategoryClientPage from "@/app/(pages)/catalog/[category]/components/ClientPage";

type Props = {
    params: Promise<{ category: string }>;
    searchParams: Promise<IProductsParams>;
};

const CategoryPage = async ({ params, searchParams }: Props) => {
    const { category } = await params;
    const filters = await searchParams;

    const products = await getProducts({
        ...filters,
        category,
    });

    console.log("products:", products);


    return (
        <CategoryClientPage products={products}/>
    );
};

export default CategoryPage;