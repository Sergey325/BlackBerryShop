"use client"

import {FaCheckCircle, FaInstagram, FaTelegram} from "react-icons/fa";
import {useCartStore} from "@/app/hooks/useCartStore";
import {useEffect} from "react";


type Props = {
    id?: string;
};

const SuccessfulClient = ({id}: Props) => {
    const clearCart = useCartStore(state => state.clearCart);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <>
            <FaCheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-center">Дякуємо за замовлення!</h1>
            <p className="text-gray-500 text-center">Замовлення #{id} успішно оплачено.</p>
            <p className="text-center text-gray-800 mt-5">Tермін відправлення: <span className="font-medium">від 1 до 4 днів</span></p>
            <div className="bg-gray-50 rounded-md mt-20 text-center">
                <p className="text-gray-700 text-center">
                    Залишилися питання — зв&apos;яжіться з нами в наших соцмережах.
                </p>
                <div className="flex justify-center gap-4 mt-4 text-base md:text-lg">
                    <a href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition">
                        <FaInstagram className="size-6"/>
                        Instagram
                    </a>
                    <a href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition">
                        <FaTelegram className="size-6"/>
                        Telegram
                    </a>
                </div>
            </div>
        </>
    );
};

export default SuccessfulClient;