"use server";

import prisma from "@/app/lib/prisma";
import {ICategory, IRelatedProductCategory} from "@/app/actions/getCategories";
import {Prisma} from "@prisma/client";
import {unstable_cache} from "next/cache";

const PRODUCTS_CACHE_SECONDS = 300;

export interface IRelatedProduct {
    id: number;
    name: string;
    slug: string;
    hasRelatedProducts: boolean;
    price: number;
    discount: number;
    material: IProductMaterial | null;
    category: IRelatedProductCategory | null;
    colors: {
        id: number;
        color: string;
        colorName: string;
        colorCode: string | null;
        filterColors: IProductColorFilter[];
        productId: number;
        isBestSeller: boolean;
        images: IProductImage[];
        sizes: IProductSize[];
    }[];
}
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

export interface IProduct {
    id: number;
    name: string;
    slug: string;
    hasRelatedProducts: boolean;
    description: string | null;
    hasLining: boolean;
    price: number;
    discount: number;
    material: IProductMaterial | null;
    createdAt: Date;
    updatedAt: Date;
    colors: IProductColor[];
    category: ICategory | null;
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

interface IProductSearchRow extends IProductSearchResult {
    score: number;
}

function normalizeValues(values?: string[]): string[] | undefined {
    if (!values?.length) return undefined;

    const normalized: string[] = Array.from(
        new Set(values.map((value: string): string => value.trim()).filter(Boolean))
    ).sort();

    return normalized.length ? normalized : undefined;
}

function normalizePrice(value?: string): string | undefined {
    if (!value?.trim()) return undefined;

    const parsed: number = Number(value);

    return Number.isFinite(parsed) ? parsed.toString() : undefined;
}

function normalizeProductsParams(params: IProductsParams): IProductsParams {
    const sorting: IProductsParams["sorting"] = ["asc", "desc", "newest"]
        .includes(params.sorting ?? "")
        ? params.sorting
        : undefined;

    return {
        title: params.title?.trim() || undefined,
        category: params.category?.trim() || undefined,
        sorting,
        priceMin: normalizePrice(params.priceMin),
        priceMax: normalizePrice(params.priceMax),
        size: normalizeValues(params.size),
        material: normalizeValues(params.material),
        color: normalizeValues(params.color),
    };
}

async function queryProducts(
    params: IProductsParams,
    bestSellersOnly: boolean
): Promise<IProduct[]> {
        const {title, category, sorting, priceMin, priceMax, size, material, color} = params;

        const where: Prisma.ProductWhereInput = {};

        const searchedProducts = title ? await prisma.$queryRaw<{ id: number; score: number }[]>`
            SELECT
                id,
                GREATEST(
                    similarity(name, ${title}),
                    CASE
                        WHEN name ILIKE ${"%" + title + "%"} THEN 1
                        ELSE 0
                    END
                ) AS score
            FROM "Product"
            WHERE
                name ILIKE ${"%" + title + "%"}
                OR similarity(name, ${title}) > 0.15
            ORDER BY score DESC
            LIMIT 100
        ` : null;

        if (material?.length) {
            where.material = {
                name: {
                    in: material,
                },
            };
        }

        if (size?.length || color?.length) {
            where.colors = {
                some: {
                    ...(color?.length && {
                        filterColors: {
                            some: {
                                catalogColor: {
                                    code: {
                                        in: color,
                                    },
                                },
                            },
                        },
                    }),
                    ...(size?.length && {
                        sizes: {
                            some: {
                                size: {
                                    in: size,
                                },
                                available: true,
                            },
                        },
                    }),
                },
            };
        }

        if (bestSellersOnly) {
            where.colors = {
                some: {
                    isBestSeller: true,
                },
            };
        }

        if (category) {
            where.category = {
                slug: category,
            };
        }

        if (priceMin || priceMax) {
            where.price = {
                ...(priceMin && { gte: Number(priceMin) }),
                ...(priceMax && { lte: Number(priceMax) }),
            };
        }

        let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] | undefined = [
            {position: "asc"},
            {id: "asc"},
        ];

        if (searchedProducts) {
            where.id = {
                in: searchedProducts.map(p => p.id),
            };
        }

