"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail } from "lucide-react";

interface FormData {
  spaceType: string;
  plan: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  paymentMethod: string;
  paymentProof: File | null;
}

const STEPS = ["Space", "Schedule", "Details", "Payment"];

const SPACE_TYPES = [
  { id: "private-office", name: "Private Office", desc: "Enclosed rooms, 1–17 seats" },
  { id: "shared-office", name: "Shared Office", desc: "Private desks, flexible terms" },
  { id: "coworking", name: "Co-working", desc: "Open desks, hot desking" },
  { id: "virtual-office", name: "Virtual Office", desc: "Address & mail services" },
  { id: "conference-room", name: "Conference Room", desc: "Hourly meeting rooms" },
];

const PLANS: Record<string, { id: string; name: string; price: string; note?: string }[]> = {
  "private-office": [
    { id: "1-seat", name: "1 Seat", price: "₱25,000/mo" },
    { id: "2-seat", name: "2 Seats", price: "₱45,000/mo" },
    { id: "4-seat", name: "4 Seats", price: "₱85,000/mo" },
    { id: "6-seat", name: "6 Seats", price: "₱120,000/mo" },
    { id: "10-seat", name: "10 Seats", price: "₱200,000/mo" },
    { id: "17-seat", name: "17 Seats", price: "₱320,000/mo" },
  ],
  "shared-office": [
    { id: "1-desk", name: "1 Desk", price: "₱18,000/mo" },
    { id: "2-desk", name: "2 Desks", price: "₱32,000/mo" },
    { id: "4-desk", name: "4 Desks", price: "₱60,000/mo" },
    { id: "custom", name: "Custom Plan", price: "Contact us" },
  ],
  "coworking": [
    { id: "daily", name: "Day Pass", price: "₱500/day" },
    { id: "weekly", name: "Week Pass", price: "₱2,500/week" },
    { id: "monthly", name: "Monthly", price: "₱8,000/mo" },
  ],
  "virtual-office": [
    { id: "basic", name: "Basic", price: "₱8,000/mo", note: "Address registration" },
    { id: "premium", name: "Premium", price: "₱15,000/mo", note: "Address + mail forwarding" },
  ],
  "conference-room": [
    { id: "small", name: "Small Room", price: "₱1,000/hr", note: "Up to 4 people" },
    { id: "medium", name: "Medium Room", price: "₱2,000/hr", note: "Up to 8 people" },
    { id: "large", name: "Large Room", price: "₱3,500/hr", note: "Up to 16 people" },
  ],
};

const PAYMENT_METHODS = [
  { id: "bank-transfer", name: "Bank Transfer", desc: "Transfer directly to our BDO account" },
  { id: "check", name: "Check", desc: "Pay via check deposit" },
  { id: "cash", name: "Cash", desc: "Pay in person at our Makati office" },
];

const BANK_DETAILS = [
  ["Bank", "BDO Unibank"],
  ["Account name", "Hero Office Philippines Inc."],
  ["Account no.", "1234-5678-9012-3456"],
  ["Branch", "Ayala Ave, Makati"],
];

