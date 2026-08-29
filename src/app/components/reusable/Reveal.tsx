"use client";

import {useEffect, useRef, useState} from "react";
import type {CSSProperties, JSX, ReactNode} from "react";

type RevealState = "idle" | "hidden" | "visible";

type Props = {
    children: ReactNode;
    className?: string;
    delay?: number;
};

const Reveal = ({children, className = "", delay = 0}: Props): JSX.Element => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [state, setState] = useState<RevealState>("idle");

    useEffect(() => {
        const container: HTMLDivElement | null = containerRef.current;

        if (!container) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!("IntersectionObserver" in window)) return;

        const bounds: DOMRect = container.getBoundingClientRect();

        // Контент, который уже находится на первом экране, остаётся видимым.
        // Так SSR и страница без JavaScript не получают скрытых секций.
        if (bounds.top <= window.innerHeight * 0.92) return;

        setState("hidden");

        let observer: IntersectionObserver | null = null;
        const frameId: number = window.requestAnimationFrame(() => {
            observer = new IntersectionObserver(
                ([entry]: IntersectionObserverEntry[]) => {
                    if (!entry.isIntersecting) return;

                    setState("visible");
                    observer?.disconnect();
                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -8% 0px",
                },
            );

            observer.observe(container);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
            observer?.disconnect();
        };
    }, []);

    const animationClass: string = state === "hidden"
        ? "motion-safe:translate-y-5 motion-safe:opacity-0"
        : state === "visible"
            ? "motion-safe:translate-y-0 motion-safe:opacity-100 motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out"
            : "translate-y-0 opacity-100";
    const style: CSSProperties = {
        transitionDelay: state === "visible" ? `${Math.max(0, delay)}ms` : "0ms",
    };

    return (
        <div
            ref={containerRef}
            data-reveal-state={state}
            className={`w-full motion-reduce:transform-none motion-reduce:opacity-100 ${animationClass} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

export default Reveal;
