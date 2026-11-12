// price includes options; liningPrice is the part excluded from discounts.
export const calculatePriceWithDiscount = (price: number, discount: number, liningPrice = 0): number =>
    (Math.round(Math.round((price - liningPrice) * 100) * (1 - discount / 100)) + Math.round(liningPrice * 100)) / 100;

export const calculateTotalPrice = (price: number, quantity: number, discount: number, liningPrice = 0): number =>
    Math.round(calculatePriceWithDiscount(price, discount, liningPrice) * quantity * 100) / 100;
