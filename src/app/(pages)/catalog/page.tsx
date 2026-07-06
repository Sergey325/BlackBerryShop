import Link from 'next/link';
import {sortSeasonsByCurrent} from "@/app/utils/sortSeasons";
import {GoHeartFill} from "react-icons/go";
import {PetalParticles, SnowParticles} from "@/app/(pages)/catalog/components/SeasonParticles";
import SeasonBlock from "@/app/(pages)/catalog/components/SeasonBlock";

// ─── Data ──────────────────────────────────────────────────────────────────
const seasons = [
    {
        id: 'SPRING_SUMMER',
        label: 'Весна / Літо',
        icon: '☀️',
        desc: 'Легкі та яскраві аксесуари для сонячних днів',
        heroImage: '/banners/IMG_1613.PNG',
        heroBg: '#fdf2f8',   // light rose
        categories: [
            { slug: 'panamy',  name: 'Панами',               count: 48, image: '/categories/IMG_1594.PNG'  },
            { slug: 'kepky',    name: 'Кепки',                 count: 23, image: '/categories/IMG_1593.PNG'    },
            { slug: 'prykrasy', name: 'Прикраси',              count: 12, image: '/categories/IMG_1597.PNG' },
        ],
        particles: <PetalParticles/>,
    },
    {
        id: 'AUTUMN_WINTER',
        label: 'Осінь / Зима',
        icon: '❄️',
        desc: 'Теплі та затишні аксесуари для холодних днів',
        heroImage: '/banners/IMG_1604.PNG',
        heroBg: '#ede9fe',   // light violet
        categories: [
            { slug: 'balaklavi', name: 'Балаклави', count: 36, image: '/IMG_3567.PNG' },
            { slug: 'shapky',    name: 'Шапки',     count: 28, image: '/IMG_3567.PNG'    },
            { slug: 'pledy',     name: 'Пледи',     count: 15, image: '/IMG_3567.PNG'     },
            { slug: 'mitenky',   name: 'Мітенки',   count: 9,  image: '/IMG_3567.PNG'   },
            { slug: 'mitenky1',   name: 'Мітенки',   count: 9,  image: '/IMG_3567.PNG'   },
            { slug: 'mitenky2',   name: 'Мітенки',   count: 9,  image: '/IMG_3567.PNG'   },
            { slug: 'mitenky3',   name: 'Мітенки',   count: 9,  image: '/IMG_3567.PNG'   },
        ],
        particles: <SnowParticles />,
    },
];


export default function CatalogPage() {
    const sortedSeasons = sortSeasonsByCurrent(seasons);

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="py-6 sm:py-10">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
                    <Link href="/" className="hover:text-gray-600 transition-colors">
                        Головна
                    </Link>
                    <span>›</span>
                    <span className="text-gray-700">Каталог</span>
                </nav>

                {/* Page title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    Каталог товарів
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mb-8 sm:mb-10">
                    <span className="inline items-baseline">
                        Обирай улюблені аксесуари ручної роботи для дітей та дорослих
                        <span className="inline-flex align-baseline ml-2 text-primary">
                            <GoHeartFill className="size-5 translate-y-1" />
                        </span>
                    </span>
                </p>

                {/* Seasons */}
                {sortedSeasons.map((season) => (
                    <SeasonBlock key={season.id} season={season} />
                ))}

            </div>
        </main>
    );
}