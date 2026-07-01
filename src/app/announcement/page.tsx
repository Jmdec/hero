"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Calendar, X } from "lucide-react"

interface Announcement {
  id: number
  tag: string
  date: string
  title: string
  excerpt: string
  content: string
}

const TAG_STYLE = "bg-blue-50 text-blue-600"
const FALLBACK_TAG_STYLE = "bg-gray-100 text-gray-600"

function tagClass(tag: string) {
  return tag ? TAG_STYLE : FALLBACK_TAG_STYLE
}

function formatDate(value: string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

async function getAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("/api/announcements", { cache: "no-store" })

  if (!res.ok) {
    throw new Error(`Status ${res.status}`)
  }

  const data = await res.json()

  // index() returns a plain array, not a paginated { data: [...] } shape
  return Array.isArray(data) ? data : (data.data ?? [])
}

function TagDateRow({ tag, date }: { tag: string; date: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${tagClass(tag)}`}>
        {tag}
      </span>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(date)}
      </div>
    </div>
  )
}

function AnnouncementCard({
  item,
  index,
  onSelect,
}: {
  item: Announcement
  index: number
  onSelect: (item: Announcement) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <TagDateRow tag={item.tag} date={item.date} />
      </div>

      <h2 className="text-[17px] font-bold text-gray-900 leading-snug mb-3">
        {item.title}
      </h2>

      <p className="text-sm text-gray-500 leading-relaxed flex-1">
        {item.excerpt}
      </p>

      <div className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-[#1B3A8C] transition-colors">
        Read more
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.div>
  )
}

function AnnouncementModal({
  item,
  onClose,
}: {
  item: Announcement
  onClose: () => void
}) {
  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />

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
          className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl pointer-events-auto flex flex-col max-h-[85vh]"
        >
          <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-4 shrink-0">
            <TagDateRow tag={item.tag} date={item.date} />
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-7 pb-8">
            <h2 className="text-xl font-bold text-gray-900 leading-snug mb-4">
              {item.title}
            </h2>
            <div className="space-y-4">
              {item.content.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function AnnouncementPage() {
  const [selected, setSelected] = useState<Announcement | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await getAnnouncements()
        if (!cancelled) setAnnouncements(data)
      } catch (err) {
        console.error("Announcement fetch failed:", err)
        if (!cancelled) {
          setError("Could not load announcements. Please try again later.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="Newsletter"
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
              News, Updates & Exclusive Offers
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get the latest from Hero Serviced Office — new locations, events,
              member benefits, and special promotions delivered straight to your
              inbox.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Announcements Grid */}
      <section className="py-20 bg-[#F5F5F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <p className="text-center text-sm text-gray-400">
              Loading announcements...
            </p>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && announcements.length === 0 && (
            <p className="text-center text-sm text-gray-400">
              No announcements yet. Check back soon.
            </p>
          )}

          {!loading && !error && announcements.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((item, i) => (
                <AnnouncementCard
                  key={item.id}
                  item={item}
                  index={i}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* CTA */}
      <section className="py-20 bg-linear-to-r from-[#0D47A1] to-[#00ACC1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className="inline-flex items-center gap-2 text-blue-200 uppercase tracking-wider text-sm font-semibold">
                ✉ Newsletter
              </span>

              <h2 className="mt-4 text-2xl lg:text-5xl font-bold text-white leading-tight">
                Subscribe to the Hero monthly
              </h2>

              <p className="mt-5 text-md text-blue-100 leading-relaxed max-w-xl">
                One curated email per month with new spaces, member perks,
                exclusive promos, and Makati business insights.
                No spam — unsubscribe anytime.
              </p>

              <div className="mt-5 space-y-2">

                {[
                  "Early access to promotional rates",
                  "Invitations to member-only events",
                  "Tips for setting up your business in the Philippines",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-blue-100"
                  >
                    <div className="w-6 h-6 rounded-full border border-blue-300 flex items-center justify-center">
                      ✓
                    </div>

                    <span>{item}</span>
                  </div>
                ))}

              </div>

            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email address
                  </label>

                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full rounded-xl bg-white px-5 py-4 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-white/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-white py-4 font-semibold text-[#0D47A1] hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-md text-blue-100 leading-relaxed">
                  By subscribing you agree to receive marketing emails from
                  Hero Serviced Office.
                </p>

              </form>

            </div>

          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <AnnouncementModal item={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}