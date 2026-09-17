import type {ICategory, IRelatedProductCategory} from "./category";

export interface IProductSize {
    id: number;
    size: string;
    quantity: number | null;
    available: boolean;
    productColorId: number;
}

export interface IProductImage {
    id: number;
    url: string;
    order: number;
    productColorId: number;
}

export interface ICatalogColor {
    id: number;
    code: string;
    name: string;
    hex: string;
}

export interface IProductColorFilter {
    productColorId: number;
    catalogColorId: number;
    catalogColor: ICatalogColor;
}

export interface IProductMaterial {
    id: number;
    name: string;
}

export interface IProductColor {
    id: number;
    color: string;
    colorName: string;
    colorCode: string | null;
    filterColors: IProductColorFilter[];
    isBestSeller: boolean;
    productId: number;
    images: IProductImage[];
    sizes: IProductSize[];
}

export interface IProductCardColor {
    id: number;
    color: string;
    colorName: string;
    isBestSeller: boolean;
    filterColors: IProductColorFilter[];
    images: Pick<IProductImage, "url">[];
    sizes: IProductSize[];
}

export interface IProductCardData {
    id: number;
    name: string;
    slug: string;
    hasRelatedProducts: boolean;
    price: number;
    discount: number;
    material: Pick<IProductMaterial, "name"> | null;
    category: Pick<IRelatedProductCategory, "slug" | "season" | "isDecoration"> | null;
    colors: IProductCardColor[];
}

export type IHomeProduct = IProductCardData;

export interface IProduct extends IProductCardData {
    description: string | null;
    hasLining: boolean;
    material: IProductMaterial | null;
    createdAt: Date;
    updatedAt: Date;
    colors: IProductColor[];
    category: ICategory | null;
}

export interface IRelatedProduct extends IProductCardData {
    material: IProductMaterial | null;
    category: IRelatedProductCategory | null;
    colors: IProductColor[];
}

export interface IProductsParams {
    title?: string;
    size?: string[];
    material?: string[];
    color?: string[];
    category?: string;
    sorting?: string;
    priceMin?: string;
    priceMax?: string;
}

export interface IProductSearchResult {
    id: number;
    name: string;
    slug: string;
    price: number;
    categorySlug: string | null;
    imageUrl: string | null;
    colorCount: number;
}

export interface IProductSpecificationOverride {
    categorySpecificationId: number;
    value: string;
}

export interface IProductWithRelated extends IProduct {
    relatedTo: IRelatedProduct[];
    specificationOverrides: IProductSpecificationOverride[];
}
