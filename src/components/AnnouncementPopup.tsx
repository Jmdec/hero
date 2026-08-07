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
  const shouldReduceMotion = useReducedMotion();

  // --- Data loading (unchanged) ---
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

  // Close on Escape only. No scroll lock — the page stays fully interactive
  // while the widget floats above it.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  const socialPlatforms = announcement
    ? normalizeSocialMedia(announcement.social_platforms, announcement.social_links)
    : [];

  return (
    <AnimatePresence>
      {open && announcement && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-1000 flex items-end justify-start px-3 sm:px-6"
          aria-live="polite"
        >
          {/* Mascot — planted in front, leaning toward the note */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, rotate: -4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, ease: "easeOut" }}
            className="pointer-events-none relative z-10 hidden shrink-0 sm:block"
          >
            <Image
              src="/hero-mascot.webp"
              alt="HERO Serviced Office"
              width={180}
              height={180}
              unoptimized
              className="drop-shadow-[0_10px_20px_rgba(13,25,54,0.35)]"
            />
          </motion.div>

          {/* Note card */}
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="announcement-title"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.9, x: -14, rotate: -2 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, x: 0, rotate: -1 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.94, x: -10 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 260, damping: 22, delay: 0.08 }
            }
            className="pointer-events-auto relative bottom-10 -ml-3 w-68 max-w-[calc(100vw-2rem)] sm:w-75"
          >
            <div className="overflow-hidden rounded-[18px] border border-[#0D2A5C]/10 bg-[#FBFAF6] shadow-[0_18px_40px_-12px_rgba(13,25,54,0.35)]">

              <div className="max-h-[46vh] overflow-y-auto px-4 pb-4 pt-3.5">
                  <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 h-6 w-6 shrink-0 items-end justify-end rounded-full text-[#0D2A5C] transition-colors hover:text-gray-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#00D1B2]"
                    aria-label="Close announcement"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                <h3
                  id="announcement-title"
                  className="text-[17px] font-bold leading-snug tracking-tight text-[#101828]"
                >
                  {announcement.title}
                </h3>

                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#8A8577]">
                  <Calendar className="h-3 w-3" />
                  {formatDate(announcement.date)}
                </div>

                <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-[#3E4451]">
                  {announcement.content}
                </p>

                {socialPlatforms.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#0D2A5C]/8 pt-3">
                    {socialPlatforms.map((entry) =>
                      entry.link ? (
                        <a
                          key={entry.platform}
                          href={entry.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-[#0D1E3F]/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0D1E3F] transition-colors hover:bg-[#0D1E3F]/12"
                        >
                          {formatSocialPlatform(entry.platform)}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : null,
                    )}
                  </div>
                )}
              </div>

              {/* Bottom accent — a single warm ember line, the "signature" mark */}
              <div className="h-0.75 w-full bg-[linear-gradient(90deg,#00D1B2_0%,#0D47A1_55%,#0D1E3F_100%)]" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}