"use client"

import { useState } from "react";
import useUrlParams from "@/app/hooks/useUrlParams";

type Props = {
    color: string;
    title?: string;
    urlParameter: string;
    urlValue: string;
    multiplyParameter?: boolean;
    baseUrl: string;
}

const ColorFilter = ({
     color,
     title,
     urlParameter,
     urlValue,
     multiplyParameter = true,
     baseUrl,
}: Props) => {
    const [isChecked, setIsChecked] = useState(false);

    const { changeUrl } = useUrlParams({
        urlValue,
        urlParameter,
        multiplyParameter,
        setIsChecked,
        baseUrl,
    });

    return (
        <button
            onClick={changeUrl}
            title={title}
            className={`
                w-7 h-7 rounded-full shadow-sm border transition-all hover:scale-110 cursor-pointer
                ${isChecked
                ? "border-primary scale-110"
                : "border-gray-400/50"
            }
            `}
            style={{ backgroundColor: color }}
        />
    );
};

export default ColorFilter;