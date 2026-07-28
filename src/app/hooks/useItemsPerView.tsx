import {ResponsiveType} from "react-multi-carousel";
import {useEffect, useState} from "react";
import {getItemsPerView} from "@/app/utils/getItemsPerView";

export function useItemsPerView(responsive: ResponsiveType) {
    const [itemsPerView, setItemsPerView] = useState<number | null>(null);

    useEffect(() => {
        const update = () => {
            setItemsPerView(getItemsPerView(responsive, window.innerWidth));
        };

        update();

        window.addEventListener("resize", update);

        return () => window.removeEventListener("resize", update);
    }, [responsive]);

    return itemsPerView;
}