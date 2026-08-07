"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
    Search,
    RefreshCw,
    X,
    Check,
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
    Loader2,
    ChevronRight,
} from "lucide-react";

type Status =
    | "pending"
    | "awaiting_payment"
    | "payment_verification"
    | "paid"
    | "contract_sent"
    | "completed"
    | "cancelled";

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
    payment_method: "n/a" | "qrph" | "online_transfer" | "bank" | null;
    transaction_id: string | null;
    receipt: string | null;
    payment_link_send_count?: number | null;
    payment_link_sent_count?: number | null;
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
    package_name?: string | null;
    package_price?: number | string | null;
    vat_percentage?: number | string | null;
    vat_amount?: number | string | null;
    subtotal?: number | string | null;
    contract_admin_fee?: number | string | null;
    discount?: number | string | null;
    discounts?: number | string | null;
    price_breakdown?: QuotationPriceBreakdown | null;
    contract_content?: string | null;
    contract_updated_at?: string | null;
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
    "n/a": "Not Applicable",
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

function parseNumberish(value: string | number | null | undefined): number | null {
    const normalized = typeof value === "string" ? value.replace(/[^0-9.-]/g, "") : value;
    const numeric = Number(normalized ?? null);
    return Number.isFinite(numeric) ? numeric : null;
}

function formatPhp(value: number | null | undefined): string {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "PHP 0.00";
    return `PHP ${numeric.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function buildDefaultContractContent(quote: Quotation) {
    const detail = quote.detail;
    const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    const fullName = detail?.full_name ?? "Client";
    const companyName = detail?.company_name ? ` of ${detail.company_name}` : "";
    const packageName = quote.package ?? "—";
    const duration = detail?.duration ?? "Month-to-month";
    const startDate = detail?.date ? formatDate(detail.date) : "—";
    const branch = quote.branch ?? null;
    const paymentMethod = detail?.payment_method
        ? PAYMENT_METHOD_LABELS[detail.payment_method] ?? detail.payment_method
        : "N/A";
    const idName = detail?.id_name ?? fullName;
    const signatoryLabel = detail?.signatory_details ?? idName;

    const monthlyFeeByPackage: Record<string, string> = {
        Basic: "2000",
        Standard: "3000",
        Premium: "5000",
    };

    const monthlyFeeAmount = parseNumberish(detail?.package_price) ?? parseNumberish(monthlyFeeByPackage[quote.package ?? ""]);
    const monthsCount = parseNumberish(detail?.months ?? detail?.duration) ?? 1;
    const subtotalAmount = parseNumberish(detail?.subtotal);
    const vatAmount = parseNumberish(detail?.vat_amount);
    const vatPercent = parseNumberish(detail?.vat_percentage);
    const contractFeeAmount = parseNumberish(detail?.contract_admin_fee);
    const discountAmount = parseNumberish(detail?.discounts ?? detail?.discount);
    const grandTotalAmount = parseNumberish(detail?.total);
    const derivedDiscount = discountAmount ?? (
        subtotalAmount != null && contractFeeAmount != null && grandTotalAmount != null
            ? Math.max(0, subtotalAmount + contractFeeAmount - grandTotalAmount)
            : null
    );

    const priceBreakdownLines = [
        "Price Breakdown",
        `Package Price: ${monthlyFeeAmount != null ? formatPhp(monthlyFeeAmount) : "—"}`,
        `Quantity / Months: ${monthsCount}`,
        `Subtotal: ${subtotalAmount != null ? formatPhp(subtotalAmount) : "—"}`,
        `VAT${vatPercent != null ? ` (${vatPercent}%)` : ""}: ${vatAmount != null ? formatPhp(vatAmount) : "—"}`,
        `Contract & Administrative Fee: ${contractFeeAmount != null ? formatPhp(contractFeeAmount) : "—"}`,
        `Discounts: ${derivedDiscount != null ? formatPhp(derivedDiscount) : "—"}`,
        `Total: ${grandTotalAmount != null ? formatPhp(grandTotalAmount) : "—"}`,
    ];

    const clientInfoLines = [
        "3. Client Information",
        `Name: ${idName}`,
        detail?.id_type ? `ID Type: ${detail.id_type}` : null,
        detail?.id_number ? `ID Number: ${detail.id_number}` : null,
        detail?.company_name ? `Company: ${detail.company_name}` : null,
        detail?.id_address ? `Address: ${detail.id_address}` : null,
        detail?.signatory_details ? `Signatory Details: ${detail.signatory_details}` : null,
        `Email: ${detail?.email ?? "—"}`,
        `Phone: ${detail?.phone ?? "—"}`,
    ].filter((line): line is string => Boolean(line));

    return [
        `Date Issued: ${today}`,
        "",
        "1. Parties",
        `This Virtual Office Service Agreement (\"Agreement\") is entered into between Hero PH Inc. (\"Provider\") and ${fullName}${companyName} (\"Client\"), effective as of the date of confirmed payment below.`,
        "",
        "2. Service Details",
        `Service: ${quote.service_name || "Virtual Office"}`,
        ...(branch ? [`Branch: ${branch}`] : []),
        `Package: ${packageName}`,
        `Duration: ${duration}`,
        `Start Date: ${startDate}`,
        `Payment Method: ${paymentMethod}`,
        ...(detail?.transaction_id ? [`Reference No: ${detail.transaction_id}`] : []),
        "",
        ...priceBreakdownLines,
        "",
        ...clientInfoLines,
        "",
        "4. Terms & Conditions",
        "The Client agrees to the Provider's standard terms of service, including monthly billing, renewal, and cancellation policies as outlined in the Provider's Terms of Use. This Agreement takes effect upon confirmed payment and remains in force on a month-to-month basis unless terminated by either party with thirty (30) days' written notice. All correspondence regarding this Agreement should be directed to salesofficer@heroph.net.",
    ].join("\n");
}

