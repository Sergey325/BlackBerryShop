import {useState} from "react";
import {FiChevronDown} from "react-icons/fi";

type Props = {
    title: string;
    children: React.ReactNode
    initialState?: boolean
}

const FilterSection = ({ title, children, initialState = true }: Props) => {
    const [open, setOpen] = useState(initialState);

    return (
        <div className="border-b border-gray-100 py-4 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3 cursor-pointer"
            >
                {title}

                <FiChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FilterSection;