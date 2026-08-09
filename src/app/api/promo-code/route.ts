import {NextResponse} from "next/server";
import {
    calculateCartPricing,
    CartPricingError,
    PromoCartItemInput,
} from "@/app/lib/promoCode";

type PromoCodeRequest = {
    code?: unknown;
    items?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body: PromoCodeRequest = await request.json() as PromoCodeRequest;

        if (typeof body.code !== "string" || !Array.isArray(body.items)) {
            return NextResponse.json({error: "Введіть промокод"}, {status: 400});
        }

        const items: PromoCartItemInput[] = body.items.map((item: unknown): PromoCartItemInput => {
            const value = item as Partial<PromoCartItemInput>;
            return {
                productId: Number(value.productId),
                quantity: Number(value.quantity),
                lining: value.lining === true,
            };
        });
        const pricing = await calculateCartPricing(items, body.code);

        return NextResponse.json({
            promoCode: pricing.promoCode,
            subtotal: pricing.subtotal,
            discountAmount: pricing.discountAmount,
            total: pricing.total,
        });
    } catch (error: unknown) {
        if (error instanceof CartPricingError) {
            return NextResponse.json({error: error.message}, {status: 400});
        }

        console.error(error);
        return NextResponse.json({error: "Не вдалося перевірити промокод"}, {status: 500});
    }
}
