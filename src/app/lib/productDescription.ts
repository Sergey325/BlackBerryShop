interface ProductDescriptionSource {
    name: string;
    description: string | null;
    category: {
        productsDescription: string;
    } | null;
}

export function getProductDescription(product: ProductDescriptionSource): string {
    return product.description?.trim()
        || product.category?.productsDescription.trim()
        || `Купити ${product.name} від українського бренду BlackBerry. Авторський дизайн, ручна робота та доставка по Україні.`;
}
