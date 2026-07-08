"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
    Search,
    RefreshCw,
    X,
    Mail,
    Phone,
    Building2,
    Calendar,
    Clock,
    Users,
    Banknote,
    Trash2,
    Eye,
    AlertCircle,
    Inbox,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Receipt,
    Hash,
    Sparkles,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Status =
    | "pending"
    | "awaiting_payment"
    | "payment_verification"
    | "paid"
    | "contract_sent"
    | "completed"
    | "cancelled";

interface QuotationDetail {
    full_name: string;
    company_name: string | null;
    email: string;
    phone: string;
    request: string | null;
    seats: number | null;
    date: string;
    time: string | null;
    duration: number | null;
    duration_type: string | null;
    other_requirements: string | null;
    total: string | number;
    payment_method: "paymongo" | "gcash";
    transaction_id: string | null;
    receipt: string | null;
}

interface Quotation {
    id: number;
    quotation_id: string;
    service_id: number;
    service_name: string;
    lease_term: string | null;
    package: string | null;
    event_type: string | null;
    status: Status;
    paid_at: string | null;
    created_at: string;
    detail: QuotationDetail | null;
    service?: { id: number; name: string };
}

const STATUSES: { value: Status; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "awaiting_payment", label: "Awaiting Payment" },
    { value: "payment_verification", label: "Payment Verification" },
    { value: "paid", label: "Paid" },
    { value: "contract_sent", label: "Contract Sent" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<Status, string> = {
    pending: "bg-[#F0F4FB] text-[#64748B] border-[#D9E2F0]",
    awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
    payment_verification: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    contract_sent: "bg-[#EEF2FB] text-[#1B3A8C] border-[#C5D2EC]",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_DOT: Record<Status, string> = {
    pending: "bg-[#94A3B8]",
    awaiting_payment: "bg-amber-500",
    payment_verification: "bg-amber-500",
    paid: "bg-green-500",
    contract_sent: "bg-[#1B3A8C]",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
};

function StatusBadge({ status }: { status: Status }) {
    const label = STATUSES.find((s) => s.value === status)?.label ?? status;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status]}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {label}
        </span>
    );
}

function formatCurrency(value: string | number) {
    const n = Number(value);
    if (Number.isNaN(n)) return "—";
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
}

function formatDate(value: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

function getInitials(name: string | null | undefined) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last).toUpperCase() || "?";
}

// Toast

type ToastTone = "success" | "error";

interface ToastItem {
    id: number;
    message: string;
    tone: ToastTone;
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${t.tone === "success"
                        ? "bg-white border-green-200"
                        : "bg-white border-red-200"
                        }`}
                >
                    {t.tone === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-[#0B1F4A] flex-1 leading-snug">{t.message}</p>
                    <button
                        onClick={() => onDismiss(t.id)}
                        className="text-[#64748B] hover:text-[#0B1F4A] transition shrink-0"
                        aria-label="Dismiss notification"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// Stats

type StatTone = "neutral" | "amber" | "green" | "red";

const STAT_TONE_STYLES: Record<StatTone, { bg: string; text: string }> = {
    neutral: { bg: "bg-[#F0F4FB]", text: "text-[#1B3A8C]" },
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    green: { bg: "bg-green-50", text: "text-green-700" },
    red: { bg: "bg-red-50", text: "text-red-600" },
};

function StatCard({
    label,
    value,
    icon: Icon,
    tone = "neutral",
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: StatTone;
}) {
    const t = STAT_TONE_STYLES[tone];
    return (
        <div className="bg-white border border-[#D9E2F0] rounded-2xl p-5 shadow-[0_4px_24px_rgba(11,31,74,0.04)] flex items-center gap-4">
            <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${t.bg}`}>
                <Icon className={`w-5 h-5 ${t.text}`} />
            </span>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-[#0B1F4A] leading-none truncate">{value}</p>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mt-1.5">{label}</p>
            </div>
        </div>
    );
}

// Small reusable pieces for the detail drawer

