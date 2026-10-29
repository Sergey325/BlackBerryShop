import CartPageClient from "./CartPageClient";
import {getCodPrepaymentPercent} from "@/app/lib/codPrepaymentConfig";

export default function CartPage() {
    return <CartPageClient prepaymentPercent={getCodPrepaymentPercent()}/>;
}
