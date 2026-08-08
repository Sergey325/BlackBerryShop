"use client"

import {ReactNode, useState} from "react";
import {FaChevronDown} from "react-icons/fa";

type Props = {
    title: string;
    openTitle?: string; // лейбл в открытом состоянии, по умолчанию = title
    content?: string[]
    children?: ReactNode;
    initialState?: boolean;
    containerClass?: string;
    buttonClass?: string;
    openUp?: boolean;
};

const Accordion = ({
                       title,
                       openTitle,
                       content,
                       children,
                       initialState = false,
                       containerClass,
                       buttonClass,
                       openUp = false,
                   }: Props) => {
    const [open, setOpen] = useState(initialState);

    const label = open && openTitle ? openTitle : title;

    const body = (
        <div
            className={`grid transition-all duration-300 ${containerClass} ${
                open ? "grid-rows-[1fr] pb-2" : "grid-rows-[0fr]"
            }`}
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
    );

    const header = (
        <button
            onClick={() => setOpen(!open)}
            className={`w-full flex items-center justify-between font-medium ${buttonClass} cursor-pointer`}
        >
            {label}
            <FaChevronDown
                className={`shrink-0 transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                }`}
            />
        </button>
    );

    return (
        <div className="flex flex-col">
            {openUp ? (
                <>
                    {body}
                    {header}
                </>
            ) : (
                <>
                    {header}
                    {body}
                </>
            )}
        </div>
    );
};

export default Accordion;