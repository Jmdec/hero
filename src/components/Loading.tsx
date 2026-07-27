"use client";

import { useEffect, useState } from "react";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type LoadingVariant = "screen" | "section" | "panel";

interface LoadingProps {
    variant?: LoadingVariant;
    title?: string;
    subtitle?: string;
    progress?: number;
    showProgress?: boolean;
}

/**
 * Concept: the workspace is being drafted, not just "loaded."
 * A dashed guide building outline sits underneath; solid ink strokes trace
 * over it as `progress` advances — outline, floors of windows, entry door,
 * then side wings + rooftop flourish. `panel` renders as a cyanotype
 * (blue paper / white ink, the real material architectural blueprints
 * were printed on); `screen`/`section` render as warm drafting paper.
 */
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
            const value = easeOutExpo(t) * 100;
            setAutoProgress(t >= 1 ? 100 : Math.round(value));
            if (t < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                // Guaranteed final write — ensures the bar always lands on
                // exactly 100 regardless of rAF timing drift or rounding.
                setAutoProgress(100);
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [progress]);

    // fraction (0–1) of a given progress window that's been "drafted" so far
    const seg = (start: number, end: number) =>
        Math.max(0, Math.min(1, (resolvedProgress - start) / (end - start)));

    const isBlueprint = variant === "panel";

    const tokens = isBlueprint
        ? {
              bg: "bg-[#0f2c58]",
              cardBg: "bg-white/[0.04]",
              cardBorder: "border-white/15",
              ink: "#f4f3ec",
              accent: "#f5c26b",
              guide: "rgba(244,243,236,0.32)",
              dot: "rgba(244,243,236,0.09)",
              subtle: "rgba(244,243,236,0.6)",
          }
        : {
              bg: "bg-[#efe8d7]",
              cardBg: "bg-[#faf6ea]/95",
              cardBorder: "border-[#d8c9a0]",
              ink: "#16233f",
              accent: "#a97d3c",
              guide: "rgba(22,35,63,0.3)",
              dot: "rgba(22,35,63,0.08)",
              subtle: "rgba(22,35,63,0.6)",
          };

    const containerClass =
        variant === "screen"
            ? `relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 ${tokens.bg}`
            : variant === "section"
                ? `relative flex min-h-[50vh] items-center justify-center overflow-hidden rounded-2xl px-4 py-8 ${tokens.bg}`
                : `relative flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-2xl px-4 py-6 ${tokens.bg}`;

    const panelSizeClass =
        variant === "panel" ? "w-full max-w-md p-5 sm:p-6" : "w-full max-w-136 p-6 sm:p-8";

    const majorTicks = [0, 50, 100];
    const minorTicks = [10, 20, 30, 40, 60, 70, 80, 90];

    return (
        <div className={containerClass} aria-live="polite" aria-busy="true">
            {/* drafting-paper dot grid, replaces the old blurred color blobs */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
                style={{
                    backgroundImage: `radial-gradient(${tokens.dot} 1px, transparent 1px)`,
                    backgroundSize: "22px 22px",
                }}
            />

            <section
                className={`relative z-10 rounded-2xl border shadow-[0_24px_80px_rgba(12,34,72,0.16)] backdrop-blur-sm ${tokens.cardBg} ${tokens.cardBorder} ${panelSizeClass}`}
            >
                {/* corner registration marks */}
                {[
                    "left-3 top-3 border-l-2 border-t-2",
                    "right-3 top-3 border-r-2 border-t-2",
                    "left-3 bottom-3 border-l-2 border-b-2",
                    "right-3 bottom-3 border-r-2 border-b-2",
                ].map((pos) => (
                    <span
                        key={pos}
                        aria-hidden
                        className={`pointer-events-none absolute h-3.5 w-3.5 ${pos}`}
                        style={{ borderColor: tokens.accent }}
                    />
                ))}

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p
                            className={`${plexMono.className} text-[0.6rem] uppercase tracking-[0.28em]`}
                            style={{ color: tokens.subtle }}
                        >
                            {subtitle} · workspace setup
                        </p>
                        <h2
                            className={`${fraunces.className} mt-2 text-3xl tracking-[0.01em] sm:text-4xl`}
                            style={{ color: tokens.ink }}
                        >
                            {title}
                        </h2>
                    </div>

                    {/* drafting-dial: tick ring + fill arc + reading */}
                    <div className="relative grid h-20 w-20 shrink-0 place-items-center sm:h-24 sm:w-24">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `repeating-conic-gradient(${tokens.guide} 0deg 1.4deg, transparent 1.4deg 15deg)`,
                                WebkitMask:
                                    "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
                                mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
                            }}
                        />
                        <div
                            className="absolute inset-2 rounded-full"
                            style={{
                                background: `conic-gradient(${tokens.accent} ${resolvedProgress * 3.6}deg, transparent 0deg)`,
                                WebkitMask:
                                    "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
                                mask: "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
                            }}
                        />
                        <span
                            className={`${plexMono.className} relative z-10 text-sm font-medium tabular-nums`}
                            style={{ color: tokens.ink }}
                        >
                            {String(resolvedProgress).padStart(2, "0")}%
                        </span>
                    </div>
                </div>

                {/* ruler progress bar */}
                {showProgress && (
                    <div className="mt-5">
                        <div className="relative h-6">
                            <div
                                className="absolute left-0 right-0 top-3.75 h-px"
                                style={{ background: tokens.guide }}
                            />
                            {minorTicks.map((t) => (
                                <div
                                    key={t}
                                    className="absolute top-2.75 w-px"
                                    style={{ left: `${t}%`, height: "6px", background: tokens.guide }}
                                />
                            ))}
                            {majorTicks.map((t) => (
                                <div
                                    key={t}
                                    className="absolute top-2 w-px"
                                    style={{ left: `${t}%`, height: "12px", background: tokens.guide }}
                                />
                            ))}
                            <div
                                className="absolute top-3.5 h-0.5 transition-[width] duration-150 ease-linear"
                                style={{ left: 0, width: `${resolvedProgress}%`, background: tokens.accent }}
                            />
                            <div
                                className="absolute top-0 -translate-x-1/2 transition-[left] duration-150 ease-linear"
                                style={{ left: `${resolvedProgress}%` }}
                            >
                                <div
                                    style={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: "4px solid transparent",
                                        borderRight: "4px solid transparent",
                                        borderTop: `7px solid ${tokens.accent}`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className={`${plexMono.className} mt-1 flex justify-between text-[0.6rem]`} style={{ color: tokens.subtle }}>
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}