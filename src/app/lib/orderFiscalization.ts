import "server-only";

import {OrderStatus, PaymentMethod, Prisma} from "@prisma/client";
import prisma from "@/app/lib/prisma";
import {
    CheckboxFiscalizationResult,
    createCheckboxAfterpaymentReceipt,
    createCheckboxPaymentReceipt,
} from "@/app/lib/checkbox";

const checkboxOrderSelect = {
    id: true,
    status: true,
    invoiceId: true,
    paymentMethod: true,
    phone: true,
    email: true,
    ttnNumber: true,
    checkboxReceiptId: true,
    checkboxReceiptFiscalCode: true,
    checkboxReceiptStatus: true,
    checkboxReceiptCreatedAt: true,
    checkboxReceiptUrl: true,
    checkboxPrepaymentRelationId: true,
    checkboxAfterpaymentReceiptId: true,
    checkboxAfterpaymentFiscalCode: true,
    checkboxAfterpaymentStatus: true,
    checkboxAfterpaymentCreatedAt: true,
    checkboxAfterpaymentReceiptUrl: true,
    items: {
        select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            colorName: true,
            color: true,
            size: true,
        },
    },
} satisfies Prisma.OrderSelect;

type FiscalizationOrder = Prisma.OrderGetPayload<{select: typeof checkboxOrderSelect}>;

async function getOrder(orderId: number): Promise<FiscalizationOrder> {
    const order: FiscalizationOrder | null = await prisma.order.findUnique({
        where: {id: orderId},
        select: checkboxOrderSelect,
    });

    if (!order) {
        throw new Error(`Order ${orderId} was not found`);
    }

    return order;
}

export async function fiscalizeInitialOrder(orderId: number): Promise<CheckboxFiscalizationResult> {
    const order: FiscalizationOrder = await getOrder(orderId);

    if (order.checkboxReceiptId && order.checkboxReceiptStatus === "DONE") {
        return {
            receiptId: order.checkboxReceiptId,
            status: "DONE",
            fiscalCode: order.checkboxReceiptFiscalCode,
            fiscalDate: order.checkboxReceiptCreatedAt,
            taxUrl: order.checkboxReceiptUrl,
            relationId: order.checkboxPrepaymentRelationId,
        };
    }

    if (
        order.status === OrderStatus.PENDING ||
        order.status === OrderStatus.CANCELLED ||
        order.status === OrderStatus.REFUNDED
    ) {
        throw new Error(`Order ${order.id} with status ${order.status} cannot be fiscalized`);
    }

    const result: CheckboxFiscalizationResult = await createCheckboxPaymentReceipt(order);

    await prisma.order.update({
        where: {id: order.id},
        data: {
            checkboxReceiptId: result.receiptId,
            checkboxReceiptFiscalCode: result.fiscalCode,
            checkboxReceiptStatus: result.status,
            checkboxReceiptCreatedAt: result.fiscalDate ?? new Date(),
            checkboxReceiptUrl: result.taxUrl,
            checkboxPrepaymentRelationId: result.relationId,
        },
    });

    return result;
}

export async function fiscalizeAfterpaymentOrder(orderId: number): Promise<CheckboxFiscalizationResult> {
    const order: FiscalizationOrder = await getOrder(orderId);

    if (order.checkboxAfterpaymentReceiptId && order.checkboxAfterpaymentStatus === "DONE") {
        return {
            receiptId: order.checkboxAfterpaymentReceiptId,
            status: "DONE",
            fiscalCode: order.checkboxAfterpaymentFiscalCode,
            fiscalDate: order.checkboxAfterpaymentCreatedAt,
            taxUrl: order.checkboxAfterpaymentReceiptUrl,
            relationId: order.checkboxPrepaymentRelationId,
        };
    }

    if (order.status !== OrderStatus.DELIVERED) {
        throw new Error(`Order ${order.id} must be delivered before creating an afterpayment receipt`);
    }

    if (order.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY) {
        throw new Error(`Order ${order.id} does not use cash on delivery`);
    }

    if (order.checkboxReceiptStatus !== "DONE" || !order.checkboxPrepaymentRelationId) {
        throw new Error(`Order ${order.id} does not have a fiscalized prepayment receipt`);
    }

    const result: CheckboxFiscalizationResult = await createCheckboxAfterpaymentReceipt(
        order,
        order.checkboxPrepaymentRelationId,
    );

    await prisma.order.update({
        where: {id: order.id},
        data: {
            checkboxAfterpaymentReceiptId: result.receiptId,
            checkboxAfterpaymentFiscalCode: result.fiscalCode,
            checkboxAfterpaymentStatus: result.status,
            checkboxAfterpaymentCreatedAt: result.fiscalDate ?? new Date(),
            checkboxAfterpaymentReceiptUrl: result.taxUrl,
        },
    });

    return result;
}
