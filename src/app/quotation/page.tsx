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
  Wallet,
  Upload,
  AlertCircle,
  MapPin,
  Eye,
} from "lucide-react";

type ServiceId = "private-office" | "virtual-office" | "coworking" | "meeting-room" | "event-space";
type BranchId = "tower-6789" | "insular-life";
type ModalKey = "privacy" | "success" | "preview" | null;

interface ContactFields {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
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
  months: string;
}

interface CoworkingFields {
  seats: string;
  startDate: string;
  endDate: string;
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
  time: string;
  attendees: string;
  duration: string;
  eventType: string;
  otherRequirements: string;
}

const SERVICES: { id: ServiceId; label: string; labelJa: string; icon: React.ElementType }[] = [
  { id: "private-office", label: "Private Office", labelJa: "個室オフィス", icon: Building2 },
  { id: "virtual-office", label: "Virtual Office", labelJa: "バーチャルオフィス", icon: Wifi },
  { id: "coworking", label: "Co-working Space", labelJa: "コワーキングスペース", icon: Armchair },
  { id: "meeting-room", label: "Meeting Room", labelJa: "会議室", icon: CalendarDays },
  { id: "event-space", label: "Event Space", labelJa: "イベントスペース", icon: PartyPopper },
];

const BRANCHES: { id: BranchId; label: string; labelJa: string; address: string; addressJa: string }[] = [
  { id: "tower-6789", label: "Tower 6789", labelJa: "タワー6789", address: "23rd Floor, Tower 6789, Ayala Ave., Makati City, 1226 Metro Manila, Philippines", addressJa: "マカティ市アヤラ通り6789番地、23階" },
  { id: "insular-life", label: "Insular Life Building", labelJa: "インシュラー・ライフ・ビル", address: "11th Floor, Insular Life Building, 6781 Ayala Ave. cor. Paseo de Roxas, Makati City, 1226 Metro Manila, Philippines", addressJa: "11 階、6781 アヤラ アベニュー コーナー パセオ デ ロハス、マカティ" },
];

const PRIVATE_OFFICE_MAX_SEATS: Record<BranchId, number> = {
  "tower-6789": 25,
  "insular-life": 30,
};

const API_BASE_URL = "/api";

const SERVICE_IDS: Record<ServiceId, number> = {
  "private-office": 1,
  "virtual-office": 2,
  "coworking": 3,
  "meeting-room": 4,
  "event-space": 5,
};

const BASE_STEPS = ["Service", "Requirements", "Contact", "Review"];
const BASE_STEPS_JA = ["サービス", "要件", "連絡先", "確認"];
const VO_STEPS = BASE_STEPS;
const VO_STEPS_JA = BASE_STEPS_JA;

const PRIVATE_TERMS = ["3 Months", "6 Months", "9 Months", "12 Months"];
const PRIVATE_TERMS_JA = ["3か月", "6か月", "9か月", "12か月"];
const COWORKING_TERMS = ["Daily", "Weekly", "Monthly", "Yearly"];
const COWORKING_TERMS_JA = ["日単位", "週単位", "月単位", "年単位"];

const TIME_SLOTS = [
  ["7:00", "7:00 AM"], ["8:00", "8:00 AM"], ["9:00", "9:00 AM"], ["10:00", "10:00 AM"], ["11:00", "11:00 AM"],
  ["13:00", "1:00 PM"], ["14:00", "2:00 PM"], ["15:00", "3:00 PM"], ["16:00", "4:00 PM"],
  ["17:00", "5:00 PM"], ["18:00", "6:00 PM"], ["19:00", "7:00 PM"], ["20:00", "8:00 PM"],
];

function translatePillOption(value: string, isJapanese: boolean) {
  if (!isJapanese) return value;
  const idx = PRIVATE_TERMS.indexOf(value);
  if (idx !== -1) return PRIVATE_TERMS_JA[idx];
  const idx2 = COWORKING_TERMS.indexOf(value);
  if (idx2 !== -1) return COWORKING_TERMS_JA[idx2];
  if (value === "Yes") return "はい";
  if (value === "No") return "いいえ";
  return value;
}

function normalizeQuotationService(value: string | null): ServiceId | null {
  if (!value) return null;

  const normalized = value === "co-working-space" ? "coworking" : value;
  return SERVICES.some((service) => service.id === normalized)
    ? (normalized as ServiceId)
    : null;
}

// Standard accepted government IDs (used by non-VO services / general fallback)
const GOVERNMENT_ID_TYPES = [
  "Philippine National ID (PhilSys ID)",
  "Passport",
  "Driver's License",
  "Professional Regulation Commission (PRC ID)",
  "Others",
];

const GOVERNMENT_ID_TYPES_JA: Record<string, string> = {
  "Philippine National ID (PhilSys ID)": "フィリピン国民ID（PhilSys ID）",
  "Passport": "パスポート",
  "Driver's License": "運転免許証",
  "Professional Regulation Commission (PRC ID)": "専門職規制委員会ID（PRC ID）",
  "Others": "その他",
};

const translateIdType = (value: string, isJapanese: boolean) =>
  isJapanese ? (GOVERNMENT_ID_TYPES_JA[value] ?? value) : value;

// Virtual Office package base monthly fees (before VAT / fees / duration multiplier)
const VO_PACKAGE_PRICES: Record<string, number> = {
  Basic: 2000,
  Standard: 3000,
  Premium: 5000,
};

const VO_VAT_RATE = 0.12; // 12% VAT

// Contract & admin fee — charged once, not multiplied by duration
const VO_CONTRACT_ADMIN_FEE: Record<string, number> = {
  Basic: 500,
  Standard: 500,
  Premium: 1000,
};

