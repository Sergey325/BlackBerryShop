export function getProductRouteSegment(productId: number, productSlug: string): string {
    return `${productId}-${productSlug}`;
}

export function getProductPath(categorySlug: string, productId: number, productSlug: string): string {
    const productSegment: string = getProductRouteSegment(productId, productSlug);

    return `/catalog/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSegment)}`;
}

export function extractProductId(productSegment: string): string | null {
    const match: RegExpMatchArray | null = productSegment.match(/^(\d+)(?:-|$)/);

    return match?.[1] ?? null;
}
