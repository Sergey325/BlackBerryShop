import Image from "next/image";
import Link from "next/link";
import {FaArrowRightLong} from "react-icons/fa6";

type Props = {
    category: Category;
}

type Category = {
    slug: string;
    name: string;
    count: number;
    image: string
};

export default function CategoryCard({ category }: Props) {
    return (
        <Link
            href={`/catalog/${category.slug}`}
            draggable={false}
            className="group bg-gray-100/60 backdrop-blur-sm rounded-2xl overflow-hidden
                       shadow-sm hover:shadow-md
                       transition-all duration-500 flex flex-col z-15 aspect-5/3"
        >
            {/* Photo */}
            <div className="relative h-full w-full overflow-hidden">
                <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    draggable={false}
                    className="object-cover object-center
                               transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/30 to-black/10 group" />

            {/* Info */}
            <div className="absolute bottom-0 left-0 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-semibold text-white text-xs sm:text-sm truncate">
                        {category.name}
                    </p>
                    <p className="text-white/80 text-[11px] sm:text-xs mt-0.5">
                        {category.count} моделей
                    </p>
                </div>
                <FaArrowRightLong
                    className="w-4 h-4 text-white shrink-0
                               group-hover:translate-x-0.5 duration-500 group-hover:text-primary
                               transition-all"
                />
            </div>
        </Link>
    );
}