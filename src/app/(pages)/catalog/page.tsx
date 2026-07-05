
import Image from 'next/image';
import Link from 'next/link';
import {FaArrowRightLong} from "react-icons/fa6";
import {sortSeasonsByCurrent} from "@/app/utils/sortSeasons";
import {GoHeartFill} from "react-icons/go";
import {PetalParticles, SnowParticles} from "@/app/(pages)/catalog/components/SeasonParticles";

// ─── Data ──────────────────────────────────────────────────────────────────
const seasons = [
    {
        id: 'SPRING_SUMMER',
        label: 'Весна / Літо',
        icon: '☀️',
        desc: 'Легкі та яскраві аксесуари для сонячних днів',
        heroImage: '/IMG_1590.PNG',
        heroBg: '#fdf2f8',   // light rose
        categories: [
            { slug: 'panamy',  name: 'Панами',               count: 48, image: '/IMG_3567.PNG'  },
            { slug: 'kepky',    name: 'Кепки',                 count: 23, image: '/IMG_3567.PNG'    },
            { slug: 'prykrasy', name: 'Прикраси',              count: 12, image: '/IMG_3567.PNG' },
            { slug: 'volossia', name: 'Аксесуари для волосся', count: 15, image: '/IMG_3567.PNG' },
        ],
        particles: <PetalParticles/>,
    },
    {
        id: 'AUTUMN_WINTER',
        label: 'Осінь / Зима',
        icon: '❄️',
        desc: 'Теплі та затишні аксесуари для холодних днів',
        heroImage: '/IMG_1576.PNG',
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

// ─── Category card ──────────────────────────────────────────────────────────
type Category = { slug: string; name: string; count: number; image: string };

function CategoryCard({ cat }: { cat: Category }) {
    return (
        <Link
            href={`/catalog/${cat.slug}`}
            draggable={false}
            className="group bg-gray-100/60 backdrop-blur-sm rounded-2xl overflow-hidden
                       shadow-sm hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-200 flex flex-col z-15"
        >
            {/* Photo */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    draggable={false}
                    className="object-cover object-center
                               transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Info */}
            <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        {cat.name}
                    </p>
                    <p className="text-gray-400 text-[11px] sm:text-xs mt-0.5">
                        {cat.count} моделей
                    </p>
                </div>
                <FaArrowRightLong
                    className="w-4 h-4 text-gray-400 shrink-0
                               group-hover:translate-x-0.5 group-hover:text-primary
                               transition-all"
                />
            </div>
        </Link>
    );
}

// ─── Season block ───────────────────────────────────────────────────────────

type Season = typeof seasons[0];

function SeasonBlock({ season }: { season: Season }) {
    return (
        <div className="mb-6 lg:mb-12 select-none">

            {/* ── MOBILE ────────────────────────────────────────────────── */}
            <div className="sm:hidden rounded-3xl relative overflow-hidden" style={{ backgroundColor: season.heroBg }}>
                {season.particles}
                {/* Banner: text left | image right — side by side, no wasted space */}
                <div className="relative flex items-stretch min-h-[120px]">

                    {/* Left — icon, title, description */}
                    <div className="flex-1 pl-4 py-5 flex flex-col justify-center gap-1 z-10">
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">{season.icon}</span>
                            <span className="text-base font-bold text-gray-800 leading-tight">
                                {season.label}
                            </span>
                        </div>
                        <p className="text-gray-500 text-[11px] leading-relaxed">
                            {season.desc}
                        </p>
                    </div>

                    {/* Right — hero image, flush to the right edge */}
                    <div className="relative w-[45%] shrink-0">

                        <Image
                            src={season.heroImage}
                            alt={season.label}
                            fill
                            className="object-cover object-right-top"
                        />
                        {/*/!* Fade right edge *!/*/}
                        {/*<div*/}
                        {/*    className="absolute inset-y-0 right-0 w-2/5 pointer-events-none"*/}
                        {/*    style={{ background: `linear-gradient(to bottom left, ${season.heroBg}, transparent)` }}*/}
                        {/*/>*/}
                        {/*/!* Fade left edge *!/*/}
                        <div
                            className="absolute inset-y-0 left-0 w-full pointer-events-none"
                            style={{ background: `linear-gradient(to right, ${season.heroBg}, ${season.heroBg}33 92%)` }}
                        />
                        {/*/!* Fade bottom edge — сглаживает переход к карточкам *!/*/}
                        <div
                            className="absolute inset-x-0 -bottom-1 h-1/2 pointer-events-none"
                            style={{ background: `linear-gradient(to bottom, transparent, ${season.heroBg})` }}
                        />
                    </div>

                </div>

                {/* Cards — same bg, no gap, flows naturally from banner */}
                <div className="px-3 pt-1 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                        {season.categories.map((cat) => (
                            <CategoryCard key={cat.slug} cat={cat} />
                        ))}
                    </div>
                </div>

            </div>

            {/* ── DESKTOP ───────────────────────────────────────────────── */}
            <div
                className="hidden sm:block relative overflow-hidden rounded-3xl"
                style={{ backgroundColor: season.heroBg }}
            >
                {season.particles}
                {/*
                    Hero image — fixed height so it never stretches with card rows.
                    Pinned to top-right. object-right-top keeps the right edge intact
                    and anchors the focal point to the top of the frame.
                    Two gradient overlays dissolve it into the season background:
                    one on the left edge, one on the bottom.
                */}
                <div className="absolute top-0 right-0 h-[280px] lg:h-[400px] w-[60%]">
                    <Image
                        src={season.heroImage}
                        alt={season.label}
                        fill
                        className="object-cover object-right-top"
                        priority
                    />
                    {/* ← fade into season bg */}
                    <div
                        className="absolute inset-y-0 left-0 w-full pointer-events-none"
                        style={{
                            background: `linear-gradient(to right, ${season.heroBg} 0%, ${season.heroBg}33 92%)`,
                        }}
                    />
                    {/* ↓ fade into season bg so cards below sit on clean color */}
                    <div
                        className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
                        style={{
                            background: `linear-gradient(to bottom, transparent 0%, ${season.heroBg} 100%)`,
                        }}
                    />
                </div>

                {/* Content — sits on top of everything, occupies full width */}
                <div className="relative z-10 p-8 lg:p-10">

                    {/* Season header */}
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">{season.icon}</span>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {season.label}
                        </h2>
                    </div>
                    <p className="text-gray-500 text-sm mb-8 lg:mb-10 max-w-xs">
                        {season.desc}
                    </p>

                    {/*
                        Cards: default 4-col, 5-col at xl.
                        If you add more categories the grid just wraps — no extra code needed.
                    */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4 max-w-[80%] select-none">
                        {season.categories.map((cat) => (
                            <CategoryCard key={cat.slug} cat={cat} />
                        ))}
                    </div>

                </div>
            </div>

        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

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
                        Обирай улюблені аксесуари ручної роботи для дітей і підлітків
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