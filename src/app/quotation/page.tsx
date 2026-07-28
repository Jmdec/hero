"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Wifi,
  Armchair,
  CalendarDays,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Landmark,
  Wallet,
  QrCode,
  ArrowRightLeft,
  Upload,
  Clock,
  AlertCircle,
  MapPin,
  Eye,
  ArrowRight,
} from "lucide-react";

type ServiceId = "private-office" | "virtual-office" | "coworking" | "meeting-room" | "event-space";
type BranchId = "tower-6789" | "insular-life";
type PaymentMethod = "qrph" | "online_transfer" | "bank" | null;
type ModalKey = "privacy" | "success" | "preview" | null;

interface ContactFields {
  name: string;
  company: string;
  email: string;
  phone: string;
}

interface ContractIdentityFields {
  idType: string;
  idTypeOther: string;
  idName: string;
  idNumber: string;
  idAddress: string;
  governmentIdFile: File | null;
  signatorySameAsIdHolder: boolean;
  signatoryIdType: string;
  signatoryIdTypeOther: string;
  signatoryIdName: string;
  signatoryIdNumber: string;
  signatoryIdAddress: string;
  signatoryGovernmentIdFile: File | null;
}

interface PreviewTarget {
  title: string;
  file: File;
}

interface PrivateOfficeFields {
  seats: string;
  moveInDate: string;
  leaseTerm: string;
  otherRequirements: string;
}

interface VirtualOfficeFields {
  package: string;
  startDate: string;
  months: string; // NEW: Months Duration
}

interface CoworkingFields {
  seats: string;
  startDate: string;
  terms: string;
  otherRequirements: string;
}

interface MeetingRoomFields {
  date: string;
  time: string;
  participants: string;
  duration: string;
  additionalRequirements: string;
}

interface EventSpaceFields {
  eventDate: string;
  attendees: string;
  duration: string;
  eventType: string;
  otherRequirements: string;
}

const SERVICES: { id: ServiceId; label: string; icon: React.ElementType }[] = [
  { id: "private-office", label: "Private Office", icon: Building2 },
  { id: "virtual-office", label: "Virtual Office", icon: Wifi },
  { id: "coworking", label: "Co-working Space", icon: Armchair },
  { id: "meeting-room", label: "Meeting Room", icon: CalendarDays },
  { id: "event-space", label: "Event Space", icon: PartyPopper },
];

const BRANCHES: { id: BranchId; label: string; address: string }[] = [
  { id: "tower-6789", label: "Tower 6789", address: "23rd Floor, Tower 6789, Ayala Ave., Makati City, 1226 Metro Manila, Philippines" },
  { id: "insular-life", label: "Insular Life Building", address: "11th Floor, Insular Life Building, 6781 Ayala Ave. cor. Paseo de Roxas, Makati City, 1226 Metro Manila, Philippines" },
];

const PRIVATE_OFFICE_MAX_SEATS: Record<BranchId, number> = {
  "tower-6789": 25,
  "insular-life": 30,
};

// ─── API Config ───────────────────────────────────────────────────────────────

const API_BASE_URL = "/api";

const SERVICE_IDS: Record<ServiceId, number> = {
  "private-office": 1,
  "virtual-office": 2,
  "coworking": 3,
  "meeting-room": 4,
  "event-space": 5,
};

// Standard flow: Service → Requirements → Contact → Review → Submit → Success Modal
const BASE_STEPS = ["Service", "Requirements", "Contact", "Review"];

// Virtual Office flow: Service → Requirements → Contact → Review → Payment → Success Modal
// Note: VO no longer sends a formal contract to the client at submission time —
// admin verifies payment first, then follows up with the client directly
// ("Formal Contact") before finalizing. The contract .docx is generated for
// internal/admin use only (see lib/mail.ts).
const VO_STEPS = ["Service", "Requirements", "Contact", "Review", "Payment"];

const LEASE_TERMS = ["6 Months", "12 Months", "More than 12 Months"];
const PASS_TYPES = ["Daily", "Weekly", "Monthly"];
const TIME_SLOTS = [
  ["09:00", "9:00 AM"], ["10:00", "10:00 AM"], ["11:00", "11:00 AM"],
  ["13:00", "1:00 PM"], ["14:00", "2:00 PM"], ["15:00", "3:00 PM"], ["16:00", "4:00 PM"],
];

// Standard accepted government IDs (used by non-VO services / general fallback)
const GOVERNMENT_ID_TYPES = [
  "Philippine National ID (PhilSys ID)",
  "Passport",
  "Driver's License",
  "Professional Regulation Commission (PRC ID)",
  "Others",
];

// Virtual Office only accepts these 4 ID types — no "Others" option
const VO_GOVERNMENT_ID_TYPES = [
  "Passport",
  "Driver's License",
  "Philippine National ID (PhilSys ID)",
  "Professional Regulation Commission (PRC ID)",
];

// Virtual Office package base monthly fees (before VAT / fees / duration multiplier)
const VO_PACKAGE_PRICES: Record<string, number> = { Basic: 2000, Standard: 3000, Premium: 5000 };
const VO_VAT_RATE = 0.12; // 12% VAT
const VO_CONTRACT_ADMIN_FEE = 500; // flat Contract & Admin Fee
const VO_MONTHS_OPTIONS = ["1", "3", "6", "12", "24"];

// ─── Validation Helpers ───────────────────────────────────────────────────────

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPhone = (phone: string) =>
  /^(\+?63|0)[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(phone.replace(/\s/g, ""));

/** Computes VO pricing breakdown: Package + VAT + Contract & Admin Fee, multiplied by Duration (months). */
function computeVirtualOfficeTotal(pkg: string, months: string) {
  const base = VO_PACKAGE_PRICES[pkg] ?? 0;
  const vat = base * VO_VAT_RATE;
  const monthlySubtotal = base + vat; // per-month cost before admin fee
  const numMonths = Math.max(1, Number(months) || 1);
  const recurring = monthlySubtotal * numMonths;
  const total = recurring + VO_CONTRACT_ADMIN_FEE; // admin fee charged once
  return {
    base,
    vat,
    monthlySubtotal,
    numMonths,
    recurring,
    contractAdminFee: VO_CONTRACT_ADMIN_FEE,
    total,
  };
}

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inputCls =
  "w-full px-4 py-3 bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl text-[#0B1F4A] text-sm placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] focus:bg-white transition-all duration-200";

const inputErrCls =
  "w-full px-4 py-3 bg-[#FFF5F5] border border-red-300 rounded-xl text-[#0B1F4A] text-sm placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 focus:bg-white transition-all duration-200";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
      <p className="text-xs text-red-500">{msg}</p>
    </div>
  );
}

