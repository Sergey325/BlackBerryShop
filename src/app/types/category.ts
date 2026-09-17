import type {Season} from "@prisma/client";

export interface IRelatedProductCategory {
    id: number;
    name: string;
    slug: string;
    season: Season;
    sizeGuideImage: string | null;
    isDecoration: boolean | null;
}

export interface ICategory {
    name: string;
    id: number;
    slug: string;
    description: string;
    productsDescription: string;
    coverImage: string;
    sizeGuideImage: string | null;
    season: Season;
    isOnMainPage: boolean | null;
    isDecoration: boolean | null;
    specifications: {
        name: string;
        id: number;
        categoryId: number;
        order: number;
        value: string;
    }[];
    _count: {
        products: number;
    };
}

export interface ICategoryCardData {
    id: number;
    name: string;
    slug: string;
    coverImage: string;
    season: Season;
    isOnMainPage: boolean | null;
    isDecoration: boolean | null;
    _count: {
        products: number;
    };
}

export type IHomeCategory = ICategoryCardData;
