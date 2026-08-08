"use client"

import {useState} from "react";
import {FiChevronLeft, FiChevronRight} from "react-icons/fi";

const Pagination = () => {
    const [page, setPage] = useState(1);
    const total = 3;
    return (
        <div className="flex items-center justify-center gap-1 mt-10">
            <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
                <FiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: total }, (_, i) => i + 1).map(p => (
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        page === p ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => setPage(p => Math.min(total, p + 1))}
                disabled={page === total}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
                <FiChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Pagination;