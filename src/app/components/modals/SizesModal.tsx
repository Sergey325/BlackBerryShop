'use client'

import React, {useState} from "react";
import Modal from "@/app/components/modals/Modal";
import useSizesModal from "@/app/hooks/useSizesModal";
import Image from "next/image";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";


const SizesModal = () => {
    const sizesModal = useSizesModal();
    const [isLoading, setIsLoading] = useState(false)

    const bodyContent =
        (<div className="relative mx-auto w-full max-w-[500px] aspect-square overflow-hidden bg-white">
            <Image
                src={optimizeCloudinaryUrl(sizesModal.imageUrl || "", 1000)}
                fill
                className="object-contain select-none pointer-events-none"
                alt="Size guide"
                quality={100}
                priority
                unoptimized
            />
        </div>)

    return (
        <Modal
            disabled={isLoading}
            isOpen={sizesModal.isOpen}
            title="Розмірна сітка"
            actionLabel="Закрити"
            onClose={sizesModal.onClose}
            onSubmit={sizesModal.onClose}
            body={bodyContent}
        />
    );
};

export default SizesModal;