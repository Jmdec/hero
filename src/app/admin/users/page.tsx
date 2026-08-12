"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/Toast";
import {
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    X,
    Search,
    Clock,
    Mail,
    Phone,
    AlertCircle,
    AlertTriangle,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    Loader2,
    Tag,
    ChevronRight,
} from "lucide-react";

type StatKey = "total" | "verified" | "unverified" | "admins";

type Role = "admin" | "user";

interface UserRecord {
    id: string | number;
    name?: string;
    email?: string;
    phone?: string;
    role?: Role;
    email_verified?: boolean;
    created_at?: string;
}

type StatTone = "neutral" | "amber" | "green" | "red";

const STAT_TONE_STYLES: Record<StatTone, { bg: string; text: string }> = {
    neutral: { bg: "bg-[#F0F4FB]", text: "text-[#1B3A8C]" },
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    green: { bg: "bg-green-50", text: "text-green-700" },
    red: { bg: "bg-red-50", text: "text-red-600" },
};

type StatCardProps = {
    icon: React.ElementType;
    label: string;
    value: string;
    supporting?: string;
    trend?: string;
    tone?: StatTone;
};

function UserStatCard({ icon: Icon, label, value, supporting, trend, tone = "neutral" }: StatCardProps) {
    const t = STAT_TONE_STYLES[tone];
    const trendTone = trend?.startsWith("+")
        ? "text-green-600"
        : trend?.startsWith("-")
            ? "text-red-600"
            : "text-slate-500";

    return (
        <article className="relative overflow-hidden bg-white p-6 rounded-2xl shadow text-left w-full border border-transparent">
            <div className={`absolute top-0 left-0 w-1 h-full ${tone === "amber" ? "bg-amber-500" : tone === "green" ? "bg-green-500" : tone === "red" ? "bg-red-500" : "bg-[#0D47A1]"}`} />
            <div className="flex items-start justify-between mb-4">
                <p className="text-md text-gray-500 font-semibold mb-1">{label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trend ? <p className={`text-xs font-semibold ${trendTone}`}>{trend}</p> : null}
        </article>
    );
}

