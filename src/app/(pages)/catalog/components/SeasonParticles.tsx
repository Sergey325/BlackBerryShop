'use client';

import {useCallback, useEffect, useState} from 'react';

// Вне компонентов — вызывается один раз при загрузке модуля
function generate<T>(count: number, factory: (i: number) => T): T[] {
    return Array.from({ length: count }, (_, i) => factory(i));
}

const flakeCache = new Map<number, P[]>();
function getFlakes(count: number): P[] {
    if (!flakeCache.has(count)) {
        flakeCache.set(count, generate(count, i => ({
            id: i,
            left:     Math.random() * 100,
            size:     Math.random() * 4 + 2,
            duration: Math.random() * 5 + 6,
            delay:    Math.random() * 8,
            drift:    Math.random() * 50 - 25,
        })));
    }
    return flakeCache.get(count)!;
}

const petalCache = new Map<number, Petal[]>();
function getPetals(count: number): Petal[] {
    if (!petalCache.has(count)) {
        petalCache.set(count, generate(count, i => ({
            id:       i,
            top:      Math.random() * 78 + 5,
            size:     Math.random() * 7 + 5,
            duration: Math.random() * 8 + 10,
            delay:    Math.random() * 14,
            color:    COLORS[Math.floor(Math.random() * COLORS.length)],
            ws:       Math.random() * 0.6 + 0.7,
        })));
    }
    return petalCache.get(count)!;
}

function useResponsiveCount(desktop: number, mobile: number) {
    const [count, setCount] = useState(desktop);

    useEffect(() => {
        let t: ReturnType<typeof setTimeout>;
        const update = () => setCount(window.innerWidth < 640 ? mobile : desktop);
        // setTimeout(0) чтобы не вызывать setState синхронно в теле эффекта
        t = setTimeout(update, 0);
        const onResize = () => { clearTimeout(t); t = setTimeout(update, 200); };
        window.addEventListener('resize', onResize);
        return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
    }, [desktop, mobile]);

    return count;
}

function useResponsiveRange(
    desktopMin: number, desktopMax: number,
    mobileMin: number, mobileMax: number,
): [number, number] {
    const [range, setRange] = useState<[number, number]>([desktopMin, desktopMax]);

    useEffect(() => {
        let t: ReturnType<typeof setTimeout>;
        const update = () =>
            setRange(window.innerWidth < 640 ? [mobileMin, mobileMax] : [desktopMin, desktopMax]);
        t = setTimeout(update, 0);
        const onResize = () => { clearTimeout(t); t = setTimeout(update, 200); };
        window.addEventListener('resize', onResize);
        return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
    }, [desktopMin, desktopMax, mobileMin, mobileMax]);

    return range;
}

function useAnimationGate<T extends HTMLElement>() {
    const [node, setNode] = useState<T | null>(null);
    const [active, setActive] = useState(false);

    // useCallback вместо ручного присваивания ref.current в теле рендера
    const ref = useCallback((el: T | null) => setNode(el), []);

    useEffect(() => {
        if (!node || typeof window === 'undefined') return;

        // prefers-reduced-motion: просто не активируем, стейт и так false
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const io = new IntersectionObserver(
            ([entry]) => setActive(entry.isIntersecting),
            { threshold: 0.01 },
        );
        io.observe(node);
        return () => io.disconnect();
    }, [node]);

    return { ref, active };
}

interface P { id: number; left: number; size: number; duration: number; delay: number; drift: number; }

// ─── Снег: падает сверху вниз ─────────────────────────────────────────────

