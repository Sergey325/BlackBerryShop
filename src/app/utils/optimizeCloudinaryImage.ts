export function optimizeCloudinaryUrl(url: string, width = 800, radius?: number): string {
    const roundedCorners = radius === undefined ? "" : `,r_${radius}`;

    return url.replace(
        "/upload/",
        `/upload/w_${width},q_auto:best:sensitive,f_auto${roundedCorners}/`
    );
}