function SectionCard({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-[#D9E2F0] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F0F4FB] bg-[#F8FAFD]">
                <Icon className="w-3.5 h-3.5 text-[#1B3A8C]" />
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#0B1F4A]/50">{title}</p>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    href,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: React.ReactNode;
    href?: string;
}) {
    const content = (
        <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#F0F4FB] flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-[#1B3A8C]" />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">{label}</p>
                <p className="text-sm font-medium text-[#0B1F4A] break-words">{value}</p>
            </div>
        </div>
    );
    if (href) {
        return (
            <a href={href} className="block hover:opacity-70 transition">
                {content}
            </a>
        );
    }
    return content;
}

// Page

export default function AdminQuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
    const [selected, setSelected] = useState<Quotation | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [statusChangeTarget, setStatusChangeTarget] = useState<{ quote: Quotation; newStatus: Status } | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const toastIdRef = useRef(0);

    const pushToast = useCallback((message: string, tone: ToastTone) => {
        const id = ++toastIdRef.current;
        setToasts((t) => [...t, { id, message, tone }]);
        setTimeout(() => {
            setToasts((t) => t.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const dismissToast = (id: number) => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
    };

    const fetchQuotations = useCallback(async (background = false) => {
        background ? setRefreshing(true) : setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/quotations", { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to load quotations (status ${res.status}).`);
            const data = await res.json();
            setQuotations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load quotations.");
        } finally {
            background ? setRefreshing(false) : setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return quotations.filter((quote) => {
            const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
            if (!matchesStatus) return false;
            if (!q) return true;
            const haystack = [
                quote.quotation_id,
                quote.service_name,
                quote.detail?.full_name,
                quote.detail?.company_name,
                quote.detail?.email,
                quote.detail?.phone,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [quotations, query, statusFilter]);

    const counts = useMemo(() => {
        const c: Record<Status | "all", number> = {
            all: quotations.length,
            pending: 0,
            awaiting_payment: 0,
            payment_verification: 0,
            paid: 0,
            contract_sent: 0,
            completed: 0,
            cancelled: 0,
        };
        quotations.forEach((q) => { c[q.status] += 1; });
        return c;
    }, [quotations]);

    const needsAttention = counts.pending + counts.awaiting_payment + counts.payment_verification;

    const paidRevenue = useMemo(() => {
        return quotations
            .filter((q) => q.status === "paid" || q.status === "completed")
            .reduce((sum, q) => sum + (q.detail ? Number(q.detail.total) || 0 : 0), 0);
    }, [quotations]);

    const handleStatusUpdate = async (quote: Quotation, status: Status) => {
        const previousStatus = quote.status;
        const statusLabel = STATUSES.find((s) => s.value === status)?.label ?? status;

        // Skip no-op updates
        if (previousStatus === status) return;

        const previous = quotations;
        setQuotations((qs) => qs.map((q) => (q.id === quote.id ? { ...q, status } : q)));
        setSelected((s) => (s && s.id === quote.id ? { ...s, status } : s));
        try {
            const res = await fetch(`/api/quotations/${quote.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    service_id: quote.service_id,
                    service_name: quote.service_name,
                    lease_term: quote.lease_term,
                    package: quote.package,
                    event_type: quote.event_type,
                    status,
                    detail: quote.detail,
                }),
            });
            if (!res.ok) throw new Error("Failed to update status.");
            pushToast(`${quote.quotation_id} updated to "${statusLabel}"`, "success");
        } catch {
            setQuotations(previous);
            setError("Couldn't update the status. Please try again.");
            pushToast(`Couldn't update ${quote.quotation_id} to "${statusLabel}"`, "error");
        }
    };

    const confirmStatusChange = async () => {
        if (!statusChangeTarget) return;
        const { quote, newStatus } = statusChangeTarget;
        setUpdatingStatus(true);
        try {
            await handleStatusUpdate(quote, newStatus);
        } finally {
            setUpdatingStatus(false);
            setStatusChangeTarget(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const quote = deleteTarget;
        const previous = quotations;
        setDeleting(true);
        try {
            const res = await fetch(`/api/quotations/${quote.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete quotation.");
            setQuotations((qs) => qs.filter((q) => q.id !== quote.id));
            setSelected((s) => (s && s.id === quote.id ? null : s));
            pushToast(`${quote.quotation_id} deleted`, "success");
            setDeleteTarget(null);
        } catch {
            setQuotations(previous);
            setError("Couldn't delete the quotation. Please try again.");
            pushToast(`Couldn't delete ${quote.quotation_id}`, "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total requests" value={String(counts.all)} icon={Inbox} tone="neutral" />
                    <StatCard label="Needs attention" value={String(needsAttention)} icon={AlertCircle} tone="amber" />
                    <StatCard label="Paid revenue" value={formatCurrency(paidRevenue)} icon={Banknote} tone="green" />
                    <StatCard label="Cancelled" value={String(counts.cancelled)} icon={XCircle} tone="red" />
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-[#FFF5F5] px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by quotation ID, name, email, phone…"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D9E2F0] rounded-xl text-sm text-[#0B1F4A] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C]"
                        />
                    </div>

                    {/* Status filter dropdown */}
                    <div className="relative w-full lg:w-64 shrink-0">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-[#D9E2F0] rounded-xl text-sm font-medium text-[#0B1F4A] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] cursor-pointer"
                        >
                            <option value="all">All statuses ({counts.all})</option>
                            {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label} ({counts[s.value]})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                    </div>

                    <button
                        onClick={() => fetchQuotations(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D9E2F0] rounded-xl text-sm font-semibold text-[#0B1F4A] hover:border-[#1B3A8C] hover:text-[#1B3A8C] transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="p-16 text-center text-sm text-[#64748B]">Loading quotations…</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-16 text-center">
                            <Inbox className="w-8 h-8 text-[#D9E2F0] mx-auto mb-3" />
                            <p className="text-sm text-[#64748B]">
                                {quotations.length === 0 ? "No quotation requests yet." : "No quotations match your filters."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-blue-50 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Quotation</th>
                                        <th className="px-5 py-3 text-left">Customer</th>
                                        <th className="px-5 py-3 text-left">Service</th>
                                        <th className="px-5 py-3 text-left">Date</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0F4FB]">
                                    {filtered.map((quote) => (
                                        <tr
                                            key={quote.id}
                                            onClick={() => setSelected(quote)}
                                            className="border-b border-[#F0F4FB] last:border-0 hover:bg-[#F8FAFD] cursor-pointer transition"
                                        >
                                            <td className="px-5 py-4 font-semibold text-[#0B1F4A] whitespace-nowrap">{quote.quotation_id}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-[#0B1F4A]">{quote.detail?.full_name ?? "—"}</p>
                                                <p className="text-xs text-[#64748B]">{quote.detail?.email ?? "—"}</p>
                                            </td>
                                            <td className="px-5 py-4 text-[#0B1F4A]">{quote.service_name}</td>
                                            <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">{formatDate(quote.created_at)}</td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={quote.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelected(quote); }}
                                                        className="p-2 rounded-lg text-[#64748B] hover:text-[#1B3A8C] hover:bg-[#F0F4FB] transition"
                                                        aria-label={`View ${quote.quotation_id}`}
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(quote); }}
                                                        className="p-2 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition"
                                                        aria-label={`Delete ${quote.quotation_id}`}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail drawer - Redesign */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative w-full max-w-md bg-[#F8FAFD] h-full overflow-y-auto shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-[#D9E2F0] px-6 py-5 z-10">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-11 h-11 rounded-xl bg-[#1B3A8C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        {getInitials(selected.detail?.full_name)}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
                                            <Hash className="w-3 h-3" />
                                            {selected.quotation_id}
                                        </div>
                                        <h2 className="text-lg font-bold text-[#0B1F4A] truncate">
                                            {selected.detail?.full_name ?? "Unnamed request"}
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-2 rounded-full text-[#64748B] hover:bg-[#F0F4FB] transition shrink-0"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-3">
                                <StatusBadge status={selected.status} />
                            </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1">
                            {/* Status control */}
                            <SectionCard icon={Sparkles} title="Update status">
                                <div className="relative">
                                    <select
                                        value={selected.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value as Status;
                                            if (newStatus === selected.status) return;
                                            setStatusChangeTarget({ quote: selected, newStatus });
                                        }}
                                        className="w-full appearance-none px-4 py-3 pr-10 bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl text-sm font-medium text-[#0B1F4A] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] cursor-pointer"
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                                </div>
                            </SectionCard>

                            {/* Customer */}
                            <SectionCard icon={Users} title="Customer">
                                {selected.detail?.company_name && (
                                    <InfoRow icon={Building2} label="Company" value={selected.detail.company_name} />
                                )}
                                {selected.detail?.email && (
                                    <InfoRow icon={Mail} label="Email" value={selected.detail.email} href={`mailto:${selected.detail.email}`} />
                                )}
                                {selected.detail?.phone && (
                                    <InfoRow icon={Phone} label="Phone" value={selected.detail.phone} href={`tel:${selected.detail.phone}`} />
                                )}
                                {!selected.detail?.company_name && !selected.detail?.email && !selected.detail?.phone && (
                                    <p className="text-sm text-[#64748B]">No contact details on file.</p>
                                )}
                            </SectionCard>

                            {/* Service / booking */}
                            <SectionCard icon={Calendar} title="Booking details">
                                <InfoRow
                                    icon={Building2}
                                    label="Service"
                                    value={
                                        <>
                                            {selected.service_name}
                                            {(selected.lease_term || selected.package || selected.event_type) && (
                                                <span className="block text-xs font-normal text-[#64748B] mt-0.5">
                                                    {[selected.lease_term, selected.package, selected.event_type].filter(Boolean).join(" · ")}
                                                </span>
                                            )}
                                        </>
                                    }
                                />
                                {selected.detail?.date && (
                                    <InfoRow
                                        icon={Clock}
                                        label="Date & time"
                                        value={`${formatDate(selected.detail.date)}${selected.detail.time ? ` · ${selected.detail.time}` : ""}`}
                                    />
                                )}
                                {selected.detail?.seats != null && (
                                    <InfoRow
                                        icon={Users}
                                        label="Seats"
                                        value={`${selected.detail.seats} seat${selected.detail.seats === 1 ? "" : "s"}`}
                                    />
                                )}
                                {selected.detail?.duration_type && (
                                    <InfoRow
                                        icon={Clock}
                                        label="Duration"
                                        value={
                                            selected.detail.duration
                                                ? `${selected.detail.duration} ${selected.detail.duration_type}`
                                                : selected.detail.duration_type
                                        }
                                    />
                                )}
                            </SectionCard>

                            {/* Notes / requirements */}
                            {(selected.detail?.other_requirements || selected.detail?.request) && (
                                <SectionCard icon={AlertCircle} title="Notes & requirements">
                                    {selected.detail?.request && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] mb-1">Request</p>
                                            <p className="text-sm text-[#0B1F4A] leading-relaxed">{selected.detail.request}</p>
                                        </div>
                                    )}
                                    {selected.detail?.other_requirements && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] mb-1">Other requirements</p>
                                            <p className="text-sm text-[#0B1F4A] leading-relaxed">{selected.detail.other_requirements}</p>
                                        </div>
                                    )}
                                </SectionCard>
                            )}

                            {/* Payment — Virtual Office only */}
                            {selected.detail && selected.service_name?.trim().toLowerCase() === "virtual office" && (
                                <SectionCard icon={Receipt} title="Payment">
                                    <div className="flex items-center justify-between bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl px-4 py-3">
                                        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Total</span>
                                        <span className="text-lg font-bold text-[#0B1F4A]">{formatCurrency(selected.detail.total)}</span>
                                    </div>
                                    <InfoRow icon={Banknote} label="Method" value={<span className="capitalize">{selected.detail.payment_method}</span>} />
                                    {selected.detail.transaction_id && (
                                        <InfoRow icon={Hash} label="Transaction ID" value={selected.detail.transaction_id} />
                                    )}
                                    {selected.detail.receipt && (
                                        <InfoRow icon={Receipt} label="Receipt" value={selected.detail.receipt} />
                                    )}
                                    {selected.paid_at && (
                                        <InfoRow icon={Calendar} label="Paid at" value={formatDate(selected.paid_at)} />
                                    )}
                                </SectionCard>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="sticky bottom-0 bg-white border-t border-[#D9E2F0] p-4">
                            <button
                                onClick={() => setDeleteTarget(selected)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Quotation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status change confirmation modal */}
            {statusChangeTarget && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !updatingStatus && setStatusChangeTarget(null)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FB]">
                                <Sparkles className="w-7 h-7 text-[#1B3A8C]" />
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-center text-[#0B1F4A]">
                                Update Status?
                            </h2>

                            <p className="mt-3 text-center text-sm text-[#64748B] leading-6">
                                Change <span className="font-semibold text-[#0B1F4A]">{statusChangeTarget.quote.quotation_id}</span> from
                            </p>

                            <div className="mt-3 flex items-center justify-center gap-2.5">
                                <StatusBadge status={statusChangeTarget.quote.status} />
                                <span className="text-[#64748B] text-sm">→</span>
                                <StatusBadge status={statusChangeTarget.newStatus} />
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setStatusChangeTarget(null)}
                                    disabled={updatingStatus}
                                    className="flex-1 rounded-xl border border-[#D9E2F0] py-3 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmStatusChange}
                                    disabled={updatingStatus}
                                    className="flex-1 rounded-xl bg-[#1B3A8C] py-3 text-white font-semibold hover:bg-[#16316F] transition disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {updatingStatus ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Updating…
                                        </>
                                    ) : (
                                        "Confirm"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal - shared by table row and drawer */}
            {deleteTarget && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !deleting && setDeleteTarget(null)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                                <Trash2 className="w-7 h-7 text-red-600" />
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-center text-[#0B1F4A]">
                                Delete Quotation?
                            </h2>

                            <p className="mt-3 text-center text-sm text-[#64748B] leading-6">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-[#0B1F4A]">{deleteTarget.quotation_id}</span>
                                {deleteTarget.detail?.full_name ? ` for ${deleteTarget.detail.full_name}` : ""}?
                                <br />
                                This action cannot be undone.
                            </p>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={deleting}
                                    className="flex-1 rounded-xl border border-[#D9E2F0] py-3 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Deleting…
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </>
    );
}