import type {IRelatedProduct, IProductSize} from "./product";

export type CartItem = {
    productId: number;
    productColorId: number;
    productName: string;
    slug: string;
    hasRelatedProducts: boolean;
    price: number;
    discount: number;
    size?: string;
    sizes: IProductSize[];
    color: string;
    colorName: string;
    photoUrl: string;
    quantity: number;
    categorySlug: string;
    isDecoration: boolean;
    lining: boolean;
};

export type ProductSelection = Omit<
    CartItem,
    "quantity" | "size" | "isDecoration"
>;

export type RelatedProductsByProductId = Record<number, IRelatedProduct[]>;

export type InventoryResponse = {
    items: {
        productColorId: number;
        sizes: IProductSize[];
    }[];
};
