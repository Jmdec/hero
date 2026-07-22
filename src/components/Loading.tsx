"use client";

import { useEffect, useState } from "react";

type LoadingVariant = "screen" | "section" | "panel";

interface LoadingProps {
    variant?: LoadingVariant;
    title?: string;
    subtitle?: string;
    progress?: number;
    showProgress?: boolean;
}

export function Loading({
    variant = "screen",
    title = "Preparing your workspace",
    subtitle = "Hero Serviced Office",
    progress,
    showProgress = true,
}: LoadingProps) {
    const [autoProgress, setAutoProgress] = useState(0);
    const resolvedProgress = Math.max(0, Math.min(100, Math.round(progress ?? autoProgress)));

    useEffect(() => {
        if (typeof progress === "number") return;

        const duration = 2400;
        const start = performance.now();
        let raf = 0;
        const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setAutoProgress(Math.round(easeOutExpo(t) * 100));
            if (t < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [progress]);

    const containerClass =
        variant === "screen"
            ? "relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f2e7] px-5 py-10 text-[#0c2248]"
            : variant === "section"
                ? "relative flex min-h-[50vh] items-center justify-center overflow-hidden rounded-2xl bg-[#f7f2e7] px-4 py-8 text-[#0c2248]"
                : "relative flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#0f172a] px-4 py-6 text-white";

    const panelClass =
        variant === "panel"
            ? "w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-5 shadow-2xl backdrop-blur-md"
            : "w-full max-w-136 rounded-[2rem] border border-[#d6c7a5] bg-[#fffaf0]/90 p-6 shadow-[0_24px_80px_rgba(12,34,72,0.18)] backdrop-blur-sm sm:p-8";

    const lineBgClass = variant === "panel" ? "bg-white/20" : "bg-[#e8dcc3]";
    const lineFillClass =
        variant === "panel"
            ? "bg-linear-to-r from-[#FFC107] to-[#ffe08f]"
            : "bg-linear-to-r from-[#b78e44] to-[#d6b06d]";

    return (
        <div className={containerClass} aria-live="polite" aria-busy="true">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div
                    className={
                        variant === "panel"
                            ? "absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#1f355d] blur-3xl"
                            : "absolute -left-28 -top-28 h-88 w-88 rounded-full bg-[#e5d7b7] blur-3xl"
                    }
                />
                <div
                    className={
                        variant === "panel"
                            ? "absolute -right-16 -bottom-24 h-80 w-80 rounded-full bg-[#365b87] blur-3xl"
                            : "absolute -right-24 -bottom-36 h-96 w-96 rounded-full bg-[#a8c0d6] blur-3xl"
                    }
                />
            </div>

            <section className={`relative z-10 ${panelClass}`}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className={`text-[0.62rem] font-semibold uppercase tracking-[0.3em] ${variant === "panel" ? "text-white/60" : "text-[#8f7650]"}`}>
                            {subtitle}
                        </p>
                        <h2 className={`mt-2 font-semibold tracking-[0.06em] ${variant === "panel" ? "text-xl sm:text-2xl text-white" : "text-3xl sm:text-4xl text-[#0c2248]"}`}>
                            {title}
                        </h2>
                        <p className={`mt-2 text-xs uppercase tracking-[0.18em] ${variant === "panel" ? "text-white/60" : "text-[#5c6f8a]"}`}>
                            Loading systems
                        </p>
                    </div>

                    <div className={`relative grid place-items-center rounded-full border shadow-inner ${variant === "panel" ? "h-18 w-18 border-white/20 bg-white/10" : "h-20 w-20 border-[#d3c39e] bg-white sm:h-24 sm:w-24"}`}>
                        <div
                            className="absolute inset-1.5 rounded-full"
                            style={{
                                background:
                                    variant === "panel"
                                        ? `conic-gradient(#FFC107 ${resolvedProgress * 3.6}deg, rgba(255,255,255,0.2) 0deg)`
                                        : `conic-gradient(#c8a861 ${resolvedProgress * 3.6}deg, #ebdfc5 0deg)`,
                                WebkitMask:
                                    "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
                                mask:
                                    "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
                            }}
                        />
                        <span className={`relative z-10 text-sm font-semibold tabular-nums ${variant === "panel" ? "text-white" : "text-[#0c2248]"}`}>
                            {String(resolvedProgress).padStart(2, "0")}%
                        </span>
                    </div>
                </div>

                {showProgress && (
                    <div className="mt-6">
                        <div className={`h-1.5 w-full overflow-hidden rounded-full ${lineBgClass}`}>
                            <div
                                className={`h-full rounded-full transition-[width] duration-150 ease-linear ${lineFillClass}`}
                                style={{ width: `${resolvedProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}