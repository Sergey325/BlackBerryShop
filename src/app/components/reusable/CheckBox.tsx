"use client"

import {useState} from "react";
import {BiSquareRounded} from "react-icons/bi";
import {BsCheck} from "react-icons/bs";
import useUrlParams from "@/app/hooks/useUrlParams";

type Props = {
    multiplyParameter?: boolean
    urlParameter?: string,
    urlValue?: string,
    label: string
    colorOnChecked?: string
    onChange?: (isChecked: boolean) => void
    initialValue?: boolean
    checked?: boolean
    baseUrl?: string
    labelStyle?: string
};

const CheckBox = ({
    label,
    urlParameter = "",
    urlValue = "",
    colorOnChecked,
    multiplyParameter = true,
    initialValue = false,
    checked,
    onChange,
    baseUrl = '',
    labelStyle,
}: Props) => {
    const [checkedState, setIsChecked] = useState(initialValue)
    const isChecked = checked ?? checkedState;
    const {changeUrl} = useUrlParams({
        urlValue,
        urlParameter,
        multiplyParameter,
        setIsChecked: checked === undefined ? setIsChecked : undefined,
        baseUrl,
    })

    const handleClick = () => {
        if (urlParameter) {
            changeUrl()
        } else {
            onChange?.(!isChecked)
            if (checked === undefined) setIsChecked(!isChecked)
        }
    }

    return (
        <div className={`flex items-center gap-1 cursor-pointer group select-none transition text-gray-700 ${isChecked ? colorOnChecked : "text-current"}`} onClick={handleClick}>
            <div className={`
                rounded-md
                relative
            `}>
                <BiSquareRounded size={20} className=""/>
                <BsCheck size={20} className={`absolute top-0 left-0 ${isChecked ? "scale-100" : "scale-0"} transition ${colorOnChecked}`}/>
            </div>
            <span className={labelStyle ? labelStyle : "text-base"}>{label}</span>
        </div>
    );
};

export default CheckBox;
