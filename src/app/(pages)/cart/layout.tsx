import type {Metadata} from "next";
import {createNoIndexMetadata} from "@/app/lib/seo";

export const metadata: Metadata = createNoIndexMetadata("Кошик", "/cart");

export default function CartLayout({children}: Readonly<{children: React.ReactNode}>) {
    return children;
}
