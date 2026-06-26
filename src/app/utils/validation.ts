// const UA_MOBILE_CODES = [
//     "039",
//     "050",
//     "063",
//     "066",
//     "067",
//     "068",
//     "073",
//     "091",
//     "092",
//     "093",
//     "094",
//     "095",
//     "096",
//     "097",
//     "098",
//     "099",
// ];

export function isValidUAPhone(phone: string) {
    const normalized = phone.replace(/\D/g, "");

    // Украина +380 и всего 12 цифр
    if (!/^380\d{9}$/.test(normalized)) {
        return false;
    }

    return true;
}

export const validateName = (value: string) => {
    return /^[А-Яа-яІіЇїЄєҐґ' -]+$/.test(value);
};