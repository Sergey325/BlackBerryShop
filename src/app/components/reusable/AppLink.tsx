import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";

type Props = LinkProps &
    AnchorHTMLAttributes<HTMLAnchorElement>;

export default function AppLink({
    draggable = false,
    children,
    ...props
}: Props) {
    return (
        <Link {...props} draggable={draggable}>
            {children}
        </Link>
    );
}