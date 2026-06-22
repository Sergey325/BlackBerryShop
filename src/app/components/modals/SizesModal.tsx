'use client'

import React, {useState} from "react";
import Modal from "@/app/components/modals/Modal";
import useSizesModal from "@/app/hooks/useSizesModal";
import Image from "next/image";


const SizesModal = () => {
    const sizesModal = useSizesModal();
    const [isLoading, setIsLoading] = useState(false)


    const bodyContent =
        (<Image
            src={'/photo_2026-06-21_15-22-55.jpg'}
            width={500} height={500}
            className="object-cover aspect-square mx-auto select-none pointer-events-none bg-transparent"
            alt="ProductImage"
            quality={100}
            priority
        />)

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