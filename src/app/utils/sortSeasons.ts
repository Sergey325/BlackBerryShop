import {Season} from "@/app/types";

export function getActiveSeasonType(): Season["id"] {
    const month = new Date().getMonth();

    // август → февраль = осень/зима
    const isAutumnWinter = month >= 7 || month <= 1;

    return isAutumnWinter
        ? "WINTER"
        : "SUMMER";
}

export function sortSeasonsByCurrent<T extends Pick<Season, "id">>(seasons: T[]): T[] {
    const active = getActiveSeasonType();

    return [...seasons].sort((a, b) => {
        return Number(b.id === active) - Number(a.id === active);
    });
}
