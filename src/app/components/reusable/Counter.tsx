import React from "react";


type Props = {
    onChange?: (count: number) => void;
    initialNumber?: number;
    max?: number | null;
    disabled?: boolean;
    onMaxReached?: () => void;
};

const Counter = ({onChange, initialNumber, max, disabled = false, onMaxReached}: Props) => {
    const count: number = Math.max(1, Math.min(initialNumber || 1, max ?? Infinity));

    const isAtMaximum: boolean = max !== null && max !== undefined && count >= max;

    return (
        <div className="flex items-center justify-between min-w-[120px] border border-gray-300 rounded-xl overflow-hidden font-medium text-zinc-700 select-none text-lg lg:text-xl">
            <button
                type="button"
                disabled={disabled || count <= 1}
                onClick={() => {
                    const newCount = Math.max(1, count - 1);

                    onChange?.(newCount);
                }}
                className="px-3 py-1 lg:px-4 lg:py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                −
            </button>
            <span className="text-[15px] flex-1 px-2 text-center">{count}</span>
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (isAtMaximum) {
                        onMaxReached?.();
                        return;
                    }

                    const newCount = Math.min(count + 1, max ?? Infinity);

                    onChange?.(newCount);
                }}
                className="px-3 py-1 lg:px-4 lg:py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                +
            </button>
        </div>
    );
};

export default Counter;
