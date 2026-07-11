"use client"

import { useRouter, useSearchParams, useParams } from "next/navigation";
import {useState, useRef} from "react";

export default function PriceRange() {
    const router = useRouter();
    const params = useSearchParams();
    const pathnameParams = useParams();

    const MIN = 100;
    const MAX = 1500;

    const [lo, setLo] = useState(() =>
        Number(params.get("priceMin")) || 200
    );

    const [hi, setHi] = useState(() =>
        Number(params.get("priceMax")) || 800
    );

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateUrl = (min:number, max:number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const query = new URLSearchParams(params.toString());

            if (min === MIN) {
                query.delete("priceMin");
            } else {
                query.set("priceMin", String(min));
            }

            if (max === MAX) {
                query.delete("priceMax");
            } else {
                query.set("priceMax", String(max));
            }

            router.replace(
                `/catalog/${pathnameParams.category}?${query.toString()}`,
                {
                    scroll: false,
                }
            );
        }, 500);
    };


    const handleMinChange = (value: number) => {
        const newValue = Math.min(value, hi - 50);

        setLo(newValue);
        updateUrl(newValue, hi);
    };


    const handleMaxChange = (value: number) => {
        const newValue = Math.max(value, lo + 50);

        setHi(newValue);
        updateUrl(lo, newValue);
    };


    const loPct = ((lo - MIN) / (MAX - MIN)) * 100;
    const hiPct = ((hi - MIN) / (MAX - MIN)) * 100;

    return (
        <div className="px-1 pt-3">
            {/* styled thumbs */}
            <style>{`
                .price-thumb { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
                .price-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none; width: 16px; height: 16px;
                    border-radius: 50%; background: #823D9A; border: 2px solid white;
                    box-shadow: 0 1px 4px rgba(0,0,0,.2); pointer-events: all;
                }
                .price-thumb::-moz-range-thumb {
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #823D9A; border: 2px solid white; pointer-events: all;
                }
                .price-thumb::-webkit-slider-runnable-track {
                    background: transparent;
                    border: none;
                }
                
                .price-thumb::-moz-range-track {
                    background: transparent;
                    border: none;
                }
            `}</style>

            <div className="relative h-1.5 bg-gray-200 rounded-full mb-3">
                {/* active track */}
                <div className="absolute h-full bg-primary rounded-full"
                     style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }} />

                {/* two overlapping range inputs */}
                <input type="range" min={MIN} max={MAX} value={lo}
                       onChange={e => handleMinChange(+e.target.value)}
                       className="price-thumb absolute top-1/2 -translate-y-1/2 inset-x-0 w-full h-4 pointer-events-none border-none"
                       style={{ zIndex: lo > MAX - 100 ? 5 : 3 }} />
                <input type="range" min={MIN} max={MAX} value={hi}
                       onChange={e => handleMaxChange(+e.target.value)}
                       className="price-thumb absolute top-1/2 -translate-y-1/2 inset-x-0 w-full h-4 pointer-events-none border-none"
                       style={{ zIndex: 4 }} />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{lo} грн</span>
                <span>{hi} грн</span>
            </div>
        </div>
    );
}