        switch (sorting) {
            case "asc":
                orderBy = { price: "asc" };
                break;

            case "desc":
                orderBy = { price: "desc" };
                break;

            case "newest":
                orderBy = { createdAt: "desc" };
                break;

            default:
                orderBy = searchedProducts
                    ? undefined
                    : [{ position: "asc" }, { id: "asc" }];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy,
            include: {
                colors: {
                    ...(bestSellersOnly && {where: {isBestSeller: true}}),
                    orderBy: [{position: "asc"}, {id: "asc"}],
                    include: {
                        filterColors: {
                            include: {
                                catalogColor: true,
                            },
                        },
                        images: {
                            orderBy: {order: "asc"},
                            take: 1,
                        },
                        sizes: true,
                    },
                },
                material: true,
                category: {
                    include: {
                        specifications: true,
                        _count: {
                            select: {
                                products: true,
                            },
                        },
                    }
                },
                _count: {
                    select: {
                        relatedTo: true,
                        colors: true,
                    },
                },
            },
        });

        const bestSellerRankByProductId: Map<number, {
            bestSellerColorCount: number;
            colorCount: number;
        }> = new Map(
            products.map((product) => [
                product.id,
                {
                    bestSellerColorCount: product.colors.filter(
                        (productColor): boolean => productColor.isBestSeller
                    ).length,
                    colorCount: product._count.colors,
                },
            ])
        );

        const productsWithRelationFlags: IProduct[] = products.map((product): IProduct => {
            const {_count, ...productData} = product;

            return {
                ...productData,
                hasRelatedProducts: _count.relatedTo > 0,
            };
        });

        if (title && !sorting) {
            const orderMap = new Map(
                searchedProducts!.map((item, index) => [
                    item.id,
                    index
                ])
            );

            return productsWithRelationFlags.sort(
                (a, b) =>
                    (orderMap.get(a.id) ?? 999) -
                    (orderMap.get(b.id) ?? 999)
            );
        }

        if (!sorting) {
            const defaultOrderByProductId: Map<number, number> = new Map(
                productsWithRelationFlags.map((product, index): [number, number] => [
                    product.id,
                    index,
                ])
            );

            return productsWithRelationFlags.sort((a, b): number => {
                const aRank = bestSellerRankByProductId.get(a.id)!;
                const bRank = bestSellerRankByProductId.get(b.id)!;
                const percentageComparison: number =
                    bRank.bestSellerColorCount * aRank.colorCount -
                    aRank.bestSellerColorCount * bRank.colorCount;

                if (percentageComparison !== 0) return percentageComparison;

                const countComparison: number =
                    bRank.bestSellerColorCount - aRank.bestSellerColorCount;

                if (countComparison !== 0) return countComparison;

                return defaultOrderByProductId.get(a.id)! - defaultOrderByProductId.get(b.id)!;
            });
        }

        return productsWithRelationFlags;
}

const getCachedProducts = unstable_cache(
    queryProducts,
    ["storefront-products-v2"],
    {
        revalidate: PRODUCTS_CACHE_SECONDS,
        tags: ["products"],
    }
);

export async function getProducts(params: IProductsParams = {}): Promise<IProduct[] | undefined> {
    try {
        return await getCachedProducts(normalizeProductsParams(params), false);
    } catch (error) {
        console.error("Failed to get products:", error);
    }
}

export async function getBestSellerProducts(): Promise<IProduct[] | undefined> {
    try {
        return await getCachedProducts(normalizeProductsParams({}), true);
    } catch (error) {
        console.error("Failed to get best sellers:", error);
    }
}

export async function searchProducts(title: string): Promise<IProductSearchResult[]> {
    const normalizedTitle: string = title.trim().slice(0, 100);

    if (normalizedTitle.length < 2) return [];

    const titlePattern: string = `%${normalizedTitle}%`;
    const rows: IProductSearchRow[] = await prisma.$queryRaw<IProductSearchRow[]>`
        SELECT
            product.id,
            product.name,
            product.slug,
            product.price,
            category.slug AS "categorySlug",
            (
                SELECT image.url
                FROM "ProductColor" AS product_color
                INNER JOIN "ProductImage" AS image
                    ON image."productColorId" = product_color.id
                WHERE product_color."productId" = product.id
                ORDER BY product_color.position ASC,
                         product_color.id ASC,
                         image."order" ASC,
                         image.id ASC
                LIMIT 1
            ) AS "imageUrl",
            (
                SELECT COUNT(*)::integer
                FROM "ProductColor" AS product_color
                WHERE product_color."productId" = product.id
            ) AS "colorCount",
            GREATEST(
                similarity(product.name, ${normalizedTitle}),
                CASE WHEN product.name ILIKE ${titlePattern} THEN 1 ELSE 0 END
            ) AS score
        FROM "Product" AS product
        LEFT JOIN "Category" AS category ON category.id = product."categoryId"
        WHERE product.name ILIKE ${titlePattern}
           OR similarity(product.name, ${normalizedTitle}) > 0.15
        ORDER BY score DESC, product.id ASC
        LIMIT 12
    `;

    return rows.map((row: IProductSearchRow): IProductSearchResult => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        price: row.price,
        categorySlug: row.categorySlug,
        imageUrl: row.imageUrl,
        colorCount: row.colorCount,
    }));
}
