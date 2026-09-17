import * as Sentry from "@sentry/nextjs";
import {NextResponse} from "next/server";
import {
    fiscalizeAfterpaymentOrder,
    fiscalizeInitialOrder,
} from "@/app/lib/orderFiscalization";
import {CheckboxFiscalizationResult} from "@/app/lib/checkbox";

type FiscalizationType = "initial" | "afterpayment";

type FiscalizationRequestBody = {
    type?: unknown;
};

type RouteContext = {
    params: Promise<{orderId: string}>;
};

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
    const secret: string | undefined = process.env.INTERNAL_API_SECRET;

    if (!secret) {
        Sentry.captureMessage("INTERNAL_API_SECRET is not configured", "error");
        return NextResponse.json({error: "Server configuration error"}, {status: 500});
    }

    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {orderId: rawOrderId} = await context.params;
    const orderId: number = Number(rawOrderId);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return NextResponse.json({error: "Invalid order ID"}, {status: 400});
    }

    let body: FiscalizationRequestBody;

    try {
        body = await request.json() as FiscalizationRequestBody;
    } catch {
        return NextResponse.json({error: "Invalid JSON body"}, {status: 400});
    }

    if (body.type !== "initial" && body.type !== "afterpayment") {
        return NextResponse.json({error: "type must be initial or afterpayment"}, {status: 400});
    }

    const type: FiscalizationType = body.type;

    try {
        const result: CheckboxFiscalizationResult = type === "initial"
            ? await fiscalizeInitialOrder(orderId)
            : await fiscalizeAfterpaymentOrder(orderId);

        return NextResponse.json({
            receiptId: result.receiptId,
            status: result.status,
            fiscalCode: result.fiscalCode,
            fiscalDate: result.fiscalDate,
            receiptUrl: result.taxUrl,
            relationId: result.relationId,
        });
    } catch (error: unknown) {
        Sentry.withScope((scope) => {
            scope.setContext("fiscalization", {orderId, type});
            scope.setTag("error_type", "internal_fiscalization_failed");
            Sentry.captureException(error);
        });

        const message: string = error instanceof Error
            ? error.message
            : "Fiscalization failed";

        return NextResponse.json({error: message}, {status: 500});
    }
}
