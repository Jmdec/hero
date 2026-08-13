"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Landmark,
  QrCode,
  Receipt,
  Upload,
  Eye, Home, FileText
} from "lucide-react";

type PaymentMethod = "qrph" | "online_transfer" | "bank" | null;

type GateStatus = "checking" | "valid" | "invalid";

interface VirtualOfficeFields {
  package: string;
  startDate: string;
  months: string;
  branch: string;
}

interface ClientInfo {
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string;
  idType: string | null;
  idName: string | null;
}

interface PricingBreakdown {
  packagePrice: number;
  vatPercentage: number;
  vatAmount: number;
  duration: number;
  subtotal: number;
  contractAdminFee: number;
  total: number;
}

interface PaymentLinkContext {
  quotationId: string;
  token: string;
  quotationReference?: string;
  virtualOffice: VirtualOfficeFields;
  client: ClientInfo;
  pricing?: PricingBreakdown | null;
}

const API_BASE_URL = "/api";
const VO_PACKAGE_PRICES: Record<string, number> = { Basic: 2000, Standard: 3000, Premium: 5000 };
const VO_VAT_RATE = 0.12;
const VO_CONTRACT_ADMIN_FEE = 500;

const inputCls =
  "w-full px-4 py-3 bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl text-[#0B1F4A] text-sm placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] focus:bg-white transition-all duration-200";

const inputErrCls =
  "w-full px-4 py-3 bg-[#FFF5F5] border border-red-300 rounded-xl text-[#0B1F4A] text-sm placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 focus:bg-white transition-all duration-200";

function computeVirtualOfficeTotal(pkg: string, months: string): PricingBreakdown {
  const base = VO_PACKAGE_PRICES[pkg] ?? 0;
  const vat = base * VO_VAT_RATE;
  const monthlySubtotal = base + vat;
  const numMonths = Math.max(1, Number(months) || 1);
  const recurring = monthlySubtotal * numMonths;
  const total = recurring + VO_CONTRACT_ADMIN_FEE;
  return {
    packagePrice: base,
    vatPercentage: VO_VAT_RATE * 100,
    vatAmount: vat,
    duration: numMonths,
    subtotal: recurring,
    contractAdminFee: VO_CONTRACT_ADMIN_FEE,
    total,
  };
}

