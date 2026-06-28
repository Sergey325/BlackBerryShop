import {OrderStatus, PaymentMethod} from "@prisma/client";

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
    colorName: string;
    photoUrl: string;
    quantity: number;
};

export interface IOrderItem {
    id: number;
    orderId: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    color: string;
    colorName: string | null;
    size: string;
    imageUrl: string;
}

export interface IOrder {
    id: number;
    invoiceId: string | null;
    status: OrderStatus;
    totalAmount: number;
    firstName: string;
    lastName: string
    phone: string;
    email: string | null;
    comment: string| null;
    city: string;
    cityRef: string;
    warehouse: string;
    warehouseRef: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    paymentMethod: PaymentMethod;
    area: string;
    ttnNumber: string | null;
    ttnRef: string | null;
    warehouseNumber: number;
    items: IOrderItem[]
}