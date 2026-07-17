"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Inbox,
  Newspaper,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface SocialMediaEntry {
  platform: string;
  link: string | null;
}

interface Announcement {
  id: number;
  tag: string;
  date: string;
  image?: string | null;
  title: string;
  excerpt: string;
  content: string;
  social_platforms?: string[] | null;
  social_links?: Array<string | null> | null;
}

const PAGE_SIZE = 6;

const TAG_STYLE = "bg-blue-50 text-blue-600";
const FALLBACK_TAG_STYLE = "bg-gray-100 text-gray-600";

const SOCIAL_MEDIA_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

function tagClass(tag: string) {
  return tag ? TAG_STYLE : FALLBACK_TAG_STYLE;
}

function getAnnouncementImageUrl(image?: string | null) {
  if (!image) return null;

  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.LARAVEL_API_URL ||
    "http://localhost:8000";
  const normalized = configured.replace(/\/+$/g, "");
  const base = normalized.endsWith("/api")
    ? normalized.replace(/\/api$/, "")
    : normalized;

  return `${base}/storage/${image.replace(/^\/+/, "")}`;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeSocialMedia(
  platforms?: string[] | null,
  links?: Array<string | null> | null,
): SocialMediaEntry[] {
  const normalizedPlatforms = Array.isArray(platforms) ? platforms : [];
  const normalizedLinks = Array.isArray(links) ? links : [];

  const count = Math.max(normalizedPlatforms.length, normalizedLinks.length);
  return Array.from({ length: count }, (_, index) => {
    const platform = normalizedPlatforms[index]?.trim();
    if (!platform) return null;
    return { platform, link: normalizedLinks[index]?.trim() ?? null };
  }).filter((item): item is SocialMediaEntry => item !== null);
}

function formatSocialPlatform(value: string) {
  return SOCIAL_MEDIA_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
}

async function getAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("/api/announcements", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Status ${res.status}`);
  }

  const data = await res.json();

  // index() returns a plain array, not a paginated { data: [...] } shape
  return Array.isArray(data) ? data : (data.data ?? []);
}

// Builds a compact page-number sequence with ellipses, e.g. [1, "…", 4, 5, 6, "…", 12]
function getPageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | "…"> = [1];
  if (current > 4) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push("…");
  pages.push(total);

  return pages;
}

function ImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-linear-to-br from-[#1B3A8C]/10 to-[#00ACC1]/10 ${className ?? ""}`}
    >
      <Newspaper className="h-10 w-10 text-[#1B3A8C]/30" />
    </div>
  );
}

