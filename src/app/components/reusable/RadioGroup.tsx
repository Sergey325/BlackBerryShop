import {Dispatch, SetStateAction} from "react";

type Option = {
    label: string;
    value: string;
    shortTitle: string;
    icon?: React.ReactNode;
};

type Props = {
    options: Option[];
    value: string;
    onChange: Dispatch<SetStateAction<{
        value: string;
        label: string;
        shortTitle: string;
    }>>
};

export default function RadioGroup({ options, value, onChange }: Props) {


    return (
        <div className="flex flex-col divide-y divide-gray-200 border-2 border-gray-200 rounded-md bg-white select-none">
            {options.map((option) => (
                <label
                    key={option.value}
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => onChange(option)}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                                value === option.value ? "border-purple-600" : "border-gray-300"
                            }`}
                        >
                            {value === option.value && (
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            )}
                        </div>
                        <span className="">{option.label}</span>
                    </div>
                    {option.icon && <div className="ml-4 shrink-0">{option.icon}</div>}
                </label>
            ))}
        </div>
    );
}