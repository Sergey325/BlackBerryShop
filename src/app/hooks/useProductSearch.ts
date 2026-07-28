"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import {getProducts, IProduct} from "@/app/actions/getProducts";

export function useProductSearch() {
    const [value, setValue] = useState("");
    const [results, setResults] = useState<IProduct[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, startTransition] = useTransition();

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = useCallback((nextValue: string) => {
        setValue(nextValue);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!nextValue) {
            setIsSearching(false);
            setResults([]);
            return;
        }

        setIsSearching(true);

        timeoutRef.current = setTimeout(() => {
            startTransition(async () => {
                const products = await getProducts({ title: nextValue });
                setResults(products || []);
                setIsSearching(false);
            });
        }, 400);
    }, []);

    const reset = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setValue("");
        setResults([]);
        setIsSearching(false);
    }, []);

    return { value, setValue: handleChange, results, isPending: isPending || isSearching, reset };
}