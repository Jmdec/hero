"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
    Search,
    RefreshCw,
    X,
    Banknote,
    Trash2,
    Eye,
    AlertCircle,
    Inbox,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Sparkles,
    Pencil,
    Link2,
    FileText,
} from "lucide-react";

type Status =
    | "pending"
    | "awaiting_payment"
    | "payment_verification"
    | "paid"
    | "contract_sent"
    | "completed"
    | "cancelled";

// Kept for backwards compatibility with any records that DO have a nested
// price_breakdown object (older records / other clients). The quote form
// (get-a-quote page) does NOT send this shape — it sends flat fields on the
// detail object instead (package_name, package_price, vat_percentage,
// vat_amount, subtotal, contract_admin_fee, total, months/duration). See
// QuotationDetail below and the receipt sections, which read both shapes.
interface QuotationPriceBreakdown {
    package_base_monthly?: number | null;
    vat_monthly?: number | null;
    monthly_subtotal?: number | null;
    months?: number | null;
    recurring_total?: number | null;
    contract_admin_fee?: number | null;
}

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
    payment_method: "paymongo" | "gcash" | "qrph" | "online_transfer" | "bank" | null;
    transaction_id: string | null;
    receipt: string | null;
    payment_link_send_count?: number | null;
    receipt_url?: string | null;
    receipt_path?: string | null;
    id_type?: string | null;
    id_number?: string | null;
    id_name?: string | null;
    id_address?: string | null;
    government_id_file?: string | null;
    government_id_url?: string | null;
    government_id_path?: string | null;
    signatory_details?: string | null;
    signatory_id_name?: string | null;
    signatory_id_number?: string | null;
    signatory_id_address?: string | null;
    signatory_id_type?: string | null;
    signatory_id_file?: string | null;
    signatory_id_url?: string | null;
    signatory_id_path?: string | null;
    signatory_same_as_id_holder?: boolean | null;
    months?: number | null;
    // Flat pricing fields — this is what the get-a-quote Virtual Office flow
    // actually submits (see buildPayload() in the quote form).
    package_name?: string | null;
    package_price?: number | string | null;
    vat_percentage?: number | string | null;
    vat_amount?: number | string | null;
    subtotal?: number | string | null;
    contract_admin_fee?: number | string | null;
    // Legacy/alternate nested shape, kept for compatibility.
    price_breakdown?: QuotationPriceBreakdown | null;
}

interface Quotation {
    id: number;
    quotation_id: string;
    service_id: number;
    service_name: string;
    lease_term: string | null;
    package: string | null;
    event_type: string | null;
    branch?: string | null;
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    paymongo: "PayMongo",
    gcash: "GCash",
    qrph: "QR Ph",
    online_transfer: "Online Transfer",
    bank: "Bank Transfer",
};

function hasPaid(quote: Quotation) {
    return (
        quote.status === "paid" ||
        quote.status === "contract_sent" ||
        quote.status === "completed" ||
        Boolean(quote.paid_at)
    );
}

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

