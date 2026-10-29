export const MIN_COD_PREPAYMENT = 150;

export function calculateCodPrepayment(total: number, percent: number) {
    if (!Number.isFinite(total) || total < 0) {
        throw new Error("Order total must be a finite non-negative amount");
    }
    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
        throw new Error("Prepayment percent must be greater than 0 and less than 100");
    }

    const totalKopecks = Math.round(total * 100);
    const percentBasisPoints = Math.round(percent * 100);
    // Round up to whole tens of UAH, using kopecks to preserve price boundaries.
    return Math.max(MIN_COD_PREPAYMENT, Math.ceil(totalKopecks * percentBasisPoints / 10_000_000) * 10);
}

export function getCodPrepaymentDescription(percent: number) {
    return `${percent}% від вартості замовлення після знижок, мінімум ${MIN_COD_PREPAYMENT} грн`;
}
