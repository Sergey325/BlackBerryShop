export function getResponsiveCloudinaryUrl(url: string, width: number) {
    return url.replace(
        "/upload/",
        `/upload/c_limit,w_${width}/f_auto/q_auto:good:sensitive/`,
    );
}

export function optimizeCloudinaryUrl(url: string, width = 800, radius?: number): string {
    const roundedCorners = radius === undefined ? "" : `,r_${radius}`;

    return url.replace(
        "/upload/",
        `/upload/w_${width},q_auto:best:sensitive,f_auto${roundedCorners}/`
    );
}
