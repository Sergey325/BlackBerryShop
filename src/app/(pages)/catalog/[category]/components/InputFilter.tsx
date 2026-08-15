"use client"

import React, {useEffect, useMemo, useState, useTransition} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import qs from "query-string";
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

    const initialValue = useMemo(() => {
        return params.get(id) ?? "";
    }, [params, id]);

    const [value, setValue] = useState(initialValue);

    const changeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
        let currentQuery = {};

        if (params) {
            currentQuery = qs.parse(params.toString())
        }

        const updatedQuery: any = {
            ...currentQuery,
            [e.target.id]: e.target.value
        }

        if (!e.target.value) {
            delete updatedQuery[e.target.id];
        }

        const url = qs.stringifyUrl({
            url: baseUrl,
            query: updatedQuery
        }, {skipNull: true})

        startTransition(() => {
            router.push(url)
        });
    }

    useEffect(() => {
        if (!debounced) return;

        const timeout = setTimeout(() => {
            changeUrl({
                target: {
                    id,
                    value,
                }
            } as React.ChangeEvent<HTMLInputElement>);
        }, 600);

        return () => clearTimeout(timeout);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.includes("-")) {
            setValue("");
            return;
        }

        setValue(e.target.value);

        if (!debounced) {
            changeUrl(e);
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
