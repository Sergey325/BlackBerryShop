export type SeasonCollectionId = "WINTER" | "SUMMER";

export interface SeasonCollectionConfig {
    id: SeasonCollectionId;
    label: string;
    icon: string;
    desc: string;
    heroImage: string;
    heroBg: string;
}

export const SEASON_COLLECTIONS: SeasonCollectionConfig[] = [
    {
        id: "SUMMER",
        label: "Весна / Літо",
        icon: "☀️",
        desc: "Легкі та яскраві аксесуари для сонячних днів",
        heroImage: "https://res.cloudinary.com/dby8qzoac/image/upload/v1794739539/BlackBerry/Banners/IMG_1613_hlahun_qid93n.png",
        heroBg: "#fdf2f8",
    },
    {
        id: "WINTER",
        label: "Осінь / Зима",
        icon: "❄️",
        desc: "Теплі та затишні аксесуари для холодних днів",
        heroImage: "https://res.cloudinary.com/dby8qzoac/image/upload/v1794739547/BlackBerry/Banners/IMG_1604_efzqvf_zozxci.png",
        heroBg: "#ede9fe",
    },
];

export function getSeasonAnchor(id: SeasonCollectionId): string {
    return `season-${id.toLowerCase()}`;
}