const VO_MONTHS_OPTIONS = ["1", "3", "6", "12"];

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPhone = (phone: string) =>
  /^(\+?63|0)[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(
    phone.replace(/\s/g, "")
  );

function computeVirtualOfficeTotal(pkg: string, months: string) {
  const base = VO_PACKAGE_PRICES[pkg] ?? 0;
  const vat = base * VO_VAT_RATE;

  const monthlySubtotal = base + vat; // Monthly package price including VAT
  const numMonths = Math.max(1, Number(months) || 1);
  const recurring = monthlySubtotal * numMonths; // Monthly cost × number of months
  const contractAdminFee = VO_CONTRACT_ADMIN_FEE[pkg] ?? 0; // One-time contract/admin fee
  const contractVat = contractAdminFee * VO_VAT_RATE;
  const total = recurring + contractAdminFee + contractVat; // Final total
  return {
    base,
    vat,
    monthlySubtotal,
    numMonths,
    recurring,
    contractAdminFee,
    contractVat,
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

function PillSelect({ options, value, onChange, isJapanese }: { options: string[]; value: string; onChange: (v: string) => void; isJapanese?: boolean }) {
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
          {isJapanese ? translatePillOption(opt, true) : opt}
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
  registeredBusiness,
  withholdingTax,
  isJapanese,
  onClose,
}: {
  isVO: boolean;
  registeredBusiness: boolean | null;
  withholdingTax: boolean | null;
  isJapanese: boolean;
  onClose: () => void;
}) {
  const kicker = isVO
    ? (isJapanese ? "バーチャルオフィスのお申し込み" : "Virtual Office Request")
    : (isJapanese ? "お見積もりを受け付けました" : "Quotation Received");

  const bodyText = withholdingTax
    ? (isJapanese
      ? "お問い合わせを受け付けました。担当の営業担当者よりメールにて詳しいご案内をお送りいたします。"
      : "Your inquiry has been submitted. Our Sales Officer will provide the necessary instructions manually via email.")
    : isVO && registeredBusiness
      ? (isJapanese
        ? "お申し込みを受け付けました。担当の営業担当者よりメールにて詳しいご案内をお送りいたします。"
        : "Your request has been submitted. Our Sales Officer will email you the necessary instructions.")
      : isVO
        ? (isJapanese
          ? "バーチャルオフィスのお申し込みを受け付けました。管理チームが詳細を確認のうえ、確認が完了次第、お支払い用の安全なリンクをメールでお送りします。"
          : "Your virtual office request has been received. Our admin team will review your details and, once verified, email you a secure link to complete payment.")
        : (isJapanese
          ? "お見積もりのご依頼を受け付けました。Hero Serviced Office, Inc. の担当者より24営業時間以内にご連絡いたします。"
          : "Your quotation request has been received. A Hero Serviced Office, Inc. representative will contact you within 24 business hours.");

  const stepsList = withholdingTax
    ? (isJapanese
      ? ["お問い合わせは営業担当者に転送されました", "必要なご案内はメールにてお送りします"]
      : ["Your inquiry has been forwarded to our Sales Officer", "The necessary instructions will be sent to you by email"])
    : isVO && registeredBusiness
      ? (isJapanese
        ? ["お申し込みは営業担当者に転送されました", "必要なご案内はメールにてお送りします"]
        : ["Your request has been forwarded to our Sales Officer", "The necessary instructions will be sent to you by email"])
      : isVO
        ? (isJapanese
          ? [
            "管理チームが送信されたお申し込み内容を確認・検証します",
            "確認が完了次第、お支払い用の安全なリンクをメールでお送りします",
            "お支払いが確認され次第、管理チームより契約手続きについてご連絡いたします",
          ]
          : [
            "Our admin team will review and verify your submitted request",
            "Once verified, we'll email you a secure link to complete payment",
            "After payment is confirmed, our admin will formally contact you to finalize your contract",
          ])
        : (isJapanese
          ? [
            "サービスのご要件とご希望を確認いたします",
            "お客様に合わせた見積書を作成いたします",
            "次のステップについて、メールまたはお電話でご連絡いたします",
          ]
          : [
            "We'll review your service requirements and preferences",
            "A customised quotation will be prepared for you",
            "Our team will reach out via email or phone to discuss next steps",
          ]);

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-[#EEF2FB] rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-[#1B3A8C]" />
      </div>

      <p className="text-[10px] tracking-[0.25em] uppercase text-[#64748B] mb-2">{kicker}</p>
      <h3 className="text-2xl font-bold text-[#0B1F4A] mb-3">{isJapanese ? "ありがとうございます！" : "Thank You!"}</h3>

      <p className="text-[#64748B] text-sm leading-relaxed mb-6">{bodyText}</p>

      <div className="bg-[#F4F6FB] rounded-2xl p-5 text-left mb-6 space-y-3">
        {stepsList.map((s, i) => (
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
          {isJapanese ? "別のお申し込みを送信する" : "Submit another request"}
        </button>
        <a
          href="/"
          className="px-8 py-3 bg-[#F0EDE6] text-[#4A4740] rounded-full text-sm font-semibold hover:bg-[#E5E1D9] transition"
        >
          {isJapanese ? "ホームに戻る" : "Back to home"}
        </a>
      </div>
    </div>
  );
}

// Step Rail

function StepRail({ step, steps, isJapanese }: { step: number; steps: string[]; isJapanese: boolean }) {
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
  nextLabel,
  isSubmit,
  isSubmitting,
  isJapanese,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  isSubmit?: boolean;
  isSubmitting?: boolean;
  isJapanese?: boolean;
}) {
  const resolvedNextLabel = nextLabel ?? (isJapanese ? "続ける" : "Continue");
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#D9E2F0]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-[#FFC107] text-[#1B3A8C] text-sm font-bold rounded-full hover:border-[#FFC107] hover:text-[#1B3A8C] transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" /> {isJapanese ? "戻る" : "Back"}
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
            {isJapanese ? "送信中..." : "Submitting…"}
          </>
        ) : (
          <>{resolvedNextLabel}<ChevronRight className="w-4 h-4" /></>
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
  isJapanese,
}: {
  selectedService: ServiceId | null;
  setSelectedService: (s: ServiceId) => void;
  selectedBranch: BranchId | null;
  setSelectedBranch: (b: BranchId) => void;
  onNext: () => void;
  isJapanese: boolean;
}) {
  const [touched, setTouched] = useState(false);

  const handleNext = () => {
    setTouched(true);
    const branchRequired = selectedService !== "private-office";
    if (selectedService && (selectedBranch || !branchRequired)) onNext();
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#0B1F4A] mb-2">{isJapanese ? "サービスを選択" : "Select a Service"}</h2>
      <p className="text-md text-[#64748B] mb-7">{isJapanese ? "ご希望のワークスペースを選んでください。" : "Choose the workspace solution you're interested in."}</p>
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
                <p className={`font-semibold text-md ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A] group-hover:text-[#1B3A8C]"}`}>{isJapanese ? s.labelJa : s.label}</p>
              </div>
            </button>
          );
        })}
      </div>
      {touched && !selectedService && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {isJapanese ? "続行するにはサービスを選択してください。" : "Please select a service to continue."}
        </div>
      )}

      <div className="mt-12 border-t border-slate-200 pt-10">
        <div className="mb-8">

          <h3 className="mt-4 text-3xl font-bold text-[#0B1F4A]">
            {isJapanese
              ? `ご希望の支店を選択${selectedService === "private-office" ? "（任意）" : ""}`
              : `Select Preferred Branch${selectedService === "private-office" ? " (Optional)" : ""}`}
          </h3>

          <p className="mt-3 text-base leading-relaxed text-slate-500">
            {isJapanese
              ? "お問い合わせ、見学、またはワークスペースの予約を希望するHero Serviced Office, Inc.の場所を選択してください。"
              : "Select the Hero Serviced Office, Inc. location where you'd like to inquire, schedule a visit, or reserve your workspace."}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {BRANCHES.map((b) => {
            const active = selectedBranch === b.id;
            const disabled = selectedService === "event-space" && b.id === "tower-6789";

            return (
              <button
                key={b.id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setSelectedBranch(b.id)}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-6 text-left transition-all duration-300 ${disabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
                  : active
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
                        {isJapanese ? b.labelJa : b.label}
                      </div>
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {disabled
                        ? (isJapanese ? "イベントスペースではご利用いただけません" : "Unavailable for Event Space")
                        : (isJapanese ? b.addressJa : b.address)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {touched && !selectedBranch && selectedService !== "private-office" && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{isJapanese ? "続行するには、支店を選択してください。" : "Please select a branch to continue."}</span>
          </div>
        )}
      </div>

      <NavRow onNext={handleNext} nextLabel={isJapanese ? "次へ" : "Continue"} isJapanese={isJapanese} />
    </div>
  );
}

// Step 2: Requirements
function Step2PrivateOffice({
  data,
  onChange,
  errors,
  branch,
  isJapanese,
}: {
  data: PrivateOfficeFields;
  onChange: (d: Partial<PrivateOfficeFields>) => void;
  errors: Partial<Record<keyof PrivateOfficeFields, string>>;
  branch: BranchId | null;
  isJapanese: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  const maxSeats = branch ? PRIVATE_OFFICE_MAX_SEATS[branch] : Math.max(...Object.values(PRIVATE_OFFICE_MAX_SEATS));
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={isJapanese ? "席数" : "Number of Seats"} required error={errors.seats}>
          <input
            id="private-office-seats"
            name="seats"
            type="number"
            min={1}
            max={maxSeats}
            value={data.seats}
            onChange={(e) => onChange({ seats: e.target.value })}
            className={errors.seats ? inputErrCls : inputCls}
            placeholder={isJapanese ? "席数" : "Number of Seats"}
          />
        </Field>
        <Field label={isJapanese ? "入居希望日" : "Target Move-in Date"} required error={errors.moveInDate}>
          <input
            id="private-office-move-in-date"
            name="moveInDate"
            type="date"
            min={today}
            value={data.moveInDate}
            onChange={(e) => onChange({ moveInDate: e.target.value })}
            className={errors.moveInDate ? inputErrCls : inputCls}
          />
        </Field>
      </div>
      <Field label={isJapanese ? "契約期間" : "Lease Term"} required error={errors.leaseTerm}>
        <PillSelect options={PRIVATE_TERMS} value={data.leaseTerm} onChange={(v) => onChange({ leaseTerm: v })} isJapanese={isJapanese} />
      </Field>
      <Field label={isJapanese ? "その他のご要望・条件" : "Other Requirements / Conditions"}>
        <textarea
          id="private-office-other-requirements"
          name="otherRequirements"
          rows={3}
          value={data.otherRequirements}
          onChange={(e) => onChange({ otherRequirements: e.target.value })}
          className={inputCls + " resize-none"}
          placeholder={isJapanese ? "レイアウトのご希望、追加設備など" : "Layout preferences, additional amenities, etc."}
        />
      </Field>
    </div>
  );
}

// Virtual Office
function Step2VirtualOffice({
  data,
  onChange,
  errors,
  notes,
  setNotes,
  isJapanese,
}: {
  data: VirtualOfficeFields;
  onChange: (d: Partial<VirtualOfficeFields>) => void;
  errors: Partial<Record<keyof VirtualOfficeFields, string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  isJapanese: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  const packages = [
    {
      id: isJapanese ?"基本" : "Basic",
      features: isJapanese
        ? ["ビジネス住所", "会社登録書類サポート", "郵便物対応", "コワーキングスペース1日利用", "会議室1時間利用"]
        : ["Business Address", "Business Registration Documents Assistance", "Mail Handling", "1 Day Co-working Space Access", "1 Hour Conference Room Access"],
      price: isJapanese ? "₱2,000 / 月" : "₱2,000 / Month",
    },
    {
      id: isJapanese ? "標準" : "Standard",
      features: isJapanese
        ? ["ビジネス住所", "会社登録書類サポート", "郵便物対応", "コワーキングスペース2日利用", "会議室2時間利用"]
        : ["Business Address", "Business Registration Documents Assistance", "Mail Handling", "2 Days Co-working Space Access", "2 Hours Conference Room Access"],
      price: isJapanese ? "₱3,000 / 月" : "₱3,000 / Month",
    },
    {
      id: isJapanese ? "プレミアム" : "Premium",
      features: isJapanese
        ? ["ビジネス住所", "会社登録書類サポート", "郵便物対応", "コワーキングスペース5日利用", "会議室3時間利用"]
        : ["Business Address", "Business Registration Documents Assistance", "Mail Handling", "5 Days Co-working Space Access", "3 Hours Conference Room Access"],
      price: isJapanese ? "₱5,000 / 月" : "₱5,000 / Month",
    },
  ];

  return (
    <div className="space-y-5">
      <Field label={isJapanese ? "プラン" : "Package"} required error={errors.package}>
        <div className="mt-1 grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => {
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
        <Field label={isJapanese ? "開始希望日" : "Preferred Start Date"} required error={errors.startDate}>
          <input
            id="virtual-office-start-date"
            name="startDate"
            type="date"
            min={today}
            value={data.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={errors.startDate ? inputErrCls : inputCls}
          />
        </Field>

        <Field label={isJapanese ? "利用期間（月）" : "Months Duration"} required error={errors.months}>
          <select
            id="virtual-office-months"
            name="months"
            value={data.months}
            onChange={(e) => onChange({ months: e.target.value })}
            className={errors.months ? inputErrCls : inputCls}
          >
            <option value="">{isJapanese ? "期間を選択" : "Select duration"}</option>
            {VO_MONTHS_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {isJapanese ? `${m}か月` : `${m} ${Number(m) === 1 ? "Month" : "Months"}`}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label={isJapanese ? "その他のご要望・条件" : "Other Requirements / Conditions"}>
          <textarea
            id="virtual-office-notes"
            name="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls + " resize-none"}
            placeholder={isJapanese ? "バーチャルオフィスのお申し込みに追加でご希望があればご記入ください。" : "Anything else you'd like us to include in your virtual office request."}
          />
        </Field>
      </div>

    </div>
  );
}

// Co-working Space
function Step2Coworking({
  data,
  onChange,
  errors,
  isJapanese,
}: {
  data: CoworkingFields;
  onChange: (d: Partial<CoworkingFields>) => void;
  errors: Partial<Record<keyof CoworkingFields, string>>;
  isJapanese: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">

        <Field label={isJapanese ? "開始希望日" : "Preferred Start Date"} required error={errors.startDate}>
          <input
            id="coworking-start-date"
            name="startDate"
            type="date"
            min={today}
            value={data.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={errors.startDate ? inputErrCls : inputCls}
          />
        </Field>
        <Field label={isJapanese ? "終了日" : "End Date"} required error={errors.endDate}>
          <input
            id="coworking-end-date"
            name="endDate"
            type="date"
            min={data.startDate || today}
            value={data.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className={errors.endDate ? inputErrCls : inputCls}
          />
        </Field>
        <Field label={isJapanese ? "席数" : "Number of Seats"} required error={errors.seats}>
          <input
            id="coworking-seats"
            name="seats"
            type="number"
            min={1}
            value={data.seats}
            onChange={(e) => onChange({ seats: e.target.value })}
            className={errors.seats ? inputErrCls : inputCls}
            placeholder={isJapanese ? "例：2" : "e.g. 2"}
          />
        </Field>
        <Field label={isJapanese ? "利用期間" : "Terms"} required error={errors.terms}>
          <PillSelect
            options={COWORKING_TERMS}
            value={data.terms}
            onChange={(v) => onChange({ terms: v })}
            isJapanese={isJapanese}
          />
        </Field>
      </div>
      <Field label={isJapanese ? "その他のご要望" : "Other Requirements"}>
        <textarea
          id="coworking-other-requirements"
          name="otherRequirements"
          rows={3}
          value={data.otherRequirements}
          onChange={(e) => onChange({ otherRequirements: e.target.value })}
          className={inputCls + " resize-none"}
          placeholder={isJapanese ? "必要な設備、バリアフリー対応など" : "Specific equipment, accessibility needs, etc."}
        />
      </Field>
    </div>
  );
}

// Meeting Room
function Step2MeetingRoom({
  data,
  onChange,
  errors,
  isJapanese,
}: {
  data: MeetingRoomFields;
  onChange: (d: Partial<MeetingRoomFields>) => void;
  errors: Partial<Record<keyof MeetingRoomFields, string>>;
  isJapanese: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  const durationOptions = isJapanese
    ? ["1時間", "2時間", "3時間", "4時間", "半日", "1日"]
    : ["1 hour", "2 hours", "3 hours", "4 hours", "Half day", "Full day"];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={isJapanese ? "予約日" : "Reservation Date"} required error={errors.date}>
          <input id="meeting-room-date" name="date" type="date" min={today} value={data.date} onChange={(e) => onChange({ date: e.target.value })} className={errors.date ? inputErrCls : inputCls} />
        </Field>
        <Field label={isJapanese ? "希望時間" : "Preferred Time"} required error={errors.time}>
          <select id="meeting-room-time" name="time" value={data.time} onChange={(e) => onChange({ time: e.target.value })} className={errors.time ? inputErrCls : inputCls}>
            <option value="">{isJapanese ? "時間を選択" : "Select time"}</option>
            {TIME_SLOTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label={isJapanese ? "参加人数" : "Number of Participants"} required error={errors.participants}>
          <input
            id="meeting-room-participants"
            name="participants"
            type="number"
            min={1}
            value={data.participants}
            onChange={(e) => onChange({ participants: e.target.value })}
            className={errors.participants ? inputErrCls : inputCls}
            placeholder={isJapanese ? "例：8" : "e.g. 8"}
          />
        </Field>
        <Field label={isJapanese ? "利用時間" : "Duration"} required error={errors.duration}>
          <select id="meeting-room-duration" name="duration" value={data.duration} onChange={(e) => onChange({ duration: e.target.value })} className={errors.duration ? inputErrCls : inputCls}>
            <option value="">{isJapanese ? "利用時間を選択" : "Select duration"}</option>
            {durationOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>
      <Field label={isJapanese ? "追加のご要望" : "Additional Requirements"}>
        <textarea id="meeting-room-additional-requirements" name="additionalRequirements" rows={3} value={data.additionalRequirements} onChange={(e) => onChange({ additionalRequirements: e.target.value })} className={inputCls + " resize-none"} placeholder={isJapanese ? "AV機器、ケータリング、ホワイトボード設置など" : "AV equipment, catering, whiteboard setup, etc."} />
      </Field>
    </div>
  );
}

// Event Space
function Step2EventSpace({
  data,
  onChange,
  errors,
  isJapanese,
}: {
  data: EventSpaceFields;
  onChange: (d: Partial<EventSpaceFields>) => void;
  errors: Partial<Record<keyof EventSpaceFields, string>>;
  isJapanese: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  const durationOptions = isJapanese
    ? ["2時間", "3時間", "4時間", "半日", "1日"]
    : ["2 hours", "3 hours", "4 hours", "Half day", "Full day"];
  const eventTypeOptions = isJapanese
    ? ["社内会議", "製品発表会", "研修・セミナー", "チームビルディング", "ネットワーキングイベント", "その他"]
    : ["Corporate Meeting", "Product Launch", "Training / Seminar", "Team Building", "Networking Event", "Other"];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={isJapanese ? "イベント日" : "Event Date"} required error={errors.eventDate}>
          <input id="event-space-date" name="eventDate" type="date" min={today} value={data.eventDate} onChange={(e) => onChange({ eventDate: e.target.value })} className={errors.eventDate ? inputErrCls : inputCls} />
        </Field>
        <Field label={isJapanese ? "イベント時間" : "Event Time"} required error={errors.time}>
          <select id="event-space-time" name="time" value={data.time} onChange={(e) => onChange({ time: e.target.value })} className={errors.time ? inputErrCls : inputCls}>
            <option value="">{isJapanese ? "時間を選択" : "Select time"}</option>
            {TIME_SLOTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label={isJapanese ? "参加予定人数" : "Estimated Attendees"} required error={errors.attendees}>
          <input id="event-space-attendees" name="attendees" type="number" min={1} value={data.attendees} onChange={(e) => onChange({ attendees: e.target.value })} className={errors.attendees ? inputErrCls : inputCls} placeholder={isJapanese ? "例：50" : "e.g. 50"} />
        </Field>
        <Field label={isJapanese ? "イベント時間の長さ" : "Event Duration"} required error={errors.duration}>
          <select id="event-space-duration" name="duration" value={data.duration} onChange={(e) => onChange({ duration: e.target.value })} className={errors.duration ? inputErrCls : inputCls}>
            <option value="">{isJapanese ? "利用時間を選択" : "Select duration"}</option>
            {durationOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label={isJapanese ? "イベント種別" : "Event Type"} required error={errors.eventType}>
          <select id="event-space-type" name="eventType" value={data.eventType} onChange={(e) => onChange({ eventType: e.target.value })} className={errors.eventType ? inputErrCls : inputCls}>
            <option value="">{isJapanese ? "種別を選択" : "Select type"}</option>
            {eventTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <Field label={isJapanese ? "その他のご要望" : "Other Requirements"}>
        <textarea id="event-space-other-requirements" name="otherRequirements" rows={3} value={data.otherRequirements} onChange={(e) => onChange({ otherRequirements: e.target.value })} className={inputCls + " resize-none"} placeholder={isJapanese ? "会場設営、ケータリング、AV機器のご希望など" : "Setup preferences, catering, AV requirements, etc."} />
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
  registeredBusiness,
  setRegisteredBusiness,
  withholdingTax,
  setWithholdingTax,
  isSubmitting,
  onBack,
  onNext,
  isJapanese,
}: {
  isVO: boolean;
  contact: ContactFields;
  contractIdentity: ContractIdentityFields;
  setContact: React.Dispatch<React.SetStateAction<ContactFields>>;
  setContractIdentity: React.Dispatch<React.SetStateAction<ContractIdentityFields>>;
  registeredBusiness: boolean | null;
  setRegisteredBusiness: (value: boolean) => void;
  withholdingTax: boolean | null;
  setWithholdingTax: (value: boolean) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  isJapanese: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);
  const idUploadRef = useRef<HTMLInputElement>(null);
  const signatoryUploadRef = useRef<HTMLInputElement>(null);

  // VO restricts to 4 accepted ID types (no "Others"); other services keep the full list
  const idTypeOptions = GOVERNMENT_ID_TYPES;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!contact.name.trim()) errs.name = isJapanese ? "氏名を入力してください。" : "Full name is required.";
    if (!contact.email.trim()) {
      errs.email = isJapanese ? "メールアドレスを入力してください。" : "Email address is required.";
    } else if (!isValidEmail(contact.email)) {
      errs.email = isJapanese ? "有効なメールアドレスを入力してください（例：juan@company.com）。" : "Please enter a valid email address (e.g. juan@company.com).";
    }
    if (!contact.phone.trim()) {
      errs.phone = isJapanese ? "電話番号を入力してください。" : "Phone number is required.";
    } else if (!isValidPhone(contact.phone)) {
      errs.phone = isJapanese ? "有効なフィリピンの携帯電話番号を入力してください（例：+63 917 123 4567 または 09171234567）。" : "Please enter a valid PH mobile number (e.g. +63 917 123 4567 or 09171234567).";
    }
    if (!contact.address.trim()) errs.address = isJapanese ? "住所を入力してください。" : "Address is required.";
    if (isVO && registeredBusiness === null) {
      errs.registeredBusiness = isJapanese ? "「はい」または「いいえ」を選択してください。" : "Please select Yes or No.";
    }
    if (isVO && withholdingTax === null) {
      errs.withholdingTax = isJapanese ? "「はい」または「いいえ」を選択してください。" : "Please select Yes or No.";
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
      <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">{isJapanese ? "ご連絡先情報" : "Your Contact Information"}</h2>
      <p className="text-sm text-[#64748B] mb-7">{isJapanese ? "お見積書の送付にこの情報を使用します。" : "We'll use these details to send you the quotation."}</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={isJapanese ? "お名前" : "Full Name"} required error={errors.name}>
          <input
            id="quotation-contact-name"
            name="name"
            type="text"
            value={contact.name}
            onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
            className={errors.name ? inputErrCls : inputCls}
            placeholder="Juan dela Cruz"
          />
        </Field>
        <Field label={isJapanese ? "会社名" : "Company Name"}>
          <input
            id="quotation-contact-company"
            name="company"
            type="text"
            value={contact.company}
            onChange={(e) => setContact((p) => ({ ...p, company: e.target.value }))}
            className={inputCls}
            placeholder={isJapanese ? "会社名（任意）" : "Your Company (optional)"}
          />
        </Field>
        <Field label={isJapanese ? "メールアドレス" : "Email Address"} required error={errors.email}>
          <input
            id="quotation-contact-email"
            name="email"
            type="email"
            value={contact.email}
            onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
            className={errors.email ? inputErrCls : inputCls}
            placeholder="juan@company.com"
          />
        </Field>
        <Field label={isJapanese ? "電話番号" : "Phone Number"} required error={errors.phone}>
          <input
            id="quotation-contact-phone"
            name="phone"
            type="tel"
            value={contact.phone}
            onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
            className={errors.phone ? inputErrCls : inputCls}
            placeholder="+63 9XX XXX XXXX"
          />
        </Field>
      </div>
      <div className="mt-5">
        <Field label={isJapanese ? "住所" : "Address"} required error={errors.address}>
          <textarea
            id="quotation-contact-address"
            name="address"
            rows={3}
            value={contact.address}
            onChange={(e) => setContact((p) => ({ ...p, address: e.target.value }))}
            className={inputCls + " resize-none"}
            placeholder={isJapanese ? "ご住所" : "Your address"}
          />
        </Field>
      </div>

      {isVO && (
        <>
          <div className="mt-5">
            <Field label={isJapanese ? "会社名はすでに登録されていますか？" : "Is your company name already registered?"} required error={errors.registeredBusiness}>
              <PillSelect
                options={["Yes", "No"]}
                value={registeredBusiness === true ? "Yes" : registeredBusiness === false ? "No" : ""}
                onChange={(value) => setRegisteredBusiness(value === "Yes")}
                isJapanese={isJapanese}
              />
            </Field>
            {registeredBusiness !== null && (
              <div className="mt-4 rounded-xl border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-3 text-sm text-[#4A5568]">
                <p className="font-semibold text-[#0B1F4A]">{isJapanese ? "必要書類" : "Applicable requirements"}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {registeredBusiness ? (
                    isJapanese ? (
                      <>
                        <li>DTIまたはSEC証明書</li>
                        <li>BIR登録証明書（COR）</li>
                        <li>署名入りの政府発行ID</li>
                        <li>その他該当する会社書類</li>
                      </>
                    ) : (
                      <>
                        <li>DTI or SEC Certificate</li>
                        <li>BIR Certificate of Registration (COR)</li>
                        <li>Government-issued ID with signature</li>
                        <li>Other applicable company documents</li>
                      </>
                    )
                  ) : (
                    isJapanese ? (
                      <>
                        <li>署名入りの政府発行ID</li>
                        <li>登録に必要なその他の書類</li>
                      </>
                    ) : (
                      <>
                        <li>Government-issued ID with signature</li>
                        <li>Other required documents for registration</li>
                      </>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-5">
            <Field label={isJapanese ? "貴社は源泉徴収を行いますか？" : "Will your company be withholding tax?"} required error={errors.withholdingTax}>
              <PillSelect
                options={["Yes", "No"]}
                value={withholdingTax === true ? "Yes" : withholdingTax === false ? "No" : ""}
                onChange={(value) => setWithholdingTax(value === "Yes")}
                isJapanese={isJapanese}
              />
            </Field>
            {withholdingTax === true && (
              <>
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
                  {isJapanese
                    ? "こちらのお申し込みはここで終了します。担当の営業担当者よりメールにて詳しいご案内をお送りいたします。"
                    : "This inquiry stops here. Our Sales Officer will provide the necessary instructions manually via email."}
                </div>
                <NavRow onNext={handleNext} nextLabel={isSubmitting ? (isJapanese ? "送信中…" : "Submitting...") : (isJapanese ? "送信する" : "Submit")} isJapanese={isJapanese} />
              </>
            )}
          </div>
        </>
      )}

      {(!isVO || withholdingTax === false) && (
        <div className="mt-7 border-t border-[#D9E2F0] pt-6">
          <h3 className="text-2xl font-bold text-[#0B1F4A] mb-2">{isJapanese ? "政府発行ID・署名者情報" : "Government & Signatory"}</h3>
          <p className="text-sm text-[#64748B] mb-5">
            {isJapanese
              ? "これらの情報は契約書の作成および本人確認のために使用されます。"
              : "These details are used for contract preparation and verification."}
            {isVO && (isJapanese
              ? " バーチャルオフィスで利用可能なID：パスポート、運転免許証、フィリピン国民ID、またはPRC ID。"
              : " Accepted IDs for Virtual Office: Passport, Driver's License, Philippine National ID, or PRC ID.")}
          </p>

          <label className="my-5 flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                id="quotation-signatory-same"
                name="signatorySameAsIdHolder"
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
              {isJapanese
                ? "政府発行IDに記載されているお名前が署名者となります。"
                : "The client name on the government ID will be the signatory."}
            </span>
          </label>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={isJapanese ? "政府発行IDの種類" : "Government ID Type"} error={errors.idType}>
              <select
                id="quotation-id-type"
                name="idType"
                value={contractIdentity.idType}
                onChange={(e) => setContractIdentity((p) => ({ ...p, idType: e.target.value, idTypeOther: "" }))}
                className={errors.idType ? inputErrCls : inputCls}
              >
                <option value="">{isJapanese ? "ID種類を選択" : "Select ID type"}</option>
                {idTypeOptions.map((idType) => (
                  <option key={idType} value={idType}>{translateIdType(idType, isJapanese)}</option>
                ))}
              </select>
            </Field>

            {!isVO && contractIdentity.idType === "Others" && (
              <Field label={isJapanese ? "ID種類を入力" : "Specify ID Type"} required error={errors.idTypeOther}>
                <input
                  id="quotation-id-type-other"
                  name="idTypeOther"
                  type="text"
                  value={contractIdentity.idTypeOther}
                  onChange={(e) => setContractIdentity((p) => ({ ...p, idTypeOther: e.target.value }))}
                  className={errors.idTypeOther ? inputErrCls : inputCls}
                  placeholder={isJapanese ? "ID種類を入力してください" : "Enter ID type"}
                />
              </Field>
            )}

            <Field label={isJapanese ? "政府発行IDに記載の氏名" : "Name on Government ID"} error={errors.idName}>
              <input
                id="quotation-id-name"
                name="idName"
                type="text"
                value={contractIdentity.idName}
                onChange={(e) => setContractIdentity((p) => ({ ...p, idName: e.target.value }))}
                className={errors.idName ? inputErrCls : inputCls}
                placeholder={isJapanese ? "IDに記載のとおりに入力してください" : "As shown on your ID"}
              />
            </Field>

            <Field label={isJapanese ? "政府発行ID番号" : "Government ID Number"} error={errors.idNumber}>
              <input
                id="quotation-id-number"
                name="idNumber"
                type="text"
                value={contractIdentity.idNumber}
                onChange={(e) => setContractIdentity((p) => ({ ...p, idNumber: e.target.value }))}
                className={errors.idNumber ? inputErrCls : inputCls}
                placeholder={isJapanese ? "ID番号を入力してください" : "Enter ID number"}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label={isJapanese ? "政府発行IDに記載の住所" : "Address on Government ID"} error={errors.idAddress}>
              <textarea
                id="quotation-id-address"
                name="idAddress"
                rows={3}
                value={contractIdentity.idAddress}
                onChange={(e) => setContractIdentity((p) => ({ ...p, idAddress: e.target.value }))}
                className={(errors.idAddress ? inputErrCls : inputCls) + " resize-none"}
                placeholder={isJapanese ? "IDに記載の完全な住所" : "Complete address as shown on your ID"}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label={isJapanese ? "政府発行IDをアップロード" : "Upload Government ID"} error={errors.governmentIdFile}>
              <button
                type="button"
                onClick={() => idUploadRef.current?.click()}
                className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all duration-200 ${contractIdentity.governmentIdFile ? "border-[#1B3A8C] bg-[#EEF2FB]" : "border-[#D9E2F0] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"}`}
              >
                <Upload className={`w-5 h-5 ${contractIdentity.governmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
                <span className={`text-sm font-semibold ${contractIdentity.governmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`}>
                  {contractIdentity.governmentIdFile ? contractIdentity.governmentIdFile.name : (isJapanese ? "クリックして政府発行IDをアップロード" : "Click to upload government ID")}
                </span>
              </button>
              <input
                ref={idUploadRef}
                id="quotation-government-id-file"
                name="governmentIdFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setContractIdentity((p) => ({ ...p, governmentIdFile: e.target.files?.[0] ?? null }))}
              />
              <p className="text-xs text-[#64748B] mt-2">{isJapanese ? "対応形式：JPG、PNG、PDF - 最大10MB" : "Accepted: JPG, PNG, PDF - Max 10 MB"}</p>
              {contractIdentity.governmentIdFile && isPreviewableFile(contractIdentity.governmentIdFile) && (
                <div className="mt-3 rounded-xl border border-[#D9E2F0] bg-white px-3 py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0B1F4A]">{isJapanese ? "アップロードしたIDをプレビュー" : "Preview uploaded ID"}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{contractIdentity.governmentIdFile.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTarget({ title: isJapanese ? "政府発行IDのプレビュー" : "Government ID Preview", file: contractIdentity.governmentIdFile! })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B3A8C] hover:underline shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isJapanese ? "表示" : "View"}
                  </button>
                </div>
              )}
            </Field>
          </div>

          {!contractIdentity.signatorySameAsIdHolder && (
            <div className="mt-5 rounded-2xl border border-[#D9E2F0] bg-[#F8FAFD] p-5 space-y-5">
              <h4 className="text-sm font-bold text-[#0B1F4A]">{isJapanese ? "署名者の詳細情報" : "Alternate Signatory Details"}</h4>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={isJapanese ? "署名者の政府発行IDの種類" : "Signatory ID Type"} error={errors.signatoryIdType}>
                  <select
                    id="quotation-signatory-id-type"
                    name="signatoryIdType"
                    value={contractIdentity.signatoryIdType}
                    onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdType: e.target.value, signatoryIdTypeOther: "" }))}
                    className={errors.signatoryIdType ? inputErrCls : inputCls}
                  >
                    <option value="">{isJapanese ? "ID種類を選択" : "Select ID type"}</option>
                    {idTypeOptions.map((idType) => (
                      <option key={idType} value={idType}>{translateIdType(idType, isJapanese)}</option>
                    ))}
                  </select>
                </Field>

                {!isVO && contractIdentity.signatoryIdType === "Others" && (
                  <Field label={isJapanese ? "署名者のID種類を入力" : "Specify Signatory ID Type"} error={errors.signatoryIdTypeOther}>
                    <input
                      id="quotation-signatory-id-type-other"
                      name="signatoryIdTypeOther"
                      type="text"
                      value={contractIdentity.signatoryIdTypeOther}
                      onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdTypeOther: e.target.value }))}
                      className={errors.signatoryIdTypeOther ? inputErrCls : inputCls}
                      placeholder={isJapanese ? "ID種類を入力してください" : "Enter ID type"}
                    />
                  </Field>
                )}

                <Field label={isJapanese ? "署名者の政府発行IDに記載の氏名" : "Signatory Name on Government ID"} error={errors.signatoryIdName}>
                  <input
                    id="quotation-signatory-id-name"
                    name="signatoryIdName"
                    type="text"
                    value={contractIdentity.signatoryIdName}
                    onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdName: e.target.value }))}
                    className={errors.signatoryIdName ? inputErrCls : inputCls}
                    placeholder={isJapanese ? "署名者のIDに記載のとおりに入力してください" : "As shown on signatory ID"}
                  />
                </Field>

                <Field label={isJapanese ? "署名者の政府発行ID番号" : "Signatory ID Number"} error={errors.signatoryIdNumber}>
                  <input
                    id="quotation-signatory-id-number"
                    name="signatoryIdNumber"
                    type="text"
                    value={contractIdentity.signatoryIdNumber}
                    onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdNumber: e.target.value }))}
                    className={errors.signatoryIdNumber ? inputErrCls : inputCls}
                    placeholder={isJapanese ? "署名者のID番号を入力してください" : "Enter signatory ID number"}
                  />
                </Field>
              </div>

              <Field label={isJapanese ? "署名者の政府発行IDに記載の住所" : "Signatory Address on Government ID"} error={errors.signatoryIdAddress}>
                <textarea
                  id="quotation-signatory-id-address"
                  name="signatoryIdAddress"
                  rows={3}
                  value={contractIdentity.signatoryIdAddress}
                  onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryIdAddress: e.target.value }))}
                  className={(errors.signatoryIdAddress ? inputErrCls : inputCls) + " resize-none"}
                  placeholder={isJapanese ? "署名者のIDに記載の完全な住所" : "Complete address as shown on signatory ID"}
                />
              </Field>

              <Field label={isJapanese ? "署名者の政府発行IDをアップロード" : "Upload Signatory Government ID"} error={errors.signatoryGovernmentIdFile}>
                <button
                  type="button"
                  onClick={() => signatoryUploadRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all duration-200 ${contractIdentity.signatoryGovernmentIdFile ? "border-[#1B3A8C] bg-[#EEF2FB]" : "border-[#D9E2F0] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"}`}
                >
                  <Upload className={`w-5 h-5 ${contractIdentity.signatoryGovernmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
                  <span className={`text-sm font-semibold ${contractIdentity.signatoryGovernmentIdFile ? "text-[#1B3A8C]" : "text-[#64748B]"}`}>
                    {contractIdentity.signatoryGovernmentIdFile ? contractIdentity.signatoryGovernmentIdFile.name : (isJapanese ? "クリックして署名者の政府発行IDをアップロード" : "Click to upload signatory government ID")}
                  </span>
                </button>
                <input
                  ref={signatoryUploadRef}
                  id="quotation-signatory-government-id-file"
                  name="signatoryGovernmentIdFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setContractIdentity((p) => ({ ...p, signatoryGovernmentIdFile: e.target.files?.[0] ?? null }))}
                />
                <p className="text-xs text-[#64748B] mt-2">{isJapanese ? "対応形式：JPG、PNG、PDF - 最大10MB" : "Accepted: JPG, PNG, PDF - Max 10 MB"}</p>
                {contractIdentity.signatoryGovernmentIdFile && isPreviewableFile(contractIdentity.signatoryGovernmentIdFile) && (
                  <div className="mt-3 rounded-xl border border-[#D9E2F0] bg-white px-3 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0B1F4A]">{isJapanese ? "アップロードした署名者IDをプレビュー" : "Preview uploaded signatory ID"}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{contractIdentity.signatoryGovernmentIdFile.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewTarget({ title: isJapanese ? "署名者IDのプレビュー" : "Signatory ID Preview", file: contractIdentity.signatoryGovernmentIdFile! })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B3A8C] hover:underline shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isJapanese ? "表示" : "View"}
                    </button>
                  </div>
                )}
              </Field>
            </div>
          )}
        </div>
      )}

      {withholdingTax !== true && (
        <NavRow
          onBack={onBack}
          onNext={handleNext}
          nextLabel={isJapanese ? "次へ" : "Continue"}
          isJapanese={isJapanese}
        />
      )}

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

