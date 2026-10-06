"use client";

import type {ImageLoaderProps} from "next/image";
import {getResponsiveCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";

export default function cloudinaryImageLoader({src, width}: ImageLoaderProps) {
    if (!src.startsWith("https://res.cloudinary.com/")) return src;

    return getResponsiveCloudinaryUrl(src, width);
}
