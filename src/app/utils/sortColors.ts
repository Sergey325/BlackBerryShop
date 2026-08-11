import { converter } from "culori";

const toOklch = converter("oklch");

export function sortColorsByShade<T extends { color: string }>(
    colors: T[],
): T[] {
    return [...colors].sort((a, b) => {
        const colorA = getSortData(a.color);
        const colorB = getSortData(b.color);

        return (
            colorA.group - colorB.group ||
            colorA.primary - colorB.primary ||
            colorA.secondary - colorB.secondary
        );
    });
}

function getSortData(colorHex: string) {
    const color = toOklch(colorHex);

    if (!color) {
        return {
            group: Number.MAX_SAFE_INTEGER,
            primary: 0,
            secondary: 0,
        };
    }

    const hue = color.h ?? 0;
    const chroma = color.c ?? 0;
    const lightness = color.l;

    // Белые, серые и чёрные
    if (chroma < 0.025) {
        return {
            group: 0,
            primary: -lightness,
            secondary: 0,
        };
    }

    // Бежевые и коричневые
    const isBrown =
        hue >= 25 &&
        hue < 75 &&
        (chroma < 0.11 || lightness < 0.45);

    if (isBrown) {
        return {
            group: 1,
            primary: -lightness,
            secondary: hue,
        };
    }

    // Розовые, красные и бордовые
    const isRedOrPink = hue >= 325 || hue < 35;

    if (isRedOrPink) {
        return {
            group: 3,
            primary: -lightness,
            secondary: -chroma,
        };
    }

    // Оранжевый → жёлтый → зелёный →
    // голубой → синий → фиолетовый
    return {
        group: 2,
        primary: hue,
        secondary: -lightness,
    };
}