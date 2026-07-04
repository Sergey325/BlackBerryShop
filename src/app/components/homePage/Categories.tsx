import {GoHeartFill} from "react-icons/go";
import {FaArrowRightLong} from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import {Category} from "@prisma/client";


type Props = {
    categories: any
};

const Categories = ({categories}: Props) => {
    return (
        <section className="">
            <div className="mx-auto px-2">
                <div className="flex justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center gap-2">
                        Популярні категорії
                        {/*<span className="text-white">💜</span>*/}
                        <GoHeartFill className="text-primary size-7" />
                    </h2>
                    <button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600
                                            hover:text-primary transition-colors cursor-pointer">
                        Перейти до каталогу
                        <FaArrowRightLong className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {categories.map((cat:any) => (
                        <Link
                            key={cat.id}
                            href={`/catalog/${cat.slug}`}
                            draggable={false}
                            className="group relative overflow-hidden rounded-2xl aspect-5/3 block select-none"
                        >
                            {/* Background photo */}
                            <Image
                                src={"/IMG_1576.PNG"}//cat.coverImage
                                alt={cat.name}
                                fill
                                className="object-cover object-center rounded-2xl transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Dark gradient overlay – heavier at bottom-left */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/20 group" />

                            {/* Label */}
                            <div className="absolute bottom-0 left-0 p-2 sm:p-4">
                                <p className="text-white font-semibold text-base sm:text-lg leading-tight mb-3">
                                    {cat.name}
                                </p>
                                <div className='flex items-center justify-center border border-white/60 size-8 rounded-full group-hover:border-primary group-hover:bg-primary transition-colors duration-500'>
                                    <FaArrowRightLong className="size-4 text-white  transition-colors duration-500" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {/* Mobile "view all" */}
                <div className="sm:hidden flex justify-center mt-6">
                    <button className="flex items-center gap-1.5 text-sm text-primary font-medium">
                        Перейти до каталогу
                        <FaArrowRightLong className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Categories;