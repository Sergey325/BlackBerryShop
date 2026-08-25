import type { Metadata } from "next";

export const SITE_NAME = "BlackBerry";
export const SITE_URL = "https://black-berry.shop";
export const DEFAULT_TITLE = "BlackBerry — авторські головні убори та аксесуари";
export const DEFAULT_DESCRIPTION = "BlackBerry — український бренд авторських головних уборів та аксесуарів. Балаклави, панамки, шапочки та багато інших унікальних моделей для дітей і дорослих.";
export const DEFAULT_OG_IMAGE = "/og-logo.png";

interface CreateMetadataOptions {
    title: string;
    description: string;
    path: string;
    image?: string;
    imageAlt?: string;
    noIndex?: boolean;
    absoluteTitle?: boolean;
}

export function absoluteUrl(path: string): string {
    return new URL(path, SITE_URL).toString();
}

export function truncateDescription(description: string, maxLength: number = 160): string {
    const normalizedDescription: string = description.replace(/\s+/g, " ").trim();

    if (normalizedDescription.length <= maxLength) {
        return normalizedDescription;
    }

    const shortenedDescription: string = normalizedDescription.slice(0, maxLength - 1);
    const lastSpaceIndex: number = shortenedDescription.lastIndexOf(" ");

    return `${shortenedDescription.slice(0, lastSpaceIndex > 0 ? lastSpaceIndex : undefined)}…`;
}

export function createMetadata({
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    imageAlt = title,
    noIndex = false,
    absoluteTitle = false,
}: CreateMetadataOptions): Metadata {
    const canonicalUrl: string = absoluteUrl(path);
    const normalizedDescription: string = truncateDescription(description);
    const socialTitle: string = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    return {
        title: absoluteTitle ? {absolute: title} : title,
        description: normalizedDescription,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: "website",
            locale: "uk_UA",
            siteName: SITE_NAME,
            title: socialTitle,
            description: normalizedDescription,
            url: canonicalUrl,
            images: [
                {
                    url: image,
                    alt: imageAlt,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: socialTitle,
            description: normalizedDescription,
            images: [image],
        },
        robots: noIndex
            ? {
                index: false,
                follow: false,
                nocache: true,
            }
            : {
                index: true,
                follow: true,
            },
    };
}

export function createNoIndexMetadata(title: string, path: string): Metadata {
    return createMetadata({
        title,
        description: DEFAULT_DESCRIPTION,
        path,
        noIndex: true,
    });
}
