import "server-only";

export function getCodPrepaymentPercent() {
    const configured = process.env.COD_PREPAYMENT_PERCENT ?? "15";
    const percent = Number(configured);
    if (!/^\d+(?:\.\d{1,2})?$/.test(configured) || !Number.isFinite(percent) || percent <= 0 || percent >= 100) {
        throw new Error("COD_PREPAYMENT_PERCENT must be greater than 0 and less than 100, with at most two decimal places");
    }
    return percent;
}
