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
    Pencil,
    Download,
} from "lucide-react";

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
    receipt_url?: string | null;
    receipt_path?: string | null;
    id_type?: string | null;
    id_number?: string | null;
    government_id_file?: string | null;
    government_id_url?: string | null;
    government_id_path?: string | null;
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

// Resolves a stored receipt/ID path (relative storage path or already-absolute URL)
// into a URL the <img>/<a> tags can use directly.
function toAssetUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `/storage/${path.replace(/^\/+/, "")}`;
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
                <p className="text-sm font-medium text-[#0B1F4A] wrap-break-word">{value}</p>
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
    const [previewImage, setPreviewImage] = useState<{ url: string; label: string } | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusEditTarget, setStatusEditTarget] = useState<Quotation | null>(null);
    const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

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
        const who = quote.detail?.full_name ?? "Request";

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
            pushToast(`${who} updated to "${statusLabel}"`, "success");
        } catch {
            setQuotations(previous);
            setError("Couldn't update the status. Please try again.");
            pushToast(`Couldn't update ${who} to "${statusLabel}"`, "error");
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
        const who = quote.detail?.full_name ?? "Request";
        const previous = quotations;
        setDeleting(true);
        try {
            const res = await fetch(`/api/quotations/${quote.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete quotation.");
            setQuotations((qs) => qs.filter((q) => q.id !== quote.id));
            setSelected((s) => (s && s.id === quote.id ? null : s));
            pushToast(`${who} deleted`, "success");
            setDeleteTarget(null);
        } catch {
            setQuotations(previous);
            setError("Couldn't delete the quotation. Please try again.");
            pushToast(`Couldn't delete ${who}`, "error");
        } finally {
            setDeleting(false);
        }
    };

    const openStatusEdit = (quote: Quotation) => {
        setStatusEditTarget(quote);
        setPendingStatus(quote.status);
    };

    const closeStatusEdit = () => {
        setStatusEditTarget(null);
        setPendingStatus(null);
    };

    const submitStatusEdit = () => {
        if (!statusEditTarget || !pendingStatus) return;
        if (pendingStatus !== statusEditTarget.status) {
            setStatusChangeTarget({ quote: statusEditTarget, newStatus: pendingStatus });
        }
        closeStatusEdit();
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
                            placeholder="Search by name, email, phone…"
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
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-[#0B1F4A]">{quote.detail?.full_name ?? "—"}</p>
                                                <p className="text-xs text-[#64748B]">{quote.detail?.email ?? "—"}</p>
                                            </td>
                                            <td className="px-5 py-4 text-[#0B1F4A]">{quote.service_name}</td>
                                            <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">{formatDate(quote.created_at)}</td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openStatusEdit(quote);
                                                    }}
                                                    className="group inline-flex items-center gap-1.5 rounded-full transition hover:opacity-80"
                                                    aria-label={`Edit status for ${quote.detail?.full_name ?? "this request"}`}
                                                    title="Edit status"
                                                >
                                                    <StatusBadge status={quote.status} />
                                                    <Pencil className="w-3 h-3 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition" />
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelected(quote); }}
                                                        className="p-2 rounded-lg text-[#64748B] hover:text-[#1B3A8C] hover:bg-[#F0F4FB] transition"
                                                        aria-label={`View request from ${quote.detail?.full_name ?? "customer"}`}
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(quote); }}
                                                        className="p-2 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition"
                                                        aria-label={`Delete request from ${quote.detail?.full_name ?? "customer"}`}
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

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]">

                        {/* Header */}
                        <div className="shrink-0 px-6 py-5 border-b border-[#E5EAF2] flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-11 h-11 rounded-full bg-[#1B3A8C] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                    {getInitials(selected.detail?.full_name)}
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-[#0B1F4A] truncate">
                                        {selected.detail?.full_name ?? "Unnamed request"}
                                    </h2>
                                    <p className="text-xs text-[#64748B] truncate">
                                        {selected.detail?.company_name ?? "Submitted"} · {formatDate(selected.created_at)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-1.5 -m-1.5 rounded-full text-[#64748B] hover:bg-[#F0F4FB] transition shrink-0"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

                            {/* Status */}
                            <div className="flex items-center justify-between gap-3">
                                <StatusBadge status={selected.status} />
                                <select
                                    value={selected.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value as Status;
                                        if (newStatus === selected.status) return;
                                        setStatusChangeTarget({ quote: selected, newStatus });
                                    }}
                                    className="text-xs font-medium text-[#0B1F4A] bg-[#F8FAFD] border border-[#D9E2F0] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A8C] cursor-pointer"
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Contact */}
                            <div className="space-y-2.5">
                                <p className="text-xs font-semibold text-[#64748B]">Contact</p>
                                {selected.detail?.company_name && <InfoRow icon={Building2} label="Company" value={selected.detail.company_name} />}
                                {selected.detail?.email && <InfoRow icon={Mail} label="Email" value={selected.detail.email} href={`mailto:${selected.detail.email}`} />}
                                {selected.detail?.phone && <InfoRow icon={Phone} label="Phone" value={selected.detail.phone} href={`tel:${selected.detail.phone}`} />}
                                {selected.detail?.id_number && <InfoRow icon={Hash} label="ID" value={`${selected.detail.id_type ?? ""} ${selected.detail.id_number}`} />}
                            </div>

                            {/* Booking details */}
                            <div className="space-y-2.5">
                                <p className="text-xs font-semibold text-[#64748B]">Booking</p>
                                <InfoRow
                                    icon={Building2}
                                    label="Service"
                                    value={[selected.service_name, selected.lease_term, selected.package, selected.event_type].filter(Boolean).join(" · ")}
                                />
                                {selected.detail?.date && (
                                    <InfoRow icon={Clock} label="Date & time" value={`${formatDate(selected.detail.date)}${selected.detail.time ? ` · ${selected.detail.time}` : ""}`} />
                                )}
                                {selected.detail?.seats != null && (
                                    <InfoRow icon={Users} label="Seats" value={`${selected.detail.seats} seat${selected.detail.seats === 1 ? "" : "s"}`} />
                                )}
                                {selected.detail?.duration_type && (
                                    <InfoRow icon={Clock} label="Duration" value={selected.detail.duration ? `${selected.detail.duration} ${selected.detail.duration_type}` : selected.detail.duration_type} />
                                )}
                            </div>

                            {/* Notes */}
                            {(selected.detail?.request || selected.detail?.other_requirements) && (
                                <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-[#64748B]">Notes</p>
                                    {selected.detail?.request && <p className="text-sm text-[#0B1F4A]">{selected.detail.request}</p>}
                                    {selected.detail?.other_requirements && <p className="text-sm text-[#0B1F4A]">{selected.detail.other_requirements}</p>}
                                </div>
                            )}

                            {/* Payment — Virtual Office only */}
                            {selected.detail && selected.service_name?.trim().toLowerCase() === "virtual office" && (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-[#64748B]">Payment</p>
                                    <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-[#64748B]">Total</p>
                                            <p className="text-lg font-semibold text-[#0B1F4A]">{formatCurrency(selected.detail.total)}</p>
                                        </div>
                                        <span className="text-xs font-medium text-[#0B1F4A] bg-white border border-[#D9E2F0] rounded-full px-2.5 py-1">
                                            {selected.detail.payment_method.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    {selected.paid_at && <InfoRow icon={Calendar} label="Paid at" value={formatDate(selected.paid_at)} />}
                                    {selected.detail.transaction_id && <InfoRow icon={Hash} label="Transaction ID" value={selected.detail.transaction_id} />}

                                    <div className="flex gap-2">
                                        {selected.detail.receipt && toAssetUrl(selected.detail.receipt_url ?? selected.detail.receipt_path) && (
                                            <button
                                                onClick={() => setPreviewImage({
                                                    url: toAssetUrl(selected.detail!.receipt_url ?? selected.detail!.receipt_path)!,
                                                    label: "Payment receipt",
                                                })}
                                                className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg border border-[#D9E2F0] text-xs font-medium text-[#1B3A8C] hover:bg-[#F0F4FB] transition"
                                            >
                                                <Receipt className="w-3.5 h-3.5" /> View receipt
                                            </button>
                                        )}
                                        {selected.detail.government_id_file && toAssetUrl(selected.detail.government_id_url ?? selected.detail.government_id_path) && (
                                            <button
                                                onClick={() => setPreviewImage({
                                                    url: toAssetUrl(selected.detail!.government_id_url ?? selected.detail!.government_id_path)!,
                                                    label: "Government ID",
                                                })}
                                                className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg border border-[#D9E2F0] text-xs font-medium text-[#1B3A8C] hover:bg-[#F0F4FB] transition"
                                            >
                                                <Receipt className="w-3.5 h-3.5" /> View ID
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 border-t border-[#E5EAF2] p-4">
                            <button
                                onClick={() => setDeleteTarget(selected)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-red-600 text-sm font-medium hover:bg-red-50 transition"
                            >
                                <Trash2 className="w-4 h-4" /> Delete quotation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt / ID preview lightbox */}
            {previewImage && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setPreviewImage(null)} />
                    <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-white">{previewImage.label}</p>
                            <div className="flex items-center gap-3">
                                {previewImage.url && (
                                    <a
                                        href={previewImage.url}
                                        download
                                        className="text-white/70 hover:text-white"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                )}
                                <button
                                    onClick={() => setPreviewImage(null)}
                                    className="text-white/70 hover:text-white"
                                    aria-label="Close preview"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl overflow-hidden flex items-center justify-center flex-1 min-h-50">
                            {previewImage.url ? (
                                <img
                                    src={previewImage.url}
                                    alt={previewImage.label}
                                    className="max-w-full max-h-[80vh] object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement?.insertAdjacentHTML(
                                            "beforeend",
                                            '<p class="text-sm text-[#64748B] p-8">Unable to load this file.</p>'
                                        );
                                    }}
                                />
                            ) : (
                                <p className="text-sm text-[#64748B] p-8">No file available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status edit modal — triggered from the table's Status column */}
            {statusEditTarget && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeStatusEdit}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-1">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FB]">
                                    <Pencil className="w-6 h-6 text-[#1B3A8C]" />
                                </div>
                                <button
                                    onClick={closeStatusEdit}
                                    className="p-1.5 rounded-full text-[#64748B] hover:bg-[#F0F4FB] transition shrink-0"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <h2 className="mt-4 text-lg font-bold text-[#0B1F4A]">Edit Status</h2>
                            <p className="mt-1 text-sm text-[#64748B]">
                                {statusEditTarget.detail?.full_name ?? "This request"}
                            </p>

                            <label className="block mt-5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B] mb-1.5">
                                New status
                            </label>
                            <div className="relative">
                                <select
                                    value={pendingStatus ?? statusEditTarget.status}
                                    onChange={(e) => setPendingStatus(e.target.value as Status)}
                                    className="w-full appearance-none px-4 py-3 pr-10 bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl text-sm font-medium text-[#0B1F4A] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] cursor-pointer"
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={closeStatusEdit}
                                    className="flex-1 rounded-xl border border-[#D9E2F0] py-3 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitStatusEdit}
                                    disabled={!pendingStatus || pendingStatus === statusEditTarget.status}
                                    className="flex-1 rounded-xl bg-[#1B3A8C] py-3 text-white font-semibold hover:bg-[#16316F] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </div>
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
                                Change status for <span className="font-semibold text-[#0B1F4A]">{statusChangeTarget.quote.detail?.full_name ?? "this request"}</span> from
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

            {/* Delete confirmation modal - shared by table row and detail modal */}
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
                                Are you sure you want to delete this request
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