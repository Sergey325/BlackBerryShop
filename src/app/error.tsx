"use client"

import { useEffect } from "react";
import EmptyState from "@/app/components/reusable/EmptyState";

type Props = {
    error: Error & { digest?: string }
    reset: () => void
};

const Error = ({ error, reset }: Props) => {
    useEffect(() => {
        console.error(error);
    }, [error]);

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