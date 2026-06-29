"use client";

import { useState } from "react";
import {
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    X,
    Search,
    Clock,
    Mail,
    Phone,
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

/* Mock Data */

const monthlyRegistrations = [
    { month: "Jan", users: 28 },
    { month: "Feb", users: 34 },
    { month: "Mar", users: 29 },
    { month: "Apr", users: 38 },
    { month: "May", users: 42 },
    { month: "Jun", users: 47 },
];

const usersByRole = [
    { name: "Regular Users", value: 232, color: "#0D47A1" },
    { name: "Admins", value: 18, color: "#FFC107" },
];

const monthlyActive = [
    { month: "Jan", active: 140 },
    { month: "Feb", active: 155 },
    { month: "Mar", active: 162 },
    { month: "Apr", active: 170 },
    { month: "May", active: 188 },
    { month: "Jun", active: 210 },
];

const recentUsers = [
    { id: "USR-001", name: "Takashi Yamamoto", email: "t.yamamoto@technosoft.ph", phone: "+63 917 123 4567", role: "user", status: "Verified", joined: "Jun 24, 2026" },
    { id: "USR-002", name: "Maria Santos", email: "maria.santos@quantum.com", phone: "+63 918 234 5678", role: "user", status: "Unverified", joined: "Jun 23, 2026" },
    { id: "USR-003", name: "James Reyes", email: "james.reyes@panislands.com", phone: "+63 919 345 6789", role: "admin", status: "Verified", joined: "Jun 23, 2026" },
    { id: "USR-004", name: "Lovely Cruz", email: "lovely.cruz@bpo.com", phone: "+63 920 456 7890", role: "user", status: "Verified", joined: "Jun 22, 2026" },
    { id: "USR-005", name: "Bethany Callora", email: "b.callora@starfield.com", phone: "+63 921 567 8901", role: "user", status: "Unverified", joined: "Jun 21, 2026" },
    { id: "USR-006", name: "Kenji Nakamura", email: "k.nakamura@imo.ph", phone: "+63 922 678 9012", role: "admin", status: "Verified", joined: "Jun 20, 2026" },
    { id: "USR-007", name: "Ana Gonzales", email: "ana.gonzales@lizlisa.ph", phone: "+63 923 789 0123", role: "user", status: "Verified", joined: "Jun 19, 2026" },
];

/* Drill-Down Data */

type StatKey = "total" | "verified" | "unverified" | "admins";

const drillDownData: Record<StatKey, { title: string; items: { label: string; value: string; sub?: string }[] }> = {
    total: {
        title: "Total Users Breakdown",
        items: [
            { label: "Regular Users", value: "232", sub: "92.8% of total" },
            { label: "Admins", value: "18", sub: "7.2% of total" },
            { label: "Verified Accounts", value: "198", sub: "79.2% of total" },
            { label: "Unverified Accounts", value: "52", sub: "20.8% of total" },
            { label: "New this month", value: "47", sub: "vs 42 last month ↑" },
            { label: "Avg. join rate", value: "36/mo", sub: "6-month average" },
        ],
    },
    verified: {
        title: "Verified Users",
        items: [
            { label: "Email Verified", value: "198", sub: "79.2% of total users" },
            { label: "Verified Admins", value: "16", sub: "88.9% of admins" },
            { label: "Verified Regular", value: "182", sub: "78.4% of regulars" },
            { label: "Verified this month", value: "34", sub: "vs 28 last month ↑" },
            { label: "Avg. time to verify", value: "2.1 hrs", sub: "After registration" },
            { label: "Verification rate", value: "79.2%", sub: "Target: >85%" },
        ],
    },
    unverified: {
        title: "Unverified Users",
        items: [
            { label: "Pending Verification", value: "52", sub: "20.8% of total" },
            { label: "Reminder sent", value: "38", sub: "73.1% of unverified" },
            { label: "No reminder yet", value: "14", sub: "26.9% of unverified" },
            { label: "Oldest pending", value: "14 days", sub: "Registered Jun 12" },
            { label: "Avg. pending time", value: "4.7 days", sub: "Across unverified" },
            { label: "At risk of churn", value: "9", sub: "Pending > 7 days" },
        ],
    },
    admins: {
        title: "Admin Users",
        items: [
            { label: "Total Admins", value: "18", sub: "7.2% of all users" },
            { label: "Verified Admins", value: "16", sub: "88.9% of admins" },
            { label: "Active this month", value: "15", sub: "83.3% active rate" },
            { label: "Assigned roles", value: "3", sub: "Super, Editor, Viewer" },
            { label: "Last admin added", value: "Jun 23", sub: "James Reyes" },
            { label: "Admin growth", value: "+2", sub: "vs last month" },
        ],
    },
};

/* Stat Card */

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
    const iconBg = color === "bg-[#FFC107]" ? "#FFF8E1" : "#EEF2FB";
    const iconColor = color === "bg-[#FFC107]" ? "#F57F17" : "#0D47A1";

    return (
        <button
            onClick={() => onClick(id)}
            className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-200 text-left w-full border border-transparent hover:border-[#C5D2EC] relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: iconBg }}
                >
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
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

/* Drill-Down Modal */

function DrillDownModal({ id, onClose }: { id: StatKey; onClose: () => void }) {
    const data = drillDownData[id];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#0D47A1]">
                    <h3 className="text-base font-bold text-white">{data.title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
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
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* Status & Role Badges */

const statusStyles: Record<string, string> = {
    Verified: "bg-green-50 text-green-700",
    Unverified: "bg-yellow-50 text-yellow-700",
};

const roleStyles: Record<string, string> = {
    admin: "bg-blue-50 text-blue-700",
    user: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
    const [activeCard, setActiveCard] = useState<StatKey | null>(null);
    const [search, setSearch] = useState("");

    const stats = [
        { id: "total" as StatKey, icon: Users, label: "Total Users", value: "250", trend: "+12.5% vs last month", trendUp: true, color: "bg-[#0D47A1]" },
        { id: "verified" as StatKey, icon: UserCheck, label: "Verified", value: "198", trend: "+8.7% vs last month", trendUp: true, color: "bg-[#0D47A1]" },
        { id: "unverified" as StatKey, icon: UserX, label: "Unverified", value: "52", trend: "-3.7% vs last month", trendUp: false, color: "bg-[#0D47A1]" },
        { id: "admins" as StatKey, icon: ShieldCheck, label: "Admins", value: "18", trend: "+2 this month", trendUp: true, color: "bg-[#FFC107]" },
    ];

    const filtered = recentUsers.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

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

                    {/* Registration trend */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">New Registrations</h3>
                                <p className="text-xs text-gray-400">Jan – Jun 2026</p>
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 11.9%</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={monthlyRegistrations} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="users" stroke="#0D47A1" strokeWidth={2.5} fill="url(#regGrad)" dot={{ r: 3, fill: "#0D47A1" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Users by role pie */}
                    <div className="bg-white rounded-2xl shadow p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Users by Role</h3>
                            <p className="text-xs text-gray-400">Current distribution</p>
                        </div>
                        <ResponsiveContainer width="100%" height={140}>
                            <PieChart>
                                <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                                    {usersByRole.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-2">
                            {usersByRole.map((item) => (
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

                {/* ── Active Users Bar Chart ── */}
                <div className="bg-white rounded-2xl shadow p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Monthly Active Users</h3>
                            <p className="text-xs text-gray-400">Jan – Jun 2026</p>
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 11.7%</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={monthlyActive} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                                labelStyle={{ fontWeight: 700, color: "#0D47A1" }}
                            />
                            <Bar dataKey="active" fill="#0D47A1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ── Recent Users Table ── */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-100 gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Recent Users</h3>
                            <p className="text-xs text-gray-400">Latest 7 registrations</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search name or email…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#0D47A1] w-56 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 text-xs font-mono text-gray-400">{user.id}</td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-semibold text-gray-800 text-xs">{user.name}</p>
                                            <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="flex items-center gap-1 text-xs text-gray-600">
                                                <Phone className="w-3 h-3 text-[#0D47A1]" />
                                                {user.phone}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleStyles[user.role]}`}>
                                                {user.role === "admin" ? "Admin" : "User"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {user.joined}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[user.status]}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                                            No users match your search.
                                        </td>
                                    </tr>
                                )}
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