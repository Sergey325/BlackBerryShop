export type ContactData = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    comment: string;
};

export type AppliedPromoCode = {
    code: string;
    discountPercent: number;
    eligibleProductIds: number[];
    discountAmount: number;
};
