"use client";

import { useState, useEffect } from "react";
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
    AlertCircle,
} from "lucide-react";

type StatKey = "total" | "verified" | "unverified" | "admins";

type Role = "admin" | "user";

interface UserRecord {
    id: string | number;
    name?: string;
    email?: string;
    phone?: string;
    role?: Role;
    email_verified_at?: string | null;
    created_at?: string;
}

/* Drill-Down Data */

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

function StatCard({
    id,
    icon: Icon,
    label,
    value,
    trend,
    trendUp,
    color,
    onClick,
}: StatCardProps) {
    return (
        <button
            onClick={() => onClick(id)}
            className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 hover:border-[#0D47A1]/30 shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-left"
        >
            {/* Background Accent */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#0D47A1]/5 via-transparent to-[#FFC107]/10" />

            <div className="relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between">

                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color === "bg-[#FFC107]"
                                ? "bg-[#FFF8E1]"
                                : "bg-[#EEF4FF]"
                            }`}
                    >
                        <Icon
                            className={`w-7 h-7 ${color === "bg-[#FFC107]"
                                    ? "text-[#FFC107]"
                                    : "text-[#0D47A1]"
                                }`}
                        />
                    </div>

                    <div
                        className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? "text-emerald-600" : "text-red-500"
                            }`}
                    >
                        {trendUp ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}

                        {trend}
                    </div>
                </div>

                {/* Value */}

                <div className="mt-8">

                    <p className="text-sm text-slate-500 mb-1">
                        {label}
                    </p>

                    <h2 className="text-4xl font-bold text-slate-900">
                        {value}
                    </h2>
                </div>
            </div>
        </button>
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        admins: 0,
    });

    // Fetch users data + derive stats
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/users");

                if (!res.ok) {
                    throw new Error(`Failed to load users (status ${res.status})`);
                }

                const data = await res.json();
                const userList: UserRecord[] = data.data ?? data ?? [];

                setUsers(Array.isArray(userList) ? userList : []);

                const total = userList.length;
                const verified = userList.filter((u) => !!u.email_verified_at).length;
                const unverified = total - verified;
                const admins = userList.filter((u) => u.role === "admin").length;

                setStats({ total, verified, unverified, admins });
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err instanceof Error ? err.message : "Failed to load users");
                setUsers([]);
                setStats({ total: 0, verified: 0, unverified: 0, admins: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const statCards = [
        {
            id: "total" as StatKey,
            icon: Users,
            label: "Total Users",
            value: stats.total.toString(),
            trend: `${stats.total} registered`,
            trendUp: true,
            color: "bg-[#0D47A1]",
        },
        {
            id: "verified" as StatKey,
            icon: UserCheck,
            label: "Verified Users",
            value: stats.verified.toString(),
            trend: `${Math.round(
                (stats.verified / Math.max(stats.total, 1)) * 100
            )}% verified`,
            trendUp: true,
            color: "bg-[#0D47A1]",
        },
        {
            id: "unverified" as StatKey,
            icon: UserX,
            label: "Pending Verification",
            value: stats.unverified.toString(),
            trend: "Needs attention",
            trendUp: false,
            color: "bg-[#0D47A1]",
        },
        {
            id: "admins" as StatKey,
            icon: ShieldCheck,
            label: "Administrators",
            value: stats.admins.toString(),
            trend: "Access management",
            trendUp: true,
            color: "bg-[#FFC107]",
        },
    ];

    const filtered = users.filter(
        (u) =>
            (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (u.email?.toLowerCase() || "").includes(search.toLowerCase())
    );

    return (
        <>
            <section className="p-4 space-y-8">

                {/* ── Error States ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-900">{error}</p>
                            <p className="text-xs text-red-700 mt-1">Please check your connection and try again.</p>
                        </div>
                    </div>
                )}

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {statCards.map((s) => (
                        <StatCard key={s.id} {...s} onClick={setActiveCard} />
                    ))}
                </div>

                {/* ── User Overview Table ── */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-100 gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">User Overview</h3>
                            {/* User Count and Add a Pagination */}
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-[#0D47A1] border-t-transparent rounded-full animate-spin" />
                                                Loading users...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                                            {search ? "No users match your search." : "No users found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 text-xs font-mono text-gray-400">
                                                {user.id ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-gray-800 text-xs">{user.name || "Unknown"}</p>
                                                <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email || "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-1 text-xs text-gray-600">
                                                    <Phone className="w-3 h-3 text-[#0D47A1]" />
                                                    {user.phone || "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleStyles[user.role ?? "user"] || roleStyles.user}`}>
                                                    {user.role === "admin" ? "Admin" : "User"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {user.created_at
                                                        ? new Date(user.created_at).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric"
                                                        })
                                                        : "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[user.email_verified_at ? "Verified" : "Unverified"]}`}>
                                                    {user.email_verified_at ? "Verified" : "Unverified"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </>
    );
}