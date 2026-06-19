"use client"

import {ReactNode, useState} from "react";
import {FaChevronDown} from "react-icons/fa";


type Props = {
    title: string;
    content?: string[]
    children?: ReactNode;
};

const Accordion = ({title, content, children}: Props) => {
    const [open, setOpen] = useState(false);


    return (
        <div className="">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between font-semibold"
            >
                {title}
                <FaChevronDown className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-600 pt-2 ${open ? "max-h-40" : "max-h-0"}`}>
                {
                    children ? children
                        : <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5">
                            {
                                content?.map((item, index) => (
                                    <li className="text-sm" key={index}>
                                        {item}
                                    </li>
                                ))
                            }
                        </ul>
                }
            </div>
        </div>
    );
};

export default Accordion;