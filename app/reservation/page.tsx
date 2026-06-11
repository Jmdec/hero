"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  CreditCard,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  User,
  Briefcase,
  MapPin,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ["Space", "Schedule", "Details", "Payment"];

function StepRail({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${done
                  ? "bg-[#1B3A8C] text-white"
                  : active
                    ? "bg-[#1B3A8C] text-white ring-4 ring-[#C5D2EC]"
                    : "bg-[#F0EDE6] text-[#9B9690]"
                  }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
              </div>
              <span
                className={`mt-1.5 text-[12px] tracking-widest uppercase font-medium ${active ? "text-[#1B3A8C]" : "text-[#9B9690]"
                  }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-12 md:w-20 mx-1 mb-5 transition-all duration-500 ${done ? "bg-[#1B3A8C]" : "bg-[#DDD9D2]"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Booking summary sidebar ──────────────────────────────────────────────────
function BookingSummary({ data, planLabel, price }: { data: FormData; planLabel: string; price: string }) {
  const rows = [
    { label: "Space type", value: data.spaceType ? data.spaceType.replace("-", " ") : null },
    { label: "Plan", value: planLabel || null },
    { label: "Date", value: data.date || null },
    { label: "Time", value: data.time ? `${data.time}` : null },
    { label: "Name", value: data.name || null },
    { label: "Company", value: data.company || null },
    { label: "Payment", value: data.paymentMethod ? data.paymentMethod.replace("-", " ") : null },
  ].filter((r) => r.value);

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
            <li key={r.label} className="flex justify-between items-start gap-4 border-b border-white/10 pb-3">
              <span className="text-[#8FA8D6] text-xs uppercase tracking-widest">{r.label}</span>
              <span className="text-white text-sm text-right capitalize font-medium">{r.value}</span>
            </li>
          ))}
        </ul>
      )}

      {price && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex justify-between items-baseline">
            <span className="text-[#8FA8D6] text-xs uppercase tracking-widest">Total</span>
            <span className="text-xl text-white">
              {price}
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

// ─── Shared field wrapper ─────────────────────────────────────────────────────
function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-[#F7F4EF] border border-[#E0DBD4] rounded-xl text-[#1A1814] text-sm placeholder:text-[#B0AB9F] focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/30 focus:border-[#1B3A8C] transition";

// ─── Nav buttons ──────────────────────────────────────────────────────────────
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
    <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#EAE6DF]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#6B6760] hover:text-[#1A1814] transition font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        type={isSubmit ? "submit" : "button"}
        onClick={!isSubmit ? onNext : undefined}
        disabled={nextDisabled || isSubmitting}
        className="flex items-center gap-2 px-8 py-3 bg-[#1B3A8C] text-white text-sm font-semibold rounded-full hover:bg-[#2A4EA0] disabled:bg-[#C5C9D0] disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReservationPage() {

  const spaceTypes = [
    { id: "serviced-office", name: "Serviced Office", icon: Building2, desc: "Private rooms, 1–17 seats" },
    { id: "meeting-room", name: "Meeting Room", icon: Users, desc: "Hourly, up to 10 people" },
    { id: "virtual-office", name: "Virtual Office", icon: Briefcase, desc: "Address & mail services" },
  ];

  const officePlans = [
    { id: "starter", name: "Starter", price: "₱25,000/month", note: "Up to 3 seats" },
    { id: "professional", name: "Professional", price: "₱45,000/month", note: "Up to 8 seats" },
    { id: "enterprise", name: "Enterprise", price: "₱75,000/month", note: "Up to 17 seats" },
  ];

  const meetingRooms = [
    { id: "small", name: "Small Room", price: "₱1,500/hour", note: "Up to 5 people" },
    { id: "large", name: "Large Room", price: "₱3,000/hour", note: "Up to 10 people" },
  ];

  const virtualPlans = [
    { id: "basic", name: "Basic", price: "₱8,000/month", note: "Address registration" },
    { id: "premium", name: "Premium", price: "₱15,000/month", note: "Address + mail forwarding" },
  ];

  const paymentMethods = [
    { id: "bank-transfer", name: "Bank Transfer", description: "Transfer directly to our bank account" },
    { id: "check", name: "Check", description: "Pay via check deposit" },
    { id: "cash", name: "Cash", description: "Pay in person at our office" },
  ];

  const [step, setStep] = useState(1);

  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [step]);

  const [formData, setFormData] = useState<FormData>({
    spaceType: "", plan: "", date: "", time: "",
    name: "", email: "", phone: "", company: "", message: "",
    paymentMethod: "", paymentProof: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFormData((p) => ({ ...p, paymentProof: e.target.files![0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const getPlanOptions = () => {
    if (formData.spaceType === "serviced-office") return officePlans;
    if (formData.spaceType === "meeting-room") return meetingRooms;
    if (formData.spaceType === "virtual-office") return virtualPlans;
    return [];
  };

  const currentPlan = getPlanOptions().find((p) => p.id === formData.plan);
  const planLabel = currentPlan?.name ?? "";
  const price = currentPlan?.price ?? "";

  // ── Success screen ──────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#F7F4EF", fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-10 md:p-16 max-w-lg w-full text-center shadow-xl"
        >
          <div className="w-16 h-16 bg-[#E8F5EC] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#2E7D4F]" />
          </div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9B9690] mb-2">Booking received</p>
          <h1
            className="text-3xl text-[#1A1814] mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
          >
            Reservation Confirmed
          </h1>
          <p className="text-[#6B6760] mb-10 leading-relaxed">
            Thank you for your reservation. We will review your booking and send a confirmation email within 24 hours.
          </p>

          <div className="bg-[#F7F4EF] rounded-2xl p-6 text-left mb-8 space-y-4">
            {[
              "We will verify your payment and booking details",
              "You will receive a confirmation email with your reservation details",
              "Our team will contact you for any additional information if needed",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#1B3A8C] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-[#4A4740]">{s}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="px-8 py-3 bg-[#1B3A8C] text-white rounded-full text-sm font-semibold hover:bg-[#2A4EA0] transition"
            >
              Back to Home
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-[#F0EDE6] text-[#4A4740] rounded-full text-sm font-semibold hover:bg-[#E5E1D9] transition"
            >
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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

      {/* ── Form area ─────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 bg-white">
        <StepRail step={step} />
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* Left: form card */}
          <div
            ref={formRef}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F2460]/5 border border-[#EAE6DF]">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">

                {/* ── Step 1: Space ──────────────────────────────────────────── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="text-2xl text-center font-bold text-gray-900 mb-6">
                      Select Space Type
                    </h2>

                    <div className="grid sm:grid-cols-3 gap-5 mb-8">
                      {spaceTypes.map((type) => {
                        const Icon = type.icon;
                        const active = formData.spaceType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, spaceType: type.id, plan: "" }))}
                            className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group overflow-hidden ${active
                              ? "border-[#1B3A8C] bg-linear-to-br from-[#EEF2FB] to-[#C5D2EC]/30 shadow-lg shadow-[#1B3A8C]/10"
                              : "border-[#E0DBD4] bg-white hover:border-[#1B3A8C] hover:shadow-md"
                              }`}
                          >
                            {active && (
                              <div className="absolute top-0 right-0 w-20 h-20 bg-[#1B3A8C]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            )}
                            <div
                              className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${active ? "bg-[#1B3A8C] shadow-lg shadow-[#1B3A8C]/20" : "bg-[#E0DBD4] group-hover:bg-[#1B3A8C]"
                                }`}
                            >
                              <Icon className={`w-6 h-6 transition-colors ${active ? "text-white" : "text-[#9B9690] group-hover:text-white"}`} />
                            </div>
                            <p className={`relative font-semibold text-base mb-1 transition-colors ${active ? "text-[#1B3A8C]" : "text-[#1A1814] group-hover:text-[#1B3A8C]"}`}>
                              {type.name}
                            </p>
                            <p className="relative text-xs text-[#9B9690]">{type.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    {formData.spaceType && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Select Plan
                        </p>
                        <div className="space-y-3">
                          {getPlanOptions().map((plan) => {
                            const active = formData.plan === plan.id;
                            return (
                              <button
                                key={plan.id}
                                type="button"
                                onClick={() => setFormData((p) => ({ ...p, plan: plan.id }))}
                                className={`relative w-full px-6 py-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 group overflow-hidden ${active
                                  ? "border-[#1B3A8C] bg-linear-to-r from-[#EEF2FB] to-[#C5D2EC]/20 shadow-md shadow-[#1B3A8C]/10"
                                  : "border-[#E0DBD4] bg-white hover:border-[#1B3A8C] hover:shadow-sm"
                                  }`}
                              >
                                {active && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1B3A8C]" />
                                )}
                                <div className="text-left relative">
                                  <p className={`font-semibold text-base transition-colors ${active ? "text-[#1B3A8C]" : "text-[#1A1814] group-hover:text-[#1B3A8C]"}`}>
                                    {plan.name}
                                  </p>
                                  {"note" in plan && (
                                    <p className="text-xs text-[#9B9690] mt-1">{(plan as any).note}</p>
                                  )}
                                </div>
                                <span className={`relative text-base font-semibold transition-colors ${active ? "text-[#1B3A8C]" : "text-[#6B6760] group-hover:text-[#1B3A8C]"}`}>
                                  {plan.price}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    <NavRow
                      onNext={() => setStep(2)}
                      nextDisabled={!formData.spaceType || !formData.plan}
                    />
                  </motion.div>
                )}

                {/* ── Step 2: Schedule ───────────────────────────────────────── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="text-2xl text-center font-bold text-gray-900 mb-6">
                      Schedule Visit
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Field label="Preferred Date" icon={Calendar}>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInput}
                          className={inputCls}
                          required
                        />
                      </Field>
                      <Field label="Preferred Time" icon={Clock}>
                        <select
                          name="time"
                          value={formData.time}
                          onChange={handleInput}
                          className={inputCls}
                          required
                        >
                          <option value="">Select Time</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                        </select>
                      </Field>
                    </div>

                    <NavRow
                      onBack={() => setStep(1)}
                      onNext={() => setStep(3)}
                      nextDisabled={!formData.date || !formData.time}
                    />
                  </motion.div>
                )}

                {/* ── Step 3: Details ────────────────────────────────────────── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="text-2xl text-center font-bold text-gray-900 mb-6">
                      Your Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Field label="Full Name" icon={User}>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInput}
                          className={inputCls}
                          placeholder="John Doe"
                          required
                        />
                      </Field>
                      <Field label="Company Name" icon={Briefcase}>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInput}
                          className={inputCls}
                          placeholder="Your Company"
                        />
                      </Field>
                      <Field label="Email Address" icon={Mail}>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInput}
                          className={inputCls}
                          placeholder="john@company.com"
                          required
                        />
                      </Field>
                      <Field label="Phone Number" icon={Phone}>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInput}
                          className={inputCls}
                          placeholder="+63 XXX XXX XXXX"
                          required
                        />
                      </Field>
                    </div>

                    <div className="mt-6">
                      <Field label="Additional Message">
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInput}
                          rows={4}
                          className={inputCls + " resize-none"}
                          placeholder="Any special requirements or questions…"
                        />
                      </Field>
                    </div>

                    <NavRow
                      onBack={() => setStep(2)}
                      onNext={() => setStep(4)}
                      nextDisabled={!formData.name || !formData.email || !formData.phone}
                    />
                  </motion.div>
                )}

                {/* ── Step 4: Payment ────────────────────────────────────────── */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="text-2xl text-center font-bold text-gray-900 mb-2">
                      Payment
                    </h2>

                    {/* Bank details */}
                    <div className="bg-linear-to-br from-[#EEF2FB] to-[#C5D2EC]/30 border border-[#C5D2EC] rounded-2xl p-7 mb-8 shadow-sm">
                      <p className="text-[11px] tracking-[0.25em] uppercase text-[#4A6AAC] mb-5 flex items-center gap-2 font-semibold">
                        <CreditCard className="w-4 h-4" />
                        Bank Details
                      </p>
                      <dl className="space-y-3 text-sm">
                        {[
                          ["Bank name", "BDO"],
                          ["Account name", "Hero Office Philippines Inc."],
                          ["Account number", "1234-5678-9012-3456"],
                          ["Branch", "Ayala Avenue, Makati"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center py-2 border-b border-[#C5D2EC]/30 last:border-0">
                            <dt className="text-[#4A6AAC] font-medium">{k}</dt>
                            <dd className="font-semibold text-[#1B3A8C]">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* Payment method */}
                    <div className="mb-8">
                      <p className="text-[11px] tracking-[0.25em] uppercase text-[#9B9690] mb-4 font-semibold">
                        Select Payment Method
                      </p>
                      <div className="space-y-3">
                        {paymentMethods.map((m) => {
                          const active = formData.paymentMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, paymentMethod: m.id }))}
                              className={`relative w-full px-6 py-5 rounded-2xl border-2 text-left transition-all duration-300 group overflow-hidden ${active
                                ? "border-[#1B3A8C] bg-linear-to-r from-[#EEF2FB] to-[#C5D2EC]/20 shadow-md shadow-[#1B3A8C]/10"
                                : "border-[#E0DBD4] bg-white hover:border-[#1B3A8C] hover:shadow-sm"
                                }`}
                            >
                              {active && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1B3A8C]" />
                              )}
                              <div className="relative">
                                <p className={`font-semibold text-base transition-colors ${active ? "text-[#1B3A8C]" : "text-[#1A1814] group-hover:text-[#1B3A8C]"}`}>
                                  {m.name}
                                </p>
                                <p className="text-xs text-[#9B9690] mt-1">{m.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* File upload */}
                    <div className="mb-8">
                      <p className="text-[11px] tracking-[0.25em] uppercase text-[#9B9690] mb-4 font-semibold flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Payment Proof *
                      </p>
                      <label
                        htmlFor="payment-proof"
                        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${formData.paymentProof
                          ? "border-[#2E7D4F] bg-linear-to-br from-[#F0FAF3] to-[#E8F5EC] shadow-md shadow-[#2E7D4F]/10"
                          : "border-[#DDD9D2] bg-[#F7F4EF] hover:border-[#1B3A8C] hover:bg-white hover:shadow-md"
                          }`}
                      >
                        {formData.paymentProof ? (
                          <div className="flex items-center gap-3 text-[#2E7D4F]">
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="text-sm font-medium">{formData.paymentProof.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-[#B0AB9F] mb-3 group-hover:text-[#1B3A8C] transition-colors" />
                            <p className="text-sm text-[#6B6760] group-hover:text-[#1A1814] transition-colors">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-[#B0AB9F] mt-2 group-hover:text-[#9B9690] transition-colors">
                              PNG, JPG, PDF up to 10MB
                            </p>
                          </>
                        )}
                        <input
                          id="payment-proof"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFile}
                          className="hidden"
                          required
                        />
                      </label>
                    </div>

                    {/* Note */}
                    <div className="bg-linear-to-r from-[#FEF9EC] to-[#FDF6E3] border border-[#F5E0A0] rounded-2xl px-6 py-5 text-sm text-[#7A6020] shadow-sm">
                      <strong className="font-semibold">Note:</strong>{" "}
                      Your reservation will be confirmed within 24 hours after payment verification.
                    </div>

                    <NavRow
                      onBack={() => setStep(3)}
                      nextLabel="Complete Reservation"
                      nextDisabled={!formData.paymentMethod || !formData.paymentProof}
                      isSubmit
                      isSubmitting={isSubmitting}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </div>

          {/* Right: summary panel */}
          <BookingSummary data={formData} planLabel={planLabel} price={price} />
        </div>
      </section>
    </div>
  );
}