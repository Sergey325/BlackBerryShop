import prisma from "@/app/lib/prisma";

export type PromoCartItemInput = {
    productId: number;
    quantity: number;
};

type PricedPromoCartItem = PromoCartItemInput & {
    unitPrice: number;
    finalUnitPrice: number;
    isEligible: boolean;
};

export type PromoCodeApplication = {
    id: number;
    code: string;
    discountPercent: number;
    eligibleProductIds: number[];
};

export type CartPricing = {
    items: PricedPromoCartItem[];
    subtotal: number;
    discountAmount: number;
    total: number;
    promoCode: PromoCodeApplication | null;
};

export class CartPricingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CartPricingError";
    }
}

const toCents = (amount: number): number => Math.round(amount * 100);

const calculateDiscountedCents = (price: number, discountPercent: number): number => {
    return Math.round(toCents(price) * (1 - discountPercent / 100));
};

export async function calculateCartPricing(
    items: PromoCartItemInput[],
    promoCodeInput?: string | null,
): Promise<CartPricing> {
    if (items.length === 0) {
        throw new CartPricingError("Кошик порожній");
    }

    if (items.some((item: PromoCartItemInput): boolean => (
        !Number.isInteger(item.productId)
        || !Number.isInteger(item.quantity)
        || item.quantity <= 0
    ))) {
        throw new CartPricingError("Некоректні товари в кошику");
    }

    const productIds: number[] = [...new Set(items.map((item: PromoCartItemInput): number => item.productId))];
    const products = await prisma.product.findMany({
        where: {id: {in: productIds}},
        select: {
            id: true,
            price: true,
            discount: true,
            categoryId: true,
        },
    });

    if (products.length !== productIds.length) {
        throw new CartPricingError("Один із товарів більше недоступний");
    }

    const normalizedCode: string = promoCodeInput?.trim() ?? "";
    const promoCode = normalizedCode
        ? await prisma.promoCode.findFirst({
            where: {
                code: {equals: normalizedCode, mode: "insensitive"},
            },
            orderBy: {updatedAt: "desc"},
            select: {
                id: true,
                code: true,
                discountPercent: true,
                scopeType: true,
                startsAt: true,
                expiresAt: true,
                maxUses: true,
                usedCount: true,
                isActive: true,
                isDeleted: true,
                categories: {select: {categoryId: true}},
                products: {select: {productId: true}},
            },
        })
        : null;

    if (normalizedCode && !promoCode) {
        throw new CartPricingError("Промокод не знайдено");
    }

    const now: Date = new Date();

    if (promoCode) {
        if (!promoCode.isActive || promoCode.isDeleted) {
            throw new CartPricingError("Промокод недоступний");
        }

        if (promoCode.startsAt && promoCode.startsAt > now) {
            throw new CartPricingError("Промокод ще не діє");
        }

        if (promoCode.expiresAt && promoCode.expiresAt < now) {
            throw new CartPricingError("Термін дії промокоду завершився");
        }

        if (promoCode.maxUses !== null && promoCode.usedCount >= promoCode.maxUses) {
            throw new CartPricingError("Ліміт використань промокоду вичерпано");
        }

        if (promoCode.discountPercent <= 0 || promoCode.discountPercent > 100) {
            throw new CartPricingError("Промокод має некоректну знижку");
        }
    }

    const promoProductIds: Set<number> = new Set(
        promoCode?.products.map((product: {productId: number}): number => product.productId) ?? [],
    );
    const promoCategoryIds: Set<number> = new Set(
        promoCode?.categories.map((category: {categoryId: number}): number => category.categoryId) ?? [],
    );
    const productById = new Map(products.map((product) => [product.id, product]));
    const eligibleProductIds: Set<number> = new Set<number>();
    let subtotalCents = 0;
    let totalCents = 0;

    const pricedItems: PricedPromoCartItem[] = items.map((item: PromoCartItemInput): PricedPromoCartItem => {
        const product = productById.get(item.productId)!;
        const unitPriceCents: number = calculateDiscountedCents(product.price, product.discount);
        const isEligible: boolean = Boolean(promoCode) && (
            promoCode!.scopeType === "ALL"
            || (promoCode!.scopeType === "CATEGORY"
                && product.categoryId !== null
                && promoCategoryIds.has(product.categoryId))
            || (promoCode!.scopeType === "PRODUCT" && promoProductIds.has(product.id))
        );
        const finalUnitPriceCents: number = isEligible
            ? Math.round(unitPriceCents * (1 - promoCode!.discountPercent / 100))
            : unitPriceCents;

        if (isEligible) {
            eligibleProductIds.add(product.id);
        }

        subtotalCents += unitPriceCents * item.quantity;
        totalCents += finalUnitPriceCents * item.quantity;

        return {
            ...item,
            unitPrice: unitPriceCents / 100,
            finalUnitPrice: finalUnitPriceCents / 100,
            isEligible,
        };
    });

    if (promoCode && eligibleProductIds.size === 0) {
        throw new CartPricingError("Промокод не діє на товари в кошику");
    }

    return {
        items: pricedItems,
        subtotal: subtotalCents / 100,
        discountAmount: (subtotalCents - totalCents) / 100,
        total: totalCents / 100,
        promoCode: promoCode ? {
            id: promoCode.id,
            code: promoCode.code,
            discountPercent: promoCode.discountPercent,
            eligibleProductIds: [...eligibleProductIds],
        } : null,
    };
}
