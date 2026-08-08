import {OrderStatus, PaymentMethod} from "@prisma/client";
import {JSX} from "react";
import {ICategory} from "@/app/actions/getCategories";
import {IProductSize} from "@/app/actions/getProducts";

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

export type ProductSelection = Omit<
    CartItem,
    "quantity" | "size" | "isDecoration"
>;

export type CartItem = {
    productId: number;
    productColorId: number;
    productName: string;
    slug: string;
    price: number;
    discount: number;
    size?: string;
    sizes: IProductSize[];
    color: string;
    colorName: string;
    photoUrl: string;
    quantity: number;
    categorySlug: string;
    isDecoration: boolean;
};

export interface IOrderItem {
    id: number;
    orderId: number;
    productId: number;
    productSizeId: number | null;
    name: string;
    price: number;
    quantity: number;
    color: string;
    colorName: string | null;
    size: string | null;
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

export type Season = {
    id: "WINTER" | "SUMMER";
    label: string;
    icon: string;
    desc: string;
    heroImage: string;
    heroBg: string;
    categories: ICategory[];
    particles: JSX.Element;
};