function AdministratorBreakdownCard({
    value,
    onClick,
}: {
    value: string;
    onClick: () => void;
}) {
    const t = STAT_TONE_STYLES.amber;

    return (
        <button
            onClick={onClick}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-200 text-left w-full border border-transparent hover:border-[#C5D2EC]"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.bg}`}>
                    <ShieldCheck className={`w-5 h-5 ${t.text}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D47A1] transition-colors" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Administrators</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            <p className="text-xs font-semibold text-[#0D47A1]">View Administrators →</p>
        </button>
    );
}

function StatCardSkeleton() {
    return (
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow text-left w-full border border-transparent animate-pulse">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
            <div className="h-4 w-28 rounded bg-slate-200 mb-3" />
            <div className="h-9 w-20 rounded bg-slate-200 mb-3" />
            <div className="h-3 w-26 rounded bg-slate-200" />
        </div>
    );
}

function UserStatsSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </>
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

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    role: "user" as Role,
};

type ConfirmState = {
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: "danger" | "primary";
    onConfirm: () => void | Promise<void>;
};

// Shared modal wrapper: clicking the dark backdrop cancels/closes,
// clicking inside the panel does not (stopPropagation).
function ModalBackdrop({
    onClose,
    children,
}: {
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
                {children}
            </div>
        </div>
    );
}

export default function UsersPage() {
    const { showToast } = useToast();
    const [adminBreakdownOpen, setAdminBreakdownOpen] = useState(false);
    const [adminBreakdownLoading, setAdminBreakdownLoading] = useState(false);
    const [adminBreakdownError, setAdminBreakdownError] = useState<string | null>(null);
    const [adminUsers, setAdminUsers] = useState<UserRecord[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        admins: 0,
    });

    // View dialog
    const [viewTarget, setViewTarget] = useState<UserRecord | null>(null);
    const [viewOpen, setViewOpen] = useState(false);

    // Edit dialog
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<UserRecord | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Shared confirmation modal
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

    function authHeaders(json = false) {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
        return {
            Authorization: `Bearer ${token}`,
            ...(json ? { "Content-Type": "application/json" } : {}),
        };
    }

    function requestConfirmation(next: ConfirmState) {
        setConfirmState(next);
    }

    function getTrendText(current: number, previous: number) {
        const delta = current - previous;
        if (delta === 0) return "No change";
        return `${delta > 0 ? "+" : ""}${delta} vs last month`;
    }

    async function handleConfirmAction() {
        if (!confirmState) return;
        setConfirmState(null);
        await confirmState.onConfirm();
    }

    const fetchUsers = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            setError(null);
            const res = await fetch("/api/users", { cache: "no-store", headers: authHeaders() });

            if (!res.ok) {
                throw new Error(`Failed to load users (status ${res.status})`);
            }

            const data = await res.json();
            const userList: UserRecord[] = data.data ?? data ?? [];

            setUsers(Array.isArray(userList) ? userList : []);

            const total = userList.length;
            const verified = userList.filter((u) => u.email_verified).length;
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
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const monthlyUserTrend = useMemo(() => {
        const now = new Date();
        const thisMonth = users.filter((u) => {
            if (!u.created_at) return false;
            const d = new Date(u.created_at);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        }).length;

        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = users.filter((u) => {
            if (!u.created_at) return false;
            const d = new Date(u.created_at);
            return d.getFullYear() === prevDate.getFullYear() && d.getMonth() === prevDate.getMonth();
        }).length;

        return {
            current: thisMonth,
            previous: prevMonth,
            trend: getTrendText(thisMonth, prevMonth),
        };
    }, [users]);

    const statCards: StatCardProps[] = [
        {
            icon: Users,
            label: "Total Users",
            value: stats.total.toString(),
            tone: "neutral",
            trend: monthlyUserTrend.trend,
            supporting: `This month: ${monthlyUserTrend.current}`,
        },
        {
            icon: UserCheck,
            label: "Verified Users",
            value: stats.verified.toString(),
            tone: "green",
            supporting: `${stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% of total`,
        },
        {
            icon: UserX,
            label: "Pending Verification",
            value: stats.unverified.toString(),
            tone: "red",
            supporting: `${stats.total > 0 ? Math.round((stats.unverified / stats.total) * 100) : 0}% of total`,
        },
    ];

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        const matchesSearch =
            (u.name?.toLowerCase() || "").includes(q) ||
            (u.email?.toLowerCase() || "").includes(q) ||
            (u.phone?.toLowerCase() || "").includes(q);
        const matchesRole = roleFilter === "all" || (u.role ?? "user") === roleFilter;
        return matchesSearch && matchesRole;
    });

    const loadAdminBreakdown = useCallback(async () => {
        setAdminBreakdownLoading(true);
        setAdminBreakdownError(null);

        try {
            const res = await fetch("/api/users", { cache: "no-store", headers: authHeaders() });
            if (res.status === 401 || res.status === 403) {
                throw new Error("You are not authorized to view administrator data.");
            }
            if (!res.ok) throw new Error(`Failed to load administrators (status ${res.status})`);

            const data = await res.json();
            const list: UserRecord[] = data.data ?? data ?? [];
            setAdminUsers((Array.isArray(list) ? list : []).filter((u) => (u.role ?? "user") === "admin"));
        } catch (err) {
            setAdminUsers([]);
            setAdminBreakdownError(err instanceof Error ? err.message : "Could not load administrators.");
        } finally {
            setAdminBreakdownLoading(false);
        }
    }, []);

    async function openAdminBreakdown() {
        setAdminBreakdownOpen(true);
        await loadAdminBreakdown();
    }

    /* ── View ── */
    function openView(u: UserRecord) {
        setViewTarget(u);
        setViewOpen(true);
    }

    function closeView() {
        setViewOpen(false);
        setViewTarget(null);
    }

    /* ── Edit ── */
    function openEdit(u: UserRecord) {
        setEditing(u);
        setForm({
            name: u.name ?? "",
            email: u.email ?? "",
            phone: u.phone ?? "",
            role: u.role ?? "user",
        });
        setFormErrors({});
        setFormOpen(true);
    }

    function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    // FIX: partial edits (name/email/phone/role only — no password, no
    // verification state) now go through PATCH instead of PUT. The users
    // API's PUT route expects the full resource; sending this trimmed
    // payload via PUT was overwriting fields like email_verified and
    // created_at with defaults/null every time an admin edited a user.
    // PATCH updates only the fields included in the body.
    async function submitEdit() {
        if (!editing) return;

        setConfirmState(null);
        setSaving(true);
        setFormErrors({});

        try {
            const res = await fetch(`/api/users/${editing.id}`, {
                method: "PATCH",
                headers: authHeaders(true),
                body: JSON.stringify(form),
            });

            if (res.status === 422) {
                const data = await res.json();
                setFormErrors(
                    Object.fromEntries(
                        Object.entries(data.errors ?? {}).map(([k, v]) => [
                            k,
                            Array.isArray(v) ? (v[0] as string) : String(v),
                        ]),
                    ),
                );
                return;
            }

            if (!res.ok) throw new Error(`Request failed (${res.status})`);

            const saved: UserRecord = await res.json();

            setUsers((prev) => prev.map((u) => (u.id === saved.id ? { ...u, ...saved } : u)));
            setFormOpen(false);
            setEditing(null);
            showToast("User updated successfully.", "success");
            fetchUsers(true);
        } catch {
            setFormErrors({ general: "Something went wrong. Please try again." });
            showToast("Could not update user. Please try again.", "error");
        } finally {
            setSaving(false);
        }
    }

    function confirmSubmitEdit() {
        requestConfirmation({
            title: "Save changes to this user?",
            description: `Update details for "${editing?.name || editing?.email || "this user"}"?`,
            confirmLabel: "Save Changes",
            confirmVariant: "primary",
            onConfirm: submitEdit,
        });
    }

    /* ── Delete ── */
    function openDeleteDialog(u: UserRecord) {
        setDeleteTarget(u);
        requestConfirmation({
            title: "Delete this user?",
            description: `"${u.name || u.email || "This user"}" will be permanently removed. This action cannot be undone.`,
            confirmLabel: "Delete",
            confirmVariant: "danger",
            onConfirm: () => confirmDelete(u),
        });
    }

    async function confirmDelete(target: UserRecord | null = deleteTarget) {
        if (!target) return;

        setConfirmState(null);
        setDeleting(true);

        try {
            const res = await fetch(`/api/users/${target.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            if (!res.ok) throw new Error(`Request failed (${res.status})`);

            setUsers((prev) => prev.filter((u) => u.id !== target.id));
            setDeleteTarget(null);
            showToast("User deleted.", "success");
            fetchUsers(true);
        } catch {
            showToast("Could not delete user. Please try again.", "error");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <main className="min-h-screen">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {loading ? (
                        <UserStatsSkeleton />
                    ) : (
                        <>
                            {statCards.map((s) => (
                                <UserStatCard key={s.label} {...s} />
                            ))}
                            <AdministratorBreakdownCard value={stats.admins.toString()} onClick={() => { void openAdminBreakdown(); }} />
                        </>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or phone…"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D9E2F0] rounded-xl text-sm text-[#0B1F4A] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C]"
                        />
                    </div>

                    {/* Role filter dropdown */}
                    <div className="relative w-full lg:w-56 shrink-0">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-[#D9E2F0] rounded-xl text-sm font-medium text-[#0B1F4A] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] cursor-pointer"
                        >
                            <option value="all">All roles</option>
                            <option value="admin">Admins</option>
                            <option value="user">Users</option>
                        </select>
                    </div>

                    <button
                        onClick={() => fetchUsers(true)}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D9E2F0] rounded-xl text-sm font-semibold text-[#0B1F4A] hover:border-[#1B3A8C] hover:text-[#1B3A8C] transition disabled:opacity-50 shrink-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* User Overview Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="px-5 py-8 text-center text-xs text-gray-400">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#0D47A1] border-t-transparent rounded-full animate-spin" />
                                Loading users...
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="px-5 py-8 text-center text-xs text-gray-400">
                            {search || roleFilter !== "all" ? "No users match your filters." : "No users found."}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 p-4 lg:hidden">
                                {filtered.map((user) => (
                                    <article key={user.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-800">{user.name || "Unknown"}</p>
                                                <p className="mt-0.5 truncate text-xs text-gray-500">{user.email || "—"}</p>
                                            </div>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[user.email_verified ? "Verified" : "Unverified"]}`}>
                                                {user.email_verified ? "Verified" : "Unverified"}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-gray-500">
                                            <p>
                                                <span className="font-semibold text-gray-700">Role:</span> {user.role === "admin" ? "Admin" : "User"}
                                            </p>
                                            <p>
                                                <span className="font-semibold text-gray-700">Phone:</span> {user.phone || "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold text-gray-700">Joined:</span>{" "}
                                                {user.created_at
                                                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openView(user)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                title="View"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEdit(user)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteDialog(user)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-50 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                        <tr>
                                            <th className="px-5 py-3 text-left">User</th>
                                            <th className="px-5 py-3 text-left">Role</th>
                                            <th className="px-5 py-3 text-left">Joined</th>
                                            <th className="px-5 py-3 text-left">Status</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map((user) => (
                                            <tr
                                                key={user.id}
                                                onClick={() => openView(user)}
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <p className="font-semibold text-gray-800 text-sm">{user.name || "Unknown"}</p>
                                                    <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {user.email || "—"} | <Phone className="w-3 h-3" /> {user.phone || "—"}
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
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[user.email_verified ? "Verified" : "Unverified"]}`}>
                                                        {user.email_verified ? "Verified" : "Unverified"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openView(user);
                                                            }}
                                                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEdit(user);
                                                            }}
                                                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteDialog(user);
                                                            }}
                                                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Administrator Breakdown Modal */}
            {adminBreakdownOpen && (
                <ModalBackdrop onClose={() => setAdminBreakdownOpen(false)}>
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Administrator Breakdown</h2>
                                <p className="text-xs text-slate-400">Total administrators: {adminUsers.length}</p>
                            </div>
                            <button
                                onClick={() => setAdminBreakdownOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                            {adminBreakdownLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="animate-pulse rounded-xl border border-slate-100 p-4">
                                            <div className="h-4 w-36 rounded bg-slate-200 mb-2" />
                                            <div className="h-3 w-56 rounded bg-slate-200" />
                                        </div>
                                    ))}
                                </div>
                            ) : adminBreakdownError ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {adminBreakdownError}
                                </div>
                            ) : adminUsers.length === 0 ? (
                                <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                                    No administrators found.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-left">
                                            <tr>
                                                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                                                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {adminUsers.map((admin) => (
                                                <tr key={String(admin.id)}>
                                                    <td className="px-4 py-3 text-slate-800">{admin.name || "Unknown"}</td>
                                                    <td className="px-4 py-3 text-slate-600">{admin.email || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalBackdrop>
            )}

            {/* ── View Dialog (read-only user details) ── */}
            {viewOpen && viewTarget && (
                <ModalBackdrop onClose={closeView}>
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">User details</h2>
                            <button
                                onClick={closeView}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 px-6 py-5">
                            <div className="rounded-lg bg-slate-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleStyles[viewTarget.role ?? "user"]}`}>
                                        <Tag className="h-3 w-3" />
                                        {viewTarget.role === "admin" ? "Admin" : "User"}
                                    </span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[viewTarget.email_verified ? "Verified" : "Unverified"]}`}>
                                        {viewTarget.email_verified ? "Verified" : "Unverified"}
                                    </span>
                                </div>
                                <p className="text-base font-semibold text-slate-900">
                                    {viewTarget.name || "Unknown"}
                                </p>
                            </div>

                            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                        <Mail className="h-3 w-3" /> Email
                                    </dt>
                                    <dd className="mt-0.5 truncate text-sm text-slate-700">
                                        {viewTarget.email || "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                        <Phone className="h-3 w-3" /> Phone
                                    </dt>
                                    <dd className="mt-0.5 text-sm text-slate-700">
                                        {viewTarget.phone || "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                        <Clock className="h-3 w-3" /> Joined
                                    </dt>
                                    <dd className="mt-0.5 text-sm text-slate-700">
                                        {viewTarget.created_at
                                            ? new Date(viewTarget.created_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-400">ID</dt>
                                    <dd className="mt-0.5 font-mono text-sm text-slate-700">{viewTarget.id}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                            <button
                                onClick={closeView}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    closeView();
                                    openEdit(viewTarget);
                                }}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </button>
                        </div>
                    </div>
                </ModalBackdrop>
            )}

            {/* ── Edit Dialog ── */}
            {formOpen && (
                <ModalBackdrop onClose={() => setFormOpen(false)}>
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">Edit User</h2>
                            <button
                                onClick={() => setFormOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            {formErrors.general && (
                                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {formErrors.general}
                                </p>
                            )}

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Name
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Full name"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Phone
                                </label>
                                <input
                                    value={form.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    placeholder="Phone number"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                                {formErrors.phone && (
                                    <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Role
                                </label>
                                <div className="flex gap-2">
                                    {(["user", "admin"] as Role[]).map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => updateField("role", opt)}
                                            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${form.role === opt
                                                ? "border-blue-400 bg-blue-50 text-blue-700"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {formErrors.role && (
                                    <p className="mt-1 text-xs text-red-600">{formErrors.role}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                            <button
                                onClick={() => setFormOpen(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSubmitEdit}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </ModalBackdrop>
            )}

            {/* ── Confirmation Modal (delete + edit save) ── */}
            {confirmState && (
                <ModalBackdrop onClose={() => setConfirmState(null)}>
                    <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
                        <div className="px-6 py-5">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${confirmState.confirmVariant === "danger" ? "bg-red-100" : "bg-blue-100"
                                        }`}
                                >
                                    <AlertTriangle
                                        className={`h-5 w-5 ${confirmState.confirmVariant === "danger" ? "text-red-600" : "text-blue-600"
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        {confirmState.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {confirmState.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                            <button
                                onClick={() => setConfirmState(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                disabled={deleting || saving}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${confirmState.confirmVariant === "danger"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {(deleting || saving) && <Loader2 className="h-4 w-4 animate-spin" />}
                                {confirmState.confirmLabel}
                            </button>
                        </div>
                    </div>
                </ModalBackdrop>
            )}
        </main>
    );
}