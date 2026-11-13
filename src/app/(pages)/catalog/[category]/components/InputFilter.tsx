"use client"

import React, {useCallback, useEffect, useState, useTransition} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {AiOutlineLoading} from "react-icons/ai";

type Props = {
    price?: boolean
    placeholder?: string
    id: string
    styles?: string
    type: string
    debounced?: boolean
    baseUrl: string
};

const InputFilter = ({price = false, placeholder = "", id, styles, type, debounced = false, baseUrl}: Props) => {
    const params = useSearchParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition();

    const initialValue = params.get(id) ?? "";
    const [input, setInput] = useState({value: initialValue, urlValue: initialValue});
    // A URL change (Back, reset, navigation) takes precedence over an older draft.
    const value = input.urlValue === initialValue ? input.value : initialValue;
    if (input.urlValue !== initialValue) {
        setInput({value: initialValue, urlValue: initialValue});
    }

    const changeUrl = useCallback((nextValue: string) => {
        if (nextValue === initialValue) return;

        const query = new URLSearchParams(params.toString());
        if (nextValue) {
            query.set(id, nextValue);
        } else {
            query.delete(id);
        }
        const queryString = query.toString();
        const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        startTransition(() => {
            router.push(url)
        });
    }, [baseUrl, id, initialValue, params, router]);

    useEffect(() => {
        if (!debounced || value === initialValue) return;

        const timeout = setTimeout(() => {
            changeUrl(value);
        }, 600);

        return () => clearTimeout(timeout);
    }, [changeUrl, debounced, initialValue, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.includes("-")) {
            setInput({value: "", urlValue: initialValue});
            return;
        }

        setInput({value: e.target.value, urlValue: initialValue});

        if (!debounced) {
            changeUrl(e.target.value);
        }
    };

    return (
        <div className="relative w-full">
            <input
                id={id}
                placeholder={placeholder}
                type={type}
                min={0}
                value={value}
                className={`
                        ${price ? "pl-5" : "pl-2"}
                        appearance-none
                        outline-none
                        ${styles ? styles : "h-[40px] text-base border border-primary/30 bg-white placeholder:text-gray-500 w-full"}
                    `}
                onChange={handleChange}
            />
            {
                price && <label className="absolute top-[7px] left-1">$</label>
            }
            {isPending && value.length > 0 && (
                <div className="pointer-events-none flex items-center absolute top-0 -left-6 bg-white ">
                    <AiOutlineLoading className="size-5.5 animate-spin text-primary"/>
                </div>
            )}
        </div>
    );
};

export default InputFilter;
