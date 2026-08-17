import {ICatalogColor, IProduct, IProductColor, IProductColorFilter} from "@/app/actions/getProducts";

export interface IFilterOptions {
    colors: {
        code: string;
        color: string;
        colorName: string;
        count: number;
    }[];
    sizes: {
        size: string;
        count: number;
    }[];
    materials: {
        name: string;
        count: number;
    }[];
}

export function getFilterOptions(products: IProduct[] | undefined): IFilterOptions {
    if (!products || products.length < 1) return {
        colors: [],
        sizes: [],
        materials: []
    }

    const sizes = new Map<string, number>();
    const materials = new Map<string, number>();
    const colors = new Map<string, {
        code: string;
        color: string;
        colorName: string;
        count: number;
    }>();

    products.forEach(product => {
        // материал
        if (product.material) {
            materials.set(
                product.material.name,
                (materials.get(product.material.name) ?? 0) + 1
            );
        }

        const productCatalogColors = new Map<string, ICatalogColor>();

        product.colors.forEach((pc: IProductColor): void => {
            pc.filterColors.forEach((filterColor: IProductColorFilter): void => {
                productCatalogColors.set(filterColor.catalogColor.code, filterColor.catalogColor);
            });

            // размеры
            pc.sizes.forEach(size => {
                if (!size.available) return;

                sizes.set(
                    size.size,
                    (sizes.get(size.size) ?? 0) + 1
                );
            });
        });

        // Count products, not ProductColor variants, so the same catalog color
        // is never counted twice for one product.
        productCatalogColors.forEach((catalogColor: ICatalogColor): void => {
            const currentColor = colors.get(catalogColor.code);

            colors.set(catalogColor.code, {
                code: catalogColor.code,
                color: catalogColor.hex,
                colorName: catalogColor.name,
                count: (currentColor?.count ?? 0) + 1,
            });
        });
    });

    return {
        sizes: Array.from(sizes, ([size, count]) => ({
            size,
            count,
        })),

        materials: Array.from(materials, ([name, count]) => ({
            name,
            count,
        })),

        colors: Array.from(colors.values()),
    };
}
