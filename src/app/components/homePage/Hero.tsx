import {FaHeart} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";

function Dots({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {[0, 1, 2, 3].map((i) => (
                <span
                    key={i}
                    className={`block rounded-full transition-all ${
                        i === 0 ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}

const Hero = ({}) => {
    return (
        <section className="relative overflow-hidden rounded-xl lg:rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.10)] bg-linear-to-t from-[#f7f5f6] via-[#f7f7f7] to-[#f9f9f9] select-none">

            {/* ── Desktop ─────────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center min-h-[650px]">

                {/* Text column */}
                <div className="relative z-10 w-1/2 px-10 xl:px-16">
                        <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm shadow-[0_0_5px_rgba(130,61,154,0.50)] transition
                                         text-gray-600 rounded-full px-4 py-1.5
                                         border border-primary mb-7">
                            Ручна робота з любов&apos;ю
                            <FaHeart className="size-4 text-primary" />
                        </span>

                    <h1 className="text-5xl leading-[1.2] font-bold text-gray-900 mb-5">
                        Аксесуари, які закохують у себе<br />
                        з першого дотику
                    </h1>

                    <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5 text-gray-600">
                        <li>Створено з турботою</li>
                        <li>Використання якісних матеріалів</li>
                        <li>Індивідуальний підхід до кожного кліента</li>
                    </ul>

                    <Link
                        href={`/catalog`}
                        className="mt-10 w-full max-w-[480px] bg-primary hover:bg-[#6e3382]
                               text-white px-6 py-3 rounded-full transition-colors cursor-pointer block text-center">
                        Перейти до каталогу
                    </Link>

                    <Dots className="mt-12" />
                </div>

                {/* Image — absolutely fills the right 65% */}
                <div className="absolute right-0 top-0 h-full w-[65%]">
                    <Image
                        src={optimizeCloudinaryUrl("https://res.cloudinary.com/dnoxhtgef/image/upload/v1783530220/BlackBerry/Banners/IMG_1557_rd2tw9.png", 1500)}
                        alt="Дівчина у панамі Teddy"
                        fill
                        unoptimized
                        draggable={false}
                        className="object-cover object-center select-none"
                    />
                    <div className="absolute inset-y-0 left-0 w-[35%]
                            bg-linear-to-r from-[#f8f8f8]/80 to-transparent
                            pointer-events-none" />
                </div>

            </div>


            {/* ── Mobile ──────────────────────────────────────────────── */}
            <div className="relative lg:hidden min-h-[450px]">

                <Image
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dnoxhtgef/image/upload/v1783530220/BlackBerry/Banners/IMG_1557_rd2tw9.png", 1500)}
                    alt="Дівчина у панамі Teddy"
                    fill priority
                    unoptimized
                    draggable={false}
                    className="object-cover object-center select-none"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/10" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between min-h-[450px] px-6 pt-10 pb-8">
                        <span className="self-start inline-flex items-center gap-1.5
                                         bg-white/80 backdrop-blur-sm text-gray-700 border border-primary shadow-[0_0_5px_rgba(130,61,154,0.50)]
                                         text-xs rounded-full px-4 py-1.5">
                            Ручна робота з любов&apos;ю
                            <FaHeart className="size-4 text-primary" />
                        </span>

                    <h1 className="text-3xl leading-tight font-bold text-white">
                        Аксесуари, які<br />
                        закохують у себе<br />
                        з першого дотику
                    </h1>

                    <ul role="list" className="list-disc marker:text-lg space-y-2 pl-5 text-white/90">
                        <li>Створено з турботою</li>
                        <li>Використання якісних матеріалів</li>
                        <li>Індивідуальний підхід до кожного кліента</li>
                    </ul>

                    <Link
                        href={`/catalog`}
                        className="w-full sm:max-w-[400px] bg-primary hover:bg-[#6e3382] text-white px-6 py-3 rounded-full transition-colors cursor-pointer"
                    >
                        Перейти до каталогу
                    </Link>

                    <Dots />
                </div>

            </div>

        </section>
    );
};

export default Hero;