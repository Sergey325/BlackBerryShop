import Button from "@/app/components/reusable/Button";
import axios from "axios";
import {FormEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {AiOutlineLoading} from "react-icons/ai";

export type AppliedPromoCode = {
    code: string;
    discountPercent: number;
    eligibleProductIds: number[];
    discountAmount: number;
};

type PromoCodeResponse = {
    promoCode: {
        code: string;
        discountPercent: number;
        eligibleProductIds: number[];
    };
    discountAmount: number;
};

type PromoCartItem = {
    productId: number;
    quantity: number;
};

type Props = {
    totalPrice: number
    payment: {
        value: string
        label: string
        shortTitle: string
    }
    contactData?: {
        firstName: string
        lastName: string
        phone: string
        email: string
        comment: string
    }
    address?: {
        city?: string
        area?: string
        warehousesAddress?: string
    }
    items: PromoCartItem[]
    appliedPromoCode: AppliedPromoCode | null
    onPromoCodeChange: (promoCode: AppliedPromoCode | null) => void
    onCheckout: () => void
};

const formatPrice = (price: number): string => new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
}).format(price);

const CartSummary = ({
    totalPrice,
    payment,
    address,
    contactData,
    items,
    appliedPromoCode,
    onPromoCodeChange,
    onCheckout,
}: Props) => {
    const [promoCodeInput, setPromoCodeInput] = useState<string>("");
    const [promoCodeError, setPromoCodeError] = useState<string>("");
    const [isPromoCodeLoading, setIsPromoCodeLoading] = useState<boolean>(false);
    const itemsKey: string = useMemo((): string => items
        .map((item: PromoCartItem): string => `${item.productId}:${item.quantity}`)
        .sort()
        .join("|"), [items]);
    const previousItemsKey = useRef<string>(itemsKey);

    const validatePromoCode = useCallback(async (code: string): Promise<void> => {
        const normalizedCode: string = code.trim();

        if (!normalizedCode) {
            setPromoCodeError("Введіть промокод");
            return;
        }

        setIsPromoCodeLoading(true);
        setPromoCodeError("");

        try {
            const response = await axios.post<PromoCodeResponse>("/api/promo-code", {
                code: normalizedCode,
                items,
            });

            onPromoCodeChange({
                ...response.data.promoCode,
                discountAmount: response.data.discountAmount,
            });
            setPromoCodeInput(response.data.promoCode.code);
        } catch (error: unknown) {
            const message: string = axios.isAxiosError<{error?: string}>(error)
                ? error.response?.data?.error ?? "Не вдалося перевірити промокод"
                : "Не вдалося перевірити промокод";

            onPromoCodeChange(null);
            setPromoCodeError(message);
        } finally {
            setIsPromoCodeLoading(false);
        }
    }, [items, onPromoCodeChange]);

    useEffect((): void | (() => void) => {
        if (previousItemsKey.current === itemsKey) {
            return;
        }

        previousItemsKey.current = itemsKey;

        if (!appliedPromoCode) {
            return;
        }

        let isCurrent = true;

        axios.post<PromoCodeResponse>("/api/promo-code", {
            code: appliedPromoCode.code,
            items,
        }).then((response): void => {
            if (!isCurrent) {
                return;
            }

            onPromoCodeChange({
                ...response.data.promoCode,
                discountAmount: response.data.discountAmount,
            });
            setPromoCodeError("");
        }).catch((error: unknown): void => {
            if (!isCurrent) {
                return;
            }

            const message: string = axios.isAxiosError<{error?: string}>(error)
                ? error.response?.data?.error ?? "Не вдалося перевірити промокод"
                : "Не вдалося перевірити промокод";

            onPromoCodeChange(null);
            setPromoCodeError(message);
        });

        return (): void => {
            isCurrent = false;
        };
    }, [appliedPromoCode, items, itemsKey, onPromoCodeChange]);

    const handlePromoCodeSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        void validatePromoCode(promoCodeInput);
    };

    const removePromoCode = (): void => {
        onPromoCodeChange(null);
        setPromoCodeInput("");
        setPromoCodeError("");
    };

    const discountedTotal: number = Math.max(
        0,
        Math.round((totalPrice - (appliedPromoCode?.discountAmount ?? 0)) * 100) / 100,
    );

    return (
        <div
            className="rounded-2xl px-4 py-6 sm:p-6 lg:col-span-5 lg:p-8 bg-white text-gray-800 self-start border-2 border-primary/50 shadow-xs"
        >
            <h2 className="text-xl font-medium">
                Підсумок замовлення
            </h2>

            <form className="mt-6" onSubmit={handlePromoCodeSubmit}>
                <label htmlFor="promo-code" className="mb-2 block text-sm font-medium text-gray-700">
                    Промокод
                </label>
                <div className="flex gap-2">
                    <input
                        id="promo-code"
                        value={promoCodeInput}
                        onChange={(event): void => setPromoCodeInput(event.target.value.toUpperCase())}
                        placeholder="Введіть код"
                        autoComplete="off"
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none transition-colors focus:border-primary"
                    />
                    <button
                        type="submit"
                        disabled={isPromoCodeLoading || !promoCodeInput.trim()}
                        className="flex min-w-27 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPromoCodeLoading && <AiOutlineLoading className="size-4 animate-spin"/>}
                        <span>{isPromoCodeLoading ? "Перевірка..." : "Застосувати"}</span>
                    </button>
                </div>
                {promoCodeError && (
                    <p className="mt-2 text-sm text-red-600">{promoCodeError}</p>
                )}
                {appliedPromoCode && !promoCodeError && (
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm text-green-700">
                        <span>
                            {appliedPromoCode.code} застосовано: −{appliedPromoCode.discountPercent}%
                        </span>
                        <button
                            type="button"
                            onClick={removePromoCode}
                            className="shrink-0 underline underline-offset-2"
                        >
                            Видалити
                        </button>
                    </div>
                )}
            </form>

            <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm text-gray-700">Вартість замовлення</span>
                    <span className="text-sm text-gray-800 font-medium text-right">{formatPrice(totalPrice)} грн</span>
                </div>
                {appliedPromoCode && (
                    <div className="flex justify-between items-center text-green-700">
                        <span className="font-light text-sm">Знижка за промокодом</span>
                        <span className="text-sm font-medium text-right">
                            −{formatPrice(appliedPromoCode.discountAmount)} грн
                        </span>
                    </div>
                )}
                <div className="flex gap-2 sm:gap-4 justify-between items-center">
                    <span className="font-light text-sm text-gray-700 text-nowrap">Спосіб оплати</span>
                    <span className="text-sm text-gray-800 font-medium text-right">{payment.shortTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm text-gray-700 text-right">Замовник</span>
                    <span className="text-sm text-gray-800 font-medium max-w-70 overflow-hidden text-right">
                        {`${contactData?.firstName} ${contactData?.lastName}`}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm text-gray-700">Адреса доставки</span>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-800 font-medium text-right">
                            {address?.city && `${address.city} ${address.area} обл.`}
                        </p>
                        <p className="text-sm text-gray-800 font-medium text-right">
                            {address?.warehousesAddress?.match(/^.*?№\d+/)?.[0]}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-700 pt-4 text-base sm:text-lg">
                    <div className="text-sm sm:text-base font-medium">Сума до cплати</div>
                    <span className="text-xl sm:text-2xl text-gray-800 whitespace-nowrap">
                        {payment.value === "CASH_ON_DELIVERY" ? 150 : formatPrice(discountedTotal)} грн
                    </span>
                </div>
            </div>
            <div className="text-sm sm:text-base pt-5">
                <Button label="Сплатити" onClick={onCheckout}/>
            </div>
        </div>
    );
};

export default CartSummary;
