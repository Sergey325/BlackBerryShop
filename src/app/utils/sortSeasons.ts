import type {SeasonCollectionId} from "@/app/lib/seasonCollections";

export function getActiveSeasonType(): SeasonCollectionId {
    const month = new Date().getMonth();

    // август → февраль = осень/зима
    const isAutumnWinter = month >= 7 || month <= 1;

    return isAutumnWinter
        ? "WINTER"
        : "SUMMER";
}

export function sortSeasonsByCurrent<T extends {id: SeasonCollectionId}>(seasons: T[]): T[] {
    const active = getActiveSeasonType();

    return [...seasons].sort((a, b) => {
        return Number(b.id === active) - Number(a.id === active);
    });
}