/** Shared pricing breakdown card: Package + VAT + Contract & Admin Fee, × Duration */
function VOPricingBreakdown({ pkg, months, isJapanese }: { pkg: string; months: string; isJapanese: boolean }) {
  const b = computeVirtualOfficeTotal(pkg, months);
  const monthLabel = isJapanese ? "か月" : (b.numMonths === 1 ? "month" : "months");
  return (
    <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
      <p className="text-md font-bold tracking-[0.2em] uppercase text-[#0A1E3F] mb-3">{isJapanese ? "お見積り内訳" : "Estimated Pricing Breakdown"}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] shrink-0">{isJapanese ? `プラン（${pkg}）` : `Package (${pkg})`}</span><span className="text-[#0B1F4A] font-medium">{peso(b.base)} {isJapanese ? "/ 月" : "/ month"}</span></div>
        <div className="flex justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] shrink-0">{isJapanese ? "VAT（12%）" : "VAT (12%)"}</span><span className="text-[#0B1F4A] font-medium">{peso(b.vat)} {isJapanese ? "/ 月" : "/ month"}</span></div>
        <div className="flex justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] shrink-0">{isJapanese ? "利用期間" : "Duration"}</span><span className="text-[#0B1F4A] font-medium">× {b.numMonths} {monthLabel}</span></div>
        <div className="flex justify-between border-t border-[#D9E2F0] pt-1.5 mt-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] shrink-0">{isJapanese ? "小計" : "Subtotal"}</span><span className="text-[#0B1F4A] font-medium">{peso(b.recurring)}</span></div>
        <div className="flex justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] shrink-0">{isJapanese ? "契約・事務手数料" : "Contract & Admin Fee"}</span><span className="text-[#0B1F4A] font-medium">{peso(b.contractAdminFee)}</span></div>
        <div className="flex justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] shrink-0">{isJapanese ? "契約・事務手数料のVAT（12%）" : "Contract & Admin Fee VAT (12%)"}</span><span className="text-[#0B1F4A] font-medium">{peso(b.contractVat)}</span></div>
        <div className="flex justify-between border-t border-[#D9E2F0] pt-2 mt-2">
          <span className="font-bold text-[#0B1F4A]">{isJapanese ? "合計" : "Total"}</span><span className="font-bold text-[#1B3A8C]">{peso(b.total)}</span></div>
      </div>
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
  isSubmitting,
  isVO,
  isJapanese,
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
  isSubmitting: boolean;
  isVO: boolean;
  isJapanese: boolean;
}) {
  const [modal, setModal] = useState<ModalKey>(null);
  const serviceEntry = SERVICES.find((s) => s.id === selectedService);
  const serviceName = serviceEntry ? (isJapanese ? serviceEntry.labelJa : serviceEntry.label) : "";
  const branchEntry = BRANCHES.find((b) => b.id === selectedBranch);
  const branchName = branchEntry ? (isJapanese ? branchEntry.labelJa : branchEntry.label) : "";

  const serviceRows = () => {
    if (selectedService === "private-office") return [
      { label: isJapanese ? "席数" : "Seats", value: privateOffice.seats },
      { label: isJapanese ? "入居日" : "Move-in Date", value: privateOffice.moveInDate },
      { label: isJapanese ? "契約期間" : "Lease Term", value: privateOffice.leaseTerm },
      { label: isJapanese ? "その他のご要望" : "Other Requirements", value: privateOffice.otherRequirements },
    ];
    if (selectedService === "virtual-office") return [
      { label: isJapanese ? "プラン" : "Package", value: virtualOffice.package },
      { label: isJapanese ? "開始日" : "Start Date", value: virtualOffice.startDate },
      { label: isJapanese ? "利用期間（月）" : "Months Duration", value: virtualOffice.months },
    ];
    if (selectedService === "coworking") return [
      { label: isJapanese ? "席数" : "Seats", value: coworking.seats },
      { label: isJapanese ? "開始日" : "Start Date", value: coworking.startDate },
      { label: isJapanese ? "終了日" : "End Date", value: coworking.endDate },
      { label: isJapanese ? "利用期間" : "Pass Type", value: coworking.terms },
      { label: isJapanese ? "その他のご要望" : "Other Requirements", value: coworking.otherRequirements },
    ];
    if (selectedService === "meeting-room") return [
      { label: isJapanese ? "日付" : "Date", value: meetingRoom.date },
      { label: isJapanese ? "時間" : "Time", value: meetingRoom.time },
      { label: isJapanese ? "参加人数" : "Participants", value: meetingRoom.participants },
      { label: isJapanese ? "利用時間" : "Duration", value: meetingRoom.duration },
      { label: isJapanese ? "追加のご要望" : "Additional Requirements", value: meetingRoom.additionalRequirements },
    ];
    if (selectedService === "event-space") return [
      { label: isJapanese ? "イベント日" : "Event Date", value: eventSpace.eventDate },
      { label: isJapanese ? "イベント時間" : "Event Time", value: eventSpace.time },
      { label: isJapanese ? "参加人数" : "Attendees", value: eventSpace.attendees },
      { label: isJapanese ? "利用時間" : "Duration", value: eventSpace.duration },
      { label: isJapanese ? "イベント種別" : "Event Type", value: eventSpace.eventType },
      { label: isJapanese ? "その他のご要望" : "Other Requirements", value: eventSpace.otherRequirements },
    ];
    return [];
  };

  const nextLabel = isJapanese ? "見積もりを依頼する" : "Get a Quote";

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">{isJapanese ? "お申し込み内容の確認" : "Review Your Request"}</h2>
      <p className="text-sm text-[#64748B] mb-7">{isJapanese ? "送信する前に内容をご確認ください。" : "Please confirm your details before submitting."}</p>

      <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 mb-4">
        <p className="text-md font-bold tracking-[0.2em] uppercase text-[#0A1E3F] mb-3">{isJapanese ? "サービス" : "Service"}</p>
        <ReviewRow label={isJapanese ? "選択したサービス" : "Selected Service"} value={serviceName} />
        <ReviewRow label={isJapanese ? "支店" : "Branch"} value={branchName} />
        {serviceRows().map((r) => <ReviewRow key={r.label} label={r.label} value={r.value} />)}
      </div>

      <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 mb-6">
        <p className="text-md font-bold tracking-[0.2em] uppercase text-[#0A1E3F] mb-3">{isJapanese ? "連絡先" : "Contact"}</p>
        <ReviewRow label={isJapanese ? "氏名" : "Name"} value={contact.name} />
        <ReviewRow label={isJapanese ? "会社名" : "Company"} value={contact.company} />
        <ReviewRow label={isJapanese ? "メール" : "Email"} value={contact.email} />
        <ReviewRow label={isJapanese ? "電話番号" : "Phone"} value={contact.phone} />
        <ReviewRow
          label={isJapanese ? "政府発行IDの種類" : "Government ID Type"}
          value={translateIdType(contractIdentity.idType === "Others" ? contractIdentity.idTypeOther : contractIdentity.idType, isJapanese)}
        />
        <ReviewRow label={isJapanese ? "ID名義" : "ID Name"} value={contractIdentity.idName} />
        <ReviewRow label={isJapanese ? "ID番号" : "ID Number"} value={contractIdentity.idNumber} />
        <ReviewRow label={isJapanese ? "ID住所" : "ID Address"} value={contractIdentity.idAddress} />
        <ReviewRow
          label={isJapanese ? "署名者" : "Signatory"}
          value={contractIdentity.signatorySameAsIdHolder ? contractIdentity.idName : contractIdentity.signatoryIdName}
        />
        <ReviewRow label={isJapanese ? "その他のご要望・条件" : "Other Requirements / Conditions"} value={notes} />
      </div>

      {isVO && virtualOffice.package && virtualOffice.months && (
        <div className="mb-4">
          <VOPricingBreakdown pkg={virtualOffice.package} months={virtualOffice.months} isJapanese={isJapanese} />
        </div>
      )}

      {isVO && (
        <div className="bg-[#fffaec] border border-[#dbd4bd] rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <Wallet className="w-4 h-4 text-[#FFC107]/50 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-800 leading-relaxed">
            {isJapanese
              ? "担当チームがお申し込み内容を確認後、バーチャルオフィスサービスのお支払いを完了するための安全なリンクをメールでお送りします。"
              : "Once our team verifies your request, we'll email you a secure link to complete payment for your virtual office service."}
          </p>
        </div>
      )}

      <label className="flex items-start gap-3 cursor-pointer group mb-2">
        <div className="relative mt-0.5 shrink-0">
          <input id="quotation-consent" name="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="sr-only" />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${consent ? "bg-[#0B1F4A] border-[#0B1F4A]" : "border-[#D9E2F0] bg-white group-hover:border-[#1B3A8C]"}`}>
            {consent && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-[#4A5568] leading-relaxed">
          {isJapanese ? (
            <>
              <button
                type="button"
                onClick={() => setModal("privacy")}
                className="text-[#1B3A8C] font-semibold hover:underline"
              >
                Hero Serviced Office, Inc.のプライバシーポリシー
              </button>
              に従い、個人情報の収集・利用に同意します。
            </>
          ) : (
            <>
              I agree to the collection and processing of my personal information in accordance with{" "}
              <button
                type="button"
                onClick={() => setModal("privacy")}
                className="text-[#1B3A8C] font-semibold hover:underline"
              >
                Hero Serviced Office, Inc.'s Privacy Policy
              </button>.
            </>
          )}
        </span>
      </label>

      <NavRow
        onBack={onBack}
        nextLabel={nextLabel}
        nextDisabled={!consent}
        isSubmit={true}
        isSubmitting={isSubmitting}
        isJapanese={isJapanese}
      />

      <Modal open={modal === "privacy"} onClose={() => setModal(null)} title={isJapanese ? "プライバシーポリシー" : "Privacy Policy"}>
        <PrivacyPolicyContent isJapanese={isJapanese} />
      </Modal>
    </div>
  );
}

// Payment Link Gate

type GateStatus = "checking" | "valid" | "invalid";

interface PaymentLinkContext {
  quotationId: string;
  token: string;
  virtualOffice: VirtualOfficeFields;
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
      setStatus("invalid");
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
          virtualOffice: {
            package: data.virtual_office?.package ?? "",
            startDate: data.virtual_office?.startDate ?? "",
            months: String(data.virtual_office?.months ?? ""),
          },
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

  return { status, context, errorMessage, hasLinkParams: Boolean(quotationId && token) };
}

export default function GetAQuotePage() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<"en" | "ja">("en");
  const isJapanese = locale === "ja";

  useEffect(() => {
    const getStoredLocale = () => {
      const match = document.cookie.match(/(?:^|;\s*)hero_lang=([^;]+)/);
      return match?.[1] === "ja" ? "ja" : "en";
    };

    const updateLocale = (event?: Event) => {
      const detail = (event as CustomEvent<string> | undefined)?.detail;
      const nextLocale = detail === "ja" || detail === "en" ? detail : getStoredLocale();
      setLocale(nextLocale);
    };

    updateLocale();
    window.addEventListener("localeChanged", updateLocale);
    return () => window.removeEventListener("localeChanged", updateLocale);
  }, []);

  useEffect(() => {
    const quotationId = searchParams.get("quotation");
    const token = searchParams.get("token");
    if (!quotationId || !token) return;

    const nextUrl = `/quotation/payment?quotation=${encodeURIComponent(quotationId)}&token=${encodeURIComponent(token)}`;
    window.location.replace(nextUrl);
  }, [searchParams]);

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchId | null>(null);
  const [contact, setContact] = useState<ContactFields>({ name: "", company: "", email: "", phone: "", address: "" });
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
    const service = normalizeQuotationService(searchParams.get("service") ?? searchParams.get("type"));

    if (branch && BRANCHES.some((b) => b.id === branch) && !(service === "event-space" && branch === "tower-6789")) {
      setSelectedBranch(branch as BranchId);
    }

    if (service) {
      setSelectedService(service);
      setStep(1);
    }
  }, [searchParams]);

  const [virtualOffice, setVirtualOffice] = useState<VirtualOfficeFields>({ package: "", startDate: "", months: "" });
  const [registeredBusiness, setRegisteredBusiness] = useState<boolean | null>(null);
  const [withholdingTax, setWithholdingTax] = useState<boolean | null>(null);
  const [coworking, setCoworking] = useState<CoworkingFields>({ seats: "", startDate: "", endDate: "", terms: "", otherRequirements: "" });
  const [meetingRoom, setMeetingRoom] = useState<MeetingRoomFields>({ date: "", time: "", participants: "", duration: "", additionalRequirements: "" });
  const [eventSpace, setEventSpace] = useState<EventSpaceFields>({ eventDate: "", time: "", attendees: "", duration: "", eventType: "", otherRequirements: "" });
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalKey>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 2 validation errors (set on attempted advance)
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  const isVO = selectedService === "virtual-office";
  // All services (including Virtual Office) follow the same 4-step wizard now.
  const steps = isJapanese ? (isVO ? VO_STEPS_JA : BASE_STEPS_JA) : (isVO ? VO_STEPS : BASE_STEPS);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Step 2 validation per service
  const validateStep2 = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (selectedService === "private-office") {
      const maxSeats = selectedBranch ? PRIVATE_OFFICE_MAX_SEATS[selectedBranch] : Math.max(...Object.values(PRIVATE_OFFICE_MAX_SEATS));
      if (!privateOffice.seats || Number(privateOffice.seats) < 1) errs.seats = isJapanese ? "有効な席数を入力してください（最小1）。" : "Please enter a valid number of seats (min 1).";
      else if (Number(privateOffice.seats) > maxSeats) errs.seats = isJapanese ? `この支店では最大${maxSeats}席までご利用いただけます。` : `Maximum ${maxSeats} seats available at this branch.`;
      if (!privateOffice.moveInDate) errs.moveInDate = isJapanese ? "入居希望日を選択してください。" : "Please select a target move-in date.";
      if (!privateOffice.leaseTerm) errs.leaseTerm = isJapanese ? "契約期間を選択してください。" : "Please select a lease term.";
    }
    if (selectedService === "virtual-office") {
      if (!virtualOffice.package) errs.package = isJapanese ? "プランを選択してください。" : "Please select a package.";
      if (!virtualOffice.startDate) errs.startDate = isJapanese ? "開始希望日を選択してください。" : "Please select a preferred start date.";
      if (!virtualOffice.months) errs.months = isJapanese ? "利用期間（月）を選択してください。" : "Please select the months duration.";
    }
    if (selectedService === "coworking") {
      if (!coworking.seats || Number(coworking.seats) < 1) errs.seats = isJapanese ? "有効な席数を入力してください。" : "Please enter a valid number of seats.";
      if (!coworking.startDate) errs.startDate = isJapanese ? "開始希望日を選択してください。" : "Please select a preferred start date.";
      if (!coworking.endDate) errs.endDate = isJapanese ? "終了日を選択してください。" : "Please select an end date.";
      if (coworking.startDate && coworking.endDate && new Date(coworking.endDate) < new Date(coworking.startDate)) {
        errs.endDate = isJapanese ? "終了日は開始日以降にしてください。" : "End date must be on or after the start date.";
      }
      if (!coworking.terms) errs.terms = isJapanese ? "利用期間を選択してください。" : "Please select a pass type.";
    }
    if (selectedService === "meeting-room") {
      if (!meetingRoom.date) errs.date = isJapanese ? "予約日を選択してください。" : "Please select a reservation date.";
      if (!meetingRoom.time) errs.time = isJapanese ? "希望時間を選択してください。" : "Please select a preferred time.";
      if (!meetingRoom.participants || Number(meetingRoom.participants) < 1) errs.participants = isJapanese ? "有効な参加人数を入力してください。" : "Please enter a valid number of participants.";
      if (!meetingRoom.duration) errs.duration = isJapanese ? "利用時間を選択してください。" : "Please select a duration.";
    }
    if (selectedService === "event-space") {
      if (!eventSpace.eventDate) errs.eventDate = isJapanese ? "イベント日を選択してください。" : "Please select an event date.";
      if (!eventSpace.time) errs.time = isJapanese ? "イベント時間を選択してください。" : "Please select an event time.";
      if (!eventSpace.attendees || Number(eventSpace.attendees) < 1) errs.attendees = isJapanese ? "参加予定人数を入力してください。" : "Please enter an estimated number of attendees.";
      if (!eventSpace.duration) errs.duration = isJapanese ? "イベント時間の長さを選択してください。" : "Please select an event duration.";
      if (!eventSpace.eventType) errs.eventType = isJapanese ? "イベント種別を選択してください。" : "Please select an event type.";
    }
    return errs;
  };

  const handleStep2Next = () => {
    const errs = validateStep2();
    setStep2Errors(errs);
    if (Object.keys(errs).length !== 0) return;
    setStep(3);
  };

  const handleReset = useCallback(() => {
    setStep(1);
    setSelectedService(null);
    setSelectedBranch(null);
    setContact({ name: "", company: "", email: "", phone: "", address: "" });
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
    setRegisteredBusiness(null);
    setWithholdingTax(null);
    setCoworking({ seats: "", startDate: "", endDate: "", terms: "", otherRequirements: "" });
    setMeetingRoom({ date: "", time: "", participants: "", duration: "", additionalRequirements: "" });
    setEventSpace({ eventDate: "", time: "", attendees: "", duration: "", eventType: "", otherRequirements: "" });
    setNotes("");
    setConsent(false);
    setStep2Errors({});
    setModal(null);
    setSubmitError(null);
  }, []);

  // Builds the payload expected by App\Http\Controllers\Api\QuotationController::store
  const buildPayload = () => {
    const serviceLabel = SERVICES.find((s) => s.id === selectedService)?.label ?? "";
    const branchLabelValue = BRANCHES.find((b) => b.id === selectedBranch)?.label ?? "";

    // Shared detail fields
    const detail: Record<string, unknown> = {
      full_name: contact.name,
      company_name: contact.company || null,
      email: contact.email,
      phone: contact.phone,
      contact_address: contact.address || null,
      request: notes || null,
      payment_method: null,
      transaction_id: null,
      receipt: null,
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
    let paymentBreakdown: Record<string, number | string | null> | null = null;

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
      paymentBreakdown = {
        package_price: pricing.base,
        vat_percentage: VO_VAT_RATE * 100,
        vat_amount: pricing.vat,
        duration: pricing.numMonths,
        subtotal: pricing.recurring,
        contract_admin_fee: pricing.contractAdminFee,
        contract_vat: pricing.contractVat,
        total: pricing.total,
      };
      detail.package_name = virtualOffice.package;
      detail.package_price = pricing.base;
      detail.vat_percentage = VO_VAT_RATE * 100;
      detail.vat_amount = pricing.vat;
      detail.duration = pricing.numMonths;
      detail.subtotal = pricing.recurring;
      detail.contract_admin_fee = pricing.contractAdminFee;
      detail.contract_vat = pricing.contractVat;
      detail.total = pricing.total;
      total = pricing.total;
      pkg = virtualOffice.package;
    } else if (selectedService === "coworking") {
      detail.seats = Number(coworking.seats) || null;
      detail.date = coworking.startDate;
      detail.end_date = coworking.endDate || null;
      detail.duration_type = coworking.terms || null;
      detail.other_requirements = coworking.otherRequirements || null;
      lease_term = coworking.terms || null;
    } else if (selectedService === "meeting-room") {
      detail.seats = Number(meetingRoom.participants) || null;
      detail.date = meetingRoom.date;
      detail.time = meetingRoom.time;
      detail.duration_type = meetingRoom.duration;
      detail.other_requirements = meetingRoom.additionalRequirements || null;
    } else if (selectedService === "event-space") {
      detail.seats = Number(eventSpace.attendees) || null;
      detail.date = eventSpace.eventDate;
      detail.time = eventSpace.time;
      detail.duration_type = eventSpace.duration;
      detail.other_requirements = eventSpace.otherRequirements || null;
      event_type = eventSpace.eventType;
    }

    if (!paymentBreakdown && selectedService) {
      detail.subtotal = total;
      detail.total = total;
      detail.contract_admin_fee = 0;
      detail.duration = 1;
    }

    detail.total = total;

    return {
      service_id: selectedService ? SERVICE_IDS[selectedService] : null,
      service_name: serviceLabel,
      branch: branchLabelValue,
      lease_term,
      package: pkg,
      event_type,
      registered_business: selectedService === "virtual-office" ? registeredBusiness : null,
      withholding_tax: isVO ? withholdingTax : null,
      status: "pending",
      detail,
    };
  };

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      const hasFileUploads = !!contractIdentity.governmentIdFile || !!contractIdentity.signatoryGovernmentIdFile;
      const headers: HeadersInit = {
        Accept: "application/json",
        "x-send-quotation-email": "true",
      };

      let body: BodyInit;
      if (hasFileUploads) {
        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));

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
        throw new Error(errBody?.message ?? (isJapanese ? `リクエストに失敗しました（ステータス：${res.status}）` : `Request failed with status ${res.status}`));
      }

      setModal("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : (isJapanese ? "問題が発生しました。もう一度お試しください。" : "Something went wrong. Please try again."));
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
        isJapanese={isJapanese}
      />
    );
    if (selectedService === "virtual-office") return (
      <Step2VirtualOffice
        data={virtualOffice}
        onChange={(d) => { setVirtualOffice((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
        notes={notes}
        setNotes={setNotes}
        isJapanese={isJapanese}
      />
    );
    if (selectedService === "coworking") return (
      <Step2Coworking
        data={coworking}
        onChange={(d) => { setCoworking((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
        isJapanese={isJapanese}
      />
    );
    if (selectedService === "meeting-room") return (
      <Step2MeetingRoom
        data={meetingRoom}
        onChange={(d) => { setMeetingRoom((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
        isJapanese={isJapanese}
      />
    );
    if (selectedService === "event-space") return (
      <Step2EventSpace
        data={eventSpace}
        onChange={(d) => { setEventSpace((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
        isJapanese={isJapanese}
      />
    );
    return null;
  };

  const step2ServiceEntry = SERVICES.find((s) => s.id === selectedService);
  const step2ServiceLabel = step2ServiceEntry ? (isJapanese ? step2ServiceEntry.labelJa : step2ServiceEntry.label) : "";

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="Hero Serviced Office, Inc."
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0B1F4A]/90 to-[#1B3A8C]/60" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-md">{isJapanese ? "見積もりを依頼" : "Get a Quote"}</h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed text-shadow-sm">
              {isJapanese
                ? "お客様のワークスペースに関するご要望をお聞かせください。弊社のチームがお客様に合わせたお見積もりを作成いたします。"
                : "Tell us about your workspace requirements and our team will prepare a customised quotation for you."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <StepRail step={step} steps={steps} isJapanese={isJapanese} />

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
                    setSelectedService={(s) => {
                      setSelectedService(s);
                      if (s === "event-space" && selectedBranch === "tower-6789") {
                        setSelectedBranch(null);
                      }
                      setStep2Errors({});
                    }}
                    selectedBranch={selectedBranch}
                    setSelectedBranch={(b) => { setSelectedBranch(b); setStep2Errors({}); }}
                    onNext={() => setStep(2)}
                    isJapanese={isJapanese}
                  />
                )}

                {/* Step 2: Requirements */}
                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">
                      {isJapanese ? `${step2ServiceLabel}の要件` : `${step2ServiceLabel} Requirements`}
                    </h2>
                    <p className="text-sm text-[#64748B] mb-7">{isJapanese ? "選択したサービスの詳細をご入力ください。" : "Fill in the details for your selected service."}</p>
                    {renderStep2()}
                    <NavRow
                      onBack={() => setStep(1)}
                      onNext={handleStep2Next}
                      isJapanese={isJapanese}
                    />
                  </div>
                )}

                {/* Step 3: Contact */}
                {step === 3 && (
                  <Step3
                    isVO={isVO}
                    contact={contact}
                    contractIdentity={contractIdentity}
                    setContact={setContact}
                    setContractIdentity={setContractIdentity}
                    registeredBusiness={registeredBusiness}
                    setRegisteredBusiness={setRegisteredBusiness}
                    withholdingTax={withholdingTax}
                    setWithholdingTax={setWithholdingTax}
                    isSubmitting={isSubmitting}
                    onBack={() => setStep(2)}
                    onNext={() => isVO && withholdingTax === true ? void handleSubmit() : setStep(4)}
                    isJapanese={isJapanese}
                  />
                )}

                {/* Step 4: Review */}
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
                    isSubmitting={isSubmitting}
                    isVO={isVO}
                    isJapanese={isJapanese}
                  />
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
        title={isJapanese ? "送信完了" : "Request Submitted"}
        hideClose={false}
      >
        <SuccessModalContent
          isVO={isVO}
          registeredBusiness={registeredBusiness}
          withholdingTax={withholdingTax}
          isJapanese={isJapanese}
          onClose={handleSuccessClose}
        />
      </Modal>
    </div>
  );
}

// Privacy Policy
function PrivacyPolicyContent({ isJapanese }: { isJapanese: boolean }) {
  if (isJapanese) {
    return (
      <>
        <p>
          この度は、Hero PH INC.（以下「当社」といいます）のサービスをご利用いただき、誠にありがとうございます。
        </p>
        <p>
          本プライバシーポリシー（以下「本ポリシー」）は、当社における個人情報等の取り扱いに関する基本方針を定めるものです。当社のサービスをご利用いただく場合、お客様（利用者）は本ポリシーに同意したものとみなされます。
        </p>
        <Section title="（1）個人情報等とは">
          個人情報等には、個人情報および利用履歴・特性情報の双方が含まれます。個人情報とは、個人情報保護法に定める個人情報、または氏名、生年月日、住所、電話番号その他の連絡先情報など、生存する個人を識別できる情報を指します。個人情報以外の情報は、利用履歴・特性情報に該当し、利用サービス、購入商品、閲覧履歴・広告閲覧履歴、検索キーワード、利用日時、利用方法、利用環境、郵便番号、性別、職業、年齢、利用者のIPアドレス、Cookie情報、位置情報、端末識別情報などが含まれます。
        </Section>
        <Section title="（2）個人情報等はどのように収集されますか">
          当社は、利用者がユーザー登録を行った際、または当社のいずれかのサービスをご利用いただいた際に個人情報を、また当社のサービスのご利用や当社ウェブサイトの閲覧時に利用履歴・特性情報を収集することがあります。
        </Section>
        <Section title="（3）個人情報等はどのような目的で利用されますか">
          <ul className="list-[upper-alpha] list-inside space-y-2 mt-1">
            <li>利用者がご自身の登録情報を閲覧・修正し、利用状況を確認できるようにするため。</li>
            <li>利用者への通知・連絡、または商品の発送のためにメールアドレスを利用するため。</li>
            <li>氏名、生年月日、住所などの情報を利用者本人の確認のために利用するため。</li>
            <li>利用者への請求のために決済関連情報を利用するため。</li>
            <li>入力画面に登録情報を表示し、利用者の入力作業を簡易にするため。</li>
            <li>利用規約に違反した利用者によるサービス利用を拒否するため。</li>
            <li>利用者からのお問い合わせに回答するため。</li>
            <li>個人を特定できない形式に加工した統計データを作成するため。</li>
            <li>当社または第三者の広告を配信・表示するため。</li>
            <li>マーケティング目的で個人情報等を利用するため。</li>
            <li>上記目的に付随する目的のため。</li>
          </ul>
        </Section>
        <Section title="（4）個人情報等を第三者に提供しますか">
          法令等で求められる場合を除き、当社は利用者の事前の承諾なく個人情報等を第三者に提供することはありません。
        </Section>
        <Section title="（5）自身の個人情報の確認や訂正を求めることはできますか">
          利用者からご自身の個人情報の開示を求められた場合、当社は利用者または第三者の利益を害するおそれがある場合を除き、遅滞なく開示いたします。
        </Section>
        <Section title="（6）利用の停止を求めることはできますか">
          利用者は、ご自身の個人情報等の利用停止を求めることができます。当社は必要な調査を行い、適切な措置を講じます。
        </Section>
        <Section title="（7）プライバシーポリシーの変更">
          本プライバシーポリシーは、事前の通知なく変更されることがあります。変更内容は本ウェブサイトに掲載された時点で効力を生じます。
        </Section>
        <Section title="（8）お問い合わせ先">
          <p>担当者：Minoru Kobayashi</p>
          <p>会社名：Hero Serviced Office, Inc.</p>
          <p>住所：23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines</p>
          <p>
            メール：{" "}
            <a href="mailto:salesofficer@heroph.net" className="text-[#1565C0] underline">
              salesofficer@heroph.net
            </a>
          </p>
        </Section>
      </>
    );
  }

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
        <p>Company name: Hero Serviced Office, Inc. Inc.</p>
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