function TagDateRow({ tag, date }: { tag: string; date: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm font-medium px-3 py-1 rounded-full ${tagClass(tag)}`}
      >
        {tag}
      </span>
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(date)}
      </div>
    </div>
  );
}

function AnnouncementCard({
  item,
  index,
  onSelect,
}: {
  item: Announcement;
  index: number;
  onSelect: (item: Announcement) => void;
}) {
  const socialPlatforms = normalizeSocialMedia(
    item.social_platforms,
    item.social_links,
  );
  const imageUrl = getAnnouncementImageUrl(item.image);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="mb-4 overflow-hidden rounded-xl border border-gray-100">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-40 w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImageFallback className="h-40 w-full" />
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <TagDateRow tag={item.tag} date={item.date} />
      </div>

      <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3">
        {item.title}
      </h2>

      <p className="text-sm text-gray-500 leading-relaxed flex-1">
        {item.excerpt}
      </p>

      <div className="flex items-center justify-between gap-2 pt-4">
        {socialPlatforms.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {socialPlatforms.map((entry) =>
              entry.link ? (
                <a
                  key={entry.platform}
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#0A1E3F] hover:bg-blue-100"
                >
                  <span className="flex items-center gap-1 uppercase tracking-wide">
                    {formatSocialPlatform(entry.platform)}{" "}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
              ) : null,
            )}
          </div>
        ) : (
          <span />
        )}

        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FFC107] transition-colors">
          Read more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.div>
  );
}

function AnnouncementModal({
  item,
  onClose,
}: {
  item: Announcement;
  onClose: () => void;
}) {
  const socialPlatforms = normalizeSocialMedia(
    item.social_platforms,
    item.social_links,
  );
  const imageUrl = getAnnouncementImageUrl(item.image);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-100 flex items-center justify-center px-4 py-8 pointer-events-none"
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
            <div className="mb-5 overflow-hidden rounded-xl border border-gray-100">
              {imageUrl && !imageFailed ? (
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="max-h-64 w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <ImageFallback className="h-40 w-full" />
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 leading-snug mb-4">
              {item.title}
            </h2>

            <div className="space-y-4 mb-4">
              {item.content.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {socialPlatforms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialPlatforms.map((entry) =>
                  entry.link ? (
                    <a
                      key={entry.platform}
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      <span className="flex items-center gap-1 rounded-full p-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {formatSocialPlatform(entry.platform)}{" "}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function AnnouncementPage() {
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Search / filter / pagination
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getAnnouncements();
        if (!cancelled) setAnnouncements(data);
      } catch (err) {
        console.error("Announcement fetch failed:", err);
        if (!cancelled) {
          setError("Could not load announcements. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const availableTags = useMemo(
    () =>
      Array.from(
        new Set(announcements.map((a) => a.tag).filter(Boolean)),
      ).sort(),
    [announcements],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements.filter((a) => {
      const matchesQuery =
        q.length === 0 ||
        a.title?.toLowerCase().includes(q) ||
        a.content?.toLowerCase().includes(q) ||
        a.tag?.toLowerCase().includes(q) ||
        a.social_platforms?.some((p) => p.toLowerCase().includes(q)) ||
        a.date?.toLowerCase().includes(q);

      const matchesTag = !tagFilter || a.tag === tagFilter;

      return matchesQuery && matchesTag;
    });
  }, [announcements, query, tagFilter]);

  // Reset to page 1 whenever the active filters change
  useEffect(() => {
    setPage(1);
  }, [query, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const hasActiveFilters = query.trim().length > 0 || tagFilter !== null;

  const clearFilters = () => {
    setQuery("");
    setTagFilter(null);
  };

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
          {/* Search + Filters */}
          <div className="mb-10 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, keyword, or tag…"
                  className="w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C] focus:border-transparent transition-all"
                />
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors w-full sm:w-auto ${filtersOpen || tagFilter
                    ? "border-[#1B3A8C] bg-[#1B3A8C] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {tagFilter ? `Tag: ${tagFilter}` : "Filter by tag"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {filtersOpen && (
                    <>
                      {/* Click-outside catcher */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setFiltersOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-lg max-h-64 overflow-y-auto"
                      >
                        <button
                          onClick={() => {
                            setTagFilter(null);
                            setFiltersOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${!tagFilter
                            ? "bg-[#1B3A8C]/5 text-[#1B3A8C] font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          All tags
                        </button>
                        {availableTags.map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setTagFilter(t);
                              setFiltersOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${tagFilter === t
                              ? "bg-[#1B3A8C]/5 text-[#1B3A8C] font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Loading state — skeleton cards */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
                >
                  <div className="mb-4 h-40 w-full rounded-xl bg-gray-100" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-16 rounded-full bg-gray-100" />
                    <div className="h-4 w-24 rounded bg-gray-100" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-gray-100 mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-gray-100 w-full" />
                    <div className="h-3 rounded bg-gray-100 w-full" />
                    <div className="h-3 rounded bg-gray-100 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">{error}</p>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-[#1B3A8C] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#2a4fa8] transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {/* Empty state (no announcements at all, or none match filters) */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                <Inbox className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                {announcements.length === 0
                  ? "No announcements yet"
                  : "No matches found"}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                {announcements.length === 0
                  ? "Check back soon for news and updates from Hero Serviced Office."
                  : "Try a different search term or clear your filters."}
              </p>
              {announcements.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && paginated.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((item, i) => (
                  <AnnouncementCard
                    key={item.id}
                    item={item}
                    index={i}
                    onSelect={setSelected}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center justify-between gap-3 md:flex-row">
                  <p className="text-sm text-gray-400">
                    {filtered.length} total{" "}
                    {filtered.length === 1 ? "announcement" : "announcements"}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>

                    <div className="hidden items-center gap-1 sm:flex">
                      {pageNumbers.map((p, i) =>
                        p === "…" ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="px-2 text-sm text-gray-400"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${currentPage === p
                              ? "bg-[#1B3A8C] text-white"
                              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    <span className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 sm:hidden">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
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
                exclusive promos, and Makati business insights. No spam —
                unsubscribe anytime.
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
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: wire up newsletter subscription endpoint
                }}
              >
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
                  By subscribing you agree to receive marketing emails from Hero
                  Serviced Office.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <AnnouncementModal
            item={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}