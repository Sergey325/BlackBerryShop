export interface IBanner {
    image: string;
    mobileImage: string | null;
    badge: string | null;
    title: string;
    features: string[];
    ctaHref: string | null;
    ctaLabel: string | null;
}
