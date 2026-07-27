"use client";

import { useEffect, useState, useCallback } from "react";
import {
    MessageSquare,
    Megaphone,
    PhilippinePeso,
    TrendingUp,
    TrendingDown,
    X,
    ChevronRight,
    Clock,
    Building2,
    RefreshCw,
    AlertCircle,
    Bot,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

/* ─── Types ─── */

interface MonthPoint {
    month: string;
    total: number;
}

interface Analytics {
    users: { total: number; verified: number; admins: number };
    chat_leads: {
        total: number; active: number; agent_requested: number;
        closed: number; conversations: number;
    };
    inquiries: {
        total: number; new: number; in_progress: number;
        replied: number; closed: number; by_type: Record<string, number>;
    };
    announcements: { total: number; published: number; draft: number };
    quotations: { total: number; revenue: number; by_status: Record<string, number> };
    monthly: {
        chat_leads: MonthPoint[];
        inquiries: MonthPoint[];
        revenue: MonthPoint[];
        announcements: MonthPoint[];
    };
    recent_inquiries: {
        id: number; name: string; company: string | null;
        inquiry_type: string; branch: string; status: string; created_at: string;
    }[];
}

/* ─── Helpers ─── */

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" };
}

function formatCurrency(value: number) {
    if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}k`;
    return `₱${value.toLocaleString()}`;
}

function formatInquiryType(raw: string) {
    return raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

const PIE_COLORS = ["#0D47A1", "#1565C0", "#1976D2", "#64B5F6", "#FFC107", "#F57F17"];

/* ─── Stat Card ─── */
type StatKey = "chat_leads" | "inquiries" | "announcements" | "revenue";

type StatCardProps = {
    id: StatKey;
    icon: React.ElementType;
    label: string;
    value: string;
    sub: string;
    trendUp: boolean | null;
    color: string;
    onClick: (id: StatKey) => void;
};

function StatCard({ id, icon: Icon, label, value, sub, trendUp, color, onClick }: StatCardProps) {
    return (
        <button
            onClick={() => onClick(id)}
            className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-200 text-left w-full border border-transparent hover:border-[#C5D2EC] relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: color === "bg-[#FFC107]" ? "#FFF8E1" : "#EEF2FB" }}
                >
                    <Icon className="w-5 h-5" style={{ color: color === "bg-[#FFC107]" ? "#F57F17" : "#0D47A1" }} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D47A1] transition-colors" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trendUp !== null ? (
                <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-green-600" : "text-red-500"}`}>
                    {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {sub}
                </div>
            ) : (
                <p className="text-xs text-gray-400">{sub}</p>
            )}
        </button>
    );
}

