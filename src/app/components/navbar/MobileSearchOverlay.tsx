"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BiSearch, BiArrowBack } from "react-icons/bi";
import Image from "next/image";
import useMobileSearchModal from "@/app/hooks/useMobileSearchModal";
import {useProductSearch} from "@/app/hooks/useProductSearch";
import Loader from "@/app/components/reusable/Loader";
import {useModalHistory} from "@/app/hooks/useModalHistory";
import Link from "next/link";

export default function MobileSearchOverlay() {
    const { isOpen, onClose } = useMobileSearchModal();
    useModalHistory(isOpen, onClose);
    const { value, setValue, results, isPending, reset } = useProductSearch();
    const [showModal, setShowModal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            setShowModal(isOpen || false);
        });
        return () => cancelAnimationFrame(id);
    }, [isOpen]);

    useEffect(() => {
        if (showModal) inputRef.current?.focus();
    }, [showModal]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("no-scroll");
            inputRef.current?.focus();
        } else {
            document.body.classList.remove("no-scroll");
        }
        return () => document.body.classList.remove("no-scroll");
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setShowModal(false);
        setTimeout(() => {
            reset();
            onClose();
        }, 300);
    }, [onClose, reset]);

    if (!isOpen) return null;

    return (
        <div
            className={`tablet::hidden fixed inset-0 bg-white z-[60] flex flex-col transition-all duration-300 ${
                showModal ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
            }`}
        >
            <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 shrink-0">
                <button onClick={handleClose} aria-label="Закрити пошук">
                    <BiArrowBack size={22} />
                </button>
                <div className="flex items-center flex-1 bg-gray-100 rounded-full px-3">
                    <BiSearch size={18} className="text-gray-500 shrink-0" />
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Пошук товарів..."
                        className="w-full bg-transparent outline-none px-2 py-2.5 text-base border-none"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto search-scrollbar">
                {isPending &&
                    <div className="h-full flex items-center justify-center">
                        <Loader isFullScreen={false}/>
                    </div>
                }
                {!isPending && value && results.length === 0 && (
                    <div className="p-4 text-sm text-gray-500">Нічого не знайдено</div>
                )}
                {!isPending &&
                    results.map((product) => (
                        <Link
                            key={product.id}
                            href={`catalog/${product.category?.slug}/${product.id}`}
                            onClick={handleClose}
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-200"
                        >
                            <div className="relative w-14 h-14 shrink-0 rounded overflow-hidden bg-gray-100">
                                <Image src={product.colors[0].images[0].url} alt={product.name} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm truncate">{product.name}</span>
                                <span className="text-sm font-medium">{product.price} ₴</span>
                            </div>
                        </Link>
                    ))}
            </div>
        </div>
    );
}