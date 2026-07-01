"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  CreditCard,
  Smartphone,
  Upload,
  FileText,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";

type ServiceId = "private-office" | "virtual-office" | "coworking" | "meeting-room" | "event-space";
type PaymentMethod = "paymongo" | "gcash" | null;
type ModalKey = "privacy" | "success" | null;

interface ContactFields {
  name: string;
  company: string;
  email: string;
  phone: string;
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
}

interface CoworkingFields {
  seats: string;
  startDate: string;
  passType: string;
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

const SERVICES: { id: ServiceId; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "private-office", label: "Private Office", desc: "Enclosed rooms, 1–17 seats", icon: Building2 },
  { id: "virtual-office", label: "Virtual Office", desc: "Address & mail services", icon: Wifi },
  { id: "coworking", label: "Co-working Space", desc: "Open desks, hot desking", icon: Armchair },
  { id: "meeting-room", label: "Meeting Room", desc: "Hourly meeting rooms", icon: CalendarDays },
  { id: "event-space", label: "Event Space", desc: "Venues for events & functions", icon: PartyPopper },
];

// ─── API Config ───────────────────────────────────────────────────────────────

// Goes through the Next.js API route (app/api/quotations/route.ts), which
// proxies to the Laravel backend server-side. Avoids CORS and keeps the
// Laravel URL out of the browser bundle.
const API_BASE_URL = "/api";

// Maps the frontend service slug to the real `services` table primary key.
// Replace these with your actual service IDs (e.g. fetch /api/services and
// match on a slug/name column instead of hardcoding).
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
const VO_STEPS = ["Service", "Requirements", "Contact", "Review", "Payment"];

const LEASE_TERMS = ["6 Months", "12 Months", "More than 12 Months"];
const PASS_TYPES = ["Daily", "Weekly", "Monthly"];
const TIME_SLOTS = [
  ["09:00", "9:00 AM"], ["10:00", "10:00 AM"], ["11:00", "11:00 AM"],
  ["13:00", "1:00 PM"], ["14:00", "2:00 PM"], ["15:00", "3:00 PM"], ["16:00", "4:00 PM"],
];