const TIME_SLOTS = [
  ["09:00", "9:00 AM"],
  ["10:00", "10:00 AM"],
  ["11:00", "11:00 AM"],
  ["13:00", "1:00 PM"],
  ["14:00", "2:00 PM"],
  ["15:00", "3:00 PM"],
  ["16:00", "4:00 PM"],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

// ─── Step Rail ────────────────────────────────────────────────────────────────
function StepRail({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  done
                    ? "bg-[#C9A84C] text-[#0B1F4A]"
                    : active
                    ? "bg-[#0B1F4A] text-white shadow-[0_0_0_4px_rgba(27,58,140,0.15)]"
                    : "bg-white text-[#64748B] border border-[#D9E2F0]"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx
                )}
              </div>
              <span
                className={`mt-1.5 text-[10px] tracking-[0.15em] uppercase font-semibold ${
                  active ? "text-[#1B3A8C]" : done ? "text-[#C9A84C]" : "text-[#64748B]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 md:w-16 mx-1 mb-5 transition-all duration-500 ${
                  done ? "bg-[#C9A84C]" : "bg-[#D9E2F0]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Booking Summary Sidebar ──────────────────────────────────────────────────
function BookingSummary({ data }: { data: FormData }) {
  const spaceName = SPACE_TYPES.find((s) => s.id === data.spaceType)?.name ?? "";
  const plan = data.spaceType ? (PLANS[data.spaceType] ?? []).find((p) => p.id === data.plan) : null;

  const rows = [
    { k: "Space type", v: spaceName },
    { k: "Plan", v: plan?.name ?? "" },
    { k: "Date", v: data.date },
    { k: "Time", v: data.time ? formatTime(data.time) : "" },
    { k: "Name", v: data.name },
    { k: "Company", v: data.company },
    { k: "Payment", v: data.paymentMethod.replace("-", " ") },
  ].filter((r) => r.v);

  return (
    <aside className="hidden lg:flex flex-col bg-[#0F2460] text-white rounded-2xl p-8 sticky top-8 self-start min-h-105 min-w-[60vh]">
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#8FA8D6] mb-1">Your booking</p>
      <h3 className="text-2xl mb-6">
        Summary
      </h3>

      {rows.length === 0 ? (
        <p className="text-[#8FA8D6] text-sm leading-relaxed">
          Your selections will appear here as you complete each step.
        </p>
      ) : (
        <ul className="space-y-4 flex-1">
          {rows.map((r) => (
            <li key={r.k} className="flex justify-between items-start gap-4 border-b border-white/10 pb-3">
              <span className="text-[#8FA8D6] text-xs uppercase tracking-widest">{r.k}</span>
              <span className="text-white text-sm text-right capitalize font-medium">{r.v}</span>
            </li>
          ))}
        </ul>
      )}

      {plan?.price && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex justify-between items-baseline">
            <span className="text-[#8FA8D6] text-xs uppercase tracking-widest">Total</span>
            <span className="text-xl text-white">
              {plan.price}
            </span>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/20 space-y-2">
        <p className="text-[13px] text-[#8FA8D6] tracking-wider uppercase">Need help?</p>
        <span className="text-sm text-white flex justify-between items-center gap-2">
          <p className="text-sm text-white flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#8FA8D6]" /> +63 2 8801-3417
          </p>
          <p className="text-sm text-white flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#8FA8D6]" /> sales@heroph.net
          </p>
        </span>
      </div>
    </aside>
  );
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-8 h-8"} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

// ─── Field Wrapper ────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 bg-[#F8FAFD] border border-[#D9E2F0] rounded-xl text-[#0B1F4A] text-sm placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/10 focus:border-[#1B3A8C] focus:bg-white transition-all duration-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-[#0B1F4A] mb-2 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Nav Row ──────────────────────────────────────────────────────────────────
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
          className="flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0B1F4A] transition-colors"
        >
          <ArrowLeftIcon /> Back
        </button>
      ) : (
        <span />
      )}
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
          <>
            {nextLabel}
            <ArrowRightIcon />
          </>
        )}
      </button>
    </div>
  );
}

// ─── Step 1: Space ────────────────────────────────────────────────────────────
function Step1({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const plans = formData.spaceType ? (PLANS[formData.spaceType] ?? []) : [];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-[#0B1F4A] mb-7">
        Choose Your Space
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {SPACE_TYPES.map((s) => {
          const active = formData.spaceType === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, spaceType: s.id, plan: "" }))}
              className={`p-4 rounded-2xl border-[1.5px] text-left transition-all duration-200 group ${
                active
                  ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]"
                  : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
              }`}
            >
              <p className={`font-semibold text-lg mb-1 ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A] group-hover:text-[#1B3A8C]"}`}>
                {s.name}
              </p>
              <p className="text-sm text-[#64748B]">{s.desc}</p>
            </button>
          );
        })}
      </div>

      {formData.spaceType && (
        <div>
          <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-[#64748B] mb-3">
            Select a plan
          </p>
          <div className="flex flex-col gap-2">
            {plans.map((plan) => {
              const active = formData.plan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, plan: plan.id }))}
                  className={`w-full px-5 py-4 rounded-xl border-[1.5px] flex justify-between items-center text-left transition-all duration-200 group ${
                    active
                      ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]"
                      : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
                  }`}
                >
                  <div>
                    <p className={`font-semibold text-md ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A] group-hover:text-[#1B3A8C]"}`}>
                      {plan.name}
                    </p>
                    {plan.note && <p className="text-sm text-[#64748B] mt-0.5">{plan.note}</p>}
                  </div>
                  <span className={`text-md font-semibold ml-4 whitespace-nowrap ${active ? "text-[#1B3A8C]" : "text-[#64748B] group-hover:text-[#1B3A8C]"}`}>
                    {plan.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <NavRow onNext={onNext} nextDisabled={!formData.spaceType || !formData.plan} />
    </div>
  );
}

// ─── Step 2: Schedule ─────────────────────────────────────────────────────────
function Step2({
  formData,
  setFormData,
  onBack,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-[#0B1F4A] mb-7">
        Schedule Your Visit
      </h2>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Preferred date">
          <input
            type="date"
            name="date"
            min={today}
            value={formData.date}
            onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
            className={inputCls}
            required
          />
        </Field>
        <Field label="Preferred time">
          <select
            name="time"
            value={formData.time}
            onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
            className={inputCls}
            required
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!formData.date || !formData.time} />
    </div>
  );
}

// ─── Step 3: Details ──────────────────────────────────────────────────────────
function Step3({
  formData,
  setFormData,
  onBack,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-[#0B1F4A] mb-7">
        Your Details
      </h2>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Full name *">
          <input type="text" name="name" value={formData.name} onChange={handle} className={inputCls} placeholder="Juan dela Cruz" required />
        </Field>
        <Field label="Company">
          <input type="text" name="company" value={formData.company} onChange={handle} className={inputCls} placeholder="Your Company" />
        </Field>
        <Field label="Email address *">
          <input type="email" name="email" value={formData.email} onChange={handle} className={inputCls} placeholder="juan@company.com" required />
        </Field>
        <Field label="Phone number *">
          <input type="tel" name="phone" value={formData.phone} onChange={handle} className={inputCls} placeholder="+63 9XX XXX XXXX" required />
        </Field>
      </div>
      <div className="mt-5">
        <Field label="Additional notes">
          <textarea
            name="message"
            value={formData.message}
            onChange={handle}
            rows={4}
            className={inputCls + " resize-none"}
            placeholder="Special requirements, preferred floor, questions…"
          />
        </Field>
      </div>
      <NavRow
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!formData.name || !formData.email || !formData.phone}
      />
    </div>
  );
}

// ─── Step 4: Payment ──────────────────────────────────────────────────────────
function Step4({
  formData,
  setFormData,
  onBack,
  isSubmitting,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => setFormData((p) => ({ ...p, paymentProof: file }));

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-[#0B1F4A] mb-7">
        Payment
      </h2>

      {/* Bank card */}
      <div className="bg-linear-to-br from-[#0B1F4A] to-[#1B3A8C] rounded-2xl p-6 mb-7">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A84C] font-semibold mb-4">
          Bank details
        </p>
        <dl className="space-y-0">
          {BANK_DETAILS.map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0">
              <dt className="text-xs text-white/60">{k}</dt>
              <dd className="text-sm font-semibold text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Payment method */}
      <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-[#64748B] mb-3">
        Payment method
      </p>
      <div className="flex flex-col gap-2 mb-7">
        {PAYMENT_METHODS.map((m) => {
          const active = formData.paymentMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, paymentMethod: m.id }))}
              className={`w-full px-5 py-4 rounded-xl border-[1.5px] text-left transition-all duration-200 group ${
                active
                  ? "border-[#1B3A8C] bg-[#EEF2FB] shadow-[inset_3px_0_0_#C9A84C]"
                  : "border-[#D9E2F0] bg-white hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
              }`}
            >
              <p className={`font-semibold text-sm ${active ? "text-[#1B3A8C]" : "text-[#0B1F4A] group-hover:text-[#1B3A8C]"}`}>
                {m.name}
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* File upload */}
      <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-[#64748B] mb-3">
        Upload payment proof *
      </p>
      <label
        className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 mb-6 ${
          formData.paymentProof
            ? "border-[#2E7D4F] bg-[#F0FAF3]"
            : isDragging
            ? "border-[#1B3A8C] bg-[#EEF2FB]"
            : "border-[#D9E2F0] bg-[#F8FAFD] hover:border-[#1B3A8C] hover:bg-[#EEF2FB]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        {formData.paymentProof ? (
          <div className="flex items-center gap-2 text-[#2E7D4F]">
            <CheckIcon />
            <span className="text-sm font-semibold">{formData.paymentProof.name}</span>
          </div>
        ) : (
          <>
            <UploadIcon className={`w-8 h-8 mb-2.5 transition-colors ${isDragging ? "text-[#1B3A8C]" : "text-[#64748B]"}`} />
            <p className="text-sm text-[#64748B] font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-[#64748B]/70 mt-1">PNG, JPG, PDF — up to 10 MB</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
      </label>

      {/* Note */}
      <div className="bg-[#FDF6E3] border border-[#EDD98A] rounded-xl px-5 py-4 text-sm text-[#7A6020] leading-relaxed mb-2">
        <strong className="font-semibold">Note:</strong> Your reservation will be confirmed within 24 hours after payment verification.
      </div>

      <NavRow
        onBack={onBack}
        nextLabel="Complete reservation"
        nextDisabled={!formData.paymentMethod || !formData.paymentProof}
        isSubmit
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4F6FB]">
      <div className="bg-white rounded-3xl p-10 md:p-16 max-w-lg w-full text-center shadow-xl border border-[#D9E2F0]">
        <div className="w-16 h-16 bg-[#F0FAF3] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon />
        </div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#64748B] mb-2">Booking received</p>
        <h1 className="text-3xl font-medium text-[#0B1F4A] mb-4">
          Reservation Confirmed
        </h1>
        <p className="text-[#64748B] mb-10 leading-relaxed text-sm">
          Thank you for choosing HERO Serviced Office. We will review your booking and send a confirmation email within 24 hours.
        </p>
        <div className="bg-[#F4F6FB] rounded-2xl p-6 text-left mb-8 space-y-4">
          {[
            "We'll verify your payment and booking details",
            "A confirmation email with your reservation details will be sent",
            "Our team will reach out if any additional information is needed",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#0B1F4A] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                {i + 1}
              </span>
              <p className="text-sm text-[#4A4740] leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/" className="px-8 py-3 bg-[#0B1F4A] text-white rounded-full text-sm font-semibold hover:bg-[#1B3A8C] transition">
            Back to home
          </a>
          <a href="/contact" className="px-8 py-3 bg-[#F0EDE6] text-[#4A4740] rounded-full text-sm font-semibold hover:bg-[#E5E1D9] transition">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    spaceType: "", plan: "", date: "", time: "",
    name: "", email: "", phone: "", company: "", message: "",
    paymentMethod: "", paymentProof: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) return <SuccessScreen />;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="About HERO Serviced Office"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#1B3A8C]/90 to-[#1B3A8C]/60" />
        </div>

        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto text-shadow-4xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Reservation
            </h1>
            <p className="text-xl text-gray-300">
              Book a tour or reserve your workspace at HERO Serviced Office.<br />
              We offer flexible plans and spaces to suit your needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form area */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 bg-white">
        <StepRail step={step} />
        <div ref={formRef} className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_4px_24px_rgba(11,31,74,0.06)] border border-[#D9E2F0]"
          >
            {step === 1 && (
              <Step1 formData={formData} setFormData={setFormData} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
              <Step2
                formData={formData}
                setFormData={setFormData}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <Step3
                formData={formData}
                setFormData={setFormData}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            )}
            {step === 4 && (
              <Step4
                formData={formData}
                setFormData={setFormData}
                onBack={() => setStep(3)}
                isSubmitting={isSubmitting}
              />
            )}
          </form>

          {/* Sidebar */}
          <BookingSummary data={formData} />
        </div>
      </section>
    </div>
  );
}