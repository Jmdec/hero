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
    Users,
    Banknote,
    Trash2,
    AlertCircle,
    Inbox,
    ChevronDown,
    CheckCircle2,
    XCircle,
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

function StatusBadge({ status }: { status: Status }) {
    const label = STATUSES.find((s) => s.value === status)?.label ?? status;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status]}`}
        >
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

// ─── Toast ──────────────────────────────────────────────────────────────────

type ToastTone = "success" | "error";

interface ToastItem {
    id: number;
    message: string;
    tone: ToastTone;
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
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

    const handleDelete = async (quote: Quotation) => {
        if (!confirm(`Delete quotation ${quote.quotation_id}? This can't be undone.`)) return;
        const previous = quotations;
        setQuotations((qs) => qs.filter((q) => q.id !== quote.id));
        setSelected(null);
        try {
            const res = await fetch(`/api/quotations/${quote.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete quotation.");
            pushToast(`${quote.quotation_id} deleted`, "success");
        } catch {
            setQuotations(previous);
            setError("Couldn't delete the quotation. Please try again.");
            pushToast(`Couldn't delete ${quote.quotation_id}`, "error");
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0B1F4A]">
                            {counts.all} request{counts.all === 1 ? "" : "s"} total
                        </h1>
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
                </div>

                {/* Table */}
                <div className="bg-white border border-[#D9E2F0] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(11,31,74,0.04)]">
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
                                <thead>
                                    <tr className="border-b border-[#D9E2F0] bg-[#F8FAFD]">
                                        <th className="text-left font-semibold text-[#64748B] text-xs uppercase tracking-wide px-5 py-3">Quotation</th>
                                        <th className="text-left font-semibold text-[#64748B] text-xs uppercase tracking-wide px-5 py-3">Customer</th>
                                        <th className="text-left font-semibold text-[#64748B] text-xs uppercase tracking-wide px-5 py-3">Service</th>
                                        <th className="text-left font-semibold text-[#64748B] text-xs uppercase tracking-wide px-5 py-3">Date</th>
                                        <th className="text-left font-semibold text-[#64748B] text-xs uppercase tracking-wide px-5 py-3">Total</th>
                                        <th className="text-left font-semibold text-[#64748B] text-xs uppercase tracking-wide px-5 py-3">Status</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((quote) => (
                                        <tr
                                            key={quote.id}
                                            onClick={() => setSelected(quote)}
                                            className="border-b border-[#F0F4FB] last:border-0 hover:bg-[#F8FAFD] cursor-pointer transition"
                                        >
                                            <td className="px-5 py-4 font-semibold text-[#0B1F4A] whitespace-nowrap">{quote.quotation_id}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-[#0B1F4A]">{quote.detail?.full_name ?? "—"}</p>
                                                <p className="text-xs text-[#64748B]">{quote.detail?.email ?? "—"}</p>
                                            </td>
                                            <td className="px-5 py-4 text-[#0B1F4A]">{quote.service_name}</td>
                                            <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">{formatDate(quote.created_at)}</td>
                                            <td className="px-5 py-4 font-semibold text-[#0B1F4A] whitespace-nowrap">
                                                {quote.detail ? formatCurrency(quote.detail.total) : "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={quote.status} />
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(quote); }}
                                                    className="p-2 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 transition"
                                                    aria-label={`Delete ${quote.quotation_id}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                    <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-[#D9E2F0] px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Quotation</p>
                                <h2 className="text-lg font-bold text-[#0B1F4A]">{selected.quotation_id}</h2>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-2 rounded-full text-[#64748B] hover:bg-[#F0F4FB] transition"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status control */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wide text-[#0B1F4A] mb-2 uppercase">Status</label>
                                <div className="relative">
                                    <select
                                        value={selected.status}
                                        onChange={(e) => handleStatusUpdate(selected, e.target.value as Status)}
                                        className="w-full appearance-none px-4 py-3 pr-10 bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl text-sm text-[#0B1F4A] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] cursor-pointer"
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 space-y-3">
                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B1F4A]/40">Customer</p>
                                <p className="font-semibold text-[rgb(11,31,74)]">NAME:{" "}
                                    <span className="underline">{selected.detail?.full_name ?? "—"}</span></p>
                                {selected.detail?.company_name && (
                                    <div className="flex items-center gap-2 text-sm text-[#1B3A8C] font-semibold">
                                        <Building2 className="w-3.5 h-3.5" /> {selected.detail.company_name}
                                    </div>
                                )}
                                {selected.detail?.email && (
                                    <a href={`mailto:${selected.detail.email}`} className="flex items-center gap-2 text-sm text-[#1B3A8C] hover:underline">
                                        <Mail className="w-3.5 h-3.5" /> {selected.detail.email}
                                    </a>
                                )}
                                {selected.detail?.phone && (
                                    <a href={`tel:${selected.detail.phone}`} className="flex items-center gap-2 text-sm text-[#1B3A8C] hover:underline">
                                        <Phone className="w-3.5 h-3.5" /> {selected.detail.phone}
                                    </a>
                                )}
                            </div>

                            {/* Service */}
                            <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 space-y-3">
                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B1F4A]/40">Service</p>
                                <div className="flex items-center gap-2 text-sm text-[#0B1F4A] font-semibold">
                                    <p className="font-semibold">{selected.service_name}:</p>
                                    <span className="underline font-semibold">
                                        {selected.lease_term && <p className="text-sm">{selected.lease_term}</p>}
                                        {selected.package && <p className="text-sm">{selected.package}</p>}
                                        {selected.event_type && <p className="text-sm">{selected.event_type}</p>}
                                    </span>
                                </div>
                                {selected.detail?.date && (
                                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                        <Calendar className="w-3.5 h-3.5" /> {formatDate(selected.detail.date)}
                                        {selected.detail.time ? ` · ${selected.detail.time}` : ""}
                                    </div>
                                )}
                                {selected.detail?.seats != null && (
                                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                        <Users className="w-3.5 h-3.5" /> {selected.detail.seats} seat{selected.detail.seats === 1 ? "" : "s"}
                                    </div>
                                )}
                                {selected.detail?.duration_type && (
                                    <p className="text-sm text-[#64748B]">{selected.detail.duration_type}</p>
                                )}
                                {selected.detail?.other_requirements && (
                                    <p className="text-sm text-[#64748B] pt-1 border-t border-[#D9E2F0]">{selected.detail.other_requirements}</p>
                                )}
                                {selected.detail?.request && (
                                    <p className="text-sm text-[#64748B] pt-1 border-t border-[#D9E2F0]">Notes: {selected.detail.request}</p>
                                )}
                            </div>

                            {/* Payment */}
                            {selected.detail && (
                                <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 space-y-3">
                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B1F4A]/40">Payment</p>
                                    <div className="flex items-center gap-2 text-sm text-[#0B1F4A] font-semibold">
                                        <Banknote className="w-3.5 h-3.5" /> {formatCurrency(selected.detail.total)}
                                    </div>
                                    <p className="text-sm text-[#64748B] capitalize">Method: {selected.detail.payment_method}</p>
                                    {selected.detail.transaction_id && (
                                        <p className="text-sm text-[#64748B]">Transaction ID: {selected.detail.transaction_id}</p>
                                    )}
                                    {selected.detail.receipt && (
                                        <p className="text-sm text-[#64748B]">Receipt: {selected.detail.receipt}</p>
                                    )}
                                    {selected.paid_at && (
                                        <p className="text-sm text-[#64748B]">Paid at: {formatDate(selected.paid_at)}</p>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => setDeleteTarget(selected)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Quotation
                            </button>

                            {deleteTarget && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

                                    {/* Backdrop */}
                                    <div
                                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                        onClick={() => setDeleteTarget(null)}
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
                                                Are you sure you want to delete
                                                <span className="font-semibold text-[#0B1F4A]">
                                                    {" "}
                                                    {deleteTarget.quotation_id}
                                                </span>
                                                ?
                                                <br />
                                                This action cannot be undone.
                                            </p>

                                            <div className="mt-8 flex gap-3">

                                                <button
                                                    onClick={() => setDeleteTarget(null)}
                                                    className="flex-1 rounded-xl border border-[#D9E2F0] py-3 font-medium hover:bg-gray-50 transition"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        handleDelete(deleteTarget);
                                                        setDeleteTarget(null);
                                                        setSelected(null);
                                                    }}
                                                    className="flex-1 rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </>
    );
}