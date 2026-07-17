'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ── адаптивные хуки ───────────────────────────

function useResponsiveCount(desktop: number, mobile: number) {
    const [count, setCount] = useState(desktop);
    useEffect(() => {
        let t: ReturnType<typeof setTimeout>;
        const update = () => setCount(window.innerWidth < 640 ? mobile : desktop);
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

// ── общий canvas-движок: сайзинг, видимость, rAF-цикл ──────────────────
// Заменяет собой useAnimationGate + CSS keyframes целиком.

type DrawFn = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    elapsed: number,
) => void;

function useParticleCanvas(draw: DrawFn) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [ready, setReady] = useState(false);

    // callback ref: node пишем в обычный useRef (мутировать можно свободно),
    // а через setState только сигналим "элемент готов/исчез" для перезапуска эффектов
    const ref = useCallback((el: HTMLCanvasElement | null) => {
        canvasRef.current = el;
        setReady(!!el);
    }, []);

    const sizeRef = useRef({ width: 0, height: 0 });
    const activeRef = useRef(false);
    const reducedRef = useRef(false);
    const elapsedRef = useRef(0);
    const drawRef = useRef(draw);

    useEffect(() => { drawRef.current = draw; }, [draw]);

    // размер canvas под родителя + devicePixelRatio
    useEffect(() => {
        const node = canvasRef.current;
        if (!ready || !node) return;
        const parent = node.parentElement;
        if (!parent) return;
        const ctx = node.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const rawDpr = window.devicePixelRatio || 1;
            const cap = window.innerWidth < 640 ? 1 : 2;
            const dpr = Math.min(rawDpr, cap);

            const { width, height } = parent.getBoundingClientRect();
            sizeRef.current = { width, height };
            node.width = Math.round(width * dpr);
            node.height = Math.round(height * dpr);
            node.style.width = `${width}px`;
            node.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(parent);
        return () => ro.disconnect();
    }, [ready]);

    // видимость блока + prefers-reduced-motion
    useEffect(() => {
        const node = canvasRef.current;
        if (!ready || !node) return;

        reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const io = new IntersectionObserver(
            ([entry]) => { activeRef.current = entry.isIntersecting; },
            { threshold: 0.01 },
        );
        io.observe(node);
        return () => io.disconnect();
    }, [ready]);

    // rAF-цикл с троттлингом до ~30fps
    useEffect(() => {
        const node = canvasRef.current;
        if (!ready || !node) return;
        const ctx = node.getContext('2d');
        if (!ctx) return;

        let rafId: number;
        let lastTime: number | null = null;
        let accumulator = 0;
        const targetFrameTime = 1000 / 30;

        const loop = (time: number) => {
            rafId = requestAnimationFrame(loop);

            const last = lastTime ?? time;
            const frameDelta = time - last;
            lastTime = time;

            if (reducedRef.current || !activeRef.current) {
                accumulator = 0; // не копим долг, пока страница вне экрана/на паузе
                return;
            }

            accumulator += frameDelta;
            if (accumulator < targetFrameTime) return; // ещё не время следующего кадра
            const dt = Math.min(accumulator / 1000, 0.05);
            accumulator = 0;

            elapsedRef.current += dt;

            const { width, height } = sizeRef.current;
            if (width === 0 || height === 0) return;

            ctx.clearRect(0, 0, width, height);
            drawRef.current(ctx, width, height, dt, elapsedRef.current);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [ready]);

    return ref;
}

// ── Снег ─────────────────────────────────────────────────────────────

interface Flake {
    x0: number;
    size: number;
    durationFactor: number;
    phase: number;
    drift: number;
}

const flakeCache = new Map<number, Flake[]>();

function getFlakes(count: number): Flake[] {
    if (!flakeCache.has(count)) {
        flakeCache.set(
            count,
            Array.from({ length: count }, () => ({
                x0: Math.random(),
                size: Math.random() * 4 + 2,
                durationFactor: Math.random(),
                phase: Math.random(),
                drift: Math.random() * 50 - 25,
            }))
        );
    }

    return flakeCache.get(count)!;
}

export function SnowParticles() {
    const count = useResponsiveCount(300, 35);
    const flakes = getFlakes(count);

    const [durMin, durMax] = useResponsiveRange(
        5, 9,   // desktop
        1, 3     // mobile
    );

    const draw = useCallback<DrawFn>((ctx, width, height, _dt, elapsed) => {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';

        for (const f of flakes) {
            const duration =
                durMin + f.durationFactor * (durMax - durMin);

            const p = ((elapsed / duration) + f.phase) % 1;

            const y = p * (height + f.size * 2) - f.size;
            const x = f.x0 * width + f.drift * p;

            let alpha = 0.8;
            if (p < 0.05) alpha *= p / 0.05;
            else if (p > 0.95) alpha *= (1 - p) / 0.05;

            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, f.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }, [flakes, durMin, durMax]);

    const ref = useParticleCanvas(draw);

    return (
        <canvas
            ref={ref}
            className="absolute inset-0 pointer-events-none z-10"
            style={{ contain: 'strict' }}
            aria-hidden
        />
    );
}

// ── Лепестки ─────────────────────────────────────────────────────────

const COLORS = ['#fda4af', '#f9a8d4', '#fbcfe8', '#fed7aa', '#fde68a'];

interface PetalBase {
    top: number;         // 0..1 доля высоты (базовая линия)
    size: number;
    durationFactor: number; // 0..1 — стабильный "характер" частицы
    phase: number;           // 0..1 — сдвиг старта по циклу
    color: string;
    ws: number;              // амплитуда волны
}

const petalCache = new Map<number, PetalBase[]>();
function getPetalsBase(count: number): PetalBase[] {
    if (!petalCache.has(count)) {
        petalCache.set(count, Array.from({ length: count }, () => ({
            top:            Math.random() * 0.78 + 0.05,
            size:           Math.random() * 7 + 5,
            durationFactor: Math.random(),
            phase:          Math.random(),
            color:          COLORS[Math.floor(Math.random() * COLORS.length)],
            ws:             Math.random() * 0.6 + 0.7,
        })));
    }
    return petalCache.get(count)!;
}

export function PetalParticles() {
    const count = useResponsiveCount(16, 6);
    const [durMin, durMax] = useResponsiveRange(10, 18, 5, 9); // на мобилке в ~2 раза быстрее
    const base = getPetalsBase(count);

    const draw = useCallback<DrawFn>((ctx, width, height, _dt, elapsed) => {
        for (const p of base) {
            const duration = durMin + p.durationFactor * (durMax - durMin);
            const t = ((elapsed / duration) + p.phase) % 1;

            const x = -60 + t * (width + 180);
            const wave = Math.sin(t * Math.PI * 4 + p.phase * 10) * 30 * p.ws;
            const y = p.top * height + wave;
            const rotation = Math.sin(t * Math.PI * 4) * 20 * (Math.PI / 180);

            let alpha = 0.85;
            if (t < 0.06) alpha *= t / 0.06;
            else if (t > 0.92) alpha *= (1 - t) / 0.08;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size / 2, (p.size * 1.6) / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }, [base, durMin, durMax]);

    const ref = useParticleCanvas(draw);

    return (
        <canvas
            ref={ref}
            className="absolute inset-0 pointer-events-none z-10"
            style={{ contain: 'strict' }}
            aria-hidden
        />
    );
}

// 'use client';
//
// import {useCallback, useEffect, useState} from 'react';
//
// // Вне компонентов — вызывается один раз при загрузке модуля
// function generate<T>(count: number, factory: (i: number) => T): T[] {
//     return Array.from({ length: count }, (_, i) => factory(i));
// }
//
// const flakeCache = new Map<number, P[]>();
// function getFlakes(count: number): P[] {
//     if (!flakeCache.has(count)) {
//         flakeCache.set(count, generate(count, i => ({
//             id: i,
//             left:     Math.random() * 100,
//             size:     Math.random() * 4 + 2,
//             duration: Math.random() * 5 + 6,
//             delay:    Math.random() * 8,
//             drift:    Math.random() * 50 - 25,
//         })));
//     }
//     return flakeCache.get(count)!;
// }
//
// interface PetalBase {
//     id: number;
//     top: number;
//     size: number;
//     durationFactor: number; // 0..1, стабильный на весь жизненный цикл частицы
//     delayFactor: number;    // 0..1
//     color: string;
//     ws: number;
// }
//
// const petalCache = new Map<number, PetalBase[]>();
// function getPetalsBase(count: number): PetalBase[] {
//     if (!petalCache.has(count)) {
//         petalCache.set(count, generate(count, i => ({
//             id:             i,
//             top:            Math.random() * 78 + 5,
//             size:           Math.random() * 7 + 5,
//             durationFactor: Math.random(),
//             delayFactor:    Math.random(),
//             color:          COLORS[Math.floor(Math.random() * COLORS.length)],
//             ws:             Math.random() * 0.6 + 0.7,
//         })));
//     }
//     return petalCache.get(count)!;
// }
//
// function useResponsiveCount(desktop: number, mobile: number) {
//     const [count, setCount] = useState(desktop);
//
//     useEffect(() => {
//         let t: ReturnType<typeof setTimeout>;
//         const update = () => setCount(window.innerWidth < 640 ? mobile : desktop);
//         // setTimeout(0) чтобы не вызывать setState синхронно в теле эффекта
//         t = setTimeout(update, 0);
//         const onResize = () => { clearTimeout(t); t = setTimeout(update, 200); };
//         window.addEventListener('resize', onResize);
//         return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
//     }, [desktop, mobile]);
//
//     return count;
// }
//
// function useResponsiveRange(
//     desktopMin: number, desktopMax: number,
//     mobileMin: number, mobileMax: number,
// ): [number, number] {
//     const [range, setRange] = useState<[number, number]>([desktopMin, desktopMax]);
//
//     useEffect(() => {
//         let t: ReturnType<typeof setTimeout>;
//         const update = () =>
//             setRange(window.innerWidth < 640 ? [mobileMin, mobileMax] : [desktopMin, desktopMax]);
//         t = setTimeout(update, 0);
//         const onResize = () => { clearTimeout(t); t = setTimeout(update, 200); };
//         window.addEventListener('resize', onResize);
//         return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
//     }, [desktopMin, desktopMax, mobileMin, mobileMax]);
//
//     return range;
// }
//
// function useAnimationGate<T extends HTMLElement>() {
//     const [node, setNode] = useState<T | null>(null);
//     const [active, setActive] = useState(false);
//
//     // useCallback вместо ручного присваивания ref.current в теле рендера
//     const ref = useCallback((el: T | null) => setNode(el), []);
//
//     useEffect(() => {
//         if (!node || typeof window === 'undefined') return;
//
//         // prefers-reduced-motion: просто не активируем, стейт и так false
//         if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
//
//         const io = new IntersectionObserver(
//             ([entry]) => setActive(entry.isIntersecting),
//             { threshold: 0.01 },
//         );
//         io.observe(node);
//         return () => io.disconnect();
//     }, [node]);
//
//     return { ref, active };
// }
//
// interface P { id: number; left: number; size: number; duration: number; delay: number; drift: number; }
//
// // ─── Снег: падает сверху вниз ─────────────────────────────────────────────
//
// export function SnowParticles() {
//     const count = useResponsiveCount(1050, 80);
//     const flakes = getFlakes(count);
//     const { ref, active } = useAnimationGate<HTMLDivElement>();
//
//
//     if (!flakes.length) return null;
//
//     return (
//         <>
//             <style>{`
//                 @keyframes snow-fall {
//                     0%   { transform: translate3d(0,0,0); opacity: 0; }
//                     5%   { opacity: 0.9; }
//                     95%  { opacity: 0.7; }
//                     100% { transform: translate3d(var(--drift), 100vh, 0); opacity: 0; }
//                 }
//                 .snow-paused span { animation-play-state: paused !important; }
//             `}</style>
//             <div
//                 ref={ref}
//                 className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${active ? '' : 'snow-paused'}`}
//                 style={{ contain: 'strict' }}
//                 aria-hidden
//             >
//                 {flakes.map(f => (
//                     <span
//                         key={f.id}
//                         className="absolute top-0 rounded-full bg-white/80"
//                         style={{
//                             left: `${f.left}%`,
//                             width: f.size, height: f.size,
//                             '--drift': `${f.drift}px`,
//                             animation: `snow-fall ${f.duration}s ${f.delay}s linear infinite both`,
//                             // willChange: 'transform, opacity',
//                         } as React.CSSProperties}
//                     />
//                 ))}
//             </div>
//         </>
//     );
// }
//
// // ─── Лепестки: слева направо ───────────────────────────────────
//
// const COLORS = ['#fda4af', '#f9a8d4', '#fbcfe8', '#fed7aa', '#fde68a'];
//
// export function PetalParticles() {
//     const count = useResponsiveCount(16, 6);
//     const [durMin, durMax] = useResponsiveRange(10, 18, 5, 9); // на мобилке в ~2 раза быстрее
//     const base = getPetalsBase(count);
//     const { ref, active } = useAnimationGate<HTMLDivElement>();
//
//     // duration/delay вычисляются на рендере из стабильного factor + текущего диапазона
//     const petals = base.map(p => ({
//         ...p,
//         duration: durMin + p.durationFactor * (durMax - durMin),
//         delay:    p.delayFactor * (durMax + 2),
//     }));
//
//     if (!petals.length) return null;
//
//     return (
//         <>
//             <style>{`
//                 @keyframes petal-x {
//                     0%   { transform: translate3d(-60px,0,0); opacity: 0; }
//                     6%   { opacity: 0.85; }
//                     92%  { opacity: 0.55; }
//                     100% { transform: translate3d(120vw,0,0); opacity: 0; }
//                 }
//                 @keyframes petal-y {
//                     0%   { transform: translate3d(0,0,0) rotate(0deg); }
//                     15%  { transform: translate3d(0, calc(var(--ws) * -50px), 0) rotate(25deg); }
//                     30%  { transform: translate3d(0, calc(var(--ws) *   8px), 0) rotate(-12deg); }
//                     50%  { transform: translate3d(0, calc(var(--ws) * -25px), 0) rotate(18deg); }
//                     68%  { transform: translate3d(0, calc(var(--ws) *   4px), 0) rotate(-8deg); }
//                     82%  { transform: translate3d(0, calc(var(--ws) * -12px), 0) rotate(10deg); }
//                     92%  { transform: translate3d(0, calc(var(--ws) *   2px), 0) rotate(-4deg); }
//                     100% { transform: translate3d(0, calc(var(--ws) *  -5px), 0) rotate(5deg); }
//                 }
//                 .petal-paused div, .petal-paused span { animation-play-state: paused !important; }
//             `}</style>
//
//             <div
//                 ref={ref}
//                 className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${active ? '' : 'petal-paused'}`}
//                 style={{ contain: 'strict' }}
//                 aria-hidden
//             >
//                 {petals.map(p => (
//                     <div
//                         key={p.id}
//                         className="absolute"
//                         style={{
//                             top: `${p.top}%`,
//                             left: 0,
//                             animation: `petal-x ${p.duration}s ${p.delay}s linear infinite both`,
//                             // willChange: 'transform, opacity',
//                         }}
//                     >
//                         <span
//                             className="block rounded-full"
//                             style={{
//                                 width: p.size,
//                                 height: p.size * 1.6,
//                                 background: p.color,
//                                 '--ws': p.ws,
//                                 animation: `petal-y ${p.duration}s ${p.delay}s ease-in-out infinite both`,
//                                 // willChange: 'transform',
//                             } as React.CSSProperties}
//                         />
//                     </div>
//                 ))}
//             </div>
//         </>
//     );
// }