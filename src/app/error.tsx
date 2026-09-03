"use client"

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import {usePathname} from "next/navigation";
import EmptyState from "@/app/components/reusable/EmptyState";

type Props = {
    error: Error & { digest?: string }
    reset: () => void
};

const Error = ({ error, reset }: Props) => {
    const pathname: string = usePathname();

    useEffect(() => {
        Sentry.withScope((scope): void => {
            scope.setTag("nextjs.error_boundary", "app/error");
            scope.setContext("nextjs", {
                pathname,
                digest: error.digest,
            });
            scope.captureException(error);
        });
    }, [error, pathname]);

    return (
        <EmptyState
            title="Щось пішло не так!"
            subtitle="Спробуйте оновити сторінку, або повернутися пізніше"
            showReset
            btnTitle="Оновити"
            onReset={reset}
        />
    );
};

export default Error;
