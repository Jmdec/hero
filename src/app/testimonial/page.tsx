"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Quote, X, Send, ArrowRight, Loader2 } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  title: string
  company: string
  rating: number
  quote: string
  status: "pending" | "approved" | "rejected"
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

interface FormData {
  name: string
  title: string
  company: string
  email: string
  rating: number
  quote: string
}

const empty: FormData = {
  name: "",
  title: "",
  company: "",
  email: "",
  rating: 5,
  quote: "",
}

export default function TestimonialPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormData>(empty)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (field: keyof FormData, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }))

  useEffect(() => {
    let cancelled = false

    async function loadTestimonials() {
      setLoading(true)
      setLoadError(null)

      try {
        const res = await fetch("/api/testimonials", { cache: "no-store" })

        if (!res.ok) throw new Error(`Status ${res.status}`)

        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.data ?? [])

        if (!cancelled) setTestimonials(list)
      } catch (err) {
        console.error("Testimonials fetch failed:", err)
        if (!cancelled) {
          setLoadError("Could not load testimonials right now.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTestimonials()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          company: form.company,
          rating: form.rating,
          quote: form.quote,
          email: form.email,
        }),
      })

      if (!res.ok) {
        if (res.status === 422) {
          const data = await res.json()
          const firstError = Object.values(data.errors ?? {})[0]
          throw new Error(
            Array.isArray(firstError)
              ? (firstError[0] as string)
              : "Please check your details and try again.",
          )
        }
        throw new Error(`Status ${res.status}`)
      }

      setSubmitted(true)
    } catch (err) {
      console.error("Testimonial submit failed:", err)
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setModalOpen(false)
    setTimeout(() => {
      setForm(empty)
      setSubmitted(false)
      setSubmitError(null)
    }, 300)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="Client's Stories"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A8C]/90 to-[#1B3A8C]/60" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Trusted by Growing Companies in Makati
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From international expansions to homegrown startups, our members
              choose Hero Serviced Office for the address, the service, and the
              community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 bg-[#F5F5F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <p className="text-center text-sm text-gray-400">
              Loading testimonials...
            </p>
          )}

          {!loading && loadError && (
            <p className="text-center text-sm text-red-500">{loadError}</p>
          )}

          {!loading && !loadError && testimonials.length === 0 && (
            <p className="text-center text-sm text-gray-400">
              No testimonials yet. Be the first to share your experience.
            </p>
          )}

          {!loading && !loadError && testimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col"
                >
                  {/* Stars + quote icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="h-5 w-5 fill-[#1B3A8C] text-[#1B3A8C]"
                        />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-gray-100 fill-gray-100" />
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-[#1B3A8C] flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-white">
                          {getInitials(t.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {t.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t.title}
                          {t.company ? ` · ${t.company}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0D47A1] to-[#00ACC1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Love working at Hero?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Share your experience and help other businesses discover the right
            workspace in Makati.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Tell us your experience
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/quotation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Book a tour
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-4 shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Share your experience
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      We'd love to hear from you
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-7 pb-2 flex-1">
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      /* Success state */
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-10 text-center"
                      >
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border border-green-100">
                          <Star className="h-7 w-7 fill-green-500 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Thank you, {form.name.split(" ")[0]}!
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                          Your testimonial has been submitted and will be
                          reviewed by our team before it goes live.
                        </p>
                      </motion.div>
                    ) : (
                      /* Form */
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        className="space-y-4 py-2"
                      >
                        {submitError && (
                          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                            {submitError}
                          </p>
                        )}

                        {/* Rating */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Overall rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onMouseEnter={() => setHoveredStar(s)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => set("rating", s)}
                              >
                                <Star
                                  className={`h-7 w-7 transition-colors ${
                                    s <= (hoveredStar || form.rating)
                                      ? "fill-[#1B3A8C] text-[#1B3A8C]"
                                      : "fill-gray-100 text-gray-200"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Full name <span className="text-red-400">*</span>
                          </label>
                          <input
                            required
                            type="text"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Maria Santos"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Job title + Company */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                              Job title <span className="text-red-400">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              value={form.title}
                              onChange={(e) => set("title", e.target.value)}
                              placeholder="e.g. CEO"
                              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                              Company <span className="text-red-400">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              value={form.company}
                              onChange={(e) => set("company", e.target.value)}
                              placeholder="e.g. Bayanihan Digital"
                              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Email address{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="you@company.com"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                          />
                        </div>

                        {/* quote */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Your testimonial{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={form.quote}
                            onChange={(e) => set("quote", e.target.value)}
                            placeholder="Tell us about your experience working at Hero Serviced Office…"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all resize-none"
                          />
                        </div>

                        <p className="text-[11px] text-gray-400 pb-1">
                          Your testimonial may be published on our website after
                          review. We'll never share your email address.
                        </p>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1B3A8C] py-3 text-sm font-medium text-white hover:bg-[#2a4fa8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting…
                            </>
                          ) : (
                            <>
                              Submit testimonial
                              <Send className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {submitted && (
                  <div className="px-7 py-5 border-t border-gray-100 shrink-0">
                    <button
                      onClick={handleClose}
                      className="w-full rounded-xl bg-[#1B3A8C] py-2.5 text-sm font-medium text-white hover:bg-[#2a4fa8] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
