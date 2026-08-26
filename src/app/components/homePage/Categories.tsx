import {GoHeartFill} from "react-icons/go";
import {FaArrowRightLong} from "react-icons/fa6";
import {ICategory} from "@/app/actions/getCategories";
import Accordion from "@/app/components/reusable/Accordion";
import CategoryCard from "@/app/(pages)/catalog/components/CategoryCard";
import Link from "next/link";

// const CategoryCard = ({cat}: {cat: ICategory}) =>
//     <Link
//         key={cat.id}
//         href={`/catalog/${cat.slug}`}
//         draggable={false}
//         className={`group relative overflow-hidden rounded-2xl aspect-5/3 block select-none`}
//     >
//         <Image
//             src={optimizeCloudinaryUrl(cat.coverImage, 500)}
//             alt={cat.name}
//             fill
//             unoptimized
//             className="object-scale-down object-top-right rounded-2xl transition-transform duration-500 group-hover:scale-105"
//         />
//
//         <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/20" />
//
//         <div className="absolute bottom-0 left-0 p-2 sm:p-4">
//             <p className="text-white font-semibold text-sm sm:text-lg leading-tight pb-1.5 sm:pb-3">
//                 {cat.name}
//             </p>
//             <div className="flex items-center justify-center border border-white/60 size-8 rounded-full group-hover:border-primary group-hover:bg-primary transition-colors duration-500">
//                 <FaArrowRightLong className="size-4 text-white" />
//             </div>
//         </div>
//     </Link>

type Props = {
    categories: ICategory[];
}

const Categories = ({ categories }: Props) => {
    return (
        <section className="">
            <div className="mx-auto px-2">
                <div className="flex justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center gap-2">
                        Популярні категорії
                        {/*<span className="text-white">💜</span>*/}
                        <GoHeartFill className="text-primary size-7" />
                    </h2>
                    <Link
                        href={`/catalog`}
                        draggable={false}
                        className="hidden sm:flex items-center gap-1.5 text-base text-gray-600 hover:text-primary transition-transform cursor-pointer hover:translate-x-2">
                        Перейти до каталогу
                        <FaArrowRightLong className="size-4" />
                    </Link>
                </div>
                {/* Mobile "view all" */}
                <div className="sm:hidden flex justify-start mb-3">
                    <Link
                        href={`/catalog`}
                        className="flex items-center gap-1.5 text-sm text-primary font-medium"
                    >
                        Перейти до каталогу
                        <FaArrowRightLong className="size-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {categories
                        .filter((cat: ICategory) => cat.isOnMainPage)
                        .map((cat: ICategory) => (
                            <CategoryCard category={cat} key={cat.id}/>
                        ))}
                </div>
                <div className="">
                    <Accordion
                        title={"Показати всі"}
                        openTitle={"Згорнути"}
                        openUp
                        containerClass="mt-2"
                        buttonClass="justify-center gap-2 text-sm sm:text-[15px] text-gray-600 hover:text-primary transition-colors duration-300"
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
                            {categories
                                .filter((cat: ICategory) => !cat.isOnMainPage)
                                .sort((a, b) => Number(b.season === "WINTER") - Number(a.season === "WINTER"))
                                .map((cat: ICategory) => (
                                    <CategoryCard category={cat} key={cat.id}/>
                                ))}
                        </div>
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

export default Categories;