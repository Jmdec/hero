"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MapPin,
  Send,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  Check,
} from "lucide-react";

const inputCls =
  "w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent bg-white transition-shadow";

const selectCls =
  "w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent bg-white transition-shadow appearance-none cursor-pointer";

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {children} {required && <span className="text-[#1B3A8C]">*</span>}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}

// Step progress indicator

function StepProgress({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Your Details" },
    { n: 2, label: "Requirements" },
  ];
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {steps.map((s, i) => {
        const isDone = step > s.n;
        const isActive = step === s.n;
        return (
          <div key={s.n} className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${isDone
                    ? "bg-[#1B3A8C] text-white"
                    : isActive
                      ? "bg-[#1B3A8C] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.n}
              </span>
              <span
                className={`text-sm font-medium hidden sm:block ${isActive ? "text-gray-900" : "text-gray-400"
                  }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`w-8 h-px transition-colors ${step > s.n ? "bg-[#1B3A8C]" : "bg-gray-200"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Dynamic Fields (Step 2)

const SERVICES_WITH_FIELDS = [
  "private-office",
  "virtual-office",
  "co-working-space",
  "meeting-room",
  "event-space",
  "ocular-visit",
];

function DynamicFields({
  inquiryType,
  dynamicData,
  onChange,
}: {
  inquiryType: string;
  dynamicData: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const input = (name: string, type: string, placeholder?: string) => (
    <input
      type={type}
      id={name}
      name={name}
      value={dynamicData[name] ?? ""}
      onChange={(e) => onChange(name, e.target.value)}
      required
      placeholder={placeholder}
      className={inputCls}
    />
  );

  const select = (
    name: string,
    options: { value: string; label: string }[],
  ) => (
    <SelectWrapper>
      <select
        id={name}
        name={name}
        value={dynamicData[name] ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        required
        className={selectCls}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </SelectWrapper>
  );

  const field = (name: string, label: string, element: React.ReactNode) => (
    <div key={name}>
      <Label htmlFor={name} required>
        {label}
      </Label>
      {element}
    </div>
  );

  switch (inquiryType) {
    case "private-office":
      return (
        <div className="space-y-6">
          {field(
            "seats",
            "Number of Seats",
            input("seats", "number", "e.g. 50"),
          )}
          {field(
            "moveInDate",
            "Target Move-in Date",
            input("moveInDate", "date"),
          )}
          {field(
            "leaseTerm",
            "Lease Term",
            select("leaseTerm", [
              { value: "1-month", label: "1 month" },
              { value: "3-months", label: "3 months" },
              { value: "6-months", label: "6 months" },
              { value: "12-months", label: "12 months" },
              { value: "12-months-plus", label: "12+ months" },
            ]),
          )}
        </div>
      );

    case "virtual-office":
      return (
        <div className="space-y-6">
          {field(
            "planType",
            "Plan Type",
            select("planType", [
              { value: "address-only", label: "Address Only" },
              { value: "address-reception", label: "Address + Reception" },
              {
                value: "address-reception-phone",
                label: "Address + Reception + Phone Answering",
              },
            ]),
          )}
          {field(
            "startDate",
            "Preferred Start Date",
            input("startDate", "date"),
          )}
        </div>
      );

    case "co-working-space":
      return (
        <div className="space-y-6">
          {field(
            "seats",
            "Number of Seats",
            input("seats", "number", "e.g. 50"),
          )}
          {field(
            "startDate",
            "Preferred Start Date",
            input("startDate", "date"),
          )}
          {field(
            "durationType",
            "Duration",
            select("durationType", [
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]),
          )}
        </div>
      );

    case "meeting-room":
      return (
        <div className="space-y-6">
          {field(
            "participants",
            "Number of Participants",
            input("participants", "number", "e.g. 50"),
          )}
          {field(
            "reservationDate",
            "Reservation Date",
            input("reservationDate", "date"),
          )}
        </div>
      );

    case "event-space":
      return (
        <div className="space-y-6">
          {field(
            "attendees",
            "Number of Attendees",
            input("attendees", "number", "e.g. 50"),
          )}
          {field("eventDate", "Event Date", input("eventDate", "date"))}
          {field(
            "eventDuration",
            "Event Duration",
            select("eventDuration", [
              { value: "half-day", label: "Half day (up to 4 hrs)" },
              { value: "full-day", label: "Full day (up to 8 hrs)" },
              { value: "multi-day", label: "Multi-day" },
            ]),
          )}
        </div>
      );

    case "ocular-visit":
      return (
        <div className="space-y-6">
          {field(
            "visitDate",
            "Preferred Visit Date",
            input("visitDate", "date"),
          )}
          {field(
            "serviceOfInterest",
            "Service of Interest",
            select("serviceOfInterest", [
              { value: "private-office", label: "Private Office" },
              { value: "virtual-office", label: "Virtual Office" },
              { value: "co-working-space", label: "Co-Working Space" },
              { value: "meeting-room", label: "Meeting Room" },
              { value: "event-space", label: "Event Space" },
            ]),
          )}
        </div>
      );

    default:
      return null;
  }
}

// Multi-Step Form

const inquiryTypes = [
  { value: "", label: "Select Inquiry Type" },
  { value: "private-office", label: "Private Office" },
  { value: "virtual-office", label: "Virtual Office" },
  { value: "co-working-space", label: "Co-Working Space" },
  { value: "meeting-room", label: "Meeting Room" },
  { value: "event-space", label: "Event Space" },
  { value: "ocular-visit", label: "Ocular Visit" },
  { value: "partnership", label: "Partnership" },
  { value: "others", label: "Others" },
];

function MultiStepForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = back

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    message: "",
    policy: false,
  });
  const [dynamicData, setDynamicData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const hasDynamicFields = SERVICES_WITH_FIELDS.includes(formData.inquiryType);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (name === "inquiryType") setDynamicData({});
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDynamicChange = (name: string, value: string) => {
    setDynamicData((prev) => ({ ...prev, [name]: value }));
  };

  const goNext = () => {
    setDirection(1);
    setStep(2);
  };

  const goBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dynamicData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      setSubmitStatus("success");

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        inquiryType: "",
        message: "",
        policy: false,
      });

      setDynamicData({});
      setStep(1);
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  const selectedLabel = inquiryTypes.find(
    (t) => t.value === formData.inquiryType,
  )?.label;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-6 sm:p-8 lg:p-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Send Us a Message
      </h2>
      <p className="text-gray-600 mb-6">
        Fill out the form below and we&apos;ll get back to you within 24 hours
      </p>

      <StepProgress step={step} />

      {/* Success / Error banners */}
      <AnimatePresence>
        {submitStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-900">
                Message sent successfully! We&apos;ll get back to you as soon as possible.
              </p>
              <p className="text-sm text-green-700">
                Thank you for reaching out to HERO Serviced Office.
              </p>
            </div>
          </motion.div>
        )}
        {submitStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-medium text-red-900">
                Failed to send. Please try again or contact us directly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding step panels */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* ── Step 1: Contact info + inquiry type ── */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" required>
                      Name
                    </Label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputCls}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" required>
                      Email
                    </Label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputCls}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" required>
                      Phone Number
                    </Label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={inputCls}
                      placeholder="+63 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="inquiryType" required>
                    Inquiry Type
                  </Label>
                  <SelectWrapper>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      required
                      className={selectCls}
                    >
                      {inquiryTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>

                {/* Message (shown in step 1 if no dynamic fields needed) */}
                {!hasDynamicFields && formData.inquiryType && (
                  <div>
                    <Label htmlFor="message" required>
                      Message
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className={`${inputCls} resize-none`}
                      placeholder="Tell us about your requirements..."
                    />
                  </div>
                )}

                {/* CTA */}
                <div>
                  {hasDynamicFields ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={
                        !formData.name ||
                        !formData.email ||
                        !formData.phone ||
                        !formData.inquiryType
                      }
                      className="w-full md:w-auto px-8 py-4 bg-[#FFC107] text-[#1B3A8C] rounded-full font-semibold hover:bg-[#FFC107]/80 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Next: {selectedLabel} Details
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !formData.name ||
                        !formData.email ||
                        !formData.phone ||
                        !formData.inquiryType ||
                        !formData.message
                      }
                      className="w-full md:w-auto px-8 py-4 bg-[#FFC107] text-[#1B3A8C] rounded-full font-semibold hover:bg-[#FFC107]/80 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onSubmit={handleSubmit}
            >
              {/* ── Step 2: Dynamic service fields + message ── */}
              <div className="space-y-6">
                {/* Summary chip */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1B3A8C]/8 rounded-full border border-[#1B3A8C]/20">
                  <span className="w-2 h-2 rounded-full bg-[#1B3A8C]" />
                  <span className="text-xs font-semibold text-[#1B3A8C] uppercase tracking-widest">
                    {selectedLabel}
                  </span>
                </div>

                <DynamicFields
                  inquiryType={formData.inquiryType}
                  dynamicData={dynamicData}
                  onChange={handleDynamicChange}
                />

                <div>
                  <Label htmlFor="message" required>
                    Message
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 md:flex-none px-8 py-4 bg-[#1B3A8C] text-white rounded-full font-semibold hover:bg-[#3B5EA6] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// FAQ Components

const faqTabs = [
  {
    id: "service",
    label: "About HERO Serviced Office",
    faqs: [
      {
        q: "What are the advantages of serviced offices?",
        a: "HERO Serviced Office is equipped with the facilities and services necessary to start a business, so the initial cost of opening an office can be reduced and business can be started immediately. You can also flexibly choose the size of the room and the period of use according to your purpose.",
      },
      {
        q: "Where is the office located?",
        a: "HERO Serviced Office is conveniently located near Ayala Triangle Park along Ayala Avenue, the main street in Makati City, Metro Manila, Philippines.",
      },
      {
        q: "What is the surrounding environment like?",
        a: "Our offices are located in Makati City — the economic center of the Philippines, often called the Wall Street of the Philippines. Many Japanese and foreign companies have offices nearby. Access from the airport takes about 20 minutes, and there are restaurants from various countries and large shopping malls in the area.",
      },
      {
        q: "Do you have Japanese-speaking staff?",
        a: "Yes. Japanese expatriates and staff who can speak Japanese are stationed at our offices.",
      },
      {
        q: "Can a serviced office be used as a business registration (SEC) address?",
        a: "Yes, it is possible. If you need address registration for corporate registration (SEC registration), please let us know and we will provide the necessary documents.",
      },
      {
        q: "What is the contract period?",
        a: "The contract period can start from 1 month. The contract form is a service use contract.",
      },
      {
        q: "What is the smoking policy?",
        a: "Smoking is prohibited in all office buildings.",
      },
    ],
  },
  {
    id: "payment",
    label: "Contract & Payment",
    faqs: [
      {
        q: "What documents are required for a service office contract?",
        a: "A review is required before signing. For corporate contracts: examination application form, SEC registration certificate (or Japan company registration for pre-establishment), and a copy of the representative's passport. For personal contracts: examination application form, business description, and photo ID of all users.",
      },
      {
        q: "What currency is used for payment?",
        a: "Payment is made in Philippine Pesos (PHP). You can also pay in Japanese Yen or US Dollars.",
      },
      {
        q: "How do I pay monthly?",
        a: "We send an invoice every month. You can pay by cash, check, or bank transfer — whichever is convenient for you.",
      },
      {
        q: "Will the contract fee be refunded when I move out?",
        a: "No. The contract fee includes the basic setup fee for the office and is non-refundable.",
      },
      {
        q: "Are electricity and internet usage charged separately?",
        a: "No. The monthly usage fee (rent and common service fee) includes electricity and internet usage (shared line). There are no additional charges for these.",
      },
    ],
  },
  {
    id: "rooms",
    label: "Private Rooms",
    faqs: [
      {
        q: "What types of private rooms are available?",
        a: "TOWER6789 MAKATI offers rooms for 1 to a maximum of 12 people. INSULAR LIFE BUILDING MAKATI offers rooms for 3 to a maximum of 35 people. Please see each floor layout for details.",
      },
      {
        q: "What facilities are in the private rooms?",
        a: "All private rooms are equipped with desks, cabinets, and wireless and wired internet access.",
      },
      {
        q: "Are there spaces other than private rooms?",
        a: "Yes. There is a shared office with booth-type desks for individual use. Shared spaces include a reception area, cafe area, lounge area, and meeting space.",
      },
      {
        q: "What services come with a private room contract?",
        a: "Private room tenants can use the reception service, cafe area, lounge area, and wireless/wired internet access at no extra charge. Optional services include telephone lines, telephone answering service, parking, cloud services, and multifunction device usage.",
      },
    ],
  },
  {
    id: "facilities",
    label: "Services & Facilities",
    faqs: [
      {
        q: "Can I get a dedicated phone number?",
        a: "Yes. A landline phone is available as an optional service for PHP 2,400/month (excl. VAT). Call charges are billed at actual cost.",
      },
      {
        q: "Can staff answer calls on my behalf?",
        a: "Yes. A telephone answering service is available for PHP 2,000/month (excl. VAT). The phone number acquisition fee is charged separately.",
      },
      {
        q: "Is the office available 24 hours a day?",
        a: "Yes. You can enter and leave the office anytime, 24 hours a day, 365 days a year. However, staff and receptionists are available Monday–Friday during Philippine business hours, and are closed on weekends, Philippine holidays, and year-end/New Year holidays.",
      },
      {
        q: "Can I use the meeting space?",
        a: "Yes. Meeting spaces are available in hourly increments for a fee.",
      },
      {
        q: "Is there a rest area with free drinks?",
        a: "Yes. Coffee and mineral water are available free of charge in the shared cafe and lounge areas. A paid vending machine is also available.",
      },
      {
        q: "Is parking available?",
        a: "Yes. Please contact us as there are vehicle restrictions and subject to availability.",
      },
      {
        q: "Can I use a printer or scanner?",
        a: "Yes. You can use a multifunction machine that supports copying, scanning, and printing.",
      },
      {
        q: "Can mail be forwarded for Virtual Office users?",
        a: "Yes. Mail arriving at the service office can be forwarded to a pre-designated address. A fixed monthly fee plus actual postage costs apply.",
      },
    ],
  },
];

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-colors ${open ? "border-[#1B3A8C]/30" : "border-gray-200"
        }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${open ? "bg-[#1B3A8C] text-white" : "bg-gray-100 text-[#1B3A8C]"
            }`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 py-4 text-md text-gray-600 bg-gray-50 border-t border-gray-200">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqTabs() {
  const [activeTab, setActiveTab] = useState("service");
  const active = faqTabs.find((t) => t.id === activeTab)!;
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {faqTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
              ? "bg-[#1B3A8C] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {active.faqs.map((faq, i) => (
            <FaqItem key={i} faq={faq} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Map card — one office location with its own independent loading state

function MapCard({
  title,
  src,
  titleAttr,
}: {
  title: string;
  src: string;
  titleAttr: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-300 shadow-lg group">
      <div className="relative h-60 overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gray-100 animate-pulse">
            <Loader2 className="w-5 h-5 text-[#1B3A8C] animate-spin" />
            <span className="text-xs font-medium text-gray-400">Loading map…</span>
          </div>
        )}
        <iframe
          src={src}
          title={titleAttr}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none flex items-center justify-center">
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View on Google Maps
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-[#0A1E3F] backdrop-blur-sm border border-white/60 shadow-sm">
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
      </div>
    </div>
  );
}

const contactChannels = [
  { icon: MapPin, label: "Visit us", value: "Ayala Avenue, Makati City" },
  { icon: Phone, label: "Call us", value: "+63 2 8888 0000" },
  { icon: Mail, label: "Email us", value: "hello@heroph.com" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
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
            className="w-full text-center mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300">
              Reach out to us for inquiries, reservations, or support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Multi-step form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <MultiStepForm />
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <MapCard
                title="Tower 6789"
                titleAttr="Tower 6789 map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7277203334647!2d121.01805607468263!3d14.557556885923752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f316aaaab%3A0xf80063632113a229!2sHERO%20PH!5e0!3m2!1sen!2sph!4v1782451174323!5m2!1sen!2sph"
              />
              <MapCard
                title="Insular Life Building"
                titleAttr="Insular Life Building map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7349367396077!2d121.01852111072995!3d14.55714458586539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f31651de5%3A0xf2d7d4161752e079!2sHero%20Serviced%20Office!5e0!3m2!1sen!2sph!4v1781155861898!5m2!1sen!2sph"
              />

              <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-[#1B3A8C]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#1B3A8C]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Office Location
                  </p>
                  <h4 className="font-semibold text-gray-900">HERO Serviced Office</h4>
                  <p className="text-sm text-gray-600">
                    Ayala Avenue, Makati City, Philippines
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick contact strip, anchored to the bottom edge of the hero
        <div className="pt-10">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">
            {contactChannels.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-3 bg-gray-200 backdrop-blur-md border border-gray-300 rounded-2xl px-5 py-4"
              >
                <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <c.icon className="w-4.5 h-4.5 text-black" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-black font-medium">
                    {c.label}
                  </p>
                  <p className="text-sm font-semibold text-black truncate">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqTabs />
        </div>
      </section>
    </div>
  );
}