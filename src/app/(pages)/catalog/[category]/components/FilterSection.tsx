import {useState} from "react";
import {FiChevronDown} from "react-icons/fi";


type Props = {
    title: string;
    children: React.ReactNode
}

const FilterSection = ({ title, children }: Props) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 py-4 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
            >
                {title}
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div>{children}</div>}
        </div>
    );
};

export default FilterSection;