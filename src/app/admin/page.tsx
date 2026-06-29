"use client";

import { useState } from "react";
import {
    Users,
    MessageSquare,
    BookOpen,
    PhilippinePeso,
    TrendingUp,
    TrendingDown,
    X,
    ChevronRight,
    Clock,
    Building2,
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

/* ─── Mock Data ─── */

const monthlyUsers = [
    { month: "Jan", users: 180 },
    { month: "Feb", users: 195 },
    { month: "Mar", users: 210 },
    { month: "Apr", users: 205 },
    { month: "May", users: 230 },
    { month: "Jun", users: 250 },
];

const monthlyRevenue = [
    { month: "Jan", revenue: 95000 },
    { month: "Feb", revenue: 102000 },
    { month: "Mar", revenue: 98000 },
    { month: "Apr", revenue: 110000 },
    { month: "May", revenue: 118000 },
    { month: "Jun", revenue: 125000 },
];

const inquiryByType = [
    { name: "Private Office", value: 14, color: "#0D47A1" },
    { name: "Virtual Office", value: 8, color: "#1565C0" },
    { name: "Co-working", value: 7, color: "#64B5F6" },
    { name: "Conference Room", value: 5, color: "#FFC107" },
];

const monthlyBlogs = [
    { month: "Jan", blogs: 2 },
    { month: "Feb", blogs: 3 },
    { month: "Mar", blogs: 4 },
    { month: "Apr", blogs: 2 },
    { month: "May", blogs: 3 },
    { month: "Jun", blogs: 4 },
];

const recentInquiries = [
    { id: "INQ-001", name: "Takashi Yamamoto", company: "TechnoSoft PH Inc.", type: "Private Office", branch: "Tower 6789", date: "Jun 24, 2026", status: "New", seats: 5 },
    { id: "INQ-002", name: "Maria Santos", company: "Quantum Growth Ltd.", type: "Virtual Office", branch: "Insular Life", date: "Jun 23, 2026", status: "In Review", seats: null },
    { id: "INQ-003", name: "James Reyes", company: "Pan Islands Inc.", type: "Co-working", branch: "Tower 6789", date: "Jun 23, 2026", status: "Contacted", seats: 2 },
    { id: "INQ-004", name: "Lovely Cruz", company: "BPO Solutions Corp.", type: "Conference Room", branch: "Insular Life", date: "Jun 22, 2026", status: "New", seats: null },
    { id: "INQ-005", name: "Bethany Callora", company: "Starfield Marketing", type: "Private Office", branch: "Insular Life", date: "Jun 21, 2026", status: "Converted", seats: 10 },
    { id: "INQ-006", name: "Kenji Nakamura", company: "IMO Solutions PH", type: "Virtual Office", branch: "Tower 6789", date: "Jun 20, 2026", status: "In Review", seats: null },
    { id: "INQ-007", name: "Ana Gonzales", company: "Liz Lisa PH", type: "Event Area", branch: "Tower 6789", date: "Jun 19, 2026", status: "Contacted", seats: null },
];

// Detail data per stat card
const drillDownData: Record<string, { title: string; items: { label: string; value: string; sub?: string }[] }> = {
    users: {
        title: "User Breakdown",
        items: [
            { label: "Private Office Tenants", value: "98", sub: "39.2% of total" },
            { label: "Virtual Office Clients", value: "72", sub: "28.8% of total" },
            { label: "Co-working Members", value: "54", sub: "21.6% of total" },
            { label: "Conference / Event", value: "26", sub: "10.4% of total" },
            { label: "Tower 6789", value: "140", sub: "Active users" },
            { label: "Insular Life Building", value: "110", sub: "Active users" },
        ],
    },
    inquiries: {
        title: "Inquiry Summary",
        items: [
            { label: "New (unread)", value: "11", sub: "32.4%" },
            { label: "In Review", value: "10", sub: "29.4%" },
            { label: "Contacted", value: "8", sub: "23.5%" },
            { label: "Converted", value: "5", sub: "14.7%" },
            { label: "This week", value: "12", sub: "vs 9 last week ↑" },
            { label: "Avg. response time", value: "4.2 hrs", sub: "Target: <6 hrs" },
        ],
    },
    blogs: {
        title: "Blog Overview",
        items: [
            { label: "Published", value: "14", sub: "Live on site" },
            { label: "Draft", value: "3", sub: "Pending review" },
            { label: "Archived", value: "1", sub: "Hidden from public" },
            { label: "Top post views", value: "1,240", sub: "\"Why Choose Makati\"" },
            { label: "Avg. read time", value: "3.4 min", sub: "Across all posts" },
            { label: "This month", value: "4 new", sub: "vs 3 last month ↑" },
        ],
    },
    revenue: {
        title: "Revenue Breakdown",
        items: [
            { label: "Private Offices", value: "₱88,500", sub: "70.8% of total" },
            { label: "Virtual Offices", value: "₱21,000", sub: "16.8%" },
            { label: "Co-working", value: "₱9,900", sub: "7.9%" },
            { label: "Conference / Events", value: "₱5,600", sub: "4.5%" },
            { label: "Tower 6789", value: "₱72,000", sub: "57.6% of total" },
            { label: "Insular Life Building", value: "₱53,000", sub: "42.4% of total" },
        ],
    },
};

/* ─── Stat Card ─── */
type StatKey = "users" | "inquiries" | "blogs" | "revenue";

type StatCardProps = {
    id: StatKey;
    icon: React.ElementType;
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    color: string;
    onClick: (id: StatKey) => void;
};

function StatCard({ id, icon: Icon, label, value, trend, trendUp, color, onClick }: StatCardProps) {
    return (
        <button
            onClick={() => onClick(id)}
            className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-200 text-left w-full border border-transparent hover:border-[#C5D2EC] relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}
                    style={{ backgroundColor: color === "bg-[#0D47A1]" ? "#EEF2FB" : color === "bg-[#FFC107]" ? "#FFF8E1" : "#E8F5E9" }}>
                    <Icon className="w-5 h-5" style={{ color: color === "bg-[#0D47A1]" ? "#0D47A1" : color === "bg-[#FFC107]" ? "#F57F17" : "#2E7D32" }} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D47A1] transition-colors" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-green-600" : "text-red-500"}`}>
                {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {trend}
            </div>
        </button>
    );
}

/* ─── Drill-Down Modal ─── */
function DrillDownModal({ id, onClose }: { id: StatKey; onClose: () => void }) {
    const data = drillDownData[id];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#0D47A1]">
                    <h3 className="text-base font-bold text-white">{data.title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
                <div className="p-5 space-y-3">
                    {data.items.map((item, i) => (
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
    New: "bg-blue-50 text-blue-700",
    "In Review": "bg-yellow-50 text-yellow-700",
    Contacted: "bg-purple-50 text-purple-700",
    Converted: "bg-green-50 text-green-700",
};

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
    const [activeCard, setActiveCard] = useState<StatKey | null>(null);

    const stats = [
        { id: "users" as StatKey, icon: Users, label: "Users", value: "250", trend: "+12.5% vs last month", trendUp: true, color: "bg-[#0D47A1]" },
        { id: "inquiries" as StatKey, icon: MessageSquare, label: "Inquiries", value: "34", trend: "+33.3% vs last month", trendUp: true, color: "bg-[#0D47A1]" },
        { id: "blogs" as StatKey, icon: BookOpen, label: "Blogs", value: "18", trend: "+2 this month", trendUp: true, color: "bg-[#0D47A1]" },
        { id: "revenue" as StatKey, icon: PhilippinePeso, label: "Revenue", value: "₱125,000", trend: "+5.9% vs last month", trendUp: true, color: "bg-[#FFC107]" },
    ];

    return (
        <>
            <section className="p-4 space-y-8">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {stats.map((s) => (
                        <StatCard key={s.id} {...s} onClick={setActiveCard} />
                    ))}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Users trend */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">User Growth</h3>
                                <p className="text-xs text-gray-400">Jan – Jun 2026</p>
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 12.5%</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={monthlyUsers} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#0D47A1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                    labelStyle={{ fontWeight: 700, color: "#0D47A1" }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#0D47A1" strokeWidth={2.5} fill="url(#userGrad)" dot={{ r: 3, fill: "#0D47A1" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Inquiry by type */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Inquiries by Type</h3>
                            <p className="text-xs text-gray-400">Current month</p>
                        </div>
                        <ResponsiveContainer width="100%" height={140}>
                            <PieChart>
                                <Pie data={inquiryByType} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                                    {inquiryByType.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-2">
                            {inquiryByType.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Revenue + Blogs Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Revenue bar chart */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Monthly Revenue</h3>
                                <p className="text-xs text-gray-400">Jan – Jun 2026 (PHP)</p>
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 5.9%</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                    formatter={(v) => [`₱${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                                    labelStyle={{ fontWeight: 700, color: "#0D47A1" }}
                                />
                                <Bar dataKey="revenue" fill="#0D47A1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Blog posts bar chart */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Blog Posts Published</h3>
                                <p className="text-xs text-gray-400">Jan – Jun 2026</p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">18 total</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={monthlyBlogs} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                    labelStyle={{ fontWeight: 700, color: "#FFC107" }}
                                />
                                <Bar dataKey="blogs" fill="#FFC107" radius={[6, 6, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Recent Inquiries Table ── */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Recent Inquiries</h3>
                            <p className="text-xs text-gray-400">Latest 7 submissions</p>
                        </div>
                        <button className="text-xs font-semibold text-[#0D47A1] hover:underline">View all →</button>
                    </div>
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
                                {recentInquiries.map((inq) => (
                                    <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 text-xs font-mono text-gray-400">{inq.id}</td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-semibold text-gray-800 text-xs">{inq.name}</p>
                                            <p className="text-xs text-gray-400">{inq.company}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="flex items-center gap-1.5 text-xs text-gray-700">
                                                <Building2 className="w-3.5 h-3.5 text-[#0D47A1]" />
                                                {inq.type}
                                                {inq.seats && <span className="text-gray-400">· {inq.seats} seats</span>}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-600">{inq.branch}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {inq.date}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[inq.status]}`}>
                                                {inq.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </section>

            {/* ── Drill-Down Modal ── */}
            {activeCard && <DrillDownModal id={activeCard} onClose={() => setActiveCard(null)} />}
        </>
    );
}