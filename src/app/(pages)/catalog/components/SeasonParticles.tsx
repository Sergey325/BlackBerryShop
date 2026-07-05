'use client';

import { useEffect, useState } from 'react';

interface P { id: number; left: number; size: number; duration: number; delay: number; drift: number; }

// ─── Снег: падает сверху вниз ─────────────────────────────────────────────

export function SnowParticles() {
    const [flakes, setFlakes] = useState<P[]>([]);
    const [count, setCount] = useState(300);

    useEffect(() => {
        const update = () => {
            setCount(window.innerWidth < 640 ? 150 : 300);
        };

        update(); // initial

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        setFlakes(Array.from({ length: count }, (_, i) => ({
            id: i,
            left:     Math.random() * 100,
            size:     Math.random() * 4 + 2,
            duration: Math.random() * 5 + 6,
            delay:    Math.random() * 8,
            drift:    Math.random() * 50 - 25,
        })));
    }, [count]);

    if (!flakes.length) return null;

    return (
        <>
            <style>{`
                @keyframes snow-fall {
                    0%   { transform: translateY(0) translateX(0); opacity: 0; }
                    5%   { opacity: 0.9; }
                    95%  { opacity: 0.7; }
                    100% { transform: translateY(100vh) translateX(var(--drift)); opacity: 0; }
                }
            `}</style>
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden>
                {flakes.map(f => (
                    // Рельс на всю высоту — translateY(100vh) гарантированно выходит за низ контейнера
                    <div key={f.id} className="absolute inset-y-0" style={{ left: `${f.left}%` }}>
                        <span
                            className="absolute top-0 rounded-full bg-white/80"
                            style={{
                                width: f.size, height: f.size,
                                '--drift': `${f.drift}px`,
                                animation: `snow-fall ${f.duration}s ${f.delay}s linear infinite both`,
                            } as React.CSSProperties}
                        />
                    </div>
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

export function PetalParticles({ count = 16 }: { count?: number }) {
    const [petals, setPetals] = useState<Petal[]>([]);


    useEffect(() => {
        setPetals(Array.from({ length: count }, (_, i) => ({
            id:       i,
            top:      Math.random() * 78 + 5,        // 5–83% по высоте
            size:     Math.random() * 7 + 5,
            duration: Math.random() * 8 + 10,        // 10–18s на перелёт
            delay:    Math.random() * 14,            // разброс старта
            color:    COLORS[Math.floor(Math.random() * COLORS.length)],
            ws:       Math.random() * 0.6 + 0.7,    // 0.7–1.3× амплитуда
        })));
    }, [count]);

    if (!petals.length) return null;

    return (
        <>
            <style>{`
                /* Горизонтальное движение + opacity */
                @keyframes petal-x {
                    0%   { transform: translateX(-60px); opacity: 0; }
                    6%   { opacity: 0.85; }
                    92%  { opacity: 0.55; }
                    100% { transform: translateX(120vw); opacity: 0; }
                }
                /*
                  Вертикальная угасающая волна — большая амплитуда в начале,
                  маленькая в конце. Масштабируется через --ws на каждом лепестке.
                */
                @keyframes petal-y {
                    0%   { transform: translateY(0)               rotate(0deg);  }
                    15%  { transform: translateY(calc(var(--ws) * -50px)) rotate(25deg);  }
                    30%  { transform: translateY(calc(var(--ws) *   8px)) rotate(-12deg); }
                    50%  { transform: translateY(calc(var(--ws) * -25px)) rotate(18deg);  }
                    68%  { transform: translateY(calc(var(--ws) *   4px)) rotate(-8deg);  }
                    82%  { transform: translateY(calc(var(--ws) * -12px)) rotate(10deg);  }
                    92%  { transform: translateY(calc(var(--ws) *   2px)) rotate(-4deg);  }
                    100% { transform: translateY(calc(var(--ws) *  -5px)) rotate(5deg);   }
                }
            `}</style>

            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden>
                {petals.map(p => (
                    /*
                      fill-mode: both — до старта анимации браузер держит 0% кадр
                      (opacity: 0), поэтому первая пачка не "вспыхивает" на месте.
                    */
                    <div
                        key={p.id}
                        className="absolute"
                        style={{
                            top: `${p.top}%`,
                            left: 0,
                            animation: `petal-x ${p.duration}s ${p.delay}s linear infinite`,
                            animationFillMode: 'both',
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
                            } as React.CSSProperties}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}