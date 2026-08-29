import Image from "next/image";
import Link from "next/link";
import type {JSX} from "react";
import {FaArrowRightLong} from "react-icons/fa6";
import {PetalParticles, SnowParticles} from "@/app/(pages)/catalog/components/SeasonParticles";
import {
    getSeasonAnchor,
    SEASON_COLLECTIONS,
    SeasonCollectionConfig,
} from "@/app/lib/seasonCollections";
import {sortSeasonsByCurrent} from "@/app/utils/sortSeasons";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import Reveal from "@/app/components/reusable/Reveal";

const HOME_SEASON_PARTICLES: Record<SeasonCollectionConfig["id"], JSX.Element> = {
    WINTER: (
        <SnowParticles
            desktop={{count: 80, durationSeconds: {min: 2, max: 5}}}
            mobile={{count: 25}}
        />
    ),
    SUMMER: (
        <PetalParticles
            desktop={{count: 11, durationSeconds: {min: 7, max: 12}}}
            mobile={{count: 5, durationSeconds: {min: 4, max: 7}}}
        />
    ),
};

const SeasonCollections = (): JSX.Element => {
    const seasons: SeasonCollectionConfig[] = sortSeasonsByCurrent(SEASON_COLLECTIONS);

    return (
        <section className="px-2" aria-labelledby="season-collections-title">
            <Reveal>
                <div className="mb-5 px-2 sm:mb-7">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary sm:text-sm">
                        Колекції BlackBerry
                    </p>
                    <h2
                        id="season-collections-title"
                        className="text-xl font-semibold text-gray-950 sm:text-2xl"
                    >
                        Обери свій настрій
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
                        Затишні образи для прохолодних днів або яскраві акценти для сонячного сезону.
                    </p>
                </div>
            </Reveal>

            <div className="grid gap-4 lg:grid-cols-2">
                {seasons.map((season: SeasonCollectionConfig, index: number) => (
                    <Reveal key={season.id} delay={index * 120} className="h-full">
                        <Link
                            href={`/catalog#${getSeasonAnchor(season.id)}`}
                            className="group relative isolate block h-full min-h-[190px] overflow-hidden rounded-3xl border border-black/5 shadow-xs transition-transform duration-500 hover:-translate-y-1 sm:min-h-[230px]"
                            style={{backgroundColor: season.heroBg}}
                        >
                            {HOME_SEASON_PARTICLES[season.id]}

                            <div className="relative z-20 flex min-h-[190px] w-[62%] flex-col items-start justify-center px-5 py-6 sm:min-h-[230px] sm:w-[56%] sm:px-8">
                                <span className="mb-3 text-xl sm:text-2xl" aria-hidden="true">
                                    {season.icon}
                                </span>
                                <h3 className="text-xl font-semibold leading-tight text-gray-950 sm:text-2xl">
                                    {season.label}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                                    {season.desc}
                                </p>
                                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                    Дивитися колекцію
                                    <FaArrowRightLong className="size-4 transition-transform duration-300 group-hover:translate-x-1"/>
                                </span>
                            </div>

                            <div className="absolute inset-y-0 right-0 z-0 w-[58%]">
                                <Image
                                    src={optimizeCloudinaryUrl(season.heroImage, 900)}
                                    alt={`Колекція ${season.label}`}
                                    fill
                                    loading="lazy"
                                    sizes="(max-width: 1023px) 58vw, 29vw"
                                    className="object-contain object-right transition-transform duration-700 group-hover:scale-[1.03]"
                                />
                                <div
                                    className="absolute inset-y-0 left-0 w-full"
                                    style={{
                                        background: `linear-gradient(to right, ${season.heroBg} 0%, ${season.heroBg}4d 58%, transparent 100%)`,
                                    }}
                                />
                                <div
                                    className="absolute inset-x-0 bottom-0 h-1/3"
                                    style={{
                                        background: `linear-gradient(to bottom, transparent 0%, ${season.heroBg} 100%)`,
                                    }}
                                />
                            </div>
                        </Link>
                    </Reveal>
                ))}
            </div>
        </section>
    );
};

export default SeasonCollections;