function Field({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-[#0B1F4A] mb-2 uppercase">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

function PillSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-all duration-150 ${value === opt
            ? "border-[#1B3A8C] bg-[#1B3A8C] text-white"
            : "border-[#D9E2F0] bg-white text-[#0B1F4A] hover:border-[#1B3A8C] hover:text-[#1B3A8C]"
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  hideClose?: boolean;
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape" && !hideClose) onClose(); },
    [onClose, hideClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={hideClose ? undefined : onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-[#0A1E3F]">{title}</h2>
          {!hideClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto px-6 py-5 text-sm text-gray-700 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Success Modal Content
function SuccessModalContent({
  isVO,
  paymentMethod,
  onClose,
}: {
  isVO: boolean;
  paymentMethod: PaymentMethod;
  onClose: () => void;
}) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-[#EEF2FB] rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-[#1B3A8C]" />
      </div>

      <p className="text-[10px] tracking-[0.25em] uppercase text-[#64748B] mb-2">
        {isVO ? "Virtual Office Request" : "Quotation Received"}
      </p>
      <h3 className="text-2xl font-bold text-[#0B1F4A] mb-3">Thank You!</h3>

      {isVO ? (
        <p className="text-[#64748B] text-sm leading-relaxed mb-6">
          Your request and payment details have been submitted. Our admin team will verify your
          payment, then reach out to you directly to formalize your contract.
        </p>
      ) : (
        <p className="text-[#64748B] text-sm leading-relaxed mb-6">
          Your quotation request has been received. {" "}
          A HERO Serviced Office representative will contact you within <strong>24 business hours</strong>.
        </p>
      )}

      <div className="bg-[#F4F6FB] rounded-2xl p-5 text-left mb-6 space-y-3">
        {(isVO
          ? [
            `Payment method selected: ${getPaymentMethodLabel(paymentMethod)}`,
            "We'll verify your submitted payment and supporting documents",
            "Our admin will formally contact you to finalize your contract",
          ]
          : [
            "We'll review your service requirements and preferences",
            "A customised quotation will be prepared for you",
            "Our team will reach out via email or phone to discuss next steps",
          ]
        ).map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#0B1F4A] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              {i + 1}
            </span>
            <p className="text-sm text-[#4A5568] leading-relaxed">{s}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-3 text-[#0B1F4A] bg-[#FFC107] rounded-full text-sm font-semibold hover:bg-[#FFC107]/80 transition"
        >
          Submit another request
        </button>
        <a
          href="/"
          className="px-8 py-3 bg-[#F0EDE6] text-[#4A4740] rounded-full text-sm font-semibold hover:bg-[#E5E1D9] transition"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}

// Step Rail

function StepRail({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center mb-10 flex-wrap gap-y-2">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${done
                ? "bg-[#FFC107] text-[#0B1F4A]"
                : active
                  ? "bg-[#0B1F4A] text-white shadow-[0_0_0_4px_rgba(27,58,140,0.15)]"
                  : "bg-white text-[#64748B] border border-[#D9E2F0]"
                }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx}
              </div>
              <span className={`mt-1.5 text-[10px] tracking-[0.15em] uppercase font-semibold ${active ? "text-[#1B3A8C]" : done ? "text-[#C9A84C]" : "text-[#64748B]"
                }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-10 md:w-14 mx-1 mb-5 transition-all duration-500 ${done ? "bg-[#C9A84C]" : "bg-[#D9E2F0]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Nav Row
function NavRow({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Continue",
  isSubmit,
  isSubmitting,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  isSubmit?: boolean;
  isSubmitting?: boolean;
}) {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#D9E2F0]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-[#FFC107] text-[#1B3A8C] text-sm font-bold rounded-full hover:border-[#FFC107] hover:text-[#1B3A8C] transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      ) : <span />}
      <button
        type={isSubmit ? "submit" : "button"}
        onClick={!isSubmit ? onNext : undefined}
        disabled={nextDisabled || isSubmitting}
        className="flex items-center gap-2 px-7 py-3 bg-[#FFC107] text-[#1B3A8C] text-sm font-bold rounded-full hover:bg-[#FFC107]/80 disabled:bg-[#D9E2F0] disabled:text-[#64748B] disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Submitting…
          </>
        ) : (
          <>{nextLabel}<ChevronRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
}

// Step 1: Service
function Step1({
  selectedService,
  setSelectedService,
  selectedBranch,
  setSelectedBranch,
  onNext,
}: {
  selectedService: ServiceId | null;
  setSelectedService: (s: ServiceId) => void;
  selectedBranch: BranchId | null;
  setSelectedBranch: (b: BranchId) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);

  const handleNext = () => {
    setTouched(true);
    if (selectedService && selectedBranch) onNext();
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#0B1F4A] mb-2">Select a Service</h2>
      <p className="text-md text-[#64748B] mb-7">Choose the workspace solution you're interested in.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const active = selectedService === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedService(s.id)}
              className={`p-4 rounded-2xl border-[1.5px] text-left transition-all duration-200 group ${active
                ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]"
                : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
                }`}
            >
              <div className="flex items-center gap-6">
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-[#1B3A8C]" : "text-[#64748B] group-hover:text-[#1B3A8C]"}`} />
                <p className={`font-semibold text-md ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A] group-hover:text-[#1B3A8C]"}`}>{s.label}</p>
              </div>
            </button>
          );
        })}
      </div>
      {touched && !selectedService && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          Please select a service to continue.
        </div>
      )}

      <div className="mt-12 border-t border-slate-200 pt-10">
        <div className="mb-8">

          <h3 className="mt-4 text-3xl font-bold text-[#0B1F4A]">
            Select Preferred Branch
          </h3>

          <p className="mt-3 text-base leading-relaxed text-slate-500">
            Select the HERO Serviced Office location where you'd like to inquire,
            schedule a visit, or reserve your workspace.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {BRANCHES.map((b) => {
            const active = selectedBranch === b.id;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBranch(b.id)}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-6 text-left transition-all duration-300 ${active
                  ? "border-[#1B3A8C] shadow-xl shadow-blue-100 ring-2 ring-[#1B3A8C]/10"
                  : "border-slate-200 hover:-translate-y-1 hover:border-[#1B3A8C]/40 hover:shadow-lg"
                  }`}
              >
                {/* Active Accent */}
                <div
                  className={`absolute left-0 top-0 h-full w-1 transition-all ${active ? "bg-[#C9A84C]" : "bg-transparent"
                    }`}
                />

                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <h4
                      className={`text-lg font-semibold transition-colors ${active
                        ? "text-[#1B3A8C]"
                        : "text-[#0B1F4A] group-hover:text-[#1B3A8C]"
                        }`}
                    >
                      <div className="flex gap-4">
                        <MapPin className="h-6 w-6" />
                        {b.label}
                      </div>
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {b.address}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {touched && !selectedBranch && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Please select a branch to continue.</span>
          </div>
        )}
      </div>

      <NavRow onNext={handleNext} />
    </div>
  );
}

// Step 2: Requirements
function Step2PrivateOffice({
  data,
  onChange,
  errors,
  branch,
}: {
  data: PrivateOfficeFields;
  onChange: (d: Partial<PrivateOfficeFields>) => void;
  errors: Partial<Record<keyof PrivateOfficeFields, string>>;
  branch: BranchId | null;
}) {
  const today = new Date().toISOString().split("T")[0];
  const maxSeats = branch ? PRIVATE_OFFICE_MAX_SEATS[branch] : Math.max(...Object.values(PRIVATE_OFFICE_MAX_SEATS));
  const branchLabel = BRANCHES.find((b) => b.id === branch)?.label;
  return (
    <div className="space-y-5">
      {branchLabel && (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1B3A8C] bg-[#EEF2FB] border border-[#C5D2EC] rounded-xl px-4 py-2.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {branchLabel} · Maximum {maxSeats} seats available
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Number of Seats" required error={errors.seats}>
          <input
            type="number"
            min={1}
            max={maxSeats}
            value={data.seats}
            onChange={(e) => onChange({ seats: e.target.value })}
            className={errors.seats ? inputErrCls : inputCls}
            placeholder={`Maximum ${maxSeats}`}
          />
        </Field>
        <Field label="Target Move-in Date" required error={errors.moveInDate}>
          <input
            type="date"
            min={today}
            value={data.moveInDate}
            onChange={(e) => onChange({ moveInDate: e.target.value })}
            className={errors.moveInDate ? inputErrCls : inputCls}
          />
        </Field>
      </div>
      <Field label="Lease Term" required error={errors.leaseTerm}>
        <PillSelect options={LEASE_TERMS} value={data.leaseTerm} onChange={(v) => onChange({ leaseTerm: v })} />
      </Field>
      <Field label="Other Requirements / Conditions">
        <textarea
          rows={3}
          value={data.otherRequirements}
          onChange={(e) => onChange({ otherRequirements: e.target.value })}
          className={inputCls + " resize-none"}
          placeholder="Layout preferences, additional amenities, etc."
        />
      </Field>
    </div>
  );
}

function Step2VirtualOffice({
  data,
  onChange,
  errors,
  notes,
  setNotes,
}: {
  data: VirtualOfficeFields;
  onChange: (d: Partial<VirtualOfficeFields>) => void;
  errors: Partial<Record<keyof VirtualOfficeFields, string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <Field label="Package" required error={errors.package}>
        <div className="mt-1 grid gap-4 md:grid-cols-3">
          {[
            {
              id: "Basic",
              features: [
                "Business Address",
                "Business Registration Documents Assistance",
                "Mail Handling",
                "Basic Call Handling",
                "1 Day Co-working Space Access",
                "1 Hour Conference Room Access",
              ],
              price: "₱2,000 / Month",
            },
            {
              id: "Standard",
              features: [
                "Business Address",
                "Business Registration Documents Assistance",
                "Mail Handling",
                "Basic Call Handling",
                "2 Days Co-working Space Access",
                "2 Hours Conference Room Access",
              ],
              price: "₱3,000 / Month",
            },
            {
              id: "Premium",
              features: [
                "Business Address",
                "Business Registration Documents Assistance",
                "Mail Handling",
                "Basic Call Handling",
                "5 Days Co-working Space Access",
                "3 Hours Conference Room Access",
              ],
              price: "₱5,000 / Month",
            },
          ].map((pkg) => {
            const active = data.package === pkg.id;

            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => onChange({ package: pkg.id })}
                className={`rounded-2xl border p-5 text-left transition-all duration-200 ${active
                  ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-lg ring-1 ring-[#1B3A8C]/10"
                  : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:shadow-md"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-lg font-bold ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A]"
                      }`}
                  >
                    {pkg.id}
                  </h3>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-[#64748B]">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 border-t border-gray-200 pt-4">
                  <p
                    className={`text-md font-bold ${active ? "text-[#C9A84C]" : "text-[#1B3A8C]"
                      }`}
                  >
                    {pkg.price}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Preferred Start Date" required error={errors.startDate}>
          <input
            type="date"
            min={today}
            value={data.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={errors.startDate ? inputErrCls : inputCls}
          />
        </Field>

        {/* NEW: Months Duration */}
        <Field label="Months Duration" required error={errors.months}>
          <select
            value={data.months}
            onChange={(e) => onChange({ months: e.target.value })}
            className={errors.months ? inputErrCls : inputCls}
          >
            <option value="">Select duration</option>
            {VO_MONTHS_OPTIONS.map((m) => (
              <option key={m} value={m}>{m} {Number(m) === 1 ? "Month" : "Months"}</option>
            ))}
          </select>
        </Field>
      </div>

      {data.package && data.months && (
        <VOPricingBreakdown pkg={data.package} months={data.months} />
      )}

      <div className="mt-5">
        <Field label="Other Requirements / Conditions">
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls + " resize-none"}
            placeholder="Anything else you'd like us to include in your virtual office request."
          />
        </Field>
      </div>

    </div>
  );
}

/** Shared pricing breakdown card: Package + VAT + Contract & Admin Fee, × Duration */
function VOPricingBreakdown({ pkg, months }: { pkg: string; months: string }) {
  const b = computeVirtualOfficeTotal(pkg, months);
  return (
    <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B1F4A]/40 mb-3">Estimated Pricing Breakdown</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-[#64748B]">Package ({pkg})</span><span className="text-[#0B1F4A] font-medium">{peso(b.base)} / month</span></div>
        <div className="flex justify-between"><span className="text-[#64748B]">VAT (12%)</span><span className="text-[#0B1F4A] font-medium">{peso(b.vat)} / month</span></div>
        <div className="flex justify-between"><span className="text-[#64748B]">Duration</span><span className="text-[#0B1F4A] font-medium">× {b.numMonths} {b.numMonths === 1 ? "month" : "months"}</span></div>
        <div className="flex justify-between border-t border-[#D9E2F0] pt-1.5 mt-1.5"><span className="text-[#64748B]">Subtotal</span><span className="text-[#0B1F4A] font-medium">{peso(b.recurring)}</span></div>
        <div className="flex justify-between"><span className="text-[#64748B]">Contract & Admin Fee</span><span className="text-[#0B1F4A] font-medium">{peso(b.contractAdminFee)}</span></div>
        <div className="flex justify-between border-t border-[#D9E2F0] pt-2 mt-2"><span className="font-bold text-[#0B1F4A]">Total</span><span className="font-bold text-[#1B3A8C]">{peso(b.total)}</span></div>
      </div>
    </div>
  );
}

function Step2Coworking({
  data,
  onChange,
  errors,
}: {
  data: CoworkingFields;
  onChange: (d: Partial<CoworkingFields>) => void;
  errors: Partial<Record<keyof CoworkingFields, string>>;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Number of Seats" required error={errors.seats}>
          <input
            type="number"
            min={1}
            value={data.seats}
            onChange={(e) => onChange({ seats: e.target.value })}
            className={errors.seats ? inputErrCls : inputCls}
            placeholder="e.g. 2"
          />
        </Field>
        <Field label="Preferred Start Date" required error={errors.startDate}>
          <input
            type="date"
            min={today}
            value={data.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={errors.startDate ? inputErrCls : inputCls}
          />
        </Field>
      </div>
      <Field label="Terms" required error={errors.terms}>
        <PillSelect options={PASS_TYPES} value={data.terms} onChange={(v) => onChange({ terms: v })} />
      </Field>
      <Field label="Other Requirements">
        <textarea
          rows={3}
          value={data.otherRequirements}
          onChange={(e) => onChange({ otherRequirements: e.target.value })}
          className={inputCls + " resize-none"}
          placeholder="Specific equipment, accessibility needs, etc."
        />
      </Field>
    </div>
  );
}

function Step2MeetingRoom({
  data,
  onChange,
  errors,
}: {
  data: MeetingRoomFields;
  onChange: (d: Partial<MeetingRoomFields>) => void;
  errors: Partial<Record<keyof MeetingRoomFields, string>>;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Reservation Date" required error={errors.date}>
          <input type="date" min={today} value={data.date} onChange={(e) => onChange({ date: e.target.value })} className={errors.date ? inputErrCls : inputCls} />
        </Field>
        <Field label="Preferred Time" required error={errors.time}>
          <select value={data.time} onChange={(e) => onChange({ time: e.target.value })} className={errors.time ? inputErrCls : inputCls}>
            <option value="">Select time</option>
            {TIME_SLOTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Number of Participants" required error={errors.participants}>
          <input
            type="number"
            min={1}
            value={data.participants}
            onChange={(e) => onChange({ participants: e.target.value })}
            className={errors.participants ? inputErrCls : inputCls}
            placeholder="e.g. 8"
          />
        </Field>
        <Field label="Duration" required error={errors.duration}>
          <select value={data.duration} onChange={(e) => onChange({ duration: e.target.value })} className={errors.duration ? inputErrCls : inputCls}>
            <option value="">Select duration</option>
            {["1 hour", "2 hours", "3 hours", "4 hours", "Half day", "Full day"].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Additional Requirements">
        <textarea rows={3} value={data.additionalRequirements} onChange={(e) => onChange({ additionalRequirements: e.target.value })} className={inputCls + " resize-none"} placeholder="AV equipment, catering, whiteboard setup, etc." />
      </Field>
    </div>
  );
}

function Step2EventSpace({
  data,
  onChange,
  errors,
}: {
  data: EventSpaceFields;
  onChange: (d: Partial<EventSpaceFields>) => void;
  errors: Partial<Record<keyof EventSpaceFields, string>>;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Event Date" required error={errors.eventDate}>
          <input type="date" min={today} value={data.eventDate} onChange={(e) => onChange({ eventDate: e.target.value })} className={errors.eventDate ? inputErrCls : inputCls} />
        </Field>
        <Field label="Estimated Attendees" required error={errors.attendees}>
          <input type="number" min={1} value={data.attendees} onChange={(e) => onChange({ attendees: e.target.value })} className={errors.attendees ? inputErrCls : inputCls} placeholder="e.g. 50" />
        </Field>
        <Field label="Event Duration" required error={errors.duration}>
          <select value={data.duration} onChange={(e) => onChange({ duration: e.target.value })} className={errors.duration ? inputErrCls : inputCls}>
            <option value="">Select duration</option>
            {["2 hours", "3 hours", "4 hours", "Half day", "Full day"].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Event Type" required error={errors.eventType}>
          <select value={data.eventType} onChange={(e) => onChange({ eventType: e.target.value })} className={errors.eventType ? inputErrCls : inputCls}>
            <option value="">Select type</option>
            {["Corporate Meeting", "Product Launch", "Training / Seminar", "Team Building", "Networking Event", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Other Requirements">
        <textarea rows={3} value={data.otherRequirements} onChange={(e) => onChange({ otherRequirements: e.target.value })} className={inputCls + " resize-none"} placeholder="Setup preferences, catering, AV requirements, etc." />
      </Field>
    </div>
  );
}

// Step 3: Contact
function Step3({
  isVO,
  contact,
  contractIdentity,
  setContact,
  setContractIdentity,
  onBack,
  onNext,
}: {
  isVO: boolean;
  contact: ContactFields;
  contractIdentity: ContractIdentityFields;
  setContact: React.Dispatch<React.SetStateAction<ContactFields>>;
  setContractIdentity: React.Dispatch<React.SetStateAction<ContractIdentityFields>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);
  const idUploadRef = useRef<HTMLInputElement>(null);
  const signatoryUploadRef = useRef<HTMLInputElement>(null);

  // VO restricts to 4 accepted ID types (no "Others"); other services keep the full list
  const idTypeOptions = isVO ? VO_GOVERNMENT_ID_TYPES : GOVERNMENT_ID_TYPES;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!contact.name.trim()) errs.name = "Full name is required.";
    if (!contact.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!isValidEmail(contact.email)) {
      errs.email = "Please enter a valid email address (e.g. juan@company.com).";
    }
    if (!contact.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!isValidPhone(contact.phone)) {
      errs.phone = "Please enter a valid PH mobile number (e.g. +63 917 123 4567 or 09171234567).";
    }

    if (!contractIdentity.idType) {
      errs.idType = isVO
        ? "Please select an accepted ID type (Passport, Driver's License, PhilSys ID, or PRC ID)."
        : "Please select a government ID type.";
    }
    if (!isVO && contractIdentity.idType === "Others" && !contractIdentity.idTypeOther.trim()) {
      errs.idTypeOther = "Please specify your government ID type.";
    }
    if (!contractIdentity.idName.trim()) {
      errs.idName = "Name on government ID is required.";
    }
    if (!contractIdentity.idNumber.trim()) {
      errs.idNumber = "Government ID number is required.";
    }
    if (!contractIdentity.idAddress.trim()) {
      errs.idAddress = "Address on government ID is required.";
    }
    if (!contractIdentity.governmentIdFile) {
      errs.governmentIdFile = "Please upload a government-issued ID copy.";
    }

    if (!contractIdentity.signatorySameAsIdHolder) {
      if (!contractIdentity.signatoryIdType) {
        errs.signatoryIdType = "Please select the signatory ID type.";
      }
      if (!isVO && contractIdentity.signatoryIdType === "Others" && !contractIdentity.signatoryIdTypeOther.trim()) {
        errs.signatoryIdTypeOther = "Please specify the signatory ID type.";
      }
      if (!contractIdentity.signatoryIdName.trim()) {
        errs.signatoryIdName = "Signatory name on ID is required.";
      }
      if (!contractIdentity.signatoryIdNumber.trim()) {
        errs.signatoryIdNumber = "Signatory ID number is required.";
      }
      if (!contractIdentity.signatoryIdAddress.trim()) {
        errs.signatoryIdAddress = "Signatory address on ID is required.";
      }
      if (!contractIdentity.signatoryGovernmentIdFile) {
        errs.signatoryGovernmentIdFile = "Please upload the signatory's government ID copy.";
      }
    }

    if (isVO && !contractIdentity.idName.trim()) {
      errs.idName = "Name on government ID is required for virtual office.";
    }
    return errs;
  };

  const handleNext = () => {
    setTouched(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">Your Contact Information</h2>
      <p className="text-sm text-[#64748B] mb-7">We'll use these details to send you the quotation.</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full Name" required error={errors.name}>
          <input
            type="text"
            value={contact.name}
            onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
            className={errors.name ? inputErrCls : inputCls}
            placeholder="Juan dela Cruz"
          />
        </Field>
        <Field label="Company Name">
          <input
            type="text"
            value={contact.company}
            onChange={(e) => setContact((p) => ({ ...p, company: e.target.value }))}
            className={inputCls}
            placeholder="Your Company (optional)"
          />
        </Field>
        <Field label="Email Address" required error={errors.email}>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
            className={errors.email ? inputErrCls : inputCls}
            placeholder="juan@company.com"
          />
        </Field>
        <Field label="Phone Number" required error={errors.phone}>
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
            className={errors.phone ? inputErrCls : inputCls}
            placeholder="+63 9XX XXX XXXX"
          />
        </Field>
      </div>

      <div className="mt-7 border-t border-[#D9E2F0] pt-6">
        <h3 className="text-2xl font-bold text-[#0B1F4A] mb-2">Government ID & Signatory</h3>
        <p className="text-sm text-[#64748B] mb-5">
          These details are used for contract preparation and verification.
          {isVO && " Accepted IDs for Virtual Office: Passport, Driver's License, Philippine National ID, or PRC ID."}
        </p>

        <label className="my-5 flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={contractIdentity.signatorySameAsIdHolder}
              onChange={(e) =>
                setContractIdentity((p) => ({
                  ...p,
                  signatorySameAsIdHolder: e.target.checked,
                  signatoryIdType: e.target.checked ? "" : p.signatoryIdType,
                  signatoryIdTypeOther: e.target.checked ? "" : p.signatoryIdTypeOther,
                  signatoryIdName: e.target.checked ? "" : p.signatoryIdName,
                  signatoryIdNumber: e.target.checked ? "" : p.signatoryIdNumber,
                  signatoryIdAddress: e.target.checked ? "" : p.signatoryIdAddress,
                  signatoryGovernmentIdFile: e.target.checked ? null : p.signatoryGovernmentIdFile,
                }))
              }
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${contractIdentity.signatorySameAsIdHolder ? "bg-[#0B1F4A] border-[#0B1F4A]" : "border-[#D9E2F0] bg-white group-hover:border-[#1B3A8C]"}`}>
              {contractIdentity.signatorySameAsIdHolder && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-[#4A5568] leading-relaxed">
            The client name on the government ID will be the signatory.
          </span>
        </label>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Government ID Type" required error={errors.idType}>
            <select
              value={contractIdentity.idType}
              onChange={(e) => setContractIdentity((p) => ({ ...p, idType: e.target.value, idTypeOther: "" }))}
              className={errors.idType ? inputErrCls : inputCls}
            >
              <option value="">Select ID type</option>
              {idTypeOptions.map((idType) => (
                <option key={idType} value={idType}>{idType}</option>
              ))}
            </select>
          </Field>

          {!isVO && contractIdentity.idType === "Others" && (
            <Field label="Specify ID Type" required error={errors.idTypeOther}>
              <input
                type="text"
                value={contractIdentity.idTypeOther}
                onChange={(e) => setContractIdentity((p) => ({ ...p, idTypeOther: e.target.value }))}
                className={errors.idTypeOther ? inputErrCls : inputCls}
                placeholder="Enter ID type"
              />
            </Field>
          )}

          <Field label="Name on Government ID" required error={errors.idName}>
            <input
              type="text"
              value={contractIdentity.idName}
              onChange={(e) => setContractIdentity((p) => ({ ...p, idName: e.target.value }))}
              className={errors.idName ? inputErrCls : inputCls}
              placeholder="As shown on your ID"
            />
          </Field>

          <Field label="Government ID Number" required error={errors.idNumber}>
            <input
              type="text"
              value={contractIdentity.idNumber}
              onChange={(e) => setContractIdentity((p) => ({ ...p, idNumber: e.target.value }))}
              className={errors.idNumber ? inputErrCls : inputCls}
              placeholder="Enter ID number"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Address on Government ID" required error={errors.idAddress}>
            <textarea
              rows={3}
              value={contractIdentity.idAddress}
              onChange={(e) => setContractIdentity((p) => ({ ...p, idAddress: e.target.value }))}
              className={(errors.idAddress ? inputErrCls : inputCls) + " resize-none"}
              placeholder="Complete address as shown on your ID"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Upload Government ID" required error={errors.governmentIdFile}>
            <button
              type="button"
              onClick={() => idUploadRef.current?.click()}
              className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all duration-200 ${contractIdentity.governmentIdFile ? "border-[#1B3A8C] bg-[#EEF2FB]" : "border-[#D9E2F0] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"}`}
            >
              <Upload className={`w-5 h-5 ${contractIdentity.governmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
              <span className={`text-sm font-semibold ${contractIdentity.governmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`}>
                {contractIdentity.governmentIdFile ? contractIdentity.governmentIdFile.name : "Click to upload government ID"}
              </span>
            </button>
            <input
              ref={idUploadRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setContractIdentity((p) => ({ ...p, governmentIdFile: e.target.files?.[0] ?? null }))}
            />
            <p className="text-xs text-[#64748B] mt-2">Accepted: JPG, PNG, PDF - Max 10 MB</p>
            {contractIdentity.governmentIdFile && isPreviewableFile(contractIdentity.governmentIdFile) && (
              <div className="mt-3 rounded-xl border border-[#D9E2F0] bg-white px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0B1F4A]">Preview uploaded ID</p>
                  <p className="text-[11px] text-[#64748B] truncate">{contractIdentity.governmentIdFile.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTarget({ title: "Government ID Preview", file: contractIdentity.governmentIdFile! })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B3A8C] hover:underline shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
              </div>
            )}
          </Field>
        </div>

        {!contractIdentity.signatorySameAsIdHolder && (
          <div className="mt-5 rounded-2xl border border-[#D9E2F0] bg-[#F8FAFD] p-5 space-y-5">
            <h4 className="text-sm font-bold text-[#0B1F4A]">Alternate Signatory Details</h4>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Signatory ID Type" required error={errors.signatoryIdType}>
                <select
                  value={contractIdentity.signatoryIdType}
                  onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdType: e.target.value, signatoryIdTypeOther: "" }))}
                  className={errors.signatoryIdType ? inputErrCls : inputCls}
                >
                  <option value="">Select ID type</option>
                  {idTypeOptions.map((idType) => (
                    <option key={idType} value={idType}>{idType}</option>
                  ))}
                </select>
              </Field>

              {!isVO && contractIdentity.signatoryIdType === "Others" && (
                <Field label="Specify Signatory ID Type" required error={errors.signatoryIdTypeOther}>
                  <input
                    type="text"
                    value={contractIdentity.signatoryIdTypeOther}
                    onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdTypeOther: e.target.value }))}
                    className={errors.signatoryIdTypeOther ? inputErrCls : inputCls}
                    placeholder="Enter ID type"
                  />
                </Field>
              )}

              <Field label="Signatory Name on Government ID" required error={errors.signatoryIdName}>
                <input
                  type="text"
                  value={contractIdentity.signatoryIdName}
                  onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdName: e.target.value }))}
                  className={errors.signatoryIdName ? inputErrCls : inputCls}
                  placeholder="As shown on signatory ID"
                />
              </Field>

              <Field label="Signatory ID Number" required error={errors.signatoryIdNumber}>
                <input
                  type="text"
                  value={contractIdentity.signatoryIdNumber}
                  onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdNumber: e.target.value }))}
                  className={errors.signatoryIdNumber ? inputErrCls : inputCls}
                  placeholder="Enter signatory ID number"
                />
              </Field>
            </div>

            <Field label="Signatory Address on Government ID" required error={errors.signatoryIdAddress}>
              <textarea
                rows={3}
                value={contractIdentity.signatoryIdAddress}
                onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdAddress: e.target.value }))}
                className={(errors.signatoryIdAddress ? inputErrCls : inputCls) + " resize-none"}
                placeholder="Complete address as shown on signatory ID"
              />
            </Field>

            <Field label="Upload Signatory Government ID" required error={errors.signatoryGovernmentIdFile}>
              <button
                type="button"
                onClick={() => signatoryUploadRef.current?.click()}
                className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all duration-200 ${contractIdentity.signatoryGovernmentIdFile ? "border-[#1B3A8C] bg-[#EEF2FB]" : "border-[#D9E2F0] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"}`}
              >
                <Upload className={`w-5 h-5 ${contractIdentity.signatoryGovernmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
                <span className={`text-sm font-semibold ${contractIdentity.signatoryGovernmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`}>
                  {contractIdentity.signatoryGovernmentIdFile ? contractIdentity.signatoryGovernmentIdFile.name : "Click to upload signatory government ID"}
                </span>
              </button>
              <input
                ref={signatoryUploadRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryGovernmentIdFile: e.target.files?.[0] ?? null }))}
              />
              <p className="text-xs text-[#64748B] mt-2">Accepted: JPG, PNG, PDF - Max 10 MB</p>
              {contractIdentity.signatoryGovernmentIdFile && isPreviewableFile(contractIdentity.signatoryGovernmentIdFile) && (
                <div className="mt-3 rounded-xl border border-[#D9E2F0] bg-white px-3 py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0B1F4A]">Preview uploaded signatory ID</p>
                    <p className="text-[11px] text-[#64748B] truncate">{contractIdentity.signatoryGovernmentIdFile.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTarget({ title: "Signatory ID Preview", file: contractIdentity.signatoryGovernmentIdFile! })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B3A8C] hover:underline shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </div>
              )}
            </Field>
          </div>
        )}
      </div>

      <NavRow onBack={onBack} onNext={handleNext} />

      <FilePreviewModal target={previewTarget} onClose={() => setPreviewTarget(null)} />
    </div>
  );
}

