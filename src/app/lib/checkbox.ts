import "server-only";

import {createHash} from "node:crypto";
import {PaymentMethod} from "@prisma/client";

const CHECKBOX_API_URL = "https://api.checkbox.ua/api/v1";
const CHECKBOX_RECEIPT_URL = "https://check.checkbox.ua";
const COD_PREPAYMENT_KOPECKS = 15_000;
const POLL_INTERVAL_MS = 1_000;
const MAX_POLL_ATTEMPTS = 20;

type CheckboxReceiptStatus = "CREATED" | "DONE" | "ERROR" | "CANCELLATION" | "CANCELLED";
type CheckboxShiftStatus = "CREATED" | "OPENING" | "OPENED" | "CLOSING" | "CLOSED";

type CheckboxOrderItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    colorName: string | null;
    color: string | null;
    size: string | null;
};

type CheckboxGoodItem = {
    good: {code: string; name: string; price: number};
    quantity: number;
};

type CheckboxDelivery = {
    emails?: string[];
    phone?: string;
};

export type CheckboxInitialPaymentSource = "MONOBANK" | "CURRENT_ACCOUNT";

type CheckboxPaymentSource = CheckboxInitialPaymentSource | "NOVAPAY";

type CheckboxPayment = {
    type: "CASHLESS";
    code: 1;
    value: number;
    label: string;
};

const CHECKBOX_PAYMENT_LABELS: Record<CheckboxPaymentSource, string> = {
    MONOBANK: "Платіж через інтегратора mono",
    NOVAPAY: "Платіж через інтегратора NovaPay",
    CURRENT_ACCOUNT: "З поточного рахунку",
};

export type CheckboxOrder = {
    id: number;
    publicToken: string;
    invoiceId: string | null;
    paymentMethod: PaymentMethod;
    phone: string | null;
    email: string | null;
    ttnNumber: string | null;
    items: CheckboxOrderItem[];
};

type CheckboxAccessTokenResponse = {
    access_token: string;
};

type CheckboxShiftResponse = {
    id: string;
    status: CheckboxShiftStatus;
    initial_transaction?: {
        response_id?: string | null;
    } | null;
    cash_register?: {
        fiscal_number?: string | null;
    } | null;
    cashier?: {
        signature_type?: string | null;
    } | null;
};

type CheckboxReceiptResponse = {
    id: string;
    status: CheckboxReceiptStatus;
    fiscal_code?: string | null;
    fiscal_date?: string | null;
    pre_payment_relation_id?: string | null;
    tax_url?: string | null;
    transaction?: {
        response_id?: string | null;
        response_error_message?: string | null;
    } | null;
    cash_register?: {
        fiscal_number?: string | null;
    } | null;
    cashier?: {
        signature_type?: string | null;
    } | null;
};

export type CheckboxFiscalizationResult = {
    receiptId: string;
    status: CheckboxReceiptStatus;
    fiscalCode: string | null;
    fiscalDate: Date | null;
    taxUrl: string | null;
    relationId: string | null;
};

type CheckboxRequestOptions = {
    method?: "GET" | "POST";
    token?: string;
    body?: unknown;
    allowNotFound?: boolean;
};

class CheckboxApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "CheckboxApiError";
        this.status = status;
    }
}

function getCheckboxCredentials(): {licenseKey: string; pinCode: string} {
    const licenseKey: string | undefined = process.env.CHECKBOX_LICENSE_KEY;
    const pinCode: string | undefined = process.env.CHECKBOX_CASHIER_PIN_CODE;

    if (!licenseKey || !pinCode) {
        throw new Error("CHECKBOX_LICENSE_KEY and CHECKBOX_CASHIER_PIN_CODE must be configured");
    }

    return {licenseKey, pinCode};
}


async function checkboxRequest<T>(path: string, options: CheckboxRequestOptions = {}): Promise<T | null> {
    const {licenseKey} = getCheckboxCredentials();

    const response: Response = await fetch(`${CHECKBOX_API_URL}${path}`, {
        method: options.method ?? "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-License-Key": licenseKey,
            ...(options.token
                ? {Authorization: `Bearer ${options.token}`}
                : {}),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
    });
    const responseText: string = await response.text();
    let responseBody: unknown = null;

    if (responseText.length > 0) {
        try {
            responseBody = JSON.parse(responseText) as unknown;
        } catch {
            responseBody = responseText;
        }
    }

    if (options.allowNotFound && response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const message: string =
            typeof responseBody === "object" &&
            responseBody !== null &&
            "message" in responseBody &&
            typeof responseBody.message === "string"
                ? responseBody.message
                : `Checkbox API request failed with status ${response.status}`;

        throw new CheckboxApiError(message, response.status);
    }

    return responseBody as T;
}