function hasPricingData(detail: QuotationDetail) {
    return Boolean(
        detail.price_breakdown ||
        detail.package_name ||
        detail.package_price != null ||
        (Number(detail.total) || 0) > 0
    );
}

function getPaymentLinkSentCount(detail: QuotationDetail | null | undefined) {
    if (!detail) return 0;
    return Number(detail.payment_link_sent_count ?? detail.payment_link_send_count ?? 0) || 0;
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
type StatKey = "total" | "needs_attention" | "value" | "cancelled";

const STAT_TONE_STYLES: Record<StatTone, { bg: string; text: string }> = {
    neutral: { bg: "bg-[#F0F4FB]", text: "text-[#1B3A8C]" },
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    green: { bg: "bg-green-50", text: "text-green-700" },
    red: { bg: "bg-red-50", text: "text-red-600" },
};

function buildDrillDownData(quotations: Quotation[], counts: Record<Status | "all", number>, needsAttention: number, completedValue: number) {
    const paidCount = counts.paid + counts.contract_sent + counts.completed;
    const pendingCount = counts.pending;
    const awaitingPaymentCount = counts.awaiting_payment + counts.payment_verification;
    const conversionRate = counts.all > 0 ? Math.round((paidCount / counts.all) * 100) : 0;
    const avgValue = counts.completed > 0 ? Math.round(completedValue / counts.completed) : 0;

    return {
        total: {
            title: "All Quotations",
            items: [
                { label: "Pending", value: String(counts.pending), sub: `${Math.round((counts.pending / Math.max(counts.all, 1)) * 100)}% of total` },
                { label: "Needs attention", value: String(needsAttention), sub: `${Math.round((needsAttention / Math.max(counts.all, 1)) * 100)}% of total` },
                { label: "Completed", value: String(counts.completed), sub: `${Math.round((counts.completed / Math.max(counts.all, 1)) * 100)}% of total` },
                { label: "Conversion rate", value: `${conversionRate}%`, sub: "Paid/contracted to completed" },
            ],
        },
        needs_attention: {
            title: "Needs Attention",
            items: [
                { label: "Pending", value: String(counts.pending), sub: `${pendingCount} awaiting action` },
                { label: "Awaiting payment", value: String(awaitingPaymentCount), sub: `${awaitingPaymentCount} at risk of stalling` },
                { label: "Cancelled", value: String(counts.cancelled), sub: `${Math.round((counts.cancelled / Math.max(counts.all, 1)) * 100)}% of total` },
                { label: "Active requests", value: String(counts.all - counts.completed - counts.cancelled), sub: "Open pipeline" },
            ],
        },
        value: {
            title: "Quotation Value",
            items: [
                { label: "Completed value", value: `PHP ${completedValue.toLocaleString("en-PH")}`, sub: "Completed quotes only" },
                { label: "Average completed value", value: `PHP ${avgValue.toLocaleString("en-PH")}`, sub: "Per completed request" },
                { label: "Paid/contracted", value: String(paidCount), sub: `${conversionRate}% conversion` },
                { label: "Open value", value: `PHP ${quotations.filter((q) => q.status !== "completed" && q.status !== "cancelled").reduce((sum, q) => sum + (q.detail ? Number(q.detail.total) || 0 : 0), 0).toLocaleString("en-PH")}`, sub: "Pending or active" },
            ],
        },
        cancelled: {
            title: "Cancelled Quotations",
            items: [
                { label: "Cancelled count", value: String(counts.cancelled), sub: `${Math.round((counts.cancelled / Math.max(counts.all, 1)) * 100)}% of total` },
                { label: "Pending before cancel", value: String(counts.pending), sub: "Can still be recovered" },
                { label: "Awaiting payment before cancel", value: String(awaitingPaymentCount), sub: "At-risk flow" },
                { label: "Completed quotes", value: String(counts.completed), sub: "Successful pipeline" },
            ],
        },
    } as Record<StatKey, { title: string; items: { label: string; value: string; sub?: string }[] }>;
}

function StatCard({
    id,
    label,
    value,
    icon: Icon,
    tone = "neutral",
    onClick,
}: {
    id: StatKey;
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: StatTone;
    onClick: (id: StatKey) => void;
}) {
    const t = STAT_TONE_STYLES[tone];
    return (
        <button
            onClick={() => onClick(id)}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-200 text-left w-full border border-transparent hover:border-[#C5D2EC]"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${tone === "amber" ? "bg-amber-500" : tone === "green" ? "bg-green-500" : tone === "red" ? "bg-red-500" : "bg-[#0D47A1]"}`} />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.bg}`}>
                    <Icon className={`w-5 h-5 ${t.text}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D47A1] transition-colors" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        </button>
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

    const signatoryDetailsValue = detail.signatory_details;
    const signatoryDetailsText =
        typeof signatoryDetailsValue === "string"
            ? signatoryDetailsValue
            : signatoryDetailsValue && typeof signatoryDetailsValue === "object"
                ? Object.values(signatoryDetailsValue as Record<string, unknown>)
                    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
                    .join(" · ")
                : null;

    const idType = sameAsHolder ? detail.id_type : detail.signatory_id_type;
    const idName = sameAsHolder ? detail.id_name : detail.signatory_id_name;
    const idNumber = sameAsHolder ? detail.id_number : detail.signatory_id_number;
    const idAddress = sameAsHolder ? detail.id_address : detail.signatory_id_address;

    const rawDocValue = sameAsHolder
        ? detail.government_id_url ?? detail.government_id_path ?? detail.government_id_file ?? null
        : detail.signatory_id_url ?? detail.signatory_id_path ?? detail.signatory_id_file ?? null;

    const idDocUrl = isLinkableValue(rawDocValue) ? rawDocValue : null;
    const idDocFilename = !idDocUrl && rawDocValue ? rawDocValue : null;

    const hasContent = [sameAsHolder, idType, idName, idNumber, idAddress, rawDocValue, signatoryDetailsText].some(Boolean);
    if (!hasContent) return null;

    return (
        <ReceiptSection>
            <ReceiptHeading>Signatory Details</ReceiptHeading>
            <ReceiptRow label="Same as ID holder" value={sameAsHolder ? "Yes" : "No"} />
            {idName && <ReceiptRow label="Name" value={idName} />}
            {idType && <ReceiptRow label="ID Type" value={idType} />}
            {idNumber && <ReceiptRow label="ID Number" value={idNumber} />}
            {idAddress && <ReceiptRow label="Address" value={idAddress} />}
            {signatoryDetailsText && <ReceiptRow label="Signatory Notes" value={signatoryDetailsText} />}
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
    const [activeCard, setActiveCard] = useState<StatKey | null>(null);

    // Email-to-client actions
    const [sendingPaymentLinkId, setSendingPaymentLinkId] = useState<number | null>(null);
    const [sendingContractId, setSendingContractId] = useState<number | null>(null);
    const [contractModalQuote, setContractModalQuote] = useState<Quotation | null>(null);
    const [contractEditMode, setContractEditMode] = useState(false);
    const [contractDraft, setContractDraft] = useState("");
    const [contractSavedSnapshot, setContractSavedSnapshot] = useState("");
    const [savingContract, setSavingContract] = useState(false);

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
    const completed = useMemo(() => {
        return quotations
            .filter((q) => q.status === "completed" && q.detail && hasPricingData(q.detail))
            .reduce((sum, q) => sum + (q.detail ? Number(q.detail.total) || 0 : 0), 0);
    }, [quotations]);

    const drillDownData = useMemo(
        () => buildDrillDownData(quotations, counts, needsAttention, completed),
        [quotations, counts, needsAttention, completed],
    );

    const activeDrillDown = activeCard ? drillDownData[activeCard] : null;

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

    const openContractViewer = (quote: Quotation) => {
        const initial = quote.detail?.contract_content?.trim() || buildDefaultContractContent(quote);
        setContractModalQuote(quote);
        setContractEditMode(false);
        setContractDraft(initial);
        setContractSavedSnapshot(initial);
    };

    const closeContractViewer = () => {
        if (savingContract) return;
        setContractModalQuote(null);
        setContractEditMode(false);
        setContractDraft("");
        setContractSavedSnapshot("");
    };

    const handleSaveContract = async () => {
        if (!contractModalQuote?.detail) return;

        setSavingContract(true);
        try {
            const updatedDetail = {
                ...contractModalQuote.detail,
                contract_content: contractDraft,
            };

            const res = await fetch(`/api/quotations/${contractModalQuote.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    service_id: contractModalQuote.service_id,
                    service_name: contractModalQuote.service_name,
                    lease_term: contractModalQuote.lease_term,
                    package: contractModalQuote.package,
                    event_type: contractModalQuote.event_type,
                    status: contractModalQuote.status,
                    detail: updatedDetail,
                }),
            });

            const payload = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(payload?.message || "Failed to save contract content.");
            }

            const returned = (payload?.data ?? null) as Quotation | null;
            const mergedQuote: Quotation = returned ?? {
                ...contractModalQuote,
                detail: updatedDetail,
            };

            setQuotations((previous) =>
                previous.map((item) => (item.id === mergedQuote.id ? mergedQuote : item))
            );
            setSelected((current) => (current && current.id === mergedQuote.id ? mergedQuote : current));
            setContractModalQuote(mergedQuote);
            setContractSavedSnapshot(contractDraft);
            setContractEditMode(false);
            pushToast("Contract content saved.", "success");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save contract content.";
            pushToast(message, "error");
        } finally {
            setSavingContract(false);
        }
    };

    // Verification step for Virtual Office
    const handleSendPaymentLink = async (quote: Quotation) => {
        const currentCount = getPaymentLinkSentCount(quote.detail);
        if (currentCount >= 3) {
            pushToast("Maximum sends reached (3/3).", "error");
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
                const message = payload?.message || payload?.error || "Failed to send payment link.";
                throw new Error(message);
            }

            const deliveryFailed = payload?.ok === false || payload?.success === false || Boolean(payload?.error);

            if (deliveryFailed) {
                const message = payload?.message || payload?.error || "Payment link delivery failed.";
                throw new Error(message);
            }

            const nextCount = Number(payload?.payment_link_sent_count ?? payload?.payment_link_send_count ?? currentCount + 1);
            setQuotations((previous) => previous.map((item) => item.id === quote.id ? {
                ...item,
                detail: item.detail
                    ? {
                        ...item.detail,
                        payment_link_sent_count: nextCount,
                        payment_link_send_count: nextCount,
                    }
                    : item.detail,
            } : item));
            setSelected((current) => current && current.id === quote.id ? {
                ...current,
                detail: current.detail
                    ? {
                        ...current.detail,
                        payment_link_sent_count: nextCount,
                        payment_link_send_count: nextCount,
                    }
                    : current.detail,
            } : current);

            pushToast(`Payment link delivered to ${who} (${nextCount}/3).`, "success");
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
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard id="total" label="Total requests" value={String(counts.all)} icon={Inbox} tone="neutral" onClick={setActiveCard} />
                    <StatCard id="needs_attention" label="Needs attention" value={String(needsAttention)} icon={AlertCircle} tone="amber" onClick={setActiveCard} />
                    <StatCard id="value" label="Quotation value" value={String(completed)} icon={Check} tone="green" onClick={setActiveCard} />
                    <StatCard id="cancelled" label="Cancelled" value={String(counts.cancelled)} icon={XCircle} tone="red" onClick={setActiveCard} />
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-[#FFF5F5] px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {activeDrillDown && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveCard(null)} />
                        <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                <h2 className="text-lg font-semibold text-slate-900">{activeDrillDown.title}</h2>
                                <button
                                    onClick={() => setActiveCard(null)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-2">
                                {activeDrillDown.items.map((item) => (
                                    <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">{item.label}</p>
                                        <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
                                        {item.sub && <p className="mt-0.5 text-xs text-slate-400">{item.sub}</p>}
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 pb-6">
                                <button
                                    onClick={() => setActiveCard(null)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
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
                        <div className="p-16 text-center text-sm text-[#64748B]">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#0D47A1] border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-[#64748B]">Loading quotations...</span>
                            </div>
                        </div>
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
                            <div className="flex items-center justify-start gap-3">
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B96AB] justify-center"> STATUS </span>
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
                                                {
                                                    selected.status === "payment_verification"
                                                        ? (
                                                            (selected.detail?.payment_link_send_count ?? 0) >= 3
                                                                ? "Payment Link Limit Reached"
                                                                : "Send Payment Link"
                                                        )
                                                        : "Payment Link Sent"
                                                }
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
                                        onClick={() => openContractViewer(selected)}
                                        className="w-full flex items-center gap-2 justify-center py-2.5 rounded-lg border border-[#C5D2EC] bg-white text-[#1B3A8C] text-sm font-semibold hover:bg-[#EEF2FB] transition"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Contract
                                    </button>
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

            {contractModalQuote && (
                <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={closeContractViewer} />
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-[#0B1F4A]">Contract Preview</h3>
                                <p className="text-xs text-[#64748B]">
                                    {contractModalQuote.detail?.full_name ?? "Client"} · {contractModalQuote.service_name}
                                </p>
                            </div>
                            <button
                                onClick={closeContractViewer}
                                disabled={savingContract}
                                className="p-2 rounded-lg text-[#64748B] hover:bg-[#F0F4FB] transition disabled:opacity-50"
                                aria-label="Close contract preview"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-[#F8FAFD] p-4 sm:p-6">
                            {!contractEditMode ? (
                                <div className="mx-auto max-w-3xl bg-white border border-[#D9E2F0] rounded-xl p-6 sm:p-8 shadow-sm">
                                    <div className="text-center mb-6">
                                        <p className="text-xl font-bold text-[#1B3A8C]">Hero Serviced Office</p>
                                        <p className="text-sm text-[#64748B] mt-1">Virtual Office Service Agreement</p>
                                    </div>
                                    <div className="whitespace-pre-wrap text-sm leading-7 text-[#0B1F4A]">
                                        {contractDraft}
                                    </div>
                                </div>
                            ) : (
                                <div className="mx-auto max-w-3xl bg-white border border-[#D9E2F0] rounded-xl p-5 sm:p-6 shadow-sm space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Edit Contract</p>
                                    <textarea
                                        value={contractDraft}
                                        onChange={(e) => setContractDraft(e.target.value)}
                                        className="w-full min-h-105 rounded-xl border border-[#D9E2F0] bg-white px-4 py-3 text-sm text-[#0B1F4A] leading-7 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C]"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-[#E5EAF2] flex flex-wrap items-center justify-end gap-2.5">
                            {contractEditMode ? (
                                <>
                                    <button
                                        onClick={() => setContractEditMode(false)}
                                        className="px-4 py-2 rounded-lg border border-[#D9E2F0] text-sm font-medium text-[#0B1F4A] hover:bg-[#F8FAFD] transition"
                                    >
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => {
                                            setContractDraft(contractSavedSnapshot);
                                            setContractEditMode(false);
                                        }}
                                        className="px-4 py-2 rounded-lg border border-[#D9E2F0] text-sm font-medium text-[#0B1F4A] hover:bg-[#F8FAFD] transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveContract}
                                        disabled={savingContract}
                                        className="px-4 py-2 rounded-lg bg-[#1B3A8C] text-white text-sm font-semibold hover:bg-[#16316F] transition disabled:opacity-60"
                                    >
                                        {savingContract ? "Saving..." : "Save"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setContractEditMode(true)}
                                    className="px-4 py-2 rounded-lg bg-[#1B3A8C] text-white text-sm font-semibold hover:bg-[#16316F] transition"
                                >
                                    Edit Contract
                                </button>
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

function formatPhpAmount(value: number | null | undefined) {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "PHP 0.00";
    return `PHP ${numeric.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toNumber(value: string | number | null | undefined): number | null {
    const numeric = Number(value ?? null);
    return Number.isFinite(numeric) ? numeric : null;
}

function getContractPriceBreakdown(detail: QuotationDetail | null | undefined) {
    if (!detail) {
        return null;
    }

    const packagePrice = toNumber(detail.package_price);
    const months = toNumber(detail.months ?? detail.duration) ?? 1;
    const subtotal = toNumber(detail.subtotal);
    const vatAmount = toNumber(detail.vat_amount);
    const vatPercentage = toNumber(detail.vat_percentage);
    const contractFee = toNumber(detail.contract_admin_fee);
    const explicitDiscount = toNumber(detail.discounts ?? detail.discount);
    const grandTotal = toNumber(detail.total);

    let computedDiscount = explicitDiscount;
    if (computedDiscount == null && subtotal != null && contractFee != null && grandTotal != null) {
        const derived = subtotal + contractFee - grandTotal;
        computedDiscount = derived > 0 ? derived : 0;
    }

    return {
        packagePrice,
        months,
        subtotal,
        vatAmount,
        vatPercentage,
        contractFee,
        discount: computedDiscount,
        grandTotal,
    };
}