import Image from "next/image";
import CategoryCard from "@/app/(pages)/catalog/components/CategoryCard";
import {Season} from "@/app/types";
import {optimizeCloudinaryUrl} from "@/app/utils/optimizeCloudinaryImage";
import {getSeasonAnchor} from "@/app/lib/seasonCollections";

type Props = {
    season: Season;
    eager?: boolean;
}

export default function SeasonBlock({ season, eager = false }: Props) {
    return (
        <div
            id={getSeasonAnchor(season.id)}
            className="mb-6 scroll-mt-24 select-none lg:mb-12"
        >

            {/* ── MOBILE ────────────────────────────────────────────────── */}
            <div className={"sm:hidden rounded-3xl relative overflow-hidden "} style={{ backgroundColor: season.heroBg }}>
                {/*{season.particles}*/}
                {/* Banner: text left | image right — side by side, no wasted space */}
                <div className="relative flex items-stretch min-h-[120px]">
                    {season.particles}
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
                            src={optimizeCloudinaryUrl(season.heroImage, 300)}
                            alt={season.label}
                            fill
                            unoptimized
                            fetchPriority={eager ? "high" : "auto"}
                            loading={eager ? "eager" : "lazy"}
                            sizes="(max-width: 639px) 45vw, 1px"
                            className="object-scale-down object-top-right"
                        />
                        {/*/!* Fade right edge *!/*/}
                        {/*<div*/}
                        {/*    className="absolute inset-y-0 right-0 w-2/5 pointer-events-none"*/}
                        {/*    style={{ background: `linear-gradient(to bottom left, ${season.heroBg}, transparent)` }}*/}
                        {/*/>*/}
                        {/*/!* Fade left edge *!/*/}
                        <div
                            className="absolute inset-y-0 left-0 w-full pointer-events-none"
                            style={{ background: `linear-gradient(to right, ${season.heroBg}, ${season.heroBg}33 82%)` }}
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
                            <CategoryCard key={cat.slug} category={cat} />
                        ))}
                    </div>
                </div>

            </div>

            {/* ── DESKTOP ───────────────────────────────────────────────── */}
            <div
                className="hidden sm:block relative overflow-hidden rounded-3xl shadow-xs"
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
                        src={optimizeCloudinaryUrl(season.heroImage, 500)}
                        alt={season.label}
                        fill
                        unoptimized
                        fetchPriority={eager ? "high" : "auto"}
                        loading={eager ? "eager" : "lazy"}
                        sizes="(min-width: 640px) 60vw, 1px"
                        className="object-scale-down object-top-right"
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
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 max-w-[75%] select-none">
                        {season.categories.map((cat) => (
                            <CategoryCard key={cat.slug} category={cat} />
                        ))}
                    </div>

                </div>
            </div>

        </div>
    );
}