export function SnowParticles() {
    const count = useResponsiveCount(250, 100);
    const flakes = getFlakes(count);
    const { ref, active } = useAnimationGate<HTMLDivElement>();


    if (!flakes.length) return null;

    return (
        <>
            <style>{`
                @keyframes snow-fall {
                    0%   { transform: translate3d(0,0,0); opacity: 0; }
                    5%   { opacity: 0.9; }
                    95%  { opacity: 0.7; }
                    100% { transform: translate3d(var(--drift), 100vh, 0); opacity: 0; }
                }
                .snow-paused span { animation-play-state: paused !important; }
            `}</style>
            <div
                ref={ref}
                className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${active ? '' : 'snow-paused'}`}
                style={{ contain: 'strict' }}
                aria-hidden
            >
                {flakes.map(f => (
                    <span
                        key={f.id}
                        className="absolute top-0 rounded-full bg-white/80"
                        style={{
                            left: `${f.left}%`,
                            width: f.size, height: f.size,
                            '--drift': `${f.drift}px`,
                            animation: `snow-fall ${f.duration}s ${f.delay}s linear infinite both`,
                            willChange: 'transform, opacity',
                        } as React.CSSProperties}
                    />
                ))}
            </div>
        </>
    );
}

// ─── Лепестки: слева направо ───────────────────────────────────

const COLORS = ['#fda4af', '#f9a8d4', '#fbcfe8', '#fed7aa', '#fde68a'];

interface Petal {
    id: number;
    top: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
    ws: number; // wave scale — индивидуальная амплитуда
}

export function PetalParticles() {
    const count = useResponsiveCount(16, 8);
    // const [durMin, durMax] = useResponsiveRange(10, 18, 5, 9); // на мобилке в ~2 раза быстрее
    const petals = getPetals(count);
    const { ref, active } = useAnimationGate<HTMLDivElement>();

    // useEffect(() => {
    //     const id = setTimeout(() => {
    //         setPetals(Array.from({ length: count }, (_, i) => ({
    //             id:       i,
    //             top:      Math.random() * 78 + 5,
    //             size:     Math.random() * 7 + 5,
    //             duration: Math.random() * (durMax - durMin) + durMin,
    //             delay:    Math.random() * (durMax + 2),
    //             color:    COLORS[Math.floor(Math.random() * COLORS.length)],
    //             ws:       Math.random() * 0.6 + 0.7,
    //         })));
    //     }, 0);
    //     return () => clearTimeout(id);
    // }, [count, durMin, durMax]);

    if (!petals.length) return null;

    return (
        <>
            <style>{`
                @keyframes petal-x {
                    0%   { transform: translate3d(-60px,0,0); opacity: 0; }
                    6%   { opacity: 0.85; }
                    92%  { opacity: 0.55; }
                    100% { transform: translate3d(120vw,0,0); opacity: 0; }
                }
                @keyframes petal-y {
                    0%   { transform: translate3d(0,0,0) rotate(0deg); }
                    15%  { transform: translate3d(0, calc(var(--ws) * -50px), 0) rotate(25deg); }
                    30%  { transform: translate3d(0, calc(var(--ws) *   8px), 0) rotate(-12deg); }
                    50%  { transform: translate3d(0, calc(var(--ws) * -25px), 0) rotate(18deg); }
                    68%  { transform: translate3d(0, calc(var(--ws) *   4px), 0) rotate(-8deg); }
                    82%  { transform: translate3d(0, calc(var(--ws) * -12px), 0) rotate(10deg); }
                    92%  { transform: translate3d(0, calc(var(--ws) *   2px), 0) rotate(-4deg); }
                    100% { transform: translate3d(0, calc(var(--ws) *  -5px), 0) rotate(5deg); }
                }
                .petal-paused div, .petal-paused span { animation-play-state: paused !important; }
            `}</style>

            <div
                ref={ref}
                className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${active ? '' : 'petal-paused'}`}
                style={{ contain: 'strict' }}
                aria-hidden
            >
                {petals.map(p => (
                    <div
                        key={p.id}
                        className="absolute"
                        style={{
                            top: `${p.top}%`,
                            left: 0,
                            animation: `petal-x ${p.duration}s ${p.delay}s linear infinite both`,
                            willChange: 'transform, opacity',
                        }}
                    >
                        <span
                            className="block rounded-full"
                            style={{
                                width: p.size,
                                height: p.size * 1.6,
                                background: p.color,
                                '--ws': p.ws,
                                animation: `petal-y ${p.duration}s ${p.delay}s ease-in-out infinite both`,
                                willChange: 'transform',
                            } as React.CSSProperties}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}