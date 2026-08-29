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
        heroImage: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1785403242/BlackBerry/Banners/IMG_1613_hlahun.png",
        heroBg: "#fdf2f8",
    },
    {
        id: "WINTER",
        label: "Осінь / Зима",
        icon: "❄️",
        desc: "Теплі та затишні аксесуари для холодних днів",
        heroImage: "https://res.cloudinary.com/dnoxhtgef/image/upload/v1785403241/BlackBerry/Banners/IMG_1604_efzqvf.png",
        heroBg: "#ede9fe",
    },
];

export function getSeasonAnchor(id: SeasonCollectionId): string {
    return `season-${id.toLowerCase()}`;
}