/* ─── Drill-Down Modal ─── */
function DrillDownModal({ id, data, onClose }: { id: StatKey; data: Analytics; onClose: () => void }) {
    const drillMap: Record<StatKey, { title: string; items: { label: string; value: string; sub?: string }[] }> = {
        chat_leads: {
            title: "Chatbot Lead Generation",
            items: [
                { label: "Total Leads Captured", value: String(data.chat_leads.total) },
                { label: "Total Conversations", value: String(data.chat_leads.conversations) },
                { label: "Active Conversations", value: String(data.chat_leads.active) },
                { label: "Awaiting Agent", value: String(data.chat_leads.agent_requested) },
                { label: "Closed", value: String(data.chat_leads.closed) },
            ],
        },
        inquiries: {
            title: "Inquiry Summary",
            items: [
                { label: "New", value: String(data.inquiries.new) },
                { label: "In Progress", value: String(data.inquiries.in_progress) },
                { label: "Replied", value: String(data.inquiries.replied) },
                { label: "Closed", value: String(data.inquiries.closed) },
                ...Object.entries(data.inquiries.by_type).map(([k, v]) => ({
                    label: formatInquiryType(k), value: String(v),
                })),
            ],
        },
        announcements: {
            title: "Announcement Overview",
            items: [
                { label: "Total", value: String(data.announcements.total) },
                { label: "Published", value: String(data.announcements.published), sub: "Live on site" },
                { label: "Draft", value: String(data.announcements.draft), sub: "Pending review" },
                { label: "Archived", value: String(data.announcements.total - data.announcements.published - data.announcements.draft), sub: "Hidden" },
            ],
        },
        revenue: {
            title: "Revenue Breakdown",
            items: [
                { label: "Total Revenue", value: `₱${data.quotations.revenue.toLocaleString()}` },
                { label: "Total Quotations", value: String(data.quotations.total) },
                ...Object.entries(data.quotations.by_status).map(([k, v]) => ({
                    label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value: String(v),
                })),
            ],
        },
    };

    const modal = drillMap[id];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#0D47A1]">
                    <h3 className="text-base font-bold text-white">{modal.title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
                <div className="p-5 space-y-3">
                    {modal.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                                {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                            </div>
                            <span className="text-sm font-bold text-[#0D47A1]">{item.value}</span>
                        </div>
                    ))}
                </div>
                <div className="px-5 pb-5">
                    <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Status Badge ─── */
const statusStyles: Record<string, string> = {
    new: "bg-blue-50 text-blue-700",
    in_progress: "bg-yellow-50 text-yellow-700",
    replied: "bg-purple-50 text-purple-700",
    closed: "bg-green-50 text-green-700",
};

const statusLabel: Record<string, string> = {
    new: "New",
    in_progress: "In Progress",
    replied: "Replied",
    closed: "Closed",
};

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCard, setActiveCard] = useState<StatKey | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);
        try {
            const res = await fetch("/api/analytics", { headers: authHeaders(), cache: "no-store" });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            setAnalytics(await res.json());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load analytics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    if (loading) {
        return (
            <section className="p-4 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Loading dashboard…</p>
                </div>
            </section>
        );
    }

    if (error || !analytics) {
        return (
            <section className="p-4 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-sm">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-sm text-gray-700 font-medium">{error ?? "Could not load dashboard data."}</p>
                    <button onClick={() => fetchAnalytics()} className="px-4 py-2 text-sm font-semibold bg-[#0D47A1] text-white rounded-xl hover:bg-[#1565C0] transition-colors">
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    const { inquiries, announcements, quotations, monthly, recent_inquiries, chat_leads } = analytics;

    const inquiryPieData = Object.entries(inquiries.by_type).map(([name, value], i) => ({
        name: formatInquiryType(name), value, color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    const stats: StatCardProps[] = [
        { id: "chat_leads", icon: Bot, label: "Chatbot Leads", value: chat_leads.total.toLocaleString(), sub: `${chat_leads.conversations} conversations · ${chat_leads.agent_requested} awaiting agent`, trendUp: chat_leads.total > 0, color: "bg-[#0D47A1]", onClick: setActiveCard },
        { id: "inquiries", icon: MessageSquare, label: "Contact Inquiries", value: inquiries.total.toLocaleString(), sub: `${inquiries.new} new · ${inquiries.in_progress} in progress`, trendUp: inquiries.new > 0, color: "bg-[#0D47A1]", onClick: setActiveCard },
        { id: "announcements", icon: Megaphone, label: "Announcements", value: announcements.total.toLocaleString(), sub: `${announcements.published} published · ${announcements.draft} draft`, trendUp: null, color: "bg-[#0D47A1]", onClick: setActiveCard },
        { id: "revenue", icon: PhilippinePeso, label: "Revenue", value: formatCurrency(quotations.revenue), sub: `${quotations.total} quotation${quotations.total !== 1 ? "s" : ""} total`, trendUp: quotations.revenue > 0, color: "bg-[#FFC107]", onClick: setActiveCard },
    ];

    return (
        <>
            <section className="p-4 space-y-8">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg font-semibold text-gray-900">Live data · {formatDate(new Date().toISOString())}</p>
                    </div>
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#0D47A1] border border-[#C5D2EC] rounded-xl hover:bg-[#EEF2FB] transition-colors disabled:opacity-60"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {stats.map((s) => <StatCard key={s.id} {...s} />)}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Lead generation */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Lead Generation</h3>
                                <p className="text-xs text-gray-400">Chatbot leads captured · last 6 months</p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{chat_leads.total} total leads</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={monthly.chat_leads} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#0D47A1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                    labelStyle={{ fontWeight: 700, color: "#0D47A1" }}
                                    formatter={(v) => [Number(v ?? 0), "New Leads"]}
                                />
                                <Area type="monotone" dataKey="total" stroke="#0D47A1" strokeWidth={2.5} fill="url(#leadGrad)" dot={{ r: 3, fill: "#0D47A1" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                        {/* Mini stats strip */}
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">{chat_leads.active}</p>
                                <p className="text-xs text-gray-400">Active</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-amber-600">{chat_leads.agent_requested}</p>
                                <p className="text-xs text-gray-400">Awaiting Agent</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-400">{chat_leads.closed}</p>
                                <p className="text-xs text-gray-400">Closed</p>
                            </div>
                        </div>
                    </div>

                    {/* Inquiries by type */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Inquiries by Type</h3>
                            <p className="text-xs text-gray-400">All time</p>
                        </div>
                        {inquiryPieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                        <Pie data={inquiryPieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                                            {inquiryPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-1.5 mt-2">
                                    {inquiryPieData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                <span className="text-xs text-gray-600 truncate max-w-27.5">{item.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-800">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-xs text-gray-400">No inquiry data yet</div>
                        )}
                    </div>
                </div>

                {/* ── Revenue + Inquiries Trend ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Revenue bar */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Monthly Revenue</h3>
                                <p className="text-xs text-gray-400">Last 6 months · paid &amp; completed</p>
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{formatCurrency(quotations.revenue)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={monthly.revenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                    formatter={(v) => [`₱${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                                    labelStyle={{ fontWeight: 700, color: "#0D47A1" }}
                                />
                                <Bar dataKey="total" fill="#0D47A1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly inquiries bar */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Monthly Inquiries</h3>
                                <p className="text-xs text-gray-400">Last 6 months</p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{inquiries.total} total</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={monthly.inquiries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                    labelStyle={{ fontWeight: 700, color: "#1565C0" }}
                                    formatter={(v) => [Number(v ?? 0), "Inquiries"]}
                                />
                                <Bar dataKey="total" fill="#1565C0" radius={[6, 6, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Recent Contact Inquiries Table ── */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Recent Inquiries</h3>
                            <p className="text-xs text-gray-400">Latest 7 contact submissions</p>
                        </div>
                        <a href="/admin/contact" className="text-xs font-semibold text-[#0D47A1] hover:underline">View all →</a>
                    </div>
                    {recent_inquiries.length === 0 ? (
                        <div className="py-16 text-center text-sm text-gray-400">No inquiries yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Branch</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                                        <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recent_inquiries.map((inq) => (
                                        <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 text-xs font-mono text-gray-400">#{inq.id}</td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-gray-800 text-xs">{inq.name}</p>
                                                {inq.company && <p className="text-xs text-gray-400">{inq.company}</p>}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-1.5 text-xs text-gray-700">
                                                    <Building2 className="w-3.5 h-3.5 text-[#0D47A1]" />
                                                    {formatInquiryType(inq.inquiry_type)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-gray-600">{inq.branch}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(inq.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[inq.status] ?? "bg-gray-100 text-gray-600"}`}>
                                                    {statusLabel[inq.status] ?? inq.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </section>

            {/* ── Drill-Down Modal ── */}
            {activeCard && <DrillDownModal id={activeCard} data={analytics} onClose={() => setActiveCard(null)} />}
        </>
    );
}