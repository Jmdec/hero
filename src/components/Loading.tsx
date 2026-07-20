import { useEffect, useState } from "react";

export function Loading() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 2600;
        const start = performance.now();
        let raf: number;

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setProgress(Math.round(easeOutCubic(t) * 100));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f2d52] text-white">
            {/* Blueprint grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(201,164,76,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(201,164,76,0.09) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
                aria-hidden
            />
            {/* Vignette to keep focus centered */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 42%, rgba(15,45,82,0) 0%, rgba(8,26,51,0.55) 78%)",
                }}
                aria-hidden
            />
            {/* Soft glow behind the drawing */}
            <div
                className="pointer-events-none absolute left-1/2 top-[38%] h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, rgba(201,164,76,0.25) 0%, transparent 70%)" }}
                aria-hidden
            />

            {/* Eyebrow */}
            <div className="relative z-10 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c9a44c]/70" />
                <span
                    className="text-[10px] font-medium uppercase tracking-[0.5em] text-[#c9a44c]"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                >
                    Hero Serviced Office
                </span>
                <span className="h-px w-8 bg-[#c9a44c]/70" />
            </div>

            {/* Architectural elevation drawing */}
            <div className="relative z-10 mt-6">
                <svg
                    viewBox="0 0 300 360"
                    className="h-75 w-63 sm:h-85 sm:w-70"
                    fill="none"
                >
                    {/* Ground line with tick marks */}
                    <g stroke="#c9a44c" strokeOpacity="0.6" strokeWidth="1">
                        <line x1="60" y1="336" x2="240" y2="336" />
                        {Array.from({ length: 10 }).map((_, i) => (
                            <line key={i} x1={64 + i * 20} y1="336" x2={64 + i * 20} y2="341" strokeOpacity="0.35" />
                        ))}
                    </g>

                    {/* Tower body outline (self-drawing) */}
                    <rect
                        x="105"
                        y="70"
                        width="90"
                        height="266"
                        pathLength={1}
                        stroke="#c9a44c"
                        strokeWidth="1.4"
                        fill="rgba(201,164,76,0.04)"
                        style={{
                            strokeDasharray: 1,
                            strokeDashoffset: 1,
                            animation: "draw 1.9s cubic-bezier(0.22,1,0.36,1) 0.15s forwards",
                        }}
                    />

                    {/* Penthouse setback */}
                    <rect
                        x="122"
                        y="38"
                        width="56"
                        height="32"
                        pathLength={1}
                        stroke="#c9a44c"
                        strokeWidth="1.4"
                        fill="rgba(201,164,76,0.05)"
                        style={{
                            strokeDasharray: 1,
                            strokeDashoffset: 1,
                            animation: "draw 1.1s cubic-bezier(0.22,1,0.36,1) 1.5s forwards",
                        }}
                    />

                    {/* Spire / antenna */}
                    <line
                        x1="150"
                        y1="38"
                        x2="150"
                        y2="16"
                        stroke="#c9a44c"
                        strokeWidth="1.2"
                        pathLength={1}
                        style={{
                            strokeDasharray: 1,
                            strokeDashoffset: 1,
                            animation: "draw 0.5s ease-out 2.4s forwards",
                        }}
                    />
                    <circle cx="150" cy="14" r="2" fill="#c9a44c" opacity="0" style={{ animation: "fadeIn 0.4s ease-out 2.8s forwards" }} />

                    {/* Floor lines */}
                    <g stroke="#c9a44c" strokeWidth="0.75">
                        {Array.from({ length: 13 }).map((_, i) => {
                            const y = 92 + i * 18.5;
                            return (
                                <line
                                    key={i}
                                    x1="105"
                                    y1={y}
                                    x2="195"
                                    y2={y}
                                    opacity="0"
                                    style={{
                                        transformOrigin: "105px center" as unknown as string,
                                        animation: `floorIn 0.5s ease-out ${1.1 + i * 0.045}s forwards`,
                                    }}
                                />
                            );
                        })}
                    </g>

                    {/* Center dimension line */}
                    <g
                        stroke="#c9a44c"
                        strokeWidth="0.75"
                        opacity="0"
                        style={{ animation: "fadeIn 0.6s ease-out 2.3s forwards" }}
                    >
                        <line x1="215" y1="70" x2="215" y2="336" strokeOpacity="0.5" />
                        <line x1="210" y1="70" x2="220" y2="70" />
                        <line x1="210" y1="336" x2="220" y2="336" />
                    </g>

                    {/* Annotations */}
                    <text
                        x="223"
                        y="205"
                        fill="#c9a44c"
                        fontSize="9"
                        letterSpacing="2"
                        opacity="0"
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            writingMode: "vertical-rl" as const,
                            animation: "fadeIn 0.6s ease-out 2.4s forwards",
                        }}
                    >
                        AYALA AVENUE
                    </text>
                    <text
                        x="150"
                        y="58"
                        fill="#c9a44c"
                        fontSize="10"
                        textAnchor="middle"
                        letterSpacing="1"
                        opacity="0"
                        style={{ fontFamily: "'Jost', sans-serif", animation: "fadeIn 0.6s ease-out 2.2s forwards" }}
                    >
                        23F
                    </text>
                </svg>
            </div>

            {/* Wordmark */}
            <div className="relative z-10 mt-2 flex flex-col items-center text-center">
                <h1
                    className="text-[44px] leading-none tracking-[0.12em] text-white sm:text-[52px]"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
                >
                    HERO
                </h1>
                <p
                    className="mt-2 text-[10px] uppercase tracking-[0.45em] text-[#c9a44c]"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                >
                    Serviced Office
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-white/40">
                    Ayala Avenue · Makati City
                </p>
            </div>

            {/* Progress */}
            <div className="relative z-10 mt-10 w-70">
                <div className="flex items-baseline justify-between">
                    <span
                        className="text-[10px] uppercase tracking-[0.35em] text-white/50"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                        Preparing your workspace
                    </span>
                    <span
                        className="text-[13px] tabular-nums text-[#c9a44c]"
                        style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500 }}
                    >
                        {String(progress).padStart(2, "0")}%
                    </span>
                </div>
                <div className="mt-3 h-px w-full bg-white/10">
                    <div
                        className="h-full bg-[#c9a44c] transition-[width] duration-150 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="mt-3 text-center text-[10px] tracking-[0.2em] text-white/30">
                    しばらくお待ちください
                </p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@300;400;500&display=swap');

        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes floorIn {
          from { opacity: 0; transform: scaleX(0); }
          to { opacity: 0.45; transform: scaleX(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
        </main>
    );
}