import {ResponsiveType} from "react-multi-carousel";

export function getItemsPerView(
    responsive: ResponsiveType,
    width: number
) {
    return (
        Object.values(responsive).find(
            ({ breakpoint }) =>
                width >= breakpoint.min && width < breakpoint.max
        )?.items ?? 1
    );
}