// Step 4: Review & Submit

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-[#F0F4FB] last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] shrink-0">{label}</span>
      <span className="text-sm text-[#0B1F4A] font-medium text-right">{value}</span>
    </div>
  );
}

function Step4({
  selectedService,
  selectedBranch,
  privateOffice,
  virtualOffice,
  coworking,
  meetingRoom,
  eventSpace,
  contact,
  contractIdentity,
  notes,
  consent,
  setConsent,
  onBack,
  onNext,
  isSubmitting,
  isVO,
}: {
  selectedService: ServiceId | null;
  selectedBranch: BranchId | null;
  privateOffice: PrivateOfficeFields;
  virtualOffice: VirtualOfficeFields;
  coworking: CoworkingFields;
  meetingRoom: MeetingRoomFields;
  eventSpace: EventSpaceFields;
  contact: ContactFields;
  contractIdentity: ContractIdentityFields;
  notes: string;
  consent: boolean;
  setConsent: (v: boolean) => void;
  onBack: () => void;
  onNext?: () => void;
  isSubmitting: boolean;
  isVO: boolean;
}) {
  const [modal, setModal] = useState<ModalKey>(null);
  const serviceName = SERVICES.find((s) => s.id === selectedService)?.label ?? "";
  const branchName = BRANCHES.find((b) => b.id === selectedBranch)?.label ?? "";

  const serviceRows = () => {
    if (selectedService === "private-office") return [
      { label: "Seats", value: privateOffice.seats },
      { label: "Move-in Date", value: privateOffice.moveInDate },
      { label: "Lease Term", value: privateOffice.leaseTerm },
      { label: "Other Requirements", value: privateOffice.otherRequirements },
    ];
    if (selectedService === "virtual-office") return [
      { label: "Package", value: virtualOffice.package },
      { label: "Start Date", value: virtualOffice.startDate },
      { label: "Months Duration", value: virtualOffice.months },
    ];
    if (selectedService === "coworking") return [
      { label: "Seats", value: coworking.seats },
      { label: "Start Date", value: coworking.startDate },
      { label: "Pass Type", value: coworking.terms },
      { label: "Other Requirements", value: coworking.otherRequirements },
    ];
    if (selectedService === "meeting-room") return [
      { label: "Date", value: meetingRoom.date },
      { label: "Time", value: meetingRoom.time },
      { label: "Participants", value: meetingRoom.participants },
      { label: "Duration", value: meetingRoom.duration },
      { label: "Additional Requirements", value: meetingRoom.additionalRequirements },
    ];
    if (selectedService === "event-space") return [
      { label: "Event Date", value: eventSpace.eventDate },
      { label: "Attendees", value: eventSpace.attendees },
      { label: "Duration", value: eventSpace.duration },
      { label: "Event Type", value: eventSpace.eventType },
      { label: "Other Requirements", value: eventSpace.otherRequirements },
    ];
    return [];
  };

  // For VO flow, "Review" submits the inquiry then goes to Payment step
  const nextLabel = isVO ? "Proceed to Payment" : "Get a Quote";

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">Review Your Request</h2>
      <p className="text-sm text-[#64748B] mb-7">Please confirm your details before submitting.</p>

      <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B1F4A]/40 mb-3">Service</p>
        <ReviewRow label="Selected Service" value={serviceName} />
        <ReviewRow label="Branch" value={branchName} />
        {serviceRows().map((r) => <ReviewRow key={r.label} label={r.label} value={r.value} />)}
      </div>

      {isVO && virtualOffice.package && virtualOffice.months && (
        <div className="mb-4">
          <VOPricingBreakdown pkg={virtualOffice.package} months={virtualOffice.months} />
        </div>
      )}

      <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 mb-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B1F4A]/40 mb-3">Contact</p>
        <ReviewRow label="Name" value={contact.name} />
        <ReviewRow label="Company" value={contact.company} />
        <ReviewRow label="Email" value={contact.email} />
        <ReviewRow label="Phone" value={contact.phone} />
        <ReviewRow
          label="Government ID Type"
          value={contractIdentity.idType === "Others" ? contractIdentity.idTypeOther : contractIdentity.idType}
        />
        <ReviewRow label="ID Name" value={contractIdentity.idName} />
        <ReviewRow label="ID Number" value={contractIdentity.idNumber} />
        <ReviewRow label="ID Address" value={contractIdentity.idAddress} />
        <ReviewRow
          label="Signatory"
          value={contractIdentity.signatorySameAsIdHolder ? contractIdentity.idName : contractIdentity.signatoryIdName}
        />
        <ReviewRow label="Other Requirements / Conditions" value={notes} />
      </div>

      {isVO && (
        <div className="bg-[#fffaec] border border-[#dbd4bd] rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <Wallet className="w-4 h-4 text-[#FFC107]/50 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-800 leading-relaxed">
            After confirming, you'll proceed to select your payment method and complete the transaction.
            Our admin team will then verify your payment and formally contact you to finalize your contract.
          </p>
        </div>
      )}

      <label className="flex items-start gap-3 cursor-pointer group mb-2">
        <div className="relative mt-0.5 shrink-0">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="sr-only" />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${consent ? "bg-[#0B1F4A] border-[#0B1F4A]" : "border-[#D9E2F0] bg-white group-hover:border-[#1B3A8C]"}`}>
            {consent && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-[#4A5568] leading-relaxed">
          I agree to the collection and processing of my personal information in accordance with{" "}
          <button
            type="button"
            onClick={() => setModal("privacy")}
            className="text-[#1B3A8C] font-semibold hover:underline"
          >
            HERO Serviced Office's Privacy Policy
          </button>.
        </span>
      </label>

      <NavRow
        onBack={onBack}
        nextLabel={nextLabel}
        nextDisabled={!consent}
        isSubmit={!isVO}
        isSubmitting={isSubmitting}
        onNext={onNext}
      />

      <Modal open={modal === "privacy"} onClose={() => setModal(null)} title="Privacy Policy">
        <PrivacyPolicyContent />
      </Modal>
    </div>
  );
}

// Step 5 (Virtual Office only): Payment & Contract

function StepVOPayment({
  virtualOffice,
  paymentMethod,
  setPaymentMethod,
  paymentReference,
  setPaymentReference,
  paymentProof,
  setPaymentProof,
  onBack,
  isSubmitting,
}: {
  virtualOffice: VirtualOfficeFields;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  paymentReference: string;
  setPaymentReference: (value: string) => void;
  paymentProof: File | null;
  setPaymentProof: (f: File | null) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const paymentProofRef = useRef<HTMLInputElement>(null);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);

  const pricing = virtualOffice.package && virtualOffice.months
    ? computeVirtualOfficeTotal(virtualOffice.package, virtualOffice.months)
    : null;

  // Only QRPH, Online Bank Transfer, and Bank Deposit are enabled.
  // Cash, Cheque, and standalone GCash have been removed/disabled per updated flow.
  const paymentOptions: Array<{
    id: Exclude<PaymentMethod, null>;
    icon: React.ElementType;
    label: string;
    sub: string;
    details: string[];
    hasQr?: boolean;
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
        hasQr: true,
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
  const canProceed =
    paymentMethod !== null && paymentReference.trim() !== "" && paymentProof !== null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">Payment & Contract</h2>
      <p className="text-sm text-[#64748B] mb-6">Choose how you'd like to pay for your virtual office service.</p>

      {/* Summary pill */}
      <div className="bg-[#EEF2FB] border border-[#C5D2EC] rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#1B3A8C] uppercase tracking-wide">Virtual Office — {virtualOffice.package}</p>
          <p className="text-xs text-[#64748B] mt-0.5">
            Starting {virtualOffice.startDate || "TBD"} · {virtualOffice.months || "—"} {Number(virtualOffice.months) === 1 ? "month" : "months"}
          </p>
        </div>
        <p className="text-md font-bold text-[#0B1F4A]">
          {pricing ? peso(pricing.total) : "—"}
        </p>
      </div>

      {pricing && (
        <div className="mb-6">
          <VOPricingBreakdown pkg={virtualOffice.package} months={virtualOffice.months} />
        </div>
      )}

      {/* Payment method selector */}
      <Field label="Payment Method" required error={!paymentMethod ? "Please select a payment method." : undefined}>
        <div className="grid sm:grid-cols-3 gap-3 mt-1">
          {paymentOptions.map((opt) => {
            const Icon = opt.icon;
            const active = paymentMethod === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => {
                  const isAlreadySelected = paymentMethod === opt.id;
                  setPaymentMethod(opt.id);
                  if (!isAlreadySelected) {
                    setPaymentProof(null);
                  }
                }}
                className={`rounded-2xl border-[1.5px] transition-all duration-200 ${active
                  ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C] text-left"
                  : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C]"
                  } p-4 text-left`}
                aria-pressed={active}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${active ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
                </div>
                <p className={`font-bold text-sm ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A]"}`}>{opt.label}</p>
                <p className="text-xs text-[#64748B]">{opt.sub}</p>
              </button>
            );
          })}
        </div>
      </Field>

      {selectedPaymentOption && (
        <div className="mt-6 bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[#0B1F4A] mb-3">Payment Details</p>
          <ul className="space-y-1.5">
            {selectedPaymentOption.details.map((detail) => (
              <li key={detail} className="text-xs text-[#64748B] leading-relaxed flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>

          {selectedPaymentOption.hasQr && (
            <div className="mt-3 rounded-xl border border-[#D9E2F0] bg-white p-3">
              <p className="text-[11px] font-semibold text-[#0B1F4A] mb-2">QRPH Code</p>
              <div className="flex items-center gap-3">
                <img
                  src="/payments/qrph-qr.svg"
                  alt="QRPH QR"
                  className="w-24 h-24 rounded-lg border border-[#D9E2F0] bg-white"
                />
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Scan using any QRPH-enabled banking or e-wallet app. If you need help, please contact HERO support for the official payment QR.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Field
          label="Reference Number"
          required
          error={!paymentReference.trim() ? "Please enter your payment reference number." : undefined}
        >
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            className={!paymentReference.trim() ? inputErrCls : inputCls}
            placeholder="e.g. Bank/QRPH transaction reference ID"
          />
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Upload Receipt" required error={!paymentProof ? "Please upload your receipt." : undefined}>
          <button
            type="button"
            onClick={() => paymentProofRef.current?.click()}
            className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all duration-200 ${paymentProof ? "border-[#1B3A8C] bg-[#EEF2FB]" : "border-[#D9E2F0] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"}`}
          >
            <Upload className={`w-5 h-5 ${paymentProof ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
            <span className={`text-sm font-semibold ${paymentProof ? "text-[#1B3A8C]" : "text-[#64748B]"}`}>
              {paymentProof ? paymentProof.name : "Click to upload receipt image or PDF"}
            </span>
          </button>
          <input ref={paymentProofRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)} />
          <p className="text-xs text-[#64748B] mt-2">Accepted: JPG, PNG, PDF · Max 10 MB</p>
          {paymentProof && isPreviewableFile(paymentProof) && (
            <div className="mt-3 rounded-xl border border-[#D9E2F0] bg-white px-3 py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0B1F4A]">Preview uploaded payment proof</p>
                <p className="text-[11px] text-[#64748B] truncate">{paymentProof.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTarget({ title: "Payment Proof Preview", file: paymentProof })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B3A8C] hover:underline shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
            </div>
          )}
        </Field>
      </div>

      {paymentMethod && (
        <div className="mt-6 space-y-4">
          <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-[#0B1F4A] mb-2">Payment Summary</p>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Selected: <span className="font-semibold text-[#0B1F4A]">{getPaymentMethodLabel(paymentMethod)}</span>
            </p>
            <p className="text-sm text-[#64748B] mt-2">
              Reference No.: <span className="font-semibold text-[#0B1F4A]">{paymentReference || "—"}</span>
            </p>
            {pricing && (
              <p className="text-sm text-[#64748B] mt-2">
                Amount Due: <span className="font-semibold text-[#0B1F4A]">{peso(pricing.total)}</span>
              </p>
            )}
          </div>

          <div className="bg-[#FFFBF0] border border-[#F0D98A] rounded-xl px-5 py-4 flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
            <div className="text-xs text-[#7A5C00] space-y-1 leading-relaxed">
              <p className="font-semibold">Admin verification within 24 business hours</p>
              <p>Our admin team will verify your payment within 24 business hours, then formally contact you directly to finalize your contract.</p>
            </div>
          </div>

        </div>
      )}

      <NavRow
        onBack={onBack}
        nextLabel="Confirm & Submit"
        nextDisabled={!canProceed}
        isSubmit={true}
        isSubmitting={isSubmitting}
      />

      <FilePreviewModal target={previewTarget} onClose={() => setPreviewTarget(null)} />
    </div>
  );
}

export default function GetAQuotePage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchId | null>(null);
  const [contact, setContact] = useState<ContactFields>({ name: "", company: "", email: "", phone: "" });
  const [contractIdentity, setContractIdentity] = useState<ContractIdentityFields>({
    idType: "",
    idTypeOther: "",
    idName: "",
    idNumber: "",
    idAddress: "",
    governmentIdFile: null,
    signatorySameAsIdHolder: true,
    signatoryIdType: "",
    signatoryIdTypeOther: "",
    signatoryIdName: "",
    signatoryIdNumber: "",
    signatoryIdAddress: "",
    signatoryGovernmentIdFile: null,
  });
  const [privateOffice, setPrivateOffice] = useState<PrivateOfficeFields>({ seats: "", moveInDate: "", leaseTerm: "", otherRequirements: "" });

  useEffect(() => {
    const branch = searchParams.get("branch");
    const service = searchParams.get("service");

    if (branch && BRANCHES.some((b) => b.id === branch)) {
      setSelectedBranch(branch as BranchId);
    }

    if (service && SERVICES.some((s) => s.id === service)) {
      setSelectedService(service as ServiceId);
    }
  }, [searchParams]);
  const [virtualOffice, setVirtualOffice] = useState<VirtualOfficeFields>({ package: "", startDate: "", months: "" });
  const [coworking, setCoworking] = useState<CoworkingFields>({ seats: "", startDate: "", terms: "", otherRequirements: "" });
  const [meetingRoom, setMeetingRoom] = useState<MeetingRoomFields>({ date: "", time: "", participants: "", duration: "", additionalRequirements: "" });
  const [eventSpace, setEventSpace] = useState<EventSpaceFields>({ eventDate: "", attendees: "", duration: "", eventType: "", otherRequirements: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalKey>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 2 validation errors (set on attempted advance)
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  const isVO = selectedService === "virtual-office";
  // Standard: Service(1) → Requirements(2) → Contact(3) → Review(4)
  // Virtual Office: Service(1) → Requirements(2) → Contact(3) → Review(4) → Payment(5)
  const steps = isVO ? VO_STEPS : BASE_STEPS;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Step 2 validation per service
  const validateStep2 = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (selectedService === "private-office") {
      const maxSeats = selectedBranch ? PRIVATE_OFFICE_MAX_SEATS[selectedBranch] : Math.max(...Object.values(PRIVATE_OFFICE_MAX_SEATS));
      if (!privateOffice.seats || Number(privateOffice.seats) < 1) errs.seats = "Please enter a valid number of seats (min 1).";
      else if (Number(privateOffice.seats) > maxSeats) errs.seats = `Maximum ${maxSeats} seats available at this branch.`;
      if (!privateOffice.moveInDate) errs.moveInDate = "Please select a target move-in date.";
      if (!privateOffice.leaseTerm) errs.leaseTerm = "Please select a lease term.";
    }
    if (selectedService === "virtual-office") {
      if (!virtualOffice.package) errs.package = "Please select a package.";
      if (!virtualOffice.startDate) errs.startDate = "Please select a preferred start date.";
      if (!virtualOffice.months) errs.months = "Please select the months duration.";
    }
    if (selectedService === "coworking") {
      if (!coworking.seats || Number(coworking.seats) < 1) errs.seats = "Please enter a valid number of seats.";
      if (!coworking.startDate) errs.startDate = "Please select a preferred start date.";
      if (!coworking.terms) errs.passType = "Please select a pass type.";
    }
    if (selectedService === "meeting-room") {
      if (!meetingRoom.date) errs.date = "Please select a reservation date.";
      if (!meetingRoom.time) errs.time = "Please select a preferred time.";
      if (!meetingRoom.participants || Number(meetingRoom.participants) < 1) errs.participants = "Please enter a valid number of participants.";
      if (!meetingRoom.duration) errs.duration = "Please select a duration.";
    }
    if (selectedService === "event-space") {
      if (!eventSpace.eventDate) errs.eventDate = "Please select an event date.";
      if (!eventSpace.attendees || Number(eventSpace.attendees) < 1) errs.attendees = "Please enter an estimated number of attendees.";
      if (!eventSpace.duration) errs.duration = "Please select an event duration.";
      if (!eventSpace.eventType) errs.eventType = "Please select an event type.";
    }
    return errs;
  };

  const handleStep2Next = () => {
    const errs = validateStep2();
    setStep2Errors(errs);
    if (Object.keys(errs).length === 0) setStep(3);
  };

  const handleReset = useCallback(() => {
    setStep(1);
    setSelectedService(null);
    setSelectedBranch(null);
    setContact({ name: "", company: "", email: "", phone: "" });
    setContractIdentity({
      idType: "",
      idTypeOther: "",
      idName: "",
      idNumber: "",
      idAddress: "",
      governmentIdFile: null,
      signatorySameAsIdHolder: true,
      signatoryIdType: "",
      signatoryIdTypeOther: "",
      signatoryIdName: "",
      signatoryIdNumber: "",
      signatoryIdAddress: "",
      signatoryGovernmentIdFile: null,
    });
    setPrivateOffice({ seats: "", moveInDate: "", leaseTerm: "", otherRequirements: "" });
    setVirtualOffice({ package: "", startDate: "", months: "" });
    setCoworking({ seats: "", startDate: "", terms: "", otherRequirements: "" });
    setMeetingRoom({ date: "", time: "", participants: "", duration: "", additionalRequirements: "" });
    setEventSpace({ eventDate: "", attendees: "", duration: "", eventType: "", otherRequirements: "" });
    setPaymentMethod(null);
    setPaymentReference("");
    setPaymentProof(null);
    setNotes("");
    setConsent(false);
    setStep2Errors({});
    setModal(null);
    setSubmitError(null);
  }, []);

  // Builds the payload expected by App\Http\Controllers\Api\QuotationController::store
  const buildPayload = () => {
    const serviceLabel = SERVICES.find((s) => s.id === selectedService)?.label ?? "";
    const branchLabel = BRANCHES.find((b) => b.id === selectedBranch)?.label ?? "";

    // Shared detail fields
    const detail: Record<string, unknown> = {
      full_name: contact.name,
      company_name: contact.company || null,
      email: contact.email,
      phone: contact.phone,
      request: notes || null,
      payment_method: paymentMethod ?? null,
      transaction_id: paymentReference.trim() || null,
      receipt: paymentProof ? paymentProof.name : null,
      id_type: contractIdentity.idType === "Others" ? contractIdentity.idTypeOther : contractIdentity.idType,
      id_name: contractIdentity.idName || null,
      id_number: contractIdentity.idNumber || null,
      id_address: contractIdentity.idAddress || null,
      signatory_same_as_id_holder: contractIdentity.signatorySameAsIdHolder,
      signatory_id_name: contractIdentity.signatorySameAsIdHolder ? null : contractIdentity.signatoryIdName || null,
      signatory_id_number: contractIdentity.signatorySameAsIdHolder ? null : contractIdentity.signatoryIdNumber || null,
      signatory_id_address: contractIdentity.signatorySameAsIdHolder ? null : contractIdentity.signatoryIdAddress || null,
      signatory_id_type: contractIdentity.signatorySameAsIdHolder
        ? null
        : (contractIdentity.signatoryIdType === "Others" ? contractIdentity.signatoryIdTypeOther : contractIdentity.signatoryIdType),
      signatory_details: contractIdentity.signatorySameAsIdHolder
        ? `${contractIdentity.idName || contact.name}`
        : `${contractIdentity.signatoryIdName} (${contractIdentity.signatoryIdType === "Others" ? contractIdentity.signatoryIdTypeOther : contractIdentity.signatoryIdType})`,
      government_id_file: contractIdentity.governmentIdFile ? contractIdentity.governmentIdFile.name : null,
      signatory_id_file: contractIdentity.signatoryGovernmentIdFile ? contractIdentity.signatoryGovernmentIdFile.name : null,
    };

    let lease_term: string | null = null;
    let pkg: string | null = null;
    let event_type: string | null = null;
    let total = 0;

    if (selectedService === "private-office") {
      detail.seats = Number(privateOffice.seats) || null;
      detail.date = privateOffice.moveInDate;
      detail.duration_type = privateOffice.leaseTerm;
      detail.other_requirements = privateOffice.otherRequirements || null;
      lease_term = privateOffice.leaseTerm;
    } else if (selectedService === "virtual-office") {
      detail.date = virtualOffice.startDate;
      detail.months = Number(virtualOffice.months) || null;
      const pricing = computeVirtualOfficeTotal(virtualOffice.package, virtualOffice.months);
      detail.price_breakdown = {
        package_base_monthly: pricing.base,
        vat_monthly: pricing.vat,
        monthly_subtotal: pricing.monthlySubtotal,
        months: pricing.numMonths,
        recurring_total: pricing.recurring,
        contract_admin_fee: pricing.contractAdminFee,
      };
      total = pricing.total;
      pkg = virtualOffice.package;
    } else if (selectedService === "coworking") {
      detail.seats = Number(coworking.seats) || null;
      detail.date = coworking.startDate;
      detail.duration_type = coworking.terms;
      detail.other_requirements = coworking.otherRequirements || null;
    } else if (selectedService === "meeting-room") {
      detail.seats = Number(meetingRoom.participants) || null;
      detail.date = meetingRoom.date;
      detail.time = meetingRoom.time;
      detail.duration_type = meetingRoom.duration;
      detail.other_requirements = meetingRoom.additionalRequirements || null;
    } else if (selectedService === "event-space") {
      detail.seats = Number(eventSpace.attendees) || null;
      detail.date = eventSpace.eventDate;
      detail.duration_type = eventSpace.duration;
      detail.other_requirements = eventSpace.otherRequirements || null;
      event_type = eventSpace.eventType;
    }

    detail.total = total;

    return {
      service_id: selectedService ? SERVICE_IDS[selectedService] : null,
      service_name: serviceLabel,
      branch: branchLabel,
      lease_term,
      package: pkg,
      event_type,
      status: "pending",
      detail,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      const hasFileUploads = !!paymentProof || !!contractIdentity.governmentIdFile || !!contractIdentity.signatoryGovernmentIdFile;
      const headers: HeadersInit = {
        Accept: "application/json",
      };

      let body: BodyInit;
      if (hasFileUploads) {
        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));

        if (paymentProof) {
          formData.append("payment_proof", paymentProof);
        }
        if (contractIdentity.governmentIdFile) {
          formData.append("government_id", contractIdentity.governmentIdFile);
        }
        if (contractIdentity.signatoryGovernmentIdFile) {
          formData.append("signatory_government_id", contractIdentity.signatoryGovernmentIdFile);
        }

        body = formData;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(payload);
      }

      const res = await fetch(`${API_BASE_URL}/quotations`, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Request failed with status ${res.status}`);
      }

      setModal("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setModal(null);
    handleReset();
  };

  const renderStep2 = () => {
    if (selectedService === "private-office") return (
      <Step2PrivateOffice
        data={privateOffice}
        onChange={(d) => { setPrivateOffice((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
        branch={selectedBranch}
      />
    );
    if (selectedService === "virtual-office") return (
      <Step2VirtualOffice
        data={virtualOffice}
        onChange={(d) => { setVirtualOffice((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
        notes={notes}
        setNotes={setNotes}
      />
    );
    if (selectedService === "coworking") return (
      <Step2Coworking
        data={coworking}
        onChange={(d) => { setCoworking((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
      />
    );
    if (selectedService === "meeting-room") return (
      <Step2MeetingRoom
        data={meetingRoom}
        onChange={(d) => { setMeetingRoom((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
      />
    );
    if (selectedService === "event-space") return (
      <Step2EventSpace
        data={eventSpace}
        onChange={(d) => { setEventSpace((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
      />
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="Hero Serviced Office"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0B1F4A]/90 to-[#1B3A8C]/60" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-md">Get a Quote</h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed text-shadow-sm">
              Tell us about your workspace requirements and our team will prepare a customised quotation for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <StepRail step={step} steps={steps} />

        <form onSubmit={handleSubmit}>
          {submitError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-[#FFF5F5] px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_4px_24px_rgba(11,31,74,0.06)] border border-[#D9E2F0]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                {/* Step 1: Service Selection */}
                {step === 1 && (
                  <Step1
                    selectedService={selectedService}
                    setSelectedService={(s) => { setSelectedService(s); setStep2Errors({}); }}
                    selectedBranch={selectedBranch}
                    setSelectedBranch={(b) => { setSelectedBranch(b); setStep2Errors({}); }}
                    onNext={() => setStep(2)}
                  />
                )}

                {/* Step 2: Requirements */}
                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">
                      {SERVICES.find((s) => s.id === selectedService)?.label} Requirements
                    </h2>
                    <p className="text-sm text-[#64748B] mb-7">Fill in the details for your selected service.</p>
                    {renderStep2()}
                    <NavRow
                      onBack={() => setStep(1)}
                      onNext={handleStep2Next}
                    />
                  </div>
                )}

                {/* Step 3: Contact (both flows) */}
                {step === 3 && (
                  <Step3
                    isVO={isVO}
                    contact={contact}
                    contractIdentity={contractIdentity}
                    setContact={setContact}
                    setContractIdentity={setContractIdentity}
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                  />
                )}

                {/* Step 4: Review — for all services */}
                {step === 4 && (
                  <Step4
                    selectedService={selectedService}
                    selectedBranch={selectedBranch}
                    privateOffice={privateOffice}
                    virtualOffice={virtualOffice}
                    coworking={coworking}
                    meetingRoom={meetingRoom}
                    eventSpace={eventSpace}
                    contact={contact}
                    contractIdentity={contractIdentity}
                    notes={notes}
                    consent={consent}
                    setConsent={setConsent}
                    onBack={() => setStep(3)}
                    onNext={() => setStep(5)}
                    isSubmitting={isSubmitting}
                    isVO={isVO}
                  />
                )}

                {/* Step 5 (VO only): Payment — this is the final submit step for VO */}
                {step === 5 && isVO && (
                  <StepVOPayment
                    virtualOffice={virtualOffice}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    paymentReference={paymentReference}
                    setPaymentReference={setPaymentReference}
                    paymentProof={paymentProof}
                    setPaymentProof={setPaymentProof}
                    onBack={() => setStep(4)}
                    isSubmitting={isSubmitting}
                  />
                )}

                {/* Hidden submit trigger for step 4 (non-VO): advances to Success */}
                {step === 4 && !isVO && (
                  <input type="submit" className="hidden" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </form>
      </section>

      {/* Success Modal */}
      <Modal
        open={modal === "success"}
        onClose={handleSuccessClose}
        title="Request Submitted"
        hideClose={false}
      >
        <SuccessModalContent
          isVO={isVO}
          paymentMethod={paymentMethod}
          onClose={handleSuccessClose}
        />
      </Modal>
    </div>
  );
}

// Privacy Policy
function PrivacyPolicyContent() {
  return (
    <>
      <p>
        Thank you very much for using the services provided by Hero PH INC. (hereinafter,
        "we/our/us").
      </p>
      <p>
        The Privacy Policy (hereinafter, "the Policy") sets forth our privacy information handling
        principles. You or users are deemed to have agreed with the Policy if you use our services.
      </p>
      <Section title="(1) What is privacy information?">
        Privacy information includes both personal information; and history information and
        characteristic information. Personal information refers to the personal information
        prescribed in the Act on the Protection of Personal Information or information relating to a
        living individual, specifically the name, date of birth, address, telephone number and other
        contact information, and any other described information that can identify individuals.
        Information other than personal information corresponds to history and characteristic
        information, such as services used, products purchased, history of pages/ads viewed, search
        keywords used by users, time and date of use, methods of using, using environment, postal
        code, gender, occupation, age, user's IP address, cookie information, location information,
        and terminal identification information.
      </Section>
      <Section title="(2) How do you collect privacy information?">
        We may collect personal information when a user makes a user registration or use any of our
        services and/or history and characteristic information of a user when a user uses any of our
        services or views any of the pages of our website.
      </Section>
      <Section title="(3) For what purpose do you use privacy information?">
        <ul className="list-[upper-alpha] list-inside space-y-2 mt-1">
          <li>To present registered information so that users can view and/or correct their registered information and view the status of use.</li>
          <li>To use an e-mail address to notify or contact users, or to send products to users.</li>
          <li>To use information such as name, date of birth, and address for user identity verification.</li>
          <li>To use payment-related information in order to charge users.</li>
          <li>To display registered information on input screens so that users can enter data easily.</li>
          <li>To refuse the use of the Service by users who violate the Terms of Use.</li>
          <li>To answer inquiries from users.</li>
          <li>To prepare statistical data processed in a form that does not permit personal identification.</li>
          <li>To distribute or display advertisements of us or a third party.</li>
          <li>To use privacy information for marketing.</li>
          <li>Purposes incidental to the purposes of use above.</li>
        </ul>
      </Section>
      <Section title="(4) Do you provide privacy information for a third party?">
        We will not provide privacy information for a third party without prior approval of users
        except where required under laws and regulations.
      </Section>
      <Section title="(5) Can I check my privacy information or request correction?">
        If a user requests disclosure of their own privacy information, we will disclose it without
        delay unless doing so would harm the interests of the user or third party.
      </Section>
      <Section title="(6) Can I request discontinuation of use?">
        Users may request discontinuation of use of their privacy information. We will conduct a
        necessary investigation and take appropriate measures.
      </Section>
      <Section title="(7) Change of Privacy Policy">
        This Privacy Policy is subject to changes without notice. Changes take effect when posted to this website.
      </Section>
      <Section title="(8) Inquiry Contact">
        <p>Contact person: Minoru Kobayashi</p>
        <p>Company name: Hero Serviced Office Inc.</p>
        <p>Address: 23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines</p>
        <p>
          E-mail:{" "}
          <a href="mailto:salesofficer@heroph.net" className="text-[#1565C0] underline">
            salesofficer@heroph.net
          </a>
        </p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-[#0A1E3F] mb-1">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </div>
  );
}

function getPaymentMethodLabel(paymentMethod: PaymentMethod | string | null | undefined) {
  switch (paymentMethod) {
    case "qrph":
      return "QRPH";
    case "online_transfer":
      return "Online Bank Transfer";
    case "bank":
      return "Bank Deposit";
    default:
      return paymentMethod || "—";
  }
}

function isPreviewableFile(file: File) {
  return file.type.startsWith("image/") || file.type === "application/pdf";
}

function FilePreviewModal({ target, onClose }: { target: PreviewTarget | null; onClose: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!target) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(target.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [target]);

  if (!target || !previewUrl) return null;

  const isImage = target.file.type.startsWith("image/");

  return (
    <Modal open={true} onClose={onClose} title={target.title}>
      <div className="space-y-3">
        <p className="text-xs text-[#64748B]">
          {target.file.name}
        </p>
        <div className="rounded-xl border border-[#D9E2F0] bg-[#F8FAFD] p-3">
          {isImage ? (
            <img src={previewUrl} alt={target.file.name} className="max-h-[60vh] w-full object-contain rounded-lg" />
          ) : (
            <iframe src={previewUrl} title={target.file.name} className="h-[60vh] w-full rounded-lg bg-white" />
          )}
        </div>
      </div>
    </Modal>
  );
}