const peso = (n: number) => `P${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function getPaymentMethodLabel(paymentMethod: PaymentMethod | string | null | undefined) {
  switch (paymentMethod) {
    case "qrph":
      return "QRPH";
    case "online_transfer":
      return "Online Bank Transfer";
    case "bank":
      return "Bank Deposit";
    default:
      return paymentMethod || "-";
  }
}

function usePaymentLinkGate() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotation");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<GateStatus>(quotationId && token ? "checking" : "invalid");
  const [context, setContext] = useState<PaymentLinkContext | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!quotationId || !token) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/quotations/${encodeURIComponent(quotationId)}/payment-link?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => null);

        if (cancelled) return;

        if (!res.ok || !data?.valid) {
          setErrorMessage(data?.message ?? null);
          setStatus("invalid");
          return;
        }

        setContext({
          quotationId,
          token,
          quotationReference: data.quotation_reference ?? quotationId,
          virtualOffice: {
            package: data.virtual_office?.package ?? "",
            startDate: data.virtual_office?.startDate ?? "",
            months: String(data.virtual_office?.months ?? ""),
            branch: data.virtual_office?.branch ?? "",
          },
          client: {
            fullName: data.client?.full_name ?? "",
            companyName: data.client?.company_name ?? null,
            email: data.client?.email ?? "",
            phone: data.client?.phone ?? "",
            idType: data.client?.id_type ?? null,
            idName: data.client?.id_name ?? null,
          },
          pricing: data.pricing
            ? {
              packagePrice: Number(data.pricing.package_price ?? 0),
              vatPercentage: Number(data.pricing.vat_percentage ?? 0),
              vatAmount: Number(data.pricing.vat_amount ?? 0),
              duration: Number(data.pricing.duration ?? 1),
              subtotal: Number(data.pricing.subtotal ?? 0),
              contractAdminFee: Number(data.pricing.contract_admin_fee ?? 0),
              total: Number(data.pricing.total ?? 0),
            }
            : null,
        });
        setStatus("valid");
      } catch {
        if (!cancelled) {
          setErrorMessage(null);
          setStatus("invalid");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [quotationId, token]);

  return { status, context, errorMessage };
}

function VOPricingBreakdown({ pricing, pkg, months }: { pricing?: PricingBreakdown | null; pkg: string; months: string }) {
  const breakdown = pricing ?? computeVirtualOfficeTotal(pkg, months);

  return (
    <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
      <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#0A1E3F] mb-3">Pricing Breakdown</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Package ({pkg || "Virtual Office"})</span><span className="text-[#0B1F4A] font-medium">{peso(breakdown.packagePrice)} / month</span></div>
        <div className="flex justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">VAT ({breakdown.vatPercentage}%)</span><span className="text-[#0B1F4A] font-medium">{peso(breakdown.vatAmount)} / month</span></div>
        <div className="flex justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Duration</span><span className="text-[#0B1F4A] font-medium">x {breakdown.duration} {breakdown.duration === 1 ? "month" : "months"}</span></div>
        <div className="flex justify-between border-t border-[#D9E2F0] pt-1.5 mt-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Subtotal</span><span className="text-[#0B1F4A] font-medium">{peso(breakdown.subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Contract & Admin Fee</span><span className="text-[#0B1F4A] font-medium">{peso(breakdown.contractAdminFee)}</span></div>
        <div className="flex justify-between border-t border-[#D9E2F0] pt-2 mt-2"><span className="font-bold text-[#0B1F4A]">Total</span><span className="font-bold text-[#1B3A8C]">{peso(breakdown.total)}</span></div>
      </div>
    </div>
  );
}

function FloatingReceipt({
  context,
  paymentMethod,
  paymentReference,
}: {
  context: PaymentLinkContext;
  paymentMethod: PaymentMethod;
  paymentReference: string;
}) {
  const pricing = context.virtualOffice.package && context.virtualOffice.months
    ? computeVirtualOfficeTotal(context.virtualOffice.package, context.virtualOffice.months)
    : null;

  const { client } = context;

  return (
    <div className="lg:sticky lg:top-8">
      <div className="bg-white rounded-3xl border border-[#D9E2F0] shadow-[0_4px_24px_rgba(11,31,74,0.08)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1F4A] px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Receipt className="w-4.5 h-4.5 text-[#FFC107]" />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-semibold">Quotation Summary</p>
            <p className="text-sm font-bold text-white">Virtual Office</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Client Information */}
          <div className="mb-3">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748B]">Client Information</p>
            <div className="space-y-2">
              <ReceiptRow label="Name" value={client.fullName} />
              <ReceiptRow label="Company" value={client.companyName ?? undefined} />
              <ReceiptRow label="Email" value={client.email} />
              <ReceiptRow label="Phone" value={client.phone} />
              {client.idType && <ReceiptRow label="ID Type" value={client.idType} />}
            </div>
          </div>

          {/* Service Details */}
          <div className="pt-4 border-t border-dashed border-[#D9E2F0]">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748B] mb-3">Service Details</p>
            <div className="space-y-2">
              <ReceiptRow label="Service" value="Virtual Office" />
              <ReceiptRow label="Package" value={context.virtualOffice.package} />
              <ReceiptRow label="Start Date" value={context.virtualOffice.startDate} />
              <ReceiptRow
                label="Duration"
                value={
                  context.virtualOffice.months
                    ? `${context.virtualOffice.months} ${Number(context.virtualOffice.months) === 1 ? "month" : "months"}`
                    : undefined
                }
              />
              <ReceiptRow label="Branch" value={context.virtualOffice.branch} />
            </div>
          </div>

          {/* Price Breakdown */}
          {pricing && (
            <div className="pt-4 border-t border-dashed border-[#D9E2F0]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748B] mb-3">Price Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Package fee</span>
                  <span className="text-[#0B1F4A] font-medium">{peso(pricing.packagePrice)} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">VAT ({pricing.vatPercentage}%)</span>
                  <span className="text-[#0B1F4A] font-medium">{peso(pricing.vatAmount)} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Duration</span>
                  <span className="text-[#0B1F4A] font-medium">
                    x {pricing.duration} {pricing.duration === 2 ? "month" : "months"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F0F4FB]">
                  <span className="text-[#64748B]">Subtotal</span>
                  <span className="text-[#0B1F4A] font-medium">{peso(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Contract & Admin Fee</span>
                  <span className="text-[#0B1F4A] font-medium">{peso(pricing.contractAdminFee)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment selection (live preview) */}
          {paymentMethod && (
            <div className="pt-4 border-t border-dashed border-[#D9E2F0]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748B] mb-3">Payment</p>
              <div className="space-y-2">
                <ReceiptRow label="Method" value={getPaymentMethodLabel(paymentMethod)} />
                <ReceiptRow label="Reference" value={paymentReference || undefined} />
              </div>
            </div>
          )}

          {/* Total */}
          {pricing && (
            <div className="pt-4 border-t-2 border-[#0B1F4A]/10 flex items-center justify-between">
              <span className="text-sm font-bold text-[#0B1F4A]">Amount Due</span>
              <span className="text-xl font-extrabold text-[#1B3A8C]">{peso(pricing.total)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 text-sm">
      <span className="text-[#64748B] shrink-0">{label}</span>
      <span className="text-[#0B1F4A] font-medium text-right wrap-break-word">{value}</span>
    </div>
  );
}

function PaymentLinkInvalid({ message }: { message?: string | null }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">This payment link is invalid or has expired</h2>
      <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
        {message ?? "Please check your email for the latest payment link, or contact sales if you believe this is a mistake."}
      </p>
      <a
        href="mailto:salesofficer@heroph.net"
        className="inline-block mt-6 px-7 py-3 bg-[#FFC107] text-[#1B3A8C] text-sm font-bold rounded-full hover:bg-[#FFC107]/80 transition-all duration-200"
      >
        Contact Sales
      </a>
    </div>
  );
}

function PaymentLinkLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <span className="inline-block w-8 h-8 rounded-full border-2 border-[#D9E2F0] border-t-[#1B3A8C] animate-spin" />
      <p className="mt-4 text-sm text-[#64748B]">Verifying your payment link...</p>
    </div>
  );
}

function PaymentLinkFlow({ context }: { context: PaymentLinkContext }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const paymentProofRef = useRef<HTMLInputElement>(null);

  const pricing = context.virtualOffice.package && context.virtualOffice.months
    ? computeVirtualOfficeTotal(context.virtualOffice.package, context.virtualOffice.months)
    : null;

  const paymentOptions: Array<{
    id: Exclude<PaymentMethod, null>;
    icon: React.ElementType;
    label: string;
    sub: string;
    details: string[];
  }> = [
      {
        id: "qrph",
        icon: QrCode,
        label: "QRPH",
        sub: "Scan to pay via any QRPH-enabled app",
        details: [
          "Account Name: HERO PH INC.",
          "Scan the QRPH code using your preferred banking or e-wallet app.",
          "Use your full name as payment reference.",
          "Upload your transaction confirmation screenshot for verification.",
        ],
      },
      {
        id: "online_transfer",
        icon: ArrowRightLeft,
        label: "Online Bank Transfer",
        sub: "Online bank-to-bank transfer",
        details: [
          "Transfer to: HERO PH INC. official bank account",
          "Include your full name as transfer note/reference.",
          "Upload the transfer reference screenshot or PDF receipt.",
        ],
      },
      {
        id: "bank",
        icon: Landmark,
        label: "Bank Deposit",
        sub: "Over-the-counter bank deposit",
        details: [
          "Bank: BDO Unibank",
          "Account Name: HERO PH INC.",
          "Account Number: 012345678901",
          "Upload your validated deposit slip or transfer confirmation.",
        ],
      },
    ];

  const selectedPaymentOption = paymentOptions.find((opt) => opt.id === paymentMethod) ?? null;
  const canProceed = paymentMethod !== null && paymentReference.trim() !== "" && paymentProof !== null;

  const handleSubmit = async () => {
    if (!canProceed || !paymentMethod || !paymentProof) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("token", context.token);
      formData.append("payment_method", paymentMethod);
      formData.append("transaction_id", paymentReference.trim());
      formData.append("payment_proof", paymentProof);

      const res = await fetch(
        `${API_BASE_URL}/quotations/${encodeURIComponent(context.quotationId)}/pay`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Request failed with status ${res.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="relative overflow-hidden">

          {/* Decorative Background */}
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#1B3A8C]/5" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#4F7CFF]/5" />

          <div className="relative z-10 px-8 py-14 md:px-14 text-center">

            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF] ring-8 ring-[#F7F9FF]">
              <CheckCircle2 className="h-12 w-12 text-[#1B3A8C]" />
            </div>

            {/* Badge */}
            <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
              Payment Received
            </span>

            {/* Heading */}
            <h1 className="mt-6 text-3xl font-bold text-[#0B1F4A] md:text-4xl">
              Payment Submitted Successfully
            </h1>

            {/* Description */}
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-[#64748B]">
              Our finance team will review and verify your
              transaction within <span className="font-semibold text-[#0B1F4A]">24 business hours</span>.
              Once verified, you'll receive an email with the next steps regarding your
              quotation.
            </p>

            {/* Info Box */}
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#D9E2F0] bg-white p-5 text-left">
              <h3 className="mb-2 text-sm font-semibold text-[#0B1F4A]">
                What happens next?
              </h3>

              <ul className="space-y-2 text-sm text-[#64748B]">
                <li>✓ Payment verification by our finance team.</li>
                <li>✓ Confirmation email once payment is approved.</li>
                <li>✓ Our team will contact you regarding your quotation.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A8C] px-7 py-3 font-medium text-white transition-all hover:bg-[#16317A] hover:shadow-lg"
              >
                <Home className="h-5 w-5" />
                Return Home
              </Link>

              <Link
                href="/quotation"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9E2F0] bg-white px-7 py-3 font-medium text-[#1B3A8C] transition-all hover:border-[#1B3A8C] hover:bg-[#F7F9FF]"
              >
                <FileText className="h-5 w-5" />
                Request New Quotation
              </Link>

            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
        {/* Main form */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_4px_24px_rgba(11,31,74,0.06)] border border-[#D9E2F0] space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F4A] mb-2">Virtual Office Payment</h1>
            <p className="text-sm text-[#64748B]">Use this secure page to complete your quotation payment.</p>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-[#FFF5F5] px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            {paymentOptions.map((opt) => {
              const Icon = opt.icon;
              const active = paymentMethod === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`rounded-2xl border-[1.5px] transition-all duration-200 ${active
                    ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]"
                    : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C]"
                    } p-4 text-left`}
                  aria-pressed={active}
                >
                  <Icon className={`w-5 h-5 mb-2 ${active ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
                  <p className={`font-bold text-sm ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A]"}`}>{opt.label}</p>
                  <p className="text-xs text-[#64748B]">{opt.sub}</p>
                </button>
              );
            })}
          </div>

          {selectedPaymentOption && (
            <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-[#0B1F4A] mb-3">Payment Details</p>
              <ul className="space-y-1.5">
                {selectedPaymentOption.details.map((detail) => (
                  <li key={detail} className="text-xs text-[#64748B] leading-relaxed flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold tracking-wide text-[#0B1F4A] mb-2 uppercase">
              Upload Receipt
            </label>

            <button
              type="button"
              onClick={() => paymentProofRef.current?.click()}
              className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all duration-200 ${paymentProof
                ? "border-[#1B3A8C] bg-[#EEF2FB]"
                : "border-[#D9E2F0] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
                }`}
            >
              <Upload
                className={`w-5 h-5 ${paymentProof ? "text-[#1B3A8C]" : "text-[#64748B]"
                  }`}
              />
              <span
                className={`text-sm font-semibold ${paymentProof ? "text-[#1B3A8C]" : "text-[#64748B]"
                  }`}
              >
                {paymentProof
                  ? paymentProof.name
                  : "Click to upload receipt image or PDF"}
              </span>
            </button>

            <input
              ref={paymentProofRef}
              id="quotation-payment-proof"
              name="paymentProof"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)}
            />

            <div className="flex items-end justify-end">
              {paymentProof && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.open(URL.createObjectURL(paymentProof), "_blank")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B3A8C] text-white text-sm font-medium hover:bg-[#16318a] transition"
                  >
                    <Eye className="w-4 h-4" />
                    View Receipt
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProof(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-[#64748B] mt-2">
              Accepted: JPG, PNG, PDF - Max 10 MB
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-[#0B1F4A] mb-2 uppercase">Reference Number</label>
            <input
              id="quotation-payment-reference"
              name="paymentReference"
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className={!paymentReference.trim() ? inputCls : inputErrCls }
              placeholder="Transaction Reference Number"
            />
          </div>

          <div className="flex justify-end items-center pt-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2 px-7 py-3 bg-[#FFC107] text-[#1B3A8C] text-sm font-bold rounded-full hover:bg-[#FFC107]/80 disabled:bg-[#D9E2F0] disabled:text-[#64748B] disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Confirm and Submit<ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Floating receipt sidebar (desktop: sticky column, mobile: stacked above via order) */}
        <div className="order-first lg:order-last">
          <FloatingReceipt
            context={context}
            paymentMethod={paymentMethod}
            paymentReference={paymentReference}
          />
        </div>
      </div>
    </div>
  );
}

export default function QuotationPaymentPage() {
  const { status, context, errorMessage } = usePaymentLinkGate();

  if (status === "checking") return <PaymentLinkLoading />;
  if (status === "invalid" || !context) return <PaymentLinkInvalid message={errorMessage} />;

  return <PaymentLinkFlow context={context} />;
}