"use client"

import {useRouter} from "next/navigation";
import Heading from "@/app/components/reusable/Heading";
import Button from "@/app/components/reusable/Button";

type Props = {
    title?: string
    subtitle?: string
    showReset?: boolean
    center?: boolean
    btnTitle?: string
    redirectUrl?: string
    heightStyle?: string
};

const EmptyState = ({
        title = "No exact matches",
        subtitle = "Try changing or removing some of your filters",
        showReset,
        btnTitle = "Reset the page",
        heightStyle,
        redirectUrl
    }: Props) => {
    const router = useRouter();

    return (
        <div
            className="
                flex flex-col
                justify-center items-center
                gap-10
            "
            style={{height: heightStyle ? heightStyle : "70vh"}}
        >
            <Heading
                center
                title={title}
                subtitle={subtitle}
            />
            <div className="w-48 mt-4">
                {showReset && (
                    <Button
                        outline
                        label={btnTitle}
                        onClick={() => router.push(redirectUrl ? redirectUrl : '/')}
                    />
                )}
            </div>
        </div>
    );
};

export default EmptyState;