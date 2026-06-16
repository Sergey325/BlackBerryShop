'use client'

import {IconType} from "react-icons";

type Props = {
    label: string
    onClick: (e: any) => void
    disabled?: boolean
    outline?: boolean
    small?: boolean
    icon?: IconType
    gradient?: boolean
};

const Button = ({label, onClick, disabled, outline, small, icon: Icon, gradient}: Props) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative
                disabled:opacity-70 disabled:cursor-not-allowed
                rounded-lg
                transition-all
                duration-300
                w-full
                ${outline ? "bg-transparent" : "bg-[#823D9A]"}
                ${outline ? "shadow-[0_0_0_1px_rgba(100,116,139,1)]" : "border-slate-400"}
                ${outline ? "hover:shadow-[0_0_0_3px_rgba(100,116,139,1)]" : gradient ? "hover:shadow-[0_0_20px_rgba(137,63,237,0.70)]" : "group"}
                ${outline ? "text-gray-950" : "text-white"}
                ${gradient && "bg-linear-to-br from-indigo-500 to-purple-600"}
                ${gradient && ""}
                ${small ? "py-1" : "py-3"}
                ${small ? "text-sm" : "text-base"}
                ${small ? "font-light" : "font-semibold"}
                select-none
                overflow-hidden
            `}
        >
            <div className="flex items-center">
                {Icon && (
                    <Icon
                        size={24}
                        className="w-[30%] pl-2"
                    />
                )}
                <span className="w-full text-center text-nowrap">
                    {label}
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-25" />
                {Icon && (
                    <div className="w-[30%]"/>
                )}
            </div>
        </button>
    );
};

export default Button;