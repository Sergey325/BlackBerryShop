"use client"

import {ReactNode, useState} from "react";
import {FaChevronDown} from "react-icons/fa";

type Props = {
    title: string;
    content?: string[]
    children?: ReactNode;
    initialState?: boolean;
    containerClass?: string;
};

const Accordion = ({title, content, children, initialState = false, containerClass}: Props) => {
    const [open, setOpen] = useState(initialState);


    return (
        <div className="">
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between font-medium ${containerClass}`}
            >
                {title}
                <FaChevronDown className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>
            <div
                className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pt-2" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden">
                    {children ? (
                        children
                    ) : (
                        <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5">
                            {content?.map((item, index) => (
                                <li className="text-sm" key={index}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Accordion;