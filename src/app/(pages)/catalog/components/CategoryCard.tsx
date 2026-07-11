import Image from "next/image";
import Link from "next/link";
import {FaArrowRightLong} from "react-icons/fa6";
import {ICategory} from "@/app/actions/getCategories";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import {pluralizeUk} from "@/app/utils/pluralizeUk";

type Props = {
    category: ICategory;
}


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
                    src={optimizeCloudinaryUrl(category.coverImage)}
                    alt={category.name}
                    fill
                    unoptimized
                    draggable={false}
                    className="object-cover object-center
                               transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/30 to-black/10 group" />

            {/* Info */}
            <div className="absolute bottom-0 left-0 px-3 py-2.5 sm:px-4 sm:py-3 w-full flex items-center justify-between">
                <div className="min-w-0">
                    <p className="font-semibold text-white text-xs sm:text-sm text-wrap">
                        {category.name}
                    </p>
                    <p className="text-white/80 text-[11px] sm:text-xs mt-0.5 ">
                        {category._count.products.toString()} {pluralizeUk(category._count.products, ["модель", "моделі", "моделей"])}
                    </p>
                </div>
                <div className="self-end flex items-center justify-center border min-w-6 sm:min-w-8 border-white/60 size-6 sm:size-8 rounded-full group-hover:border-primary group-hover:bg-primary transition-colors duration-500">
                    <FaArrowRightLong className="size-3 sm:size-4 text-white" />
                </div>
            </div>
        </Link>
    );
}