async function signInCashier(): Promise<string> {
    const {pinCode} = getCheckboxCredentials();
    const response: CheckboxAccessTokenResponse | null = await checkboxRequest<CheckboxAccessTokenResponse>(
        "/cashier/signinPinCode",
        {
            method: "POST",
            body: {pin_code: pinCode},
        },
    );

    if (!response?.access_token) {
        throw new Error("Checkbox did not return a cashier access token");
    }

    return response.access_token;
}

function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve: () => void): void => {
        setTimeout(resolve, milliseconds);
    });
}

function hasTestMarker(values: Array<string | null | undefined>): boolean {
    return values.some(
        (value: string | null | undefined): boolean => value?.toUpperCase().startsWith("TEST") === true,
    );
}

function assertProductionShift(shift: CheckboxShiftResponse): void {
    if (
        process.env.NODE_ENV === "production" &&
        hasTestMarker([
            shift.initial_transaction?.response_id,
            shift.cash_register?.fiscal_number,
            shift.cashier?.signature_type,
        ])
    ) {
        throw new Error(
            `Checkbox returned test shift ${shift.id}. Check production license key and cashier PIN code`,
        );
    }
}

async function waitForOpenedShift(token: string, shiftId: string): Promise<void> {
    for (let attempt: number = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        const shift: CheckboxShiftResponse | null = await checkboxRequest<CheckboxShiftResponse>(
            `/shifts/${shiftId}`,
            {token},
        );

        if (shift?.status === "OPENED") {
            assertProductionShift(shift);
            return;
        }

        if (shift?.status === "CLOSED" || shift?.status === "CLOSING") {
            throw new Error(`Checkbox shift ${shiftId} cannot be opened (status: ${shift.status})`);
        }

        await delay(POLL_INTERVAL_MS);
    }

    throw new Error(`Checkbox shift ${shiftId} did not open in time`);
}

async function ensureOpenShift(token: string): Promise<void> {
    let activeShift: CheckboxShiftResponse | null = null;

    try {
        activeShift = await checkboxRequest<CheckboxShiftResponse>("/cashier/shift", {
            token,
            allowNotFound: true,
        });
    } catch (error: unknown) {
        if (!(error instanceof CheckboxApiError) || error.status !== 400) {
            throw error;
        }
    }

    if (activeShift?.status === "OPENED") {
        assertProductionShift(activeShift);
        return;
    }

    if (activeShift && (activeShift.status === "CREATED" || activeShift.status === "OPENING")) {
        await waitForOpenedShift(token, activeShift.id);
        return;
    }

    let createdShift: CheckboxShiftResponse | null;

    try {
        createdShift = await checkboxRequest<CheckboxShiftResponse>("/shifts", {
            method: "POST",
            token,
            body: {},
        });
    } catch (error: unknown) {
        // Another concurrent webhook may have opened the same cashier's shift.
        if (!(error instanceof CheckboxApiError) || error.status !== 400) {
            throw error;
        }

        const concurrentShift: CheckboxShiftResponse | null = await checkboxRequest<CheckboxShiftResponse>(
            "/cashier/shift",
            {token, allowNotFound: true},
        );

        if (!concurrentShift) {
            throw error;
        }

        createdShift = concurrentShift;
    }

    if (!createdShift) {
        throw new Error("Checkbox did not return the opened shift");
    }

    if (createdShift.status !== "OPENED") {
        await waitForOpenedShift(token, createdShift.id);
    } else {
        assertProductionShift(createdShift);
    }
}

function createStableUuid(orderToken: string, kind: "payment" | "afterpayment"): string {
    const hex: string = createHash("sha256")
        .update(`blackberry-shop:${orderToken}:${kind}`)
        .digest("hex")
        .slice(0, 32);
    const versioned: string = `${hex.slice(0, 12)}5${hex.slice(13)}`;
    const variantNibble: number = (Number.parseInt(versioned[16], 16) & 0x3) | 0x8;
    const uuidHex: string = `${versioned.slice(0, 16)}${variantNibble.toString(16)}${versioned.slice(17)}`;

    return `${uuidHex.slice(0, 8)}-${uuidHex.slice(8, 12)}-${uuidHex.slice(12, 16)}-${uuidHex.slice(16, 20)}-${uuidHex.slice(20)}`;
}

export function getCheckboxPaymentReceiptUrl(orderToken: string): string {
    return `${CHECKBOX_RECEIPT_URL}/${createStableUuid(orderToken, "payment")}`;
}

