import {useRouter, useSearchParams} from "next/navigation";

const FILTER_PARAMS = [
    "size",
    "color",
    "material",
    "priceMin",
    "priceMax",
    "title",
];

export const useClearFilters = (baseUrl: string) => {
    const router = useRouter();
    const params = useSearchParams();

    const clearFilters = () => {
        const query = new URLSearchParams(params.toString());

        FILTER_PARAMS.forEach(param => {
            query.delete(param);
        });

        const queryString = query.toString();

        router.replace(
            queryString
                ? `${baseUrl}?${queryString}`
                : baseUrl,
            {
                scroll: false,
            }
        );
    };

    return {
        clearFilters,
    };
};