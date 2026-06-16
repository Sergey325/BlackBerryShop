import React, {useState} from "react";


type Props = {
    onChange?: (count: number) => void;
    initialNumber?: number;
};

const Counter = ({onChange, initialNumber}: Props) => {
    const [count, setCount] = useState(initialNumber || 1);


    return (
        <div className="flex items-center border border-gray-300 font-medium text-zinc-700 select-none text-lg lg:text-xl">
            <button
                onClick={() => {
                    const newCount = Math.max(1, count - 1);

                    setCount(newCount);
                    onChange?.(newCount);
                }}
                className="px-3 py-1 lg:px-4 lg:py-2 hover:bg-gray-100 "
            >
                −
            </button>
            <span className="text-[15px] px-4">{count}</span>
            <button
                onClick={() => {
                    const newCount = count + 1;

                    setCount(newCount);
                    onChange?.(newCount);
                }}
                className="px-3 py-1 lg:px-4 lg:py-2 hover:bg-gray-100"
            >
                +
            </button>
        </div>
    );
};

export default Counter;