function toKopecks(value: number): number {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid monetary value for Checkbox: ${value}`);
    }

    return Math.round(value * 100);
}

function buildCashlessPayment(value: number, source: CheckboxPaymentSource): CheckboxPayment {
    return {
        type: "CASHLESS",
        code: 1,
        value,
        label: CHECKBOX_PAYMENT_LABELS[source],
    };
}

function normalizePhone(phone: string | null): string | undefined {
    if (!phone) {
        return undefined;
    }

    const digits: string = phone.replace(/\D/g, "");

    if (digits.length === 10 && digits.startsWith("0")) {
        return `+38${digits}`;
    }

    if (digits.length === 12 && digits.startsWith("380")) {
        return `+${digits}`;
    }

    return undefined;
}

function buildDelivery(order: Pick<CheckboxOrder, "email" | "phone">): CheckboxDelivery | undefined {
    const delivery: CheckboxDelivery = {};
    const email: string | null = order.email?.trim() || null;
    const phone: string | undefined = normalizePhone(order.phone);

    if (email) {
        delivery.emails = [email, process.env.EMAIL!];
    }

    if (phone) {
        delivery.phone = phone;
    }

    return Object.keys(delivery).length > 0 ? delivery : undefined;
}

function buildGoods(order: CheckboxOrder): CheckboxGoodItem[] {
    return order.items.map((item: CheckboxOrderItem) => {
        const variantParts: string[] = [item.colorName ?? item.color, item.size]
            .filter((value: string | null): value is string => Boolean(value));

        return {
            good: {
                code: `order-${order.id}-item-${item.id}`,
                name: variantParts.length > 0
                    ? `${item.name} (${variantParts.join(", ")})`
                    : item.name,
                price: toKopecks(item.price),
            },
            quantity: item.quantity * 1_000,
        };
    });
}

async function getExistingReceipt(token: string, receiptId: string): Promise<CheckboxReceiptResponse | null> {
    return checkboxRequest<CheckboxReceiptResponse>(`/receipts/${receiptId}`, {
        token,
        allowNotFound: true,
    });
}

async function createOrGetReceipt(
    token: string,
    endpoint: string,
    receiptId: string,
    payload: unknown,
): Promise<CheckboxReceiptResponse> {
    try {
        const createdReceipt: CheckboxReceiptResponse | null = await checkboxRequest<CheckboxReceiptResponse>(
            endpoint,
            {method: "POST", token, body: payload},
        );

        if (!createdReceipt) {
            throw new Error(`Checkbox did not return receipt ${receiptId}`);
        }

        return createdReceipt;
    } catch (error: unknown) {
        if (!(error instanceof CheckboxApiError) || error.status !== 400) {
            throw error;
        }

        // A concurrent webhook may have created our deterministic receipt ID.
        const concurrentReceipt: CheckboxReceiptResponse | null = await getExistingReceipt(token, receiptId);

        if (!concurrentReceipt) {
            throw error;
        }

        return concurrentReceipt;
    }
}

async function waitForFiscalizedReceipt(
    token: string,
    initialReceipt: CheckboxReceiptResponse,
): Promise<CheckboxReceiptResponse> {
    let receipt: CheckboxReceiptResponse = initialReceipt;

    for (let attempt: number = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        if (receipt.status === "DONE") {
            return receipt;
        }

        if (receipt.status === "ERROR" || receipt.status === "CANCELLED") {
            throw new Error(
                receipt.transaction?.response_error_message
                ?? `Checkbox receipt ${receipt.id} failed with status ${receipt.status}`,
            );
        }

        await delay(POLL_INTERVAL_MS);
        const updatedReceipt: CheckboxReceiptResponse | null = await getExistingReceipt(token, receipt.id);

        if (!updatedReceipt) {
            throw new Error(`Checkbox receipt ${receipt.id} disappeared while fiscalizing`);
        }

        receipt = updatedReceipt;
    }

    throw new Error(`Checkbox receipt ${receipt.id} was not fiscalized in time`);
}

function assertProductionReceipt(receipt: CheckboxReceiptResponse): void {
    if (process.env.NODE_ENV !== "production") {
        return;
    }

    if (hasTestMarker([
        receipt.fiscal_code,
        receipt.transaction?.response_id,
        receipt.cash_register?.fiscal_number,
        receipt.cashier?.signature_type,
    ])) {
        throw new Error(
            `Checkbox returned test receipt ${receipt.id}. Check production license key and cashier PIN code`,
        );
    }
}

function toFiscalizationResult(
    receipt: CheckboxReceiptResponse,
    relationId: string | null,
): CheckboxFiscalizationResult {
    assertProductionReceipt(receipt);

    return {
        receiptId: receipt.id,
        status: receipt.status,
        fiscalCode: receipt.fiscal_code ?? null,
        fiscalDate: receipt.fiscal_date ? new Date(receipt.fiscal_date) : null,
        taxUrl: `${CHECKBOX_RECEIPT_URL}/${receipt.id}`,
        relationId: receipt.pre_payment_relation_id ?? relationId,
    };
}

export async function createCheckboxPaymentReceipt(
    order: CheckboxOrder,
    paymentSource: CheckboxInitialPaymentSource = "MONOBANK",
): Promise<CheckboxFiscalizationResult> {
    const token: string = await signInCashier();
    const receiptId: string = createStableUuid(order.publicToken, "payment");
    const relationId: string | null = order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
        ? `blackberry-order-${order.publicToken}`
        : null;
    const existingReceipt: CheckboxReceiptResponse | null = await getExistingReceipt(token, receiptId);

    if (existingReceipt) {
        const fiscalizedReceipt: CheckboxReceiptResponse = await waitForFiscalizedReceipt(token, existingReceipt);
        return toFiscalizationResult(fiscalizedReceipt, relationId);
    }

    await ensureOpenShift(token);

    const goods: CheckboxGoodItem[] = buildGoods(order);
    const goodsTotalKopecks: number = order.items.reduce(
        (total: number, item: CheckboxOrderItem): number => total + toKopecks(item.price) * item.quantity,
        0,
    );
    const delivery: CheckboxDelivery | undefined = buildDelivery(order);
    const commonPayload = {
        id: receiptId,
        goods,
        ...(delivery ? {delivery} : {}),
        context: {
            order_id: order.id,
            monobank_invoice_id: order.invoiceId ?? "",
            ttn: order.ttnNumber ?? "",
        },
    };
    let endpoint: string;
    let payload: unknown;

    if (order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
        if (goodsTotalKopecks < COD_PREPAYMENT_KOPECKS) {
            throw new Error(`Order ${order.id} total is less than the 150 UAH prepayment`);
        }

        if (!order.ttnNumber) {
            throw new Error(`Order ${order.id} requires a TTN before creating a Checkbox prepayment receipt`);
        }

        endpoint = "/prepayment-receipts";
        payload = {
            ...commonPayload,
            custom_relation_id: relationId,
            ettn: order.ttnNumber,
            payments: [buildCashlessPayment(COD_PREPAYMENT_KOPECKS, paymentSource)],
        };
    } else {
        endpoint = "/receipts/sell";
        payload = {
            ...commonPayload,
            payments: [buildCashlessPayment(goodsTotalKopecks, paymentSource)],
        };
    }

    const createdReceipt: CheckboxReceiptResponse = await createOrGetReceipt(
        token,
        endpoint,
        receiptId,
        payload,
    );

    const fiscalizedReceipt: CheckboxReceiptResponse = await waitForFiscalizedReceipt(token, createdReceipt);
    return toFiscalizationResult(fiscalizedReceipt, relationId);
}

export async function createCheckboxAfterpaymentReceipt(
    order: CheckboxOrder,
    relationId: string,
): Promise<CheckboxFiscalizationResult> {
    const token: string = await signInCashier();
    const receiptId: string = createStableUuid(order.publicToken, "afterpayment");
    const existingReceipt: CheckboxReceiptResponse | null = await getExistingReceipt(token, receiptId);

    if (existingReceipt) {
        const fiscalizedReceipt: CheckboxReceiptResponse = await waitForFiscalizedReceipt(token, existingReceipt);
        return toFiscalizationResult(fiscalizedReceipt, relationId);
    }

    const goodsTotalKopecks: number = order.items.reduce(
        (total: number, item: CheckboxOrderItem): number => total + toKopecks(item.price) * item.quantity,
        0,
    );
    const afterpaymentKopecks: number = goodsTotalKopecks - COD_PREPAYMENT_KOPECKS;

    if (afterpaymentKopecks <= 0) {
        throw new Error(`Order ${order.id} has no amount left for an afterpayment receipt`);
    }

    await ensureOpenShift(token);

    const delivery: CheckboxDelivery | undefined = buildDelivery(order);
    const createdReceipt: CheckboxReceiptResponse = await createOrGetReceipt(
        token,
        `/prepayment-receipts/${encodeURIComponent(relationId)}`,
        receiptId,
        {
            id: receiptId,
            payments: [buildCashlessPayment(afterpaymentKopecks, "NOVAPAY")],
            ...(delivery ? {delivery} : {}),
        },
    );

    const fiscalizedReceipt: CheckboxReceiptResponse = await waitForFiscalizedReceipt(token, createdReceipt);
    return toFiscalizationResult(fiscalizedReceipt, relationId);
}
