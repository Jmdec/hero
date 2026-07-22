"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { X, Calendar, ExternalLink } from "lucide-react";

interface SocialMediaEntry {
  platform: string;
  link: string | null;
}

interface Announcement {
  id: number;
  tag: string;
  date: string;
  title: string;
  content: string;
  image?: string | null;
  created_at: string;
  social_platforms?: string[] | null;
  social_links?: Array<string | null> | null;
}

const SOCIAL_MEDIA_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

function formatSocialPlatform(value: string) {
  return SOCIAL_MEDIA_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
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

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PROMO_TAG_KEYWORDS = ["promo", "promotion", "promotional", "offer", "deal", "sale", "discount"];

// Used whenever an announcement has no image of its own, or its uploaded
// image fails to load — so the popup never looks like an empty flat-color box.
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&q=80";

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

function isPromotionalAnnouncement(item: Announcement) {
  const tag = (item.tag || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const content = (item.content || "").toLowerCase();
  return PROMO_TAG_KEYWORDS.some(
    (keyword) => tag.includes(keyword) || title.includes(keyword) || content.includes(keyword),
  );
}

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    async function loadLatestAnnouncement() {
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        if (!res.ok) return;

        const json = await res.json();
        const list: Announcement[] = Array.isArray(json)
          ? json
          : (json.data ?? []);

        if (cancelled || list.length === 0) return;

        const promotionalAnnouncements = list.filter(isPromotionalAnnouncement);
        if (promotionalAnnouncements.length === 0) return;

        const latest = [...promotionalAnnouncements].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];

        setAnnouncement(latest);
        setTimeout(() => setOpen(true), 400);
      } catch {
        // silently ignore — a broken announcements fetch shouldn't block the page
      }
    }

    loadLatestAnnouncement();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Close on Escape, and don't let the page scroll behind the popup.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleClose]);

  // Reset image-error tracking whenever a new announcement is loaded
  useEffect(() => {
    setImageFailed(false);
  }, [announcement?.id]);

  const uploadedImageSrc = getAnnouncementImageUrl(announcement?.image);
  const imageSrc =
    uploadedImageSrc && !imageFailed ? uploadedImageSrc : FALLBACK_IMAGE;

  const socialPlatforms = announcement
    ? normalizeSocialMedia(announcement.social_platforms, announcement.social_links)
    : [];

  return (
    <AnimatePresence>
      {open && announcement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          className="fixed inset-0 z-999 flex items-center justify-center overflow-y-auto bg-[#0A1E3F]/70 p-4 py-8 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 24 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 280, damping: 26 }
            }
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-lg md:max-w-3xl md:flex-row"
          >
            {/* Close button — consistent placement regardless of column layout */}
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0D47A1]"
              aria-label="Close announcement"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Signature: a document-tab / directory-plaque spine, brand gradient.
                Runs along the top on mobile, the left edge on desktop. */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scaleX: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
              className="absolute inset-x-0 top-0 z-20 h-1.5 bg-linear-to-r from-[#1B3A8C] via-[#0D47A1] to-[#00ACC1] md:hidden"
            />
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scaleY: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="absolute inset-y-0 left-0 z-20 hidden w-1.5 bg-linear-to-b from-[#1B3A8C] via-[#0D47A1] to-[#00ACC1] md:block"
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row">
              {/* Media column */}
              <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-100 md:aspect-auto md:w-[42%]">
                <Image
                  src={imageSrc}
                  alt={announcement.title}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setImageFailed(true)}
                />
                <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/35 to-transparent" />

                <motion.span
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -6 }
                  }
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0 }
                  }
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="absolute left-3 top-3 rounded-md bg-[#FFC107] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1B3A8C] shadow-sm"
                >
                  New announcement
                </motion.span>
              </div>

              {/* Content column */}
              <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {announcement.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(announcement.date)}
                  </div>
                </div>

                <h3
                  id="announcement-title"
                  className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl"
                >
                  {announcement.title}
                </h3>

                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                  {announcement.content}
                </p>

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
                          <span className="flex items-center gap-1 uppercase tracking-wide">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}