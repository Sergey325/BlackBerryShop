import { IMaskInput } from "react-imask";
import {ContactData} from "@/app/types";


type Props = {
    value: ContactData;
    onChange: (data: ContactData) => void;
};

export default function ContactForm({ value, onChange }: Props) {
    const update = (field: keyof ContactData) => (newValue: string) => {
        onChange({
            ...value,
            [field]: newValue,
        });
    };

    return (
        <div className="border-2 border-gray-200 rounded-md p-6 flex flex-col gap-5 text-base lg:text-lg bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base">Ім&#39;я*</label>
                    <input
                        name="firstName"
                        autoComplete="given-name"
                        value={value.firstName}
                        onChange={(e) => update("firstName")(e.target.value)}
                        className="border border-gray-200 rounded-sm px-3 py-2 outline-none focus:border-gray-400 transition"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base">Прізвище*</label>
                    <input
                        name="lastName"
                        autoComplete="family-name"
                        value={value.lastName}
                        onChange={(e) => update("lastName")(e.target.value)}
                        className="border border-gray-200 rounded-sm px-3 py-2 outline-none focus:border-gray-400 transition"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base">Номер телефону*</label>
                    <IMaskInput
                        mask="+38 (000) 000-00-00"
                        value={value.phone}
                        onAccept={(val) => update("phone")(val)}
                        name="phone"
                        autoComplete="tel"
                        className="border border-gray-200 rounded-sm px-3 py-2 outline-none focus:border-gray-400 transition"
                    />

                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base">Email*</label>
                    <input
                        value={value.email}
                        onChange={(e) => update("email")(e.target.value)}
                        type="email"
                        className="border border-gray-200 rounded-sm px-3 py-2 outline-none focus:border-gray-400 transition"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm md:text-base">Коментарі до замовлення</label>
                <textarea
                    value={value.comment}
                    onChange={(e) => update("comment")(e.target.value)}
                    rows={4}
                    className="border border-gray-200 rounded-sm px-3 py-2 outline-none focus:border-gray-400 transition min-h-20 max-h-70"
                />
            </div>
        </div>
    );
}