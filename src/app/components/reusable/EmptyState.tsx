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
    onClick?: () => void
};

const EmptyState = ({
        title = "No exact matches",
        subtitle = "Try changing or removing some of your filters",
        showReset,
        btnTitle = "Reset the page",
        onClick
    }: Props) => {
    const router = useRouter()

    return (
        <div
            className="
                h-4/6
                flex flex-col
                justify-center items-center
                gap-2
            "
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
                        onClick={() => onClick || router.push('/')}
                    />
                )}
            </div>
        </div>
    );
};

export default EmptyState;