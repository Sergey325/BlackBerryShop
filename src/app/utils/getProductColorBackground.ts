import {IProductColor} from "@/app/actions/getProducts";

type ProductColorSwatch = Pick<IProductColor, "color" | "filterColors">;

export function getProductColorBackground(productColor: ProductColorSwatch): string {
    const catalogHexes: string[] = Array.from(new Set(
        productColor.filterColors.map((filterColor): string => filterColor.catalogColor.hex)
    ));

    if (catalogHexes.length <= 1) {
        return productColor.color;
    }

    const segmentSize: number = 100 / catalogHexes.length;
    const stops: string = catalogHexes
        .flatMap((hex: string, index: number): string[] => [
            `${hex} ${index * segmentSize}%`,
            `${hex} ${(index + 1) * segmentSize}%`,
        ])
        .join(", ");

    return `conic-gradient(from 45deg, ${stops})`;
}
