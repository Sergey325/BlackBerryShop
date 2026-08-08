import {sortSeasonsByCurrent} from "@/app/utils/sortSeasons";
import {GoHeartFill} from "react-icons/go";
import {PetalParticles, SnowParticles} from "@/app/(pages)/catalog/components/SeasonParticles";
import SeasonBlock from "@/app/(pages)/catalog/components/SeasonBlock";
import {getCategories} from "@/app/actions/getCategories";
import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────────────────
const seasonsConfig = [
    {
        id: 'SUMMER' as "WINTER" | "SUMMER",
        label: 'Весна / Літо',
        icon: '☀️',
        desc: 'Легкі та яскраві аксесуари для сонячних днів',
        heroImage: 'https://res.cloudinary.com/dnoxhtgef/image/upload/v1785403242/BlackBerry/Banners/IMG_1613_hlahun.png',
        heroBg: '#fdf2f8',
        particles: <PetalParticles />,
    },
    {
        id: 'WINTER' as "WINTER" | "SUMMER",
        label: 'Осінь / Зима',
        icon: '❄️',
        desc: 'Теплі та затишні аксесуари для холодних днів',
        heroImage: 'https://res.cloudinary.com/dnoxhtgef/image/upload/v1785403241/BlackBerry/Banners/IMG_1604_efzqvf.png',
        heroBg: '#ede9fe',
        particles: <SnowParticles />,
    },
];


export default async function CatalogPage() {
    const categories = await getCategories()

    const seasons = seasonsConfig.map(season => ({
        ...season,
        categories: categories.filter(
            category => category.season === season.id
        ),
    }));

    const sortedSeasons = sortSeasonsByCurrent(seasons);

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="py-6">
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