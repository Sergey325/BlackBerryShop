"use client";

import {useCallback, useEffect, useRef, useState, useTransition} from "react";
import {IProductSearchResult, searchProducts} from "@/app/actions/getProducts";

export function useProductSearch() {
    const [value, setValue] = useState("");
    const [results, setResults] = useState<IProductSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, startTransition] = useTransition();

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            requestIdRef.current += 1;
        };
    }, []);

    const handleChange = useCallback((nextValue: string) => {
        setValue(nextValue);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const normalizedValue: string = nextValue.trim();

        if (normalizedValue.length < 2) {
            requestIdRef.current += 1;
            setIsSearching(false);
            setResults([]);
            return;
        }

        const requestId: number = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setIsSearching(true);

        timeoutRef.current = setTimeout(() => {
            startTransition(async () => {
                try {
                    const products: IProductSearchResult[] = await searchProducts(normalizedValue);

                    if (requestIdRef.current === requestId) {
                        setResults(products);
                    }
                } catch (error) {
                    console.error("Product search failed:", error);

                    if (requestIdRef.current === requestId) {
                        setResults([]);
                    }
                } finally {
                    if (requestIdRef.current === requestId) {
                        setIsSearching(false);
                    }
                }
            });
        }, 500);
    }, []);

    const reset = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        requestIdRef.current += 1;
        setValue("");
        setResults([]);
        setIsSearching(false);
    }, []);

    return { value, setValue: handleChange, results, isPending: isPending || isSearching, reset };
}