function formatCurrency(value: string | number | null | undefined) {
    const n = Number(value ?? 0);
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

function isVirtualOffice(quote: Quotation) {
    return quote.service_name?.trim().toLowerCase() === "virtual office";
}

function hasPricingData(detail: QuotationDetail) {
    return Boolean(
        detail.price_breakdown ||
        detail.package_name ||
        detail.package_price != null ||
        (Number(detail.total) || 0) > 0
    );
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

function ReceiptHeading({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B96AB] mb-3">
            {children}
        </p>
    );
}

function ReceiptRow({
    label,
    value,
    href,
    strong,
}: {
    label: string;
    value: React.ReactNode;
    href?: string;
    strong?: boolean;
}) {
    if (value === null || value === undefined || value === "") return null;
    const valueClasses = strong
        ? "text-base font-bold text-[#1B3A8C]"
        : "text-sm font-semibold text-[#0B1F4A]";

    return (
        <div className="flex items-baseline justify-between gap-4 py-1.5">
            <span className={strong ? "text-sm font-bold text-[#0B1F4A]" : "text-sm text-[#64748B]"}>
                {label}
            </span>
            {href ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-right shrink-0 max-w-[65%] wrap-break-word hover:underline ${valueClasses}`}
                >
                    {value}
                </a>
            ) : (
                <span className={`text-right shrink-0 max-w-[65%] wrap-break-word ${valueClasses}`}>{value}</span>
            )}
        </div>
    );
}

function ReceiptDivider() {
    return <div className="border-t border-dashed border-[#D9E2F0] my-4" />;
}

function ReceiptSection({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

// Client Information — mirrors the quote form's "Contact" review block.
function ClientInfoSection({ detail }: { detail: QuotationDetail }) {
    return (
        <ReceiptSection>
            <ReceiptHeading>Client Information</ReceiptHeading>
            {detail.company_name && <ReceiptRow label="Company" value={detail.company_name} />}
            <ReceiptRow label="Name" value={detail.full_name} />
            <ReceiptRow label="Email" value={detail.email} href={detail.email ? `mailto:${detail.email}` : undefined} />
            <ReceiptRow label="Phone" value={detail.phone} href={detail.phone ? `tel:${detail.phone}` : undefined} />
        </ReceiptSection>
    );
}

// Service Details — service, package, date, duration, branch.
function ServiceDetailsSection({ quote }: { quote: Quotation }) {
    const detail = quote.detail;
    const durationLabel =
        detail?.duration != null && detail?.duration_type
            ? `${detail.duration} ${detail.duration_type}`
            : detail?.duration_type ??
            (detail?.duration != null ? `${detail.duration} ${detail.duration === 1 ? "month" : "months"}` : null);

    return (
        <ReceiptSection>
            <ReceiptHeading>Service Details</ReceiptHeading>
            <ReceiptRow label="Service" value={quote.service_name} />
            {(quote.package || detail?.package_name) && (
                <ReceiptRow label="Package" value={quote.package ?? detail?.package_name} />
            )}
            {detail?.date && (
                <ReceiptRow
                    label={detail.time ? "Date & Time" : "Start Date"}
                    value={`${formatDate(detail.date)}${detail.time ? ` · ${detail.time}` : ""}`}
                />
            )}
            {detail?.seats != null && (
                <ReceiptRow label="Seats / Attendees" value={`${detail.seats} ${detail.seats === 1 ? "person" : "people"}`} />
            )}
            {durationLabel && <ReceiptRow label="Duration" value={durationLabel} />}
            {quote.lease_term && <ReceiptRow label="Lease Term" value={quote.lease_term} />}
            {quote.event_type && <ReceiptRow label="Event Type" value={quote.event_type} />}
            {quote.branch && <ReceiptRow label="Branch" value={quote.branch} />}
            {(detail?.request || detail?.other_requirements) && (
                <div className="mt-2.5 pt-2.5 border-t border-[#F0F4FB] flex justify-between items-start">
                    <p className="text-sm text-[#64748B]">Notes</p>
                    <div className="text-sm font-bold text-[#0B1F4A]">
                    {detail?.request && <p className="text-sm text-[#0B1F4A]">{detail.request}</p>}
                    {detail?.other_requirements && <p className="text-sm text-[#0B1F4A]">{detail.other_requirements}</p>}
                </div>
                </div>
            )}
        </ReceiptSection>
    );
}

// Price breakdown

function PriceBreakdownSection({ detail }: { detail: QuotationDetail }) {
    const nested = detail.price_breakdown;

    if (!hasPricingData(detail)) {
        return (
            <ReceiptSection>
                <ReceiptHeading>Price Breakdown</ReceiptHeading>
                <p className="text-sm text-[#64748B]">
                    No fixed pricing yet — our team will prepare a custom quotation for this request.
                </p>
            </ReceiptSection>
        );
    }

    const months = nested?.months ?? detail.months ?? detail.duration ?? 1;
    const packageBase = nested?.package_base_monthly ?? detail.package_price;
    const vat = nested?.vat_monthly ?? detail.vat_amount;
    const vatPct = detail.vat_percentage != null ? Number(detail.vat_percentage) : null;
    const recurringTotal = nested?.recurring_total ?? detail.subtotal;
    const adminFee = nested?.contract_admin_fee ?? detail.contract_admin_fee;

    return (
        <ReceiptSection>
            <ReceiptHeading>Price Breakdown</ReceiptHeading>
            {detail.package_name && <ReceiptRow label="Package" value={detail.package_name} />}
            {packageBase != null && (
                <ReceiptRow label="Package fee" value={`${formatCurrency(packageBase)} / mo`} />
            )}
            {vat != null && (
                <ReceiptRow label={`VAT${vatPct != null ? ` (${vatPct}%)` : ""}`} value={`${formatCurrency(vat)} / mo`} />
            )}
            <ReceiptRow label="Duration" value={`x ${months} ${Number(months) === 1 ? "month" : "months"}`} />

            <div className="mt-2 pt-2 border-t border-[#F0F4FB]" />

            {recurringTotal != null && <ReceiptRow label="Subtotal" value={formatCurrency(recurringTotal)} />}
            {adminFee != null && <ReceiptRow label="Contract & Admin Fee" value={formatCurrency(adminFee)} />}

            <div className="mt-3 pt-3 border-t border-[#D9E2F0]">
                <ReceiptRow label="Amount Due" value={formatCurrency(detail.total)} strong />
            </div>
        </ReceiptSection>
    );
}

// Signatory Details 

function isLinkableValue(value: string | null | undefined): value is string {
    if (!value) return false;
    return /^https?:\/\//i.test(value) || value.startsWith("/");
}

function SignatoryDetailsSection({ detail }: { detail: QuotationDetail }) {
    const sameAsHolder = Boolean(detail.signatory_same_as_id_holder);

    const idType = sameAsHolder ? detail.id_type : detail.signatory_id_type;
    const idName = sameAsHolder ? detail.id_name : detail.signatory_id_name;
    const idNumber = sameAsHolder ? detail.id_number : detail.signatory_id_number;
    const idAddress = sameAsHolder ? detail.id_address : detail.signatory_id_address;

    const rawDocValue = sameAsHolder
        ? detail.government_id_url ?? detail.government_id_path ?? detail.government_id_file ?? null
        : detail.signatory_id_url ?? detail.signatory_id_path ?? detail.signatory_id_file ?? null;

    const idDocUrl = isLinkableValue(rawDocValue) ? rawDocValue : null;
    const idDocFilename = !idDocUrl && rawDocValue ? rawDocValue : null;

    const hasContent = [idType, idName, idNumber, idAddress, rawDocValue, detail.signatory_details].some(Boolean);

    // TEMP DEBUG — remove once confirmed
    if (!hasContent) {
        console.warn("SignatoryDetailsSection: no content found, raw detail was:", detail);
        return null;
    }

    return (
        <ReceiptSection>
            <ReceiptHeading>Signatory Details</ReceiptHeading>
            <ReceiptRow label="Same as ID holder" value={sameAsHolder ? "Yes" : "No"} />
            {idName && <ReceiptRow label="Name" value={idName} />}
            {idType && <ReceiptRow label="ID Type" value={idType} />}
            {idNumber && <ReceiptRow label="ID Number" value={idNumber} />}
            {idAddress && <ReceiptRow label="Address" value={idAddress} />}
            {idDocUrl && <ReceiptRow label="ID Document" value="View uploaded document" href={idDocUrl} />}
            {idDocFilename && <ReceiptRow label="ID Document" value={idDocFilename} />}
        </ReceiptSection>
    );
}

// Payment Details — payment method, transaction id, paid date, receipt.
function PaymentDetailsSection({ quote }: { quote: Quotation }) {
    const detail = quote.detail;
    if (!detail) return null;

    const receiptUrl = detail.receipt_url ?? detail.receipt_path ?? detail.receipt ?? null;
    const methodLabel = detail.payment_method
        ? PAYMENT_METHOD_LABELS[detail.payment_method] ?? detail.payment_method
        : null;
    const hasContent = Boolean(methodLabel || detail.transaction_id || quote.paid_at || receiptUrl);

    if (!hasContent) {
        return (
            <ReceiptSection>
                <ReceiptHeading>Payment Details</ReceiptHeading>
                <p className="text-sm text-[#64748B]">No payment recorded yet.</p>
            </ReceiptSection>
        );
    }

    return (
        <ReceiptSection>
            <ReceiptHeading>Payment Details</ReceiptHeading>
            {methodLabel && <ReceiptRow label="Payment Method" value={methodLabel} />}
            {detail.transaction_id && <ReceiptRow label="Transaction ID" value={detail.transaction_id} />}
            {quote.paid_at && <ReceiptRow label="Paid On" value={formatDate(quote.paid_at)} />}
            {receiptUrl && <ReceiptRow label="Receipt" value="View uploaded receipt" href={receiptUrl} />}
        </ReceiptSection>
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
    const [deleting, setDeleting] = useState(false);
    const [statusChangeTarget, setStatusChangeTarget] = useState<{ quote: Quotation; newStatus: Status } | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusEditTarget, setStatusEditTarget] = useState<Quotation | null>(null);
    const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

    // Email-to-client actions
    const [sendingPaymentLinkId, setSendingPaymentLinkId] = useState<number | null>(null);
    const [sendingContractId, setSendingContractId] = useState<number | null>(null);

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
        if (background) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await fetch("/api/quotations", { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to load quotations (status ${res.status}).`);
            const data = await res.json();
            setQuotations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load quotations.");
        } finally {
            if (background) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchQuotations();
        }, 0);

        return () => window.clearTimeout(timeoutId);
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
            .filter((q) => (q.status === "paid" || q.status === "completed") && q.detail && hasPricingData(q.detail))
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

    // Verification step for Virtual Office
    const handleSendPaymentLink = async (quote: Quotation) => {
        const currentCount = quote.detail?.payment_link_send_count ?? 0;
        if (currentCount >= 3) {
            pushToast("This payment link has reached the 3-send limit.", "error");
            return;
        }

        const who = quote.detail?.full_name ?? "the client";
        setSendingPaymentLinkId(quote.id);
        try {
            const res = await fetch(`/api/quotations/${quote.id}/send-payment-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                const message = payload?.message || "Failed to send payment link.";
                throw new Error(message);
            }

            const nextCount = Number(payload?.payment_link_send_count ?? currentCount + 1);
            setQuotations((previous) => previous.map((item) => item.id === quote.id ? {
                ...item,
                detail: item.detail ? { ...item.detail, payment_link_send_count: nextCount } : item.detail,
            } : item));
            setSelected((current) => current && current.id === quote.id ? {
                ...current,
                detail: current.detail ? { ...current.detail, payment_link_send_count: nextCount } : current.detail,
            } : current);
            pushToast(`Payment link sent to ${who}`, "success");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Couldn't send payment link to the client.";
            pushToast(msg, "error");
        } finally {
            setSendingPaymentLinkId(null);
        }
    };

    const handleSendContract = async (quote: Quotation) => {
        const who = quote.detail?.full_name ?? "the client";
        setSendingContractId(quote.id);
        try {
            const res = await fetch(`/api/quotations/${quote.id}/send-contract`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                const message = payload?.message || "Failed to send contract.";
                throw new Error(message);
            }

            setQuotations((previous) => previous.map((item) => item.id === quote.id ? { ...item, status: "contract_sent" } : item));
            setSelected((current) => current && current.id === quote.id ? { ...current, status: "contract_sent" } : current);
            pushToast(`Contract sent to ${who}`, "success");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Couldn't send the contract to the client.";
            pushToast(msg, "error");
        } finally {
            setSendingContractId(null);
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
                    <StatCard label="Quotation value" value={formatCurrency(paidRevenue)} icon={Banknote} tone="green" />
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
                                        <th className="px-5 py-3 text-left">Total</th>
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
                                            <td className="px-5 py-4 text-[#0B1F4A] whitespace-nowrap">
                                                {quote.detail && hasPricingData(quote.detail) ? formatCurrency(quote.detail.total) : "—"}
                                            </td>
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

            {/* Detail modal — receipt-style layout */}
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

                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-1.5 rounded-full text-[#64748B] hover:bg-[#F0F4FB] transition items-end justify-end absolute right-3.5 top-3.5"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
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

                            {/* Receipt */}
                            {selected.detail && (
                                <div>
                                    <ClientInfoSection detail={selected.detail} />
                                    <ReceiptDivider />
                                    <SignatoryDetailsSection detail={selected.detail} />
                                    <ReceiptDivider />
                                    <ServiceDetailsSection quote={selected} />
                                    <ReceiptDivider />
                                    <PriceBreakdownSection detail={selected.detail} />
                                    <ReceiptDivider />
                                    <PaymentDetailsSection quote={selected} />
                                </div>
                            )}

                            {selected.detail && isVirtualOffice(selected) && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSendPaymentLink(selected)}
                                        disabled={sendingPaymentLinkId === selected.id || (selected.detail?.payment_link_send_count ?? 0) >= 3}
                                        className="w-full flex items-center gap-2 justify-center py-2.5 rounded-lg bg-[#1B3A8C] text-white text-sm font-semibold hover:bg-[#16316F] transition disabled:opacity-60"
                                    >
                                        {sendingPaymentLinkId === selected.id ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Sending payment link…
                                            </>
                                        ) : (
                                            <>
                                                <Link2 className="w-4 h-4" />
                                                {(selected.detail?.payment_link_send_count ?? 0) >= 3 ? "Payment link limit reached" : "Send Payment Link"}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[11px] text-[#64748B] text-center">
                                        {(selected.detail?.payment_link_send_count ?? 0) >= 3
                                            ? "This quotation already reached its 3-send limit."
                                            : `Sends ${selected.detail.email} a link to the dedicated payment page for this quotation.`}
                                    </p>
                                </div>
                            )}

                            {selected.detail && isVirtualOffice(selected) && (selected.status === "payment_verification" || hasPaid(selected)) && (
                                <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-[#64748B]">Contract</p>
                                    <button
                                        onClick={() => handleSendContract(selected)}
                                        disabled={sendingContractId === selected.id || selected.status === "contract_sent" || selected.status === "completed"}
                                        className="w-full flex items-center gap-2 justify-center py-2.5 rounded-lg bg-[#1B3A8C] text-white text-sm font-semibold hover:bg-[#16316F] transition disabled:opacity-60"
                                    >
                                        {sendingContractId === selected.id ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Sending contract…
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-4 h-4" />
                                                {selected.status === "contract_sent" ? "Contract sent" : "Send contract"}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[11px] text-[#64748B] text-center">
                                        Sends the contract PDF directly to {selected.detail.email}.
                                    </p>
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
                                    className="flex-1 rounded-xl border border-[#D9E2F0] py-3 font-medium hover:bg-gray-50 transition"
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