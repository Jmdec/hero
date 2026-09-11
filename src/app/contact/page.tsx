"use client";

import { useState, useEffect } from "react";
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
  X,
} from "lucide-react";

const inputCls =
  "w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent bg-white transition-shadow";

const selectCls =
  "w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent bg-white transition-shadow appearance-none cursor-pointer";

const PH_PHONE_REGEX = /^(\+63|0)9\d{9}$/;

function validatePhone(value: string) {
  const digitsOnly = value.replace(/[\s-]/g, "");
  if (!digitsOnly) return "Phone number is required.";
  if (!PH_PHONE_REGEX.test(digitsOnly)) {
    return "Enter a valid PH mobile number, e.g. +63 917 123 4567 or 0917 123 4567.";
  }
  return null;
}

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

function StepProgress({ step, isJapanese }: { step: 1 | 2; isJapanese: boolean }) {
  const steps = [
    { n: 1, label: isJapanese ? "ご入力" : "Your Details" },
    { n: 2, label: isJapanese ? "要件" : "Requirements" },
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

const SERVICES_WITH_FIELDS = [
  "private-office",
  "virtual-office",
  "co-working-space",
  "meeting-room",
  "event-space",
  "ocular-visit",
];

const BRANCH_OPTIONS = [
  { value: "", label: "Select Branch",  },
  { value: "tower-6789", label: "Tower 6789" },
  { value: "insular-life", label: "Insular Life Building" },
  { value: "both", label: "Both Branches" },
];

function branchLabel(value: string, isJapanese: boolean) {
  if (value === "") return isJapanese ? "支店を選択" : "Select Branch";
  if (value === "tower-6789") return isJapanese ? "タワー6789" : "Tower 6789";
  if (value === "insular-life") return isJapanese ? "インシュラー・ライフ・ビル" : "Insular Life Building";
  return isJapanese ? "両支店" : "Both Branches";
}

function inquiryTypeLabel(value: string, isJapanese: boolean) {
  const labels: Record<string, string> = {
    "": isJapanese ? "お問い合わせ種別を選択" : "Select Inquiry Type",
    "private-office": isJapanese ? "個室オフィス" : "Private Office",
    "virtual-office": isJapanese ? "バーチャルオフィス" : "Virtual Office",
    "co-working-space": isJapanese ? "コワーキングスペース" : "Co-Working Space",
    "meeting-room": isJapanese ? "会議室" : "Meeting Room",
    "event-space": isJapanese ? "イベントスペース" : "Event Space",
    "ocular-visit": isJapanese ? "現地見学" : "Ocular Visit",
    partnership: isJapanese ? "提携" : "Partnership",
    others: isJapanese ? "その他" : "Others",
  };
  return labels[value] ?? value;
}

function DynamicFields({
  inquiryType,
  dynamicData,
  onChange,
  isJapanese,
}: {
  inquiryType: string;
  dynamicData: Record<string, string>;
  onChange: (name: string, value: string) => void;
  isJapanese: boolean;
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
            isJapanese ? "席数" : "Number of Seats",
            input("seats", "number", isJapanese ? "例：50" : "e.g. 50"),
          )}
          {field(
            "moveInDate",
            isJapanese ? "入居希望日" : "Target Move-in Date",
            input("moveInDate", "date"),
          )}
          {field(
            "leaseTerm",
            isJapanese ? "契約期間" : "Lease Term",
            select("leaseTerm", [
              { value: "1-month", label: isJapanese ? "1か月" : "1 month" },
              { value: "3-months", label: isJapanese ? "3か月" : "3 months" },
              { value: "6-months", label: isJapanese ? "6か月" : "6 months" },
              { value: "12-months", label: isJapanese ? "12か月" : "12 months" },
              { value: "12-months-plus", label: isJapanese ? "12か月以上" : "12+ months" },
            ]),
          )}
        </div>
      );

    case "virtual-office":
      return (
        <div className="space-y-6">
          {field(
            "package",
            isJapanese ? "プラン" : "Package",
            select("package", [
              { value: "basic", label: "Basic" },
              { value: "standard", label: "Standard" },
              { value: "premium", label: "Premium" },
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
            isJapanese ? "席数" : "Number of Seats",
            input("seats", "number", isJapanese ? "例：50" : "e.g. 50"),
          )}
          {field(
            "startDate",
            isJapanese ? "開始希望日" : "Preferred Start Date",
            input("startDate", "date"),
          )}
          {field(
            "durationType",
            isJapanese ? "利用期間" : "Duration",
            select("durationType", [
              { value: "daily", label: isJapanese ? "日単位" : "Daily" },
              { value: "weekly", label: isJapanese ? "週単位" : "Weekly" },
              { value: "monthly", label: isJapanese ? "月単位" : "Monthly" },
            ]),
          )}
        </div>
      );

    case "meeting-room":
      return (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1B3A8C]/15 bg-[#1B3A8C]/5 px-4 py-3 text-sm text-[#1B3A8C]">
            {isJapanese ? "空き状況を確認します。" : "We&apos;ll check the availability."}
          </div>
          {field(
            "participants",
            isJapanese ? "参加人数" : "Number of Participants",
            input("participants", "number", isJapanese ? "例：50" : "e.g. 50"),
          )}
          {field(
            "reservationDate",
            isJapanese ? "予約日" : "Reservation Date",
            input("reservationDate", "date"),
          )}
        </div>
      );

    case "event-space":
      return (
        <div className="space-y-6">
          {field(
            "attendees",
            isJapanese ? "参加人数" : "Number of Attendees",
            input("attendees", "number", isJapanese ? "例：50" : "e.g. 50"),
          )}
          {field(isJapanese ? "イベント日" : "Event Date", isJapanese ? "イベント日" : "Event Date", input("eventDate", "date"))}
          {field(
            "eventDuration",
            isJapanese ? "イベント時間" : "Event Duration",
            select("eventDuration", [
              { value: "half-day", label: isJapanese ? "半日（4時間まで）" : "Half day (up to 4 hrs)" },
              { value: "full-day", label: isJapanese ? "1日（8時間まで）" : "Full day (up to 8 hrs)" },
              { value: "multi-day", label: isJapanese ? "複数日" : "Multi-day" },
            ]),
          )}
        </div>
      );

    case "ocular-visit":
      return (
        <div className="space-y-6">
          {field(
            "visitDate",
            isJapanese ? "見学希望日" : "Preferred Visit Date",
            input("visitDate", "date"),
          )}
          {field(
            "serviceOfInterest",
            isJapanese ? "興味のあるサービス" : "Service of Interest",
            select("serviceOfInterest", [
              { value: "private-office", label: isJapanese ? "個室オフィス" : "Private Office" },
              { value: "virtual-office", label: isJapanese ? "バーチャルオフィス" : "Virtual Office" },
              { value: "co-working-space", label: isJapanese ? "コワーキングスペース" : "Co-Working Space" },
              { value: "meeting-room", label: isJapanese ? "会議室" : "Meeting Room" },
              { value: "event-space", label: isJapanese ? "イベントスペース" : "Event Space" },
            ]),
          )}
        </div>
      );

    default:
      return null;
  }
}

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

function Modal({
  open,
  onClose,
  title,
  hideClose = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  hideClose?: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071735]/65 backdrop-blur-[2px] px-4 py-5 sm:px-6 sm:mt-7 md:mt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative
              w-full
              max-w-[500px]
              max-h-[500px]
              lg:max-w-[580px]
              lg:max-h-[calc(100vh-40px)]
              overflow-y-auto
              rounded-[28px]
              bg-white
              shadow-[0_25px_80px_rgba(7,23,53,0.25)]
              scrollbar-thin
            "
            onClick={(e) => e.stopPropagation()}
          >
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/20 sm:right-5 sm:top-5"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MultiStepForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = back
  const [locale, setLocale] = useState<'en' | 'ja'>('en');
  const isJapanese = locale === 'ja';
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    branchInterest: "",
    inquiryType: "",
    message: "",
    policy: false,
  });
  const [dynamicData, setDynamicData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "error">("idle");
  const [modal, setModal] = useState<"idle" | "success">("idle");
  const [lastSubmittedWasVO, setLastSubmittedWasVO] = useState(false);

  const hasDynamicFields = SERVICES_WITH_FIELDS.includes(formData.inquiryType);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (name === "inquiryType") setDynamicData({});
    if (name === "phone" && phoneTouched) {
      setPhoneError(validatePhone(value));
    }
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    setPhoneError(validatePhone(formData.phone));
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

  const handleSuccessClose = () => {
    setModal("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneValidationError = validatePhone(formData.phone);
    if (phoneValidationError) {
      setPhoneTouched(true);
      setPhoneError(phoneValidationError);
      return;
    }

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

      setLastSubmittedWasVO(formData.inquiryType === "virtual-office");
      setModal("success");
      setPhoneTouched(false);
      setPhoneError(null);

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        branchInterest: "",
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
        {isJapanese ? "メッセージを送る" : "Send Us a Message"}
      </h2>
      <p className="text-gray-600 mb-6">
        {isJapanese
          ? "下記のフォームにご記入ください。担当者よりできるだけ早くご連絡いたします。"
          : "Fill out the form below, and our team will get back to you as soon as possible."}
      </p>

      <StepProgress step={step} isJapanese={isJapanese} />

      {/* Success modal, shown after a successful submit */}
      <Modal
        open={modal === "success"}
        onClose={handleSuccessClose}
        title={isJapanese ? "送信完了" : "Request Submitted"}
      >
        <SuccessModalContent
          isVO={lastSubmittedWasVO}
          isJapanese={isJapanese}
          onClose={handleSuccessClose}
        />
      </Modal>

      {/* Error banner */}
      <AnimatePresence>
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
                {isJapanese
                  ? "送信に失敗しました。再度お試しいただくか、直接お問い合わせください。"
                  : "Failed to send. Please try again or contact us directly."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding step panels */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.form
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onSubmit={hasDynamicFields ? (e) => e.preventDefault() : handleSubmit}
            >
              {/* ── Step 1: Contact info + inquiry type ── */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" required>
                      {isJapanese ? "名前" : "Full Name"}
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
                    <Label htmlFor="phone" required>
                      {isJapanese ? "電話番号" : "Phone Number"}
                    </Label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handlePhoneBlur}
                      required
                      aria-invalid={Boolean(phoneError)}
                      aria-describedby={phoneError ? "phone-error" : undefined}
                      className={`${inputCls} ${phoneError ? "border-red-400 focus:ring-red-400" : ""}`}
                      placeholder="+63 XXX XXX XXXX"
                    />
                    {phoneError && (
                      <p id="phone-error" className="mt-1.5 text-xs text-red-600">
                        {phoneError}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" required>
                    {isJapanese ? "メールアドレス" : "Email"}
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

                <div>
                  <Label htmlFor="company">{isJapanese ? "会社" : "Company"}</Label>
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

                <div>
                  <Label htmlFor="branchInterest" required>
                    {isJapanese ? "関心のある支店" : "Branch Interested In"}
                  </Label>
                  <SelectWrapper>
                    <select
                      id="branchInterest"
                      name="branchInterest"
                      value={formData.branchInterest}
                      onChange={handleChange}
                      required
                      className={selectCls}
                    >
                      {BRANCH_OPTIONS.map((branch) => (
                        <option key={branch.value} value={branch.value}>
                          {branchLabel(branch.value, isJapanese)}
                        </option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>

                <div>
                  <Label htmlFor="inquiryType" required>
                    {isJapanese ? "お問い合わせ種別" : "Inquiry Type"}
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
                          {inquiryTypeLabel(t.value, isJapanese)}
                        </option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>

                {/* Message (shown in step 1 if no dynamic fields needed —
                    i.e. Partnership / Others, which skip Step 2 entirely) */}
                {!hasDynamicFields && formData.inquiryType && (
                  <div>
                    <Label htmlFor="message" required>
                      {isJapanese ? "メッセージ" : "Message"}
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={200}
                      rows={5}
                      className={`${inputCls} resize-none`}
                      placeholder="Tell us about your requirements..."
                    />
                    <p className="mt-2 text-xs text-gray-500 text-right">{formData.message.length}/200</p>
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
                        Boolean(validatePhone(formData.phone)) ||
                        !formData.branchInterest ||
                        !formData.inquiryType
                      }
                      className="w-full md:w-auto px-8 py-4 bg-[#FFC107] text-[#1B3A8C] rounded-full font-semibold hover:bg-[#FFC107]/80 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isJapanese ? `${selectedLabel} の詳細へ` : `Next: ${selectedLabel} Details`}
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
                        Boolean(validatePhone(formData.phone)) ||
                        !formData.branchInterest ||
                        !formData.inquiryType ||
                        !formData.message
                      }
                      className="w-full md:w-auto px-8 py-4 bg-[#FFC107] text-[#1B3A8C] rounded-full font-semibold hover:bg-[#FFC107]/80 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          {isJapanese ? "送信中..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          {isJapanese ? "送信する" : "Send Message"}
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.form>
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
              {/* Step 2: Dynamic service fields + message */}
              <div className="space-y-6">
                {/* Summary chip */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1B3A8C]/8 rounded-full border border-[#1B3A8C]/20">
                  <span className="w-2 h-2 rounded-full bg-[#1B3A8C]" />
                  <span className="text-xs font-semibold text-[#1B3A8C] uppercase tracking-widest">
                    {isJapanese ? inquiryTypeLabel(formData.inquiryType, true) : selectedLabel}
                  </span>
                </div>

                <DynamicFields
                  inquiryType={formData.inquiryType}
                  dynamicData={dynamicData}
                  onChange={handleDynamicChange}
                  isJapanese={isJapanese}
                />

                <div>
                  <Label htmlFor="message" required>
                    {isJapanese ? "メッセージ" : "Message"}
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="Tell us about your requirements..."
                  />
                  <p className="mt-2 text-xs text-gray-500 text-right">{formData.message.length}/200</p>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-2 px-8 py-4 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {isJapanese ? "戻る" : "Back"}
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
    label: "About Hero Serviced Office, Inc.",
    faqs: [
      {
        q: "What are the advantages of serviced offices?",
        a: "Hero Serviced Office, Inc. is equipped with the facilities and services necessary to start a business, so the initial cost of opening an office can be reduced and business can be started immediately. You can also flexibly choose the size of the room and the period of use according to your purpose.",
      },
      {
        q: "Where is the office located?",
        a: "Hero Serviced Office, Inc. is conveniently located near Ayala Triangle Park along Ayala Avenue, the main street in Makati City, Metro Manila, Philippines.",
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

const faqTabsJa = [
  {
    id: "service",
    label: "Hero Serviced Office, Inc.について",
    faqs: [
      {
        q: "サービスオフィスを利用するメリットは何ですか？",
        a: "Hero Serviced Office, Inc.は、事業開始に必要な設備とサービスを完備しているため、オフィス開設の初期費用を抑え、すぐに事業を開始できます。また、用途に合わせて部屋の広さや利用期間を柔軟に選択することも可能です。",
      },
      {
        q: "オフィスの場所はどこですか？",
        a: "Hero Serviced Office, Inc. は、フィリピン・マカティ市の中心部、Ayala Avenue沿いにあり、Ayala Triangle Parkの近くに位置しています。",
      },
      {
        q: "周辺環境はどのような感じですか？",
        a: "弊社のオフィスはフィリピンの経済中心地であるマカティ市にあります。多くの日本企業や外資系企業が近隣に拠点を構えており、空港から約20分でアクセスできます。さまざまな国の飲食店や大型ショッピングモールも近くにあります。",
      },
      {
        q: "日本語を話せるスタッフはいますか？",
        a: "はい。弊社には日本人駐在員や日本語を話せるスタッフが在籍しています。",
      },
      {
        q: "サービスオフィスを会社登記（SEC）の住所として使用できますか？",
        a: "はい、可能です。法人登記（SEC 登記）のための住所登録が必要な場合は、お知らせください。必要な書類をご案内いたします。",
      },
      {
        q: "契約期間はどのくらいですか？",
        a: "契約期間は1か月から開始可能です。契約書式はサービス利用契約になります。",
      },
      {
        q: "喫煙ポリシーはどうなっていますか？",
        a: "すべてのオフィスビル内では喫煙は禁止です。",
      },
    ],
  },
  {
    id: "payment",
    label: "契約・支払い",
    faqs: [
      {
        q: "サービスオフィス契約に必要な書類は何ですか？",
        a: "契約前に審査が必要です。法人契約の場合は、審査申請書、SEC 登記証明書（または設立前の日本会社登記証明書）、代表者のパスポートの写しが必要です。個人契約の場合は、審査申請書、事業内容、利用者全員の身分証明書の写しが必要です。",
      },
      {
        q: "支払いに使う通貨は何ですか？",
        a: "支払いはフィリピン・ペソ（PHP）です。日本円や米ドルでもお支払いいただけます。",
      },
      {
        q: "毎月の支払いはどうすればいいですか？",
        a: "毎月、請求書をお送りします。現金、チェック、銀行振込のいずれでもご利用いただけます。",
      },
      {
        q: "退去時に契約料は返金されますか？",
        a: "いいえ。契約料にはオフィスの基本セットアップ費用が含まれており、返金はできません。",
      },
      {
        q: "電気代やインターネット使用料は別料金ですか？",
        a: "いいえ。月額利用料（賃料および共通サービス料）には、電気代とインターネット使用料（共用回線）が含まれています。追加料金は発生しません。",
      },
    ],
  },
  {
    id: "rooms",
    label: "個室",
    faqs: [
      {
        q: "どのような個室がありますか？",
        a: "TOWER6789 MAKATI では1名から最大12名までの部屋をご用意しています。INSULAR LIFE BUILDING MAKATI では3名から最大35名までの部屋をご用意しています。各フロアレイアウトは詳細をご確認ください。",
      },
      {
        q: "個室にはどのような設備がありますか？",
        a: "すべての個室には、デスク、キャビネット、および有線・無線のインターネット接続が備わっています。",
      },
      {
        q: "個室以外のスペースはありますか？",
        a: "はい。個人利用向けのブース型デスクを備えた共有オフィスがあります。共有スペースには、受付スペース、カフェスペース、ラウンジ、会議スペースがあります。",
      },
      {
        q: "個室契約にはどのようなサービスが含まれますか？",
        a: "個室利用者は、受付サービス、カフェスペース、ラウンジ、無線・有線インターネットを追加料金なしでご利用いただけます。オプションとして、電話回線、電話応対サービス、駐車場、クラウドサービス、多機能機の利用があります。",
      },
    ],
  },
  {
    id: "facilities",
    label: "サービス・施設",
    faqs: [
      {
        q: "専用の電話番号を取得できますか？",
        a: "はい。専用の固定電話はオプションサービスとしてご利用いただけます（VAT別 PHP 2,400/月）。通話料は実費で請求されます。",
      },
      {
        q: "スタッフが私の代わりに電話に出られますか？",
        a: "はい。電話応対サービスは VAT 別 PHP 2,000/月でご利用いただけます。電話番号取得費用は別途発生します。",
      },
      {
        q: "オフィスは24時間利用できますか？",
        a: "はい。24時間365日いつでも出入り可能です。ただし、スタッフや受付はフィリピンの営業時間である平日（月〜金）に対応しており、土日、フィリピンの祝日、年末年始は休業します。",
      },
      {
        q: "会議スペースは利用できますか？",
        a: "はい。会議スペースは時間単位でご利用いただけます。",
      },
      {
        q: "無料のお飲み物がある休憩スペースはありますか？",
        a: "はい。共有カフェやラウンジには、コーヒーやミネラルウォーターが無料で提供されています。自動販売機もあります。",
      },
      {
        q: "駐車場はありますか？",
        a: "はい。車両制限や空き状況により利用条件が異なるため、事前にご連絡ください。",
      },
      {
        q: "プリンターやスキャナーは使えますか？",
        a: "はい。コピー、スキャン、印刷に対応した複合機をご利用いただけます。",
      },
      {
        q: "バーチャルオフィス利用者に郵便物を転送できますか？",
        a: "はい。サービスオフィス宛てに届いた郵便物は、事前に指定した住所へ転送できます。固定月額料金と実際の郵送料が別途かかります。",
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
  const [locale, setLocale] = useState<"en" | "ja">("en");
  const isJapanese = locale === "ja";
  const tabs = isJapanese ? faqTabsJa : faqTabs;

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

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {tabs.map((tab) => (
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
        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          View on Google Maps
        </span>

        <div className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-[#0A1E3F] backdrop-blur-sm border border-white/60 shadow-sm pointer-events-none">
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
      </div>
    </div >
  );
}

function SuccessModalContent({
  isVO,
  isJapanese,
  onClose,
}: {
  isVO: boolean;
  isJapanese: boolean;
  onClose: () => void;
}) {
  const steps = isVO
    ? [
      "Our admin team will review and verify your submitted request",
      "Once verified, we'll email you a secure link to complete payment",
      "After payment is confirmed, our admin will contact you to finalize your contract",
    ]
    : [
      "We'll review your service requirements and preferences",
      "A customised quotation will be prepared for you",
      "Our team will reach out via email or phone to discuss next steps",
    ];
    const stepsJA = isVO
    ? [
      "管理チームが送信されたリクエストを確認・検証します",
      "検証が完了次第、支払いを完了するための安全なリンクをメールでお送りします",
      "支払いが確認され次第、管理チームが契約を完了するためにご連絡いたします",
    ]
    : [
      "サービスの要件とご希望を確認します",
      "お客様に合わせた見積書を作成します",
      "次のステップについて、メールまたは電話でご連絡いたします",
    ];

  return (
    <div className="px-5 py-7 sm:px-8 md:px-10 md:py-5">
      {/* Success icon */}
      <div className="hidden md:flex justify-center">
        <div className="flex h-[30px] w-[30px] lg:h-[68px] lg:w-[68px] items-center justify-center rounded-full bg-[#EEF2FB] ring-8 ring-[#F7F9FD]">
          <CheckCircle2 className="h-4 w-4 lg:h-8 lg:w-8 text-[#1B3A8C]" strokeWidth={2.2} />
        </div>
      </div>

      {/* Heading */}
      <div className="mt-5 text-center">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#64748B]">
          {isJapanese ? "お問い合わせを受け取りました" : "Inquiry Received"}
        </p>

        <h3 className="lg:text-[26px] font-bold leading-tight text-[#0B1F4A] text-[28px]">
          {isJapanese ? "ありがとうございます！" : "Thank You!"}
        </h3>

        <p className="mx-auto mt-2 max-w-sm lg:max-w-[470px] text-sm lg:text-[14px] text-[#64748B]">
          Your quotation request has been received. A Hero Serviced Office, Inc.
          representative will contact you within{" "}
          <strong className="font-semibold text-[#52637D]">
            24 business hours.
          </strong>
        </p>
      </div>

      {/* Next steps */}
      <div className="mt-4 rounded-[20px] bg-[#F4F6FB] px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-4">
          {(isJapanese ? stepsJA : steps).map((text, index) => (
            <div
              key={index}
              className="flex items-start gap-3.5"
            >
              <span
                className="flex h-4 w-4 lg:h-6 lg:w-6 shrink-0 items-center justify-center rounded-full bg-[#0B1F4A] text-xs md:text-sm font-bold text-white"
              >
                {index + 1}
              </span>

              <p className="pt-0.5 text-[13px] leading-5 text-[#4A5568] text-xs">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3 flex-row">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[50px] flex-1 items-center justify-center rounded-full bg-[#FFC107] px-6 py-3 text-xs lg:text-sm
            font-bold text-[#0B1F4A] transition-all hover:bg-[#FFB900] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40"
        >
          Submit another request
        </button>

        <a
          href="/"
          className="flex min-h-[50px] flex-1 items-center justify-center rounded-full bg-[#F0EDE6] px-6 py-3 text-xs lg:text-sm font-bold text-[#4A4740] transition-all hover:bg-[#E5E1D9]
            active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4A4740]/10"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}

export default function ContactPage() {
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

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/header.webp"
            alt="About Hero Serviced Office, Inc."
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#1B3A8C]/90 via-[#1B3A8C]/70 to-[#1B3A8C]/80" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-md">
              {isJapanese ? "お問い合わせ" : "Contact Us"}
            </h1>
            <p className="text-xl text-gray-300 font-semibold text-shadow-sm">
              {isJapanese
                ? "ご相談・ご予約・サポートのご依頼はこちらからお問い合わせください。"
                : "Reach out to us for inquiries, reservations, or support."}
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
                    {isJapanese ? "オフィス所在地" : "Office Location"}
                  </p>
                  <h4 className="font-semibold text-gray-900">
                    Hero Serviced Office, Inc.
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isJapanese ? "フィリピン、マカティ市、アヤラ通り" : "Ayala Avenue, Makati City, Philippines"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isJapanese ? "よくある質問" : "Frequently Asked Questions"}
            </h2>
          </div>
          <FaqTabs />
        </div>
      </section>
    </div>
  );
}