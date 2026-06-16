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
    productId: string;
    productName: string;
    quantity: number;
    photoUrl: string;
    size?: string;
    color?: string;
    price: number;
    discount: number;
    slug: string;
};