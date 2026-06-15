"use client"

import axios from "axios";
import toast from "react-hot-toast";
import React from "react";

const DevCreateProductBtn = () => {
    const createProduct = () => {
        const data = {
            name: "Панама GIG Ranger Ears з вушками. Tiger Stripe Miami",
            price: 1009,
            discount: 12,
            images: [
                "https://res.cloudinary.com/dnoxhtgef/image/upload/v1781104323/BlackBerry/Tiger_Stripe_Miami_1_os1g6s.webp",
                "https://res.cloudinary.com/dnoxhtgef/image/upload/v1781104323/BlackBerry/Tiger_Stripe_Miami_2_nali9a.webp",
                "https://res.cloudinary.com/dnoxhtgef/image/upload/v1781104323/BlackBerry/Tiger_Stripe_Miami_2_nali9a.webp",
                "https://res.cloudinary.com/dnoxhtgef/image/upload/v1781104322/BlackBerry/Tiger_Stripe_Miami_4_nbc7fx.webp",
            ],
            variants: [
                { color: "#00C950", size: "S", available: true },
                { color: "#00C950", size: "M", available: false },
                { color: "#000000", size: "S", available: true },
                { color: "#FB2C36", size: "S", available: true },
                { color: "#FB2C36", size: "S", available: true },
                { color: "#4D179A", size: "S", available: true },
            ],
        }

        axios.post("api/products", data)
            .then(() => {
                toast.success("Product created!")
            })
            .catch(() => {
                toast.error("Something went wrong")
            })
            .finally(() => {

            })
    }

    return (
        <button onClick={createProduct} className="text-white bg-orange-600 cursor-pointer">Create</button>
    );
};

export default DevCreateProductBtn;