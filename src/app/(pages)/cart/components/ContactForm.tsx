import { IMaskInput } from "react-imask";
import {ContactData} from "@/app/types";
import {INVALID_EMAIL_MESSAGE} from "@/app/utils/validation";


type Props = {
    value: ContactData;
    onChange: (data: ContactData) => void;
    onEmailBlur: () => void;
    emailError: boolean;
};

export default function ContactForm({ value, onChange, onEmailBlur, emailError }: Props) {
    const update = (field: keyof ContactData) => (newValue: string) => {
        onChange({
            ...value,
            [field]: newValue,
        });
    };

    return (
        <div className="border border-primary/30 rounded-2xl p-6 flex flex-col gap-5 text-base bg-white shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-[15px]">Прізвище*</label>
                    <input
                        name="lastName"
                        autoComplete="family-name"
                        value={value.lastName}
                        maxLength={25}
                        onChange={(e) => update("lastName")(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 transition"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-[15px]">Ім&#39;я*</label>
                    <input
                        name="firstName"
                        autoComplete="given-name"
                        value={value.firstName}
                        maxLength={25}
                        onChange={(e) => update("firstName")(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 transition"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-[15px]">Номер телефону*</label>
                    <IMaskInput
                        mask="+38 (000) 000-00-00"
                        value={value.phone}
                        onAccept={(val) => update("phone")(val)}
                        name="phone"
                        autoComplete="tel"
                        className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 transition"
                    />

                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-email" className="text-sm md:text-[15px]">Email</label>
                    <input
                        id="checkout-email"
                        name="email"
                        autoComplete="email"
                        value={value.email}
                        maxLength={50}
                        onChange={(e) => update("email")(e.target.value)}
                        onBlur={onEmailBlur}
                        type="email"
                        aria-invalid={emailError}
                        aria-describedby={emailError ? "checkout-email-error" : undefined}
                        className={`border rounded-lg px-3 py-2 outline-none transition ${emailError ? "border-red-500" : "border-gray-200 focus:border-gray-400"}`}
                    />
                    {emailError && <p id="checkout-email-error" className="text-sm text-red-600">{INVALID_EMAIL_MESSAGE}</p>}
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm md:text-[15px]">Коментарі до замовлення</label>
                <textarea
                    value={value.comment}
                    onChange={(e) => update("comment")(e.target.value)}
                    rows={4}
                    className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 transition min-h-20 max-h-70"
                />
            </div>
        </div>
    );
}
