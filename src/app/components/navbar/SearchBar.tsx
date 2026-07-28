"use client";

import { useEffect, useRef, useState } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import Image from "next/image";
import Link from "next/link";
import { useProductSearch } from "@/app/hooks/useProductSearch";
import {AiOutlineLoading} from "react-icons/ai";

export default function SearchBar() {
    const [open, setOpen] = useState(false);
    const { value, setValue, results, isPending, reset } = useProductSearch();

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleClose = () => {
        setOpen(false);
        reset();
    };

    return (
        <div ref={containerRef} className="relative flex items-center">
            <button
                onClick={() => setOpen(true)}
                className={`py-2 mt-1 transition-[opacity,transform,color] ${open ? "opacity-0 pointer-events-none absolute" : "opacity-100"} cursor-pointer hover:text-primary`}
                aria-label="Пошук"
            >
                <BiSearch className="size-7"/>
            </button>

            <div
                className={`flex items-center overflow-hidden transition-all duration-300 ease-out bg-white  border border-primary rounded-full ${
                    open ? "w-64 px-3 opacity-100 border-gray-200" : "w-0 px-0 opacity-0 border-transparent"
                }`}
            >
                <BiSearch size={18} className="shrink-0 text-gray-500" />
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Пошук товарів..."
                    className="w-full bg-transparent outline-none px-2 py-2 text-sm border-none"
                />
                {open && (
                    <button onClick={handleClose} className="shrink-0 text-gray-400 hover:text-gray-700 cursor-pointer">
                        <BiX size={20} />
                    </button>
                )}
            </div>

            {open && value && (
                <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-primary rounded-lg shadow-lg z-50 overflow-hidden search-scrollbar">
                    {isPending && (
                        <div className="p-4 text-sm text-gray-500 flex gap-2 items-center">
                            <AiOutlineLoading className="size-4 animate-spin"/>
                            <p>Пошук...</p>
                        </div>
                    )}
                    {!isPending && results.length === 0 && (
                        <div className="p-4 text-sm text-gray-500">Нічого не знайдено</div>
                    )}
                    {!isPending &&
                        results.map((product) => (
                            <Link
                                key={product.id}
                                href={`/catalog/${product.category?.slug}/${product.id}`}
                                onClick={handleClose}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-primary/30 last:border-0"
                            >
                                <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-gray-100">
                                    <Image src={product.colors[0].images[0].url} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm truncate">{product.name}</span>
                                    <span className="text-sm font-medium">{product.price} ₴</span>
                                </div>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    );
}