// ─── Validation Helpers ───────────────────────────────────────────────────────

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPhone = (phone: string) =>
  /^(\+?63|0)[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(phone.replace(/\s/g, ""));

// ─── Shared UI ────────────────────────────────────────────────────────────────

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
          className={`px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-all duration-150 ${
            value === opt
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
  const isGCash = isVO && paymentMethod === "gcash";

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-[#EEF2FB] rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-[#1B3A8C]" />
      </div>

      <p className="text-[10px] tracking-[0.25em] uppercase text-[#64748B] mb-2">
        {isVO ? "Virtual Office Request" : "Quotation Received"}
      </p>
      <h3 className="text-2xl font-bold text-[#0B1F4A] mb-3">Thank You!</h3>

      {isGCash ? (
        <p className="text-[#64748B] text-sm leading-relaxed mb-6">
          Your proof of payment has been received.<br/>A HERO Serviced Office representative will
          verify your GCash payment and send your service contract to your email within{" "}
          <strong>24 business hours</strong>.
        </p>
      ) : isVO ? (
        <p className="text-[#64748B] text-sm leading-relaxed mb-6">
          Payment confirmed. Your service contract has been auto-generated and will be sent to
          your email for digital signing via DocHub. Your virtual office service will begin on
          your selected start date.
        </p>
      ) : (
        <p className="text-[#64748B] text-sm leading-relaxed mb-6">
         Your quotation request has been received. {" "}
         A HERO Serviced Office representative will contact you within <strong>24 business hours</strong>.
        </p>
      )}

      <div className="bg-[#F4F6FB] rounded-2xl p-5 text-left mb-6 space-y-3">
        {(isGCash
          ? [
              "We'll verify your GCash payment within 24 business hours",
              "Your service contract will be generated and emailed to you",
              "Our team will reach out to confirm your virtual office activation",
            ]
          : isVO
          ? [
              "Your payment has been processed successfully",
              "A contract PDF will be emailed to you for e-signature",
              "Your virtual office service is now being set up",
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
          className="px-8 py-3 bg-[#0B1F4A] text-white rounded-full text-sm font-semibold hover:bg-[#1B3A8C] transition"
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                done
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
              <span className={`mt-1.5 text-[10px] tracking-[0.15em] uppercase font-semibold ${
                active ? "text-[#1B3A8C]" : done ? "text-[#C9A84C]" : "text-[#64748B]"
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
          className="flex items-center gap-2 px-6 py-3 border border-[#D9E2F0] text-[#0B1F4A] text-sm font-semibold rounded-full hover:border-[#1B3A8C] hover:text-[#1B3A8C] transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      ) : <span />}
      <button
        type={isSubmit ? "submit" : "button"}
        onClick={!isSubmit ? onNext : undefined}
        disabled={nextDisabled || isSubmitting}
        className="flex items-center gap-2 px-7 py-3 bg-[#0B1F4A] text-white text-sm font-semibold rounded-full hover:bg-[#1B3A8C] disabled:bg-[#D9E2F0] disabled:text-[#64748B] disabled:cursor-not-allowed transition-all duration-200"
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
  onNext,
}: {
  selectedService: ServiceId | null;
  setSelectedService: (s: ServiceId) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);

  const handleNext = () => {
    setTouched(true);
    if (selectedService) onNext();
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
              className={`p-4 rounded-2xl border-[1.5px] text-left transition-all duration-200 group ${
                active
                  ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]"
                  : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2.5 transition-colors ${active ? "text-[#1B3A8C]" : "text-[#64748B] group-hover:text-[#1B3A8C]"}`} />
              <p className={`font-semibold text-md mb-0.5 ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A] group-hover:text-[#1B3A8C]"}`}>{s.label}</p>
              <p className="text-sm text-[#64748B] leading-snug">{s.desc}</p>
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
      <NavRow onNext={handleNext} />
    </div>
  );
}

// Step 2: Requirements 
function Step2PrivateOffice({
  data,
  onChange,
  errors,
}: {
  data: PrivateOfficeFields;
  onChange: (d: Partial<PrivateOfficeFields>) => void;
  errors: Partial<Record<keyof PrivateOfficeFields, string>>;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Number of Seats" required error={errors.seats}>
          <input
            type="number"
            min={1}
            max={17}
            value={data.seats}
            onChange={(e) => onChange({ seats: e.target.value })}
            className={errors.seats ? inputErrCls : inputCls}
            placeholder="Maximum 17"
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
}: {
  data: VirtualOfficeFields;
  onChange: (d: Partial<VirtualOfficeFields>) => void;
  errors: Partial<Record<keyof VirtualOfficeFields, string>>;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="space-y-5">
      <Field label="Package" required error={errors.package}>
        <div className="grid sm:grid-cols-3 gap-3 mt-1">
          {[
            { id: "Basic", desc: "Business address registration", price: "₱8,000/mo" },
            { id: "Standard", desc: "Address + mail handling", price: "₱12,000/mo" },
            { id: "Premium", desc: "Address + mail forwarding + receptionist", price: "₱15,000/mo" },
          ].map((pkg) => {
            const active = data.package === pkg.id;
            return (
              <button key={pkg.id} type="button" onClick={() => onChange({ package: pkg.id })}
                className={`p-4 rounded-2xl border-[1.5px] text-left transition-all duration-200 group ${active ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]" : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"}`}>
                <p className={`font-bold text-md mb-1 ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A]"}`}>{pkg.id}</p>
                <p className="text-sm text-[#64748B] mb-2 leading-snug">{pkg.desc}</p>
                <p className={`text-xs font-bold ${active ? "text-[#C9A84C]" : "text-[#64748B]"}`}>{pkg.price}</p>
              </button>
            );
          })}
        </div>
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
      <Field label="Pass Type" required error={errors.passType}>
        <PillSelect options={PASS_TYPES} value={data.passType} onChange={(v) => onChange({ passType: v })} />
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
  contact,
  notes,
  setContact,
  setNotes,
  onBack,
  onNext,
}: {
  contact: ContactFields;
  notes: string;
  setContact: React.Dispatch<React.SetStateAction<ContactFields>>;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFields, string>>>({});
  const [touched, setTouched] = useState(false);

  const validate = () => {
    const errs: Partial<Record<keyof ContactFields, string>> = {};
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
    return errs;
  };

  const handleNext = () => {
    setTouched(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  };

  // Live validate after first submit attempt
  useEffect(() => {
    if (touched) setErrors(validate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact, touched]);

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
      <div className="mt-5">
        <Field label="Notes / Special Requests">
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls + " resize-none"}
            placeholder="Anything else you'd like us to know before preparing your quote…"
          />
        </Field>
      </div>
      <NavRow onBack={onBack} onNext={handleNext} />
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
  privateOffice,
  virtualOffice,
  coworking,
  meetingRoom,
  eventSpace,
  contact,
  notes,
  consent,
  setConsent,
  onBack,
  onNext,
  isSubmitting,
  isVO,
}: {
  selectedService: ServiceId | null;
  privateOffice: PrivateOfficeFields;
  virtualOffice: VirtualOfficeFields;
  coworking: CoworkingFields;
  meetingRoom: MeetingRoomFields;
  eventSpace: EventSpaceFields;
  contact: ContactFields;
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
    ];
    if (selectedService === "coworking") return [
      { label: "Seats", value: coworking.seats },
      { label: "Start Date", value: coworking.startDate },
      { label: "Pass Type", value: coworking.passType },
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
        {serviceRows().map((r) => <ReviewRow key={r.label} label={r.label} value={r.value} />)}
      </div>

      <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5 mb-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0B1F4A]/40 mb-3">Contact</p>
        <ReviewRow label="Name" value={contact.name} />
        <ReviewRow label="Company" value={contact.company} />
        <ReviewRow label="Email" value={contact.email} />
        <ReviewRow label="Phone" value={contact.phone} />
        <ReviewRow label="Notes" value={notes} />
      </div>

      {isVO && (
        <div className="bg-[#EEF2FB] border border-[#C5D2EC] rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <CreditCard className="w-4 h-4 text-[#1B3A8C] shrink-0 mt-0.5" />
          <p className="text-xs text-[#1B3A8C] leading-relaxed">
            After confirming, you'll proceed to select your payment method and complete the transaction before your virtual office is activated.
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
  gcashProof,
  setGcashProof,
  contractAction,
  setContractAction,
  onBack,
  isSubmitting,
}: {
  virtualOffice: VirtualOfficeFields;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  gcashProof: File | null;
  setGcashProof: (f: File | null) => void;
  contractAction: "dochub" | "upload" | null;
  setContractAction: (a: "dochub" | "upload" | null) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const gcashRef = useRef<HTMLInputElement>(null);
  const signRef = useRef<HTMLInputElement>(null);
  const [signedFile, setSignedFile] = useState<File | null>(null);

  const packagePrices: Record<string, string> = {
    Basic: "₱8,000",
    Standard: "₱12,000",
    Premium: "₱15,000",
  };

  const canProceed =
    (paymentMethod === "paymongo" && contractAction !== null) ||
    (paymentMethod === "gcash" && gcashProof !== null);

  const handleSubmitAttempt = () => { setTouched(true); };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0B1F4A] mb-2">Payment & Contract</h2>
      <p className="text-sm text-[#64748B] mb-6">Choose how you'd like to pay and sign your service contract.</p>

      {/* Summary pill */}
      <div className="bg-[#EEF2FB] border border-[#C5D2EC] rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#1B3A8C] uppercase tracking-wide">Virtual Office — {virtualOffice.package}</p>
          <p className="text-xs text-[#64748B] mt-0.5">Starting {virtualOffice.startDate || "TBD"}</p>
        </div>
        <p className="text-xl font-bold text-[#0B1F4A]">
          {packagePrices[virtualOffice.package] ?? "—"}
          <span className="text-xs text-[#64748B] font-normal">/mo</span>
        </p>
      </div>

      {/* Payment method selector */}
      <Field label="Payment Method" required error={touched && !paymentMethod ? "Please select a payment method." : undefined}>
        <div className="grid sm:grid-cols-2 gap-3 mt-1">
          {[
            { id: "paymongo" as PaymentMethod, icon: CreditCard, label: "PayMongo", sub: "Credit / Debit Card", badge: "Instant" },
            { id: "gcash" as PaymentMethod, icon: Smartphone, label: "GCash", sub: "Mobile wallet", badge: "Manual verify" },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = paymentMethod === opt.id;
            return (
              <button
                key={opt.id!}
                type="button"
                onClick={() => { setPaymentMethod(opt.id); setContractAction(null); setGcashProof(null); }}
                className={`p-4 rounded-2xl border-[1.5px] text-left transition-all duration-200 ${
                  active ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]" : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${active ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    opt.badge === "Instant" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>{opt.badge}</span>
                </div>
                <p className={`font-bold text-sm ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A]"}`}>{opt.label}</p>
                <p className="text-xs text-[#64748B]">{opt.sub}</p>
              </button>
            );
          })}
        </div>
      </Field>

      {/* PayMongo flow */}
      {paymentMethod === "paymongo" && (
        <div className="mt-6 space-y-4">
          <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0B1F4A] mb-1">How it works</p>
            <ol className="text-xs text-[#64748B] space-y-1 list-decimal list-inside">
              <li>Pay securely via PayMongo (card, Maya, GCash via PayMongo)</li>
              <li>Your contract is auto-generated upon payment confirmation</li>
              <li>Sign digitally via DocHub or upload a signed copy</li>
            </ol>
          </div>

          <Field label="After payment, I want to…" required error={touched && !contractAction ? "Please select a contract signing method." : undefined}>
            <div className="grid sm:grid-cols-2 gap-3 mt-1">
              {[
                { id: "dochub" as const, icon: ExternalLink, label: "Sign via DocHub", sub: "Opens contract in DocHub for e-signature" },
                { id: "upload" as const, icon: Upload, label: "Upload signed copy", sub: "Download, sign, and upload the PDF" },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = contractAction === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setContractAction(opt.id)}
                    className={`p-4 rounded-2xl border-[1.5px] text-left transition-all duration-200 ${
                      active ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]" : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${active ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
                    <p className={`font-bold text-sm ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A]"}`}>{opt.label}</p>
                    <p className="text-xs text-[#64748B] leading-snug">{opt.sub}</p>
                  </button>
                );
              })}
            </div>
          </Field>

          {contractAction === "upload" && (
            <div className="bg-[#FFFBF0] border border-[#F0D98A] rounded-xl px-5 py-4 flex items-start gap-3">
              <FileText className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#7A5C00] mb-1">Upload Signed Contract</p>
                <p className="text-xs text-[#A07A10] mb-3 leading-relaxed">
                  After payment you'll receive a PDF contract via email. Print, sign, scan/photo, and upload it below.
                </p>
                <button
                  type="button"
                  onClick={() => signRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white text-xs font-semibold rounded-full hover:bg-[#B8973B] transition"
                >
                  <Upload className="w-3 h-3" />
                  {signedFile ? signedFile.name : "Choose file (PDF / JPG / PNG)"}
                </button>
                <input ref={signRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setSignedFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>
          )}

          {contractAction === "dochub" && (
            <div className="bg-[#EEF2FB] border border-[#C5D2EC] rounded-xl px-5 py-4 flex items-start gap-3">
              <ExternalLink className="w-4 h-4 text-[#1B3A8C] shrink-0 mt-0.5" />
              <p className="text-xs text-[#1B3A8C] leading-relaxed">
                After payment, a DocHub link will be sent to your email so you can e-sign the contract online — no printing needed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* GCash flow */}
      {paymentMethod === "gcash" && (
        <div className="mt-6 space-y-4">
          <div className="bg-[#F8FAFD] border border-[#D9E2F0] rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0B1F4A] mb-3">GCash Payment Details</p>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-[#EEF2FB] rounded-xl flex items-center justify-center shrink-0 border border-[#C5D2EC]">
                <Smartphone className="w-8 h-8 text-[#1B3A8C]" />
              </div>
              <div className="text-xs text-[#64748B] space-y-1">
                <p><span className="font-semibold text-[#0B1F4A]">GCash Number:</span> 09XX XXX XXXX</p>
                <p><span className="font-semibold text-[#0B1F4A]">Account Name:</span> HERO PH INC.</p>
                <p><span className="font-semibold text-[#0B1F4A]">Amount:</span> {packagePrices[virtualOffice.package] ?? "—"}/mo</p>
                <p className="mt-2 text-[#64748B]">Use your <strong>full name</strong> as the reference / note.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFBF0] border border-[#F0D98A] rounded-xl px-5 py-4 flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
            <div className="text-xs text-[#7A5C00] space-y-1 leading-relaxed">
              <p className="font-semibold">Verification within 24 business hours</p>
              <p>Our sales officer will verify your payment and send the service contract to your email within 24 business hours of receiving your proof of payment.</p>
            </div>
          </div>

          <Field label="Upload Proof of Payment" required error={touched && !gcashProof ? "Please upload your GCash proof of payment." : undefined}>
            <button
              type="button"
              onClick={() => gcashRef.current?.click()}
              className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all duration-200 ${
                gcashProof ? "border-[#1B3A8C] bg-[#EEF2FB]" : "border-[#D9E2F0] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
              }`}
            >
              <Upload className={`w-5 h-5 ${gcashProof ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
              <span className={`text-sm font-semibold ${gcashProof ? "text-[#1B3A8C]" : "text-[#64748B]"}`}>
                {gcashProof ? gcashProof.name : "Click to upload screenshot or PDF"}
              </span>
            </button>
            <input ref={gcashRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setGcashProof(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-[#64748B] mt-2">Accepted: JPG, PNG, PDF · Max 10 MB</p>
          </Field>
        </div>
      )}

      <NavRow
        onBack={onBack}
        nextLabel="Confirm & Submit"
        nextDisabled={!canProceed}
        isSubmit={true}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function GetAQuotePage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [contact, setContact] = useState<ContactFields>({ name: "", company: "", email: "", phone: "" });
  const [privateOffice, setPrivateOffice] = useState<PrivateOfficeFields>({ seats: "", moveInDate: "", leaseTerm: "", otherRequirements: "" });
  const [virtualOffice, setVirtualOffice] = useState<VirtualOfficeFields>({ package: "", startDate: "" });
  const [coworking, setCoworking] = useState<CoworkingFields>({ seats: "", startDate: "", passType: "", otherRequirements: "" });
  const [meetingRoom, setMeetingRoom] = useState<MeetingRoomFields>({ date: "", time: "", participants: "", duration: "", additionalRequirements: "" });
  const [eventSpace, setEventSpace] = useState<EventSpaceFields>({ eventDate: "", attendees: "", duration: "", eventType: "", otherRequirements: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [gcashProof, setGcashProof] = useState<File | null>(null);
  const [contractAction, setContractAction] = useState<"dochub" | "upload" | null>(null);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalKey>(null);

  // Step 2 validation errors (set on attempted advance)
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  const isVO = selectedService === "virtual-office";
  // Standard: Service(1) → Requirements(2) → Contact(3) → Review(4)
  // Virtual Office: Service(1) → Requirements(2) → Contact(3) → Review(4) → Payment(5)
  const steps = isVO ? VO_STEPS : BASE_STEPS;

  // Step 2 validation per service
  const validateStep2 = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (selectedService === "private-office") {
      if (!privateOffice.seats || Number(privateOffice.seats) < 1) errs.seats = "Please enter a valid number of seats (min 1).";
      if (Number(privateOffice.seats) > 17) errs.seats = "Maximum 17 seats available.";
      if (!privateOffice.moveInDate) errs.moveInDate = "Please select a target move-in date.";
      if (!privateOffice.leaseTerm) errs.leaseTerm = "Please select a lease term.";
    }
    if (selectedService === "virtual-office") {
      if (!virtualOffice.package) errs.package = "Please select a package.";
      if (!virtualOffice.startDate) errs.startDate = "Please select a preferred start date.";
    }
    if (selectedService === "coworking") {
      if (!coworking.seats || Number(coworking.seats) < 1) errs.seats = "Please enter a valid number of seats.";
      if (!coworking.startDate) errs.startDate = "Please select a preferred start date.";
      if (!coworking.passType) errs.passType = "Please select a pass type.";
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
    setContact({ name: "", company: "", email: "", phone: "" });
    setPrivateOffice({ seats: "", moveInDate: "", leaseTerm: "", otherRequirements: "" });
    setVirtualOffice({ package: "", startDate: "" });
    setCoworking({ seats: "", startDate: "", passType: "", otherRequirements: "" });
    setMeetingRoom({ date: "", time: "", participants: "", duration: "", additionalRequirements: "" });
    setEventSpace({ eventDate: "", attendees: "", duration: "", eventType: "", otherRequirements: "" });
    setPaymentMethod(null);
    setGcashProof(null);
    setContractAction(null);
    setNotes("");
    setConsent(false);
    setStep2Errors({});
    setModal(null);
    setSubmitError(null);
  }, []);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Builds the payload expected by App\Http\Controllers\Api\QuotationController::store
  const buildPayload = () => {
    const serviceLabel = SERVICES.find((s) => s.id === selectedService)?.label ?? "";

    // Shared detail fields
    const detail: Record<string, unknown> = {
      full_name: contact.name,
      company_name: contact.company || null,
      email: contact.email,
      phone: contact.phone,
      request: notes || null,
      payment_method: paymentMethod ?? "gcash", // backend requires this; defaults to gcash for non-VO flows
      transaction_id: null,
      receipt: gcashProof ? gcashProof.name : null,
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
      const packagePrices: Record<string, number> = { Basic: 8000, Standard: 12000, Premium: 15000 };
      total = packagePrices[virtualOffice.package] ?? 0;
      pkg = virtualOffice.package;
    } else if (selectedService === "coworking") {
      detail.seats = Number(coworking.seats) || null;
      detail.date = coworking.startDate;
      detail.duration_type = coworking.passType;
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
      const res = await fetch(`${API_BASE_URL}/quotations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(buildPayload()),
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
      />
    );
    if (selectedService === "virtual-office") return (
      <Step2VirtualOffice
        data={virtualOffice}
        onChange={(d) => { setVirtualOffice((p) => ({ ...p, ...d })); setStep2Errors({}); }}
        errors={step2Errors}
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Get a Quote</h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
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
                    contact={contact}
                    notes={notes}
                    setContact={setContact}
                    setNotes={setNotes}
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                  />
                )}

                {/* Step 4: Review — for all services */}
                {step === 4 && (
                  <Step4
                    selectedService={selectedService}
                    privateOffice={privateOffice}
                    virtualOffice={virtualOffice}
                    coworking={coworking}
                    meetingRoom={meetingRoom}
                    eventSpace={eventSpace}
                    contact={contact}
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
                    gcashProof={gcashProof}
                    setGcashProof={setGcashProof}
                    contractAction={contractAction}
                    setContractAction={setContractAction}
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