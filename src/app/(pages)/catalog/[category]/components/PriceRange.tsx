import {useState} from "react";

export default function PriceRange() {
    const [lo, setLo] = useState(200);
    const [hi, setHi] = useState(800);
    const MIN = 100, MAX = 1500;
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
            `}</style>

            <div className="relative h-1.5 bg-gray-200 rounded-full mb-3">
                {/* active track */}
                <div className="absolute h-full bg-primary rounded-full"
                     style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }} />

                {/* two overlapping range inputs */}
                <input type="range" min={MIN} max={MAX} value={lo}
                       onChange={e => setLo(Math.min(+e.target.value, hi - 50))}
                       className="price-thumb absolute inset-0 w-full h-full pointer-events-none"
                       style={{ zIndex: lo > MAX - 100 ? 5 : 3 }} />
                <input type="range" min={MIN} max={MAX} value={hi}
                       onChange={e => setHi(Math.max(+e.target.value, lo + 50))}
                       className="price-thumb absolute inset-0 w-full h-full pointer-events-none"
                       style={{ zIndex: 4 }} />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{lo} грн</span>
                <span>{hi} грн</span>
            </div>
        </div>
    );
}