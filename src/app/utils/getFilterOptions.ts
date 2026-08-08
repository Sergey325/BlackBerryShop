import {IProduct} from "@/app/actions/getProducts";

export function getFilterOptions(products: IProduct[] | undefined) {
    if (!products || products.length < 1) return {
        colors: [],
        sizes: [],
        materials: []
    }

    const sizes = new Map<string, number>();
    const materials = new Map<string, number>();
    const colors = new Map<string, {
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

        product.colors.forEach(pc => {
            // цвет
            const currentColor = colors.get(pc.color);

            colors.set(pc.color, {
                color: pc.color,
                colorName: pc.colorName,
                count: (currentColor?.count ?? 0) + 1,
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