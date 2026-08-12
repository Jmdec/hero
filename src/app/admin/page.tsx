"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Bot,
    MessageSquare,
    Star,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    X,
    RefreshCw,
    AlertCircle,
    ScrollText,
    MoveRight,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type StatKey = "chat_leads" | "inquiries" | "testimonials" | "quotations";
type StatTone = "neutral" | "amber" | "green" | "red";

interface MonthPoint {
    month: string;
    total: number;
}

interface Analytics {
    chat_leads: {
        total: number;
        active: number;
        agent_requested: number;
        closed: number;
        conversations: number;
        escalation_rate: number;
        average_messages: number;
        completion_rate: number;
        escalation: { this_month: number; last_month: number; three_month_average: number };
        completion: { this_month: number; last_month: number; three_month_average: number };
    };
    inquiries: {
        total: number;
        new: number;
        in_progress: number;
        replied: number;
        closed: number;
        contacted?: number;
        top_service?: string | null;
        by_type: Record<string, number>;
    };
    announcements: { total: number; published: number; draft: number };
    quotations: {
        total: number;
        revenue: number;
        by_status: Record<string, number>;
        by_service: Record<string, number>;
        converted: number;
        conversion_rate: number;
        conversion: { this_month: number; last_month: number; three_month_average: number };
    };
    testimonials: {
        total: number;
        average_rating: number;
        by_status: Record<string, number>;
        by_rating: Record<string, number>;
        rating: { this_month: number; last_month: number; three_month_average: number };
        monthly_average_rating: MonthPoint[];
    };
    monthly: {
        chat_leads: MonthPoint[];
        inquiries: MonthPoint[];
        quotations: MonthPoint[];
        revenue: MonthPoint[];
        testimonials: MonthPoint[];
        testimonial_ratings: MonthPoint[];
        quotation_conversion: MonthPoint[];
    };
    recent_inquiries: Array<{
        id: number;
        name: string;
        company: string | null;
        inquiry_type: string;
        branch: string;
        status: string;
        created_at: string;
    }>;
    recent_testimonials: Array<{
        id: number;
        name: string | null;
        rating: number;
        quote: string | null;
        service_type: string | null;
        status: "pending" | "approved" | "rejected";
        created_at: string;
    }>;
}

const PIE_COLORS = ["#0D47A1", "#1565C0", "#1976D2", "#64B5F6", "#FFC107", "#F57F17"];

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        Authorization: `Bearer ${token ?? ""}`,
        "Content-Type": "application/json",
    };
}

