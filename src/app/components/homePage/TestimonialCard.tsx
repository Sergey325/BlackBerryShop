import Image from "next/image";
import { FaQuoteLeft } from "react-icons/fa";
import {JSX} from "react";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";

type Props = {
    photoSrc: string,
    photoAlt: string,
    quote: string,
    author: string,
    date: string,
}

export default function TestimonialCard({
    photoSrc,
    photoAlt = "",
    quote,
}: Props): JSX.Element {
    return (
        <div className="relative flex h-[220px] select-none flex-col gap-4 rounded-[28px] border border-primary/20 bg-[#fbf9fc] p-6 transition-colors duration-300 hover:border-primary/40 md:flex-row md:gap-4 md:p-4">
            {/* Photo */}
            <div className="relative mx-auto w-full max-w-[150px] md:mx-0">
                <div className="relative aspect-4/5 w-full -rotate-4 overflow-hidden rounded-[22px] bg-white shadow-lg">
                    <Image
                        src={optimizeCloudinaryUrl(photoSrc, 500)}
                        alt={photoAlt}
                        fill
                        unoptimized
                        draggable={false}
                        sizes="200px"
                        className="object-cover select-none"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="relative flex flex-1 flex-col">
                {/* Decorative scribble marks, top-right */}
                <svg
                    viewBox="0 0 60 40"
                    className="pointer-events-none absolute right-0 -top-1 hidden h-5 w-8 text-primary md:block"
                    fill="none"
                >
                    <path d="M6 26 L14 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M24 30 L40 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M44 24 L52 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>

                <FaQuoteLeft className="absolute left-0 -top-2 text-primary" size={24} />

                <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-800  overflow-x-auto thin-scrollbar">
                    {quote}
                </p>
            </div>
        </div>
    );
}
