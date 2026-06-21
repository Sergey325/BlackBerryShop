export type City = {
    ref: string;
    name: string;
    area: string
};

export type Warehouse = {
    ref: string;
    number: string;
    description: string
};

export type ContactData = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    comment: string;
};

export type CartItem = {
    productId: number;
    productColorId: number;
    productName: string;
    slug: string;
    price: number;
    discount: number;
    size: string;
    color: string;
    photoUrl: string;
    quantity: number;
};