function formatCurrency(value: number) {
    if (value >= 1_000_000) return `P${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `P${(value / 1_000).toFixed(0)}k`;
    return `P${value.toLocaleString()}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatInquiryType(raw: string) {
    return raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncateText(value: string, max = 90) {
    if (value.length <= max) return value;
    return `${value.slice(0, max)}...`;
}

const TESTIMONIAL_STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
};

function getTrendValue(points: MonthPoint[]) {
    if (!points.length) return "No change";
    const latest = points[points.length - 1]?.total ?? 0;
    const previous = points[points.length - 2]?.total ?? latest;
    const delta = latest - previous;
    if (delta === 0) return "No change";
    const percent = previous === 0 ? (latest > 0 ? 100 : 0) : Math.round((delta / previous) * 100);
    return `${delta > 0 ? "+" : "-"}${Math.abs(percent)}%`;
}

const STAT_TONE_STYLES: Record<StatTone, { bg: string; text: string; accent: string }> = {
    neutral: { bg: "bg-[#F0F4FB]", text: "text-[#1B3A8C]", accent: "bg-[#0D47A1]" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-500" },
    green: { bg: "bg-green-50", text: "text-green-700", accent: "bg-green-500" },
    red: { bg: "bg-red-50", text: "text-red-600", accent: "bg-red-500" },
};

type StatCardProps = {
    id: StatKey;
    label: string;
    value: string;
    trend: string;
    tone: StatTone;
    onClick: (id: StatKey) => void;
};

function StatCard({ id, label, value, trend, tone, onClick }: StatCardProps) {
    const style = STAT_TONE_STYLES[tone];
    const trendTone = trend.startsWith("+") ? "text-green-600" : trend.startsWith("-") ? "text-red-600" : "text-slate-500";

    return (
        <button
            onClick={() => onClick(id)}
            className="group relative w-full overflow-hidden rounded-2xl border border-transparent bg-white p-6 text-left shadow transition-all duration-200 hover:border-[#C5D2EC] hover:shadow-lg"
        >
            <div className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />
            <div className="mb-4 flex items-start justify-between">
                <p className="mb-1 text-md font-semibold text-gray-500">{label}</p>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-[#0D47A1]" />
            </div>
            <p className="mb-2 text-2xl font-bold text-gray-900">{value}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold ${trendTone}`}>
                {trend.startsWith("+") && <TrendingUp className="h-3.5 w-3.5" />}
                {trend.startsWith("-") && <TrendingDown className="h-3.5 w-3.5" />}
                {trend}
            </div>
        </button>
    );
}

function ModalBackdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">{children}</div>
        </div>
    );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
            {sub ? <p className="mt-0.5 text-xs text-slate-400">{sub}</p> : null}
        </div>
    );
}

function TrendChart({ title, data }: { title: string; data: MonthPoint[] }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                    <Area type="monotone" dataKey="total" stroke="#0D47A1" strokeWidth={2.5} fill="#0D47A1" fillOpacity={0.12} dot={{ r: 3, fill: "#0D47A1" }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function SkeletonBlock({ className }: { className: string }) {
    return <div className={`animate-pulse rounded bg-slate-200/90 ${className}`} />;
}

function StatCardSkeleton() {
    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-transparent bg-white p-6 shadow">
            <div className="absolute left-0 top-0 h-full w-1 bg-slate-200" />
            <SkeletonBlock className="mb-3 h-4 w-28" />
            <SkeletonBlock className="mb-3 h-9 w-24" />
            <div className="mb-2 flex items-center gap-2">
                <SkeletonBlock className="h-3.5 w-3.5 rounded-full" />
                <SkeletonBlock className="h-3.5 w-14" />
            </div>
            <SkeletonBlock className="h-3 w-24" />
        </div>
    );
}

function StatisticsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
    );
}

function LeadGenerationChartSkeleton() {
    return (
        <article className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-44" />
                    <SkeletonBlock className="h-3 w-56" />
                </div>
                <SkeletonBlock className="h-8 w-32 rounded-lg" />
            </div>
            <div className="h-55 rounded-xl bg-slate-50 p-3">
                <div className="flex h-full items-end gap-2">
                    <div className="relative flex h-full w-full items-end">
                        <div className="absolute inset-0 flex flex-col justify-between py-2">
                            <SkeletonBlock className="h-px w-full" />
                            <SkeletonBlock className="h-px w-full" />
                            <SkeletonBlock className="h-px w-full" />
                            <SkeletonBlock className="h-px w-full" />
                        </div>
                        <div className="relative z-10 flex h-full w-full items-end justify-between pb-5">
                            {[30, 55, 42, 70, 52, 74, 66].map((h, i) => (
                                <SkeletonBlock key={i} className="w-8 rounded-md" />
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <SkeletonBlock key={i} className="h-2.5 w-6" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function InquiryTypeChartSkeleton() {
    return (
        <article className="rounded-2xl bg-white p-5 shadow">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="h-3 w-44" />
                </div>
                <SkeletonBlock className="h-8 w-28 rounded-lg" />
            </div>
            <div className="mb-4 flex h-40 items-center justify-center">
                <div className="relative h-32 w-32">
                    <div className="absolute inset-0 animate-pulse rounded-full border-16 border-slate-200" />
                    <div className="absolute inset-5.5 rounded-full bg-white" />
                </div>
            </div>
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-2.5 w-2.5 rounded-full" />
                            <SkeletonBlock className="h-3 w-20" />
                        </div>
                        <SkeletonBlock className="h-3 w-14" />
                    </div>
                ))}
            </div>
        </article>
    );
}

function VerticalBarsSkeleton({ colorClass }: { colorClass: string }) {
    return (
        <div className="h-55 rounded-xl bg-slate-50 p-3">
            <div className="relative flex h-full items-end pb-5">
                <div className="absolute inset-0 flex flex-col justify-between py-2">
                    <SkeletonBlock className="h-px w-full" />
                    <SkeletonBlock className="h-px w-full" />
                    <SkeletonBlock className="h-px w-full" />
                    <SkeletonBlock className="h-px w-full" />
                </div>
                <div className="relative z-10 flex w-full items-end justify-between px-1">
                    {[90, 128, 74, 148, 106, 133, 98].map((height, i) => (
                        <div
                            key={i}
                            className={`w-7 animate-pulse rounded-t-md ${colorClass}`}
                            style={{ height }}
                        />
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <SkeletonBlock key={i} className="h-2.5 w-6" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function MonthlyQuotationChartSkeleton() {
    return (
        <article className="rounded-2xl bg-white p-5 shadow">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-3 w-44" />
                </div>
                <SkeletonBlock className="h-8 w-28 rounded-lg" />
            </div>
            <VerticalBarsSkeleton colorClass="bg-slate-300" />
        </article>
    );
}

function MonthlyInquiryChartSkeleton() {
    return (
        <article className="rounded-2xl bg-white p-5 shadow">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-30" />
                    <SkeletonBlock className="h-3 w-42" />
                </div>
                <SkeletonBlock className="h-8 w-24 rounded-lg" />
            </div>
            <VerticalBarsSkeleton colorClass="bg-slate-300" />
        </article>
    );
}

function RecentTestimonialsSkeleton() {
    return (
        <article className="overflow-hidden rounded-2xl bg-white shadow">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-36" />
                    <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="h-8 w-36 rounded-lg" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-5 py-3"><SkeletonBlock className="h-3 w-14" /></th>
                            <th className="px-5 py-3"><SkeletonBlock className="h-3 w-12" /></th>
                            <th className="px-5 py-3"><SkeletonBlock className="h-3 w-18" /></th>
                            <th className="px-5 py-3"><SkeletonBlock className="h-3 w-12" /></th>
                            <th className="px-5 py-3"><SkeletonBlock className="h-3 w-10" /></th>
                            <th className="px-5 py-3"><SkeletonBlock className="h-3 w-12" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Array.from({ length: 7 }).map((_, row) => (
                            <tr key={row}>
                                <td className="px-5 py-3.5"><SkeletonBlock className="h-3.5 w-24" /></td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <SkeletonBlock key={i} className="h-3.5 w-3.5 rounded-full" />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="space-y-1.5">
                                        <SkeletonBlock className="h-3 w-[320px] max-w-full" />
                                        <SkeletonBlock className="h-3 w-65 max-w-full" />
                                    </div>
                                </td>
                                <td className="px-5 py-3.5"><SkeletonBlock className="h-3.5 w-24" /></td>
                                <td className="px-5 py-3.5"><SkeletonBlock className="h-3.5 w-20" /></td>
                                <td className="px-5 py-3.5"><SkeletonBlock className="h-6 w-16 rounded-full" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </article>
    );
}

function DashboardSkeleton() {
    return (
        <main className="min-h-screen">
            <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-4">
                <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-7 w-64" />
                    <SkeletonBlock className="h-9 w-24 rounded-xl" />
                </div>

                <StatisticsCardsSkeleton />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <LeadGenerationChartSkeleton />
                    <InquiryTypeChartSkeleton />
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <MonthlyQuotationChartSkeleton />
                    <MonthlyInquiryChartSkeleton />
                </div>

                <RecentTestimonialsSkeleton />
            </section>
        </main>
    );
}

function TestimonialDetailModal({
    testimonial,
    onClose,
}: {
    testimonial: Analytics["recent_testimonials"][number];
    onClose: () => void;
}) {
    return (
        <ModalBackdrop onClose={onClose}>
            <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Testimonial Details</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-4 px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{testimonial.name ?? "Anonymous"}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${TESTIMONIAL_STATUS_STYLES[testimonial.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {testimonial.status}
                    </span>
                </div>

                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={`modal-star-${testimonial.id}-${i}`}
                            className={`h-4 w-4 ${i < testimonial.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-slate-100 text-slate-200"}`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <p>
                        <span className="font-semibold text-slate-600">Service:</span> {testimonial.service_type ?? "-"}
                    </p>
                    <p>
                        <span className="font-semibold text-slate-600">Date:</span> {formatDate(testimonial.created_at)}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {testimonial.quote?.trim() ? testimonial.quote : "No testimonial quote provided."}
                </div>
            </div>
        </ModalBackdrop>
    );
}

function DrillDownModal({ id, data, onClose }: { id: StatKey; data: Analytics; onClose: () => void }) {
    const [range, setRange] = useState("last_6_months");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [detailData, setDetailData] = useState<Analytics>(data);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setDetailData(data);
    }, [data]);

    useEffect(() => {
        if (range === "custom" && (!startDate || !endDate)) return;

        const params = new URLSearchParams({ range });
        if (range === "custom") {
            params.set("start_date", startDate);
            params.set("end_date", endDate);
        }

        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/analytics?${params.toString()}`, {
                    headers: authHeaders(),
                    cache: "no-store",
                });
                if (!res.ok) throw new Error(`Error ${res.status}`);
                setDetailData(await res.json());
            } catch {
                // Keep previous values if filtered request fails.
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [range, startDate, endDate]);

    const title: Record<StatKey, string> = {
        chat_leads: "Chatbot Lead Analytics",
        inquiries: "Inquiry Analytics",
        testimonials: "Testimonial Analytics",
        quotations: "Quotation Analytics",
    };

    const inquiryServices = Object.entries(detailData.inquiries.by_type)
        .map(([service, total]) => ({
            service: formatInquiryType(service),
            total,
            pct: Math.round((total / Math.max(detailData.inquiries.total, 1)) * 100),
        }))
        .sort((a, b) => b.total - a.total);

    const quotationServices = Object.entries(detailData.quotations.by_service)
        .map(([service, total]) => ({
            service,
            total,
            pct: Math.round((total / Math.max(detailData.quotations.total, 1)) * 100),
        }))
        .sort((a, b) => b.total - a.total);

    const testimonialStars = [5, 4, 3, 2, 1].map((star) => ({
        star,
        total: detailData.testimonials.by_rating[String(star)] ?? 0,
    }));

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{title[id]}</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="border-b border-slate-100 px-6 py-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                    >
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="last_3_months">Last 3 Months</option>
                        <option value="last_6_months">Last 6 Months</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {range === "custom" ? (
                        <>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                            />
                        </>
                    ) : null}
                </div>
            </div>

            <div className="max-h-[72vh] space-y-4 overflow-y-auto px-6 py-5">
                {loading ? <p className="text-xs font-medium text-slate-500">Refreshing analytics...</p> : null}

                {id === "chat_leads" ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Metric label="Total Conversations" value={String(detailData.chat_leads.conversations)} />
                            <Metric label="Agent Escalation Rate" value={`${detailData.chat_leads.escalation_rate.toFixed(2)}%`} />
                            <Metric label="Average Messages" value={detailData.chat_leads.average_messages.toFixed(1)} />
                            <Metric label="Completed Rate" value={`${detailData.chat_leads.completion_rate.toFixed(2)}%`} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <Metric label="This Month" value={`${detailData.chat_leads.escalation.this_month.toFixed(1)}%`} />
                            <Metric label="Last Month" value={`${detailData.chat_leads.escalation.last_month.toFixed(1)}%`} />
                            <Metric label="3-Month Avg" value={`${detailData.chat_leads.escalation.three_month_average.toFixed(1)}%`} />
                        </div>
                        <TrendChart title="Conversation Trend" data={detailData.monthly.chat_leads} />
                    </>
                ) : null}

                {id === "inquiries" ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Metric label="Total Inquiries" value={String(detailData.inquiries.total)} />
                            <Metric label="Contacted Number" value={String(detailData.inquiries.contacted ?? 0)} />
                            <Metric label="Most Requested Service" value={detailData.inquiries.top_service ? formatInquiryType(detailData.inquiries.top_service) : "-"} />
                            <Metric
                                label="Contact Rate"
                                value={`${Math.round(((detailData.inquiries.contacted ?? 0) / Math.max(detailData.inquiries.total, 1)) * 100)}%`}
                            />
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Service Breakdown</p>
                            <div className="space-y-2">
                                {inquiryServices.map((row) => (
                                    <div key={row.service} className="flex items-center justify-between text-sm text-slate-700">
                                        <span>{row.service}</span>
                                        <span className="font-semibold">{row.total} ({row.pct}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <TrendChart title="Inquiry Trend" data={detailData.monthly.inquiries} />
                    </>
                ) : null}

                {id === "testimonials" ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Metric label="Total Testimonials" value={String(detailData.testimonials.total)} />
                            <Metric label="Average Rating" value={`${detailData.testimonials.average_rating.toFixed(2)}/5`} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <Metric label="This Month" value={detailData.testimonials.rating.this_month.toFixed(2)} />
                            <Metric label="Last Month" value={detailData.testimonials.rating.last_month.toFixed(2)} />
                            <Metric label="3-Month Avg" value={detailData.testimonials.rating.three_month_average.toFixed(2)} />
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Rating Distribution</p>
                            <div className="space-y-1.5">
                                {testimonialStars.map((row) => (
                                    <div key={row.star} className="flex items-center justify-between text-sm text-slate-700">
                                        <span className="inline-flex items-center gap-1">
                                            {row.star} <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                                        </span>
                                        <span className="font-semibold">{row.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <TrendChart title="Average Rating Trend" data={detailData.monthly.testimonial_ratings} />
                    </>
                ) : null}

                {id === "quotations" ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Metric label="Total Quotations" value={String(detailData.quotations.total)} />
                            <Metric label="Conversion Rate" value={`${detailData.quotations.conversion_rate.toFixed(2)}%`} />
                            <Metric label="Pending" value={String(detailData.quotations.by_status.pending ?? 0)} />
                            <Metric label="Paid" value={String(detailData.quotations.by_status.paid ?? 0)} />
                            <Metric
                                label="Contract Sent"
                                value={String((detailData.quotations.by_status.contract_sent ?? 0) + (detailData.quotations.by_status["contract-sent"] ?? 0))}
                            />
                            <Metric label="Completed" value={String(detailData.quotations.by_status.completed ?? 0)} />
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Service Breakdown</p>
                            <div className="space-y-2">
                                {quotationServices.map((row) => (
                                    <div key={row.service} className="flex items-center justify-between text-sm text-slate-700">
                                        <span>{row.service}</span>
                                        <span className="font-semibold">{row.total} ({row.pct}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <Metric label="This Month" value={`${detailData.quotations.conversion.this_month.toFixed(1)}%`} />
                            <Metric label="Last Month" value={`${detailData.quotations.conversion.last_month.toFixed(1)}%`} />
                            <Metric label="3-Month Avg" value={`${detailData.quotations.conversion.three_month_average.toFixed(1)}%`} />
                        </div>
                        <TrendChart title="Conversion Trend" data={detailData.monthly.quotation_conversion} />
                    </>
                ) : null}
            </div>
        </ModalBackdrop>
    );
}

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCard, setActiveCard] = useState<StatKey | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<Analytics["recent_testimonials"][number] | null>(null);

    const fetchAnalytics = useCallback(async (silent = false) => {
        if (silent) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            const res = await fetch("/api/analytics", {
                headers: authHeaders(),
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            setAnalytics(await res.json());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load analytics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void fetchAnalytics();
    }, [fetchAnalytics]);

    const inquiryPieData = useMemo(() => {
        if (!analytics) return [];
        return Object.entries(analytics.inquiries.by_type).map(([name, value], i) => ({
            name: formatInquiryType(name),
            value,
            color: PIE_COLORS[i % PIE_COLORS.length],
        }));
    }, [analytics]);

    const cards = useMemo(() => {
        if (!analytics) return [];

        return [
            {
                id: "chat_leads" as const,
                icon: Bot,
                label: "Chatbot Leads",
                value: analytics.chat_leads.conversations.toLocaleString(),
                trend: getTrendValue(analytics.monthly.chat_leads),
                tone: "neutral" as const,
            },
            {
                id: "inquiries" as const,
                icon: MessageSquare,
                label: "Inquiries",
                value: analytics.inquiries.total.toLocaleString(),
                trend: getTrendValue(analytics.monthly.inquiries),
                tone: "amber" as const,
            },
            {
                id: "testimonials" as const,
                icon: Star,
                label: "Testimonials",
                value: analytics.testimonials.total.toLocaleString(),
                trend: `Star ${analytics.testimonials.average_rating.toFixed(1)}`,
                tone: "green" as const,
            },
            {
                id: "quotations" as const,
                icon: ScrollText,
                label: "Quotation Requests",
                value: analytics.quotations.total.toLocaleString(),
                trend: getTrendValue(analytics.monthly.revenue),
                tone: "red" as const,
            },
        ];
    }, [analytics]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error || !analytics) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center p-4">
                <div className="max-w-sm space-y-4 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
                    <p className="text-sm font-medium text-gray-700">{error ?? "Could not load dashboard data."}</p>
                    <button
                        onClick={() => fetchAnalytics()}
                        className="rounded-xl bg-[#0D47A1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1565C0]"
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    return (
        <main className="min-h-screen">
            <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900">Live data · {formatDate(new Date().toISOString())}</p>
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 rounded-xl border border-[#C5D2EC] px-3 py-1.5 text-sm font-semibold text-[#0D47A1] transition-colors hover:bg-[#EEF2FB] disabled:opacity-60"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <StatCard key={card.id} {...card} onClick={setActiveCard} />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <article className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Chatbot Lead Generation</h3>
                                <p className="text-xs text-gray-400">Monthly conversation trend and lead volume</p>
                            </div>
                            <Link
                                href="/admin/chats"
                                className="text-sm font-semibold text-[#0D47A1] transition-colors hover:bg-[#EEF2FB]"
                            >
                                <MoveRight className="mr-1 h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {analytics.monthly.chat_leads.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={analytics.monthly.chat_leads} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                        formatter={(v) => [Number(v ?? 0), "Leads"]}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#0D47A1" strokeWidth={2.5} fill="#0D47A1" fillOpacity={0.12} dot={{ r: 3, fill: "#0D47A1" }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-55 items-center justify-center text-xs text-slate-400">No chatbot trend data yet</div>
                        )}
                    </article>

                    <article className="rounded-2xl bg-white p-5 shadow">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Inquiry by Type</h3>
                                <p className="text-xs text-gray-400">Distribution across inquiry services</p>
                            </div>
                            <Link
                                href="/admin/inquiries"
                                className="text-sm font-semibold text-[#0D47A1] transition-colors hover:bg-[#EEF2FB]"
                            >
                                <MoveRight className="mr-1 h-3.5 w-3.5" />
                            </Link>
                        </div>
                        {inquiryPieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie data={inquiryPieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                                            {inquiryPieData.map((entry, i) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                            formatter={(v) => [Number(v ?? 0), "Inquiries"]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-1.5">
                                    {inquiryPieData.map((item) => {
                                        const pct = Math.round((item.value / Math.max(analytics.inquiries.total, 1)) * 100);
                                        return (
                                            <div key={item.name} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span>{item.name}</span>
                                                </div>
                                                <span className="font-semibold text-slate-800">{item.value} ({pct}%)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex h-55 items-center justify-center text-xs text-slate-400">No inquiry type data yet</div>
                        )}
                    </article>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <article className="rounded-2xl bg-white p-5 shadow">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Monthly Quotations</h3>
                                <p className="text-xs text-gray-400">Quotation request count by month</p>
                            </div>
                            <Link
                                href="/admin/quotation"
                                className="text-sm font-semibold text-[#0D47A1] transition-colors hover:bg-[#EEF2FB]"
                            >
                                <MoveRight className="mr-1 h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {analytics.monthly.quotations.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={analytics.monthly.quotations} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                        formatter={(v) => [Number(v ?? 0), "Quotations"]}
                                    />
                                    <Bar dataKey="total" fill="#0D47A1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-55 items-center justify-center text-xs text-slate-400">No quotation trend data yet</div>
                        )}
                    </article>

                    <article className="rounded-2xl bg-white p-5 shadow">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Monthly Inquiries</h3>
                                <p className="text-xs text-gray-400">Inquiry volume comparison by month</p>
                            </div>
                            <Link
                                href="/admin/inquiries"
                                className="text-sm font-semibold text-[#0D47A1] transition-colors hover:bg-[#EEF2FB]"
                            >
                                <MoveRight className="mr-1 h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {analytics.monthly.inquiries.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={analytics.monthly.inquiries} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                        formatter={(v) => [Number(v ?? 0), "Inquiries"]}
                                    />
                                    <Bar dataKey="total" fill="#1565C0" radius={[6, 6, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-55 items-center justify-center text-xs text-slate-400">No monthly inquiry data yet</div>
                        )}
                    </article>
                </div>

                <article className="overflow-hidden rounded-2xl bg-white shadow">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Recent Testimonials</h3>
                            <p className="text-xs text-gray-400">Latest 7 submissions</p>
                        </div>
                        <Link
                            href="/admin/testimonials"
                            className="text-sm font-semibold text-[#0D47A1] transition-colors hover:bg-[#EEF2FB]"
                        >
                            <MoveRight className="mr-1 h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {analytics.recent_testimonials.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-400">No testimonials yet</div>
                    ) : (
                        <>
                            <div className="space-y-3 p-4 lg:hidden">
                                {analytics.recent_testimonials.map((item) => {
                                    const quote = item.quote ?? "";
                                    return (
                                        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{item.name ?? ""}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">{item.service_type ?? ""}</p>
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${TESTIMONIAL_STATUS_STYLES[item.status] ?? "bg-slate-100 text-slate-600"}`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={`${item.id}-mobile-star-${i}`}
                                                        className={`h-3.5 w-3.5 ${i < item.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-slate-100 text-slate-200"}`}
                                                    />
                                                ))}
                                            </div>

                                            <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                                {truncateText(quote)}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                                <span>{formatDate(item.created_at)}</span>
                                                {quote.length > 90 ? (
                                                    <button
                                                        onClick={() => setSelectedTestimonial(item)}
                                                        className="rounded-md bg-[#EEF2FB] px-2.5 py-1 font-semibold text-[#0D47A1]"
                                                    >
                                                        View
                                                    </button>
                                                ) : null}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Client</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Rating</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Testimonial</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Service</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Date</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {analytics.recent_testimonials.map((item) => {
                                            const quote = item.quote ?? "";
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/70">
                                                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">{item.name ?? ""}</td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={`${item.id}-star-${i}`}
                                                                    className={`h-3.5 w-3.5 ${i < item.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-slate-100 text-slate-200"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-slate-600">
                                                        <p className="max-w-[320px] leading-relaxed">
                                                            {truncateText(quote)}
                                                        </p>
                                                        {quote.length > 90 ? (
                                                            <button
                                                                onClick={() => setSelectedTestimonial(item)}
                                                                className="mt-1 text-[11px] font-semibold text-[#0D47A1] hover:underline"
                                                            >
                                                                View full testimonial
                                                            </button>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-slate-600">{item.service_type ?? ""}</td>
                                                    <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(item.created_at)}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${TESTIMONIAL_STATUS_STYLES[item.status] ?? "bg-slate-100 text-slate-600"}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </article>
            </section>

            {activeCard ? (
                <DrillDownModal id={activeCard} data={analytics} onClose={() => setActiveCard(null)} />
            ) : null}

            {selectedTestimonial ? (
                <TestimonialDetailModal testimonial={selectedTestimonial} onClose={() => setSelectedTestimonial(null)} />
            ) : null}
        </main>
    );
}
