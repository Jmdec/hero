"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ExternalLink, X } from "lucide-react";

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
  image_url?: string | null;
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

const PROMO_TAG_KEYWORDS = [
  "promo",
  "promotion",
  "promotional",
  "offer",
  "deal",
  "sale",
  "discount",
];

const FALLBACK_IMAGE =
  "/pop-up-image-fallback.png";

function formatSocialPlatform(value: string) {
  return (
    SOCIAL_MEDIA_OPTIONS.find((opt) => opt.value === value)?.label ?? value
  );
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

    return {
      platform,
      link: normalizedLinks[index]?.trim() ?? null,
    };
  }).filter((item): item is SocialMediaEntry => item !== null);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getAnnouncementImageUrl(announcement?: Announcement | null) {
  const value = announcement?.image_url || announcement?.image;

  if (!value) return null;

  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.LARAVEL_API_URL ||
    "http://localhost:8000";

  const base = configured.replace(/\/+$/g, "").replace(/\/api$/, "");

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);

      if (!/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(parsed.hostname)) {
        return value;
      }

      const baseUrl = new URL(base);

      parsed.protocol = baseUrl.protocol;
      parsed.host = baseUrl.host;

      return parsed.toString();
    } catch {
      return value;
    }
  }

  let path = value.replace(/^\/+/, "");

  path = path.replace(/^public\/storage\//i, "").replace(/^storage\//i, "");

  return `${base}/storage/${path}`;
}

function isPromotionalAnnouncement(item: Announcement) {
  const tag = (item.tag || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const content = (item.content || "").toLowerCase();

  return PROMO_TAG_KEYWORDS.some(
    (keyword) =>
      tag.includes(keyword) ||
      title.includes(keyword) ||
      content.includes(keyword),
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
        const res = await fetch("/api/announcements", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const json = await res.json();

        const list: Announcement[] = Array.isArray(json)
          ? json
          : (json.data ?? []);

        if (cancelled || list.length === 0) {
          return;
        }

        const promotionalAnnouncements = list.filter(
          isPromotionalAnnouncement,
        );

        if (promotionalAnnouncements.length === 0) {
          return;
        }

        const latest = [...promotionalAnnouncements].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )[0];

        if (cancelled) return;

        setImageFailed(false);
        setAnnouncement(latest);

        const timer = window.setTimeout(() => {
          if (!cancelled) {
            setOpen(true);
          }
        }, 400);

        return () => window.clearTimeout(timer);
      } catch {
        // Do not block the website if announcements fail.
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

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleClose]);

  const uploadedImageSrc = getAnnouncementImageUrl(announcement);

  const imageSrc =
    uploadedImageSrc && !imageFailed ? uploadedImageSrc : FALLBACK_IMAGE;

  const socialPlatforms = announcement
    ? normalizeSocialMedia(
      announcement.social_platforms,
      announcement.social_links,
    )
    : [];

  return (
    <AnimatePresence>
      {open && announcement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.25,
          }}
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[#07162E]/85 p-3 py-6 backdrop-blur-md sm:p-5 sm:py-8 md:p-6"
          onClick={handleClose}
        >
          {/* Decorative HERO-style background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[-15%] top-[20%] h-[260px] w-[260px] rounded-full bg-[#1B3A8C]/20 blur-[90px] sm:h-[340px] sm:w-[340px] sm:blur-[110px] lg:h-[420px] lg:w-[420px] lg:blur-[120px]" />

            <div className="absolute bottom-[-20%] right-[-10%] h-[320px] w-[320px] rounded-full bg-[#00ACC1]/10 blur-[100px] sm:h-[420px] sm:w-[420px] sm:blur-[120px] lg:h-[500px] lg:w-[500px] lg:blur-[140px]" />
          </div>

          {/* Chibi mascot, pinned to the bottom-left of the viewport, behind the dialog. */}
          <div className="pointer-events-none fixed bottom-2 left-2 z-10 hidden lg:block">
            <Image
              src="/hero-chibi.webp"
              alt="HERO Serviced Office"
              width={340}
              height={340}
              unoptimized
              className="h-auto w-[180px] md:w-[220px] lg:w-[280px] xl:w-[340px]"
            />
          </div>

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                  opacity: 0,
                  scale: 0.94,
                  y: 30,
                }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                  opacity: 0,
                  scale: 0.96,
                  y: 16,
                }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : {
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                }
            }
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-[20px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] h-[75vh] sm:max-w-lg sm:rounded-3xl md:h-[78vh] md:max-w-2xl md:flex-row lg:h-[70vh] lg:max-w-4xl lg:rounded-[28px] xl:max-w-5xl lg:left-32 mt-8 md:mt-14 lg:mt-0"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close announcement"
              className="absolute right-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-[#0B1F4A]/85 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-[#1B3A8C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C] sm:right-4 sm:top-4 sm:h-10 sm:w-10 md:h-11 md:w-11"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* LEFT: Announcement Image (tablet & up) */}
            <div className="relative hidden min-h-0 w-[42%] shrink-0 overflow-hidden bg-[#0B1F4A] md:block lg:w-[46%]">
              <Image
                src={imageSrc}
                alt={announcement.title}
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 46vw, (min-width: 768px) 42vw, 100vw"
                className="object-contain"
                onError={() => setImageFailed(true)}
              />
            </div>

            {/* RIGHT: Content */}
            <div className="flex min-h-0 flex-1 flex-col bg-[#FCFCFB]">
              {/* Mobile / small-tablet image */}
              <div className="relative h-40 shrink-0 overflow-hidden xs:h-48 sm:h-56 hidden">
                <Image
                  src={imageSrc}
                  alt={announcement.title}
                  fill
                  priority
                  unoptimized
                  sizes="100vw"
                  className="object-cover"
                  onError={() => setImageFailed(true)}
                />
              </div>

              {/* Content */}
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 md:px-8">
                {/* Category / date */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1B3A8C] sm:text-xs sm:tracking-[0.18em]">
                    {announcement.tag}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#C9A84C]" />

                  <span className="flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

                    {formatDate(announcement.date)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  id="announcement-title"
                  className="max-w-2xl font-serif text-2xl font-bold leading-[1.2] text-[#1E2A3A] sm:text-3xl sm:leading-[1.15] md:text-xl lg:text-2xl"
                >
                  {announcement.title}
                </h3>

                {/* Accent */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-[3px] w-10 bg-[#C9A84C] sm:w-14" />

                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                {/* Announcement content */}
                <div className="max-w-2xl">
                  <p className="whitespace-pre-wrap text-slate-600 text-sm lg:text-md">
                    {announcement.content}
                  </p>
                </div>

                {/* Social links */}
                {socialPlatforms.length > 0 && (
                  <div className="mt-4">

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/announcement`}
                        onClick={handleClose}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#D9E2F0] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1B3A8C] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1B3A8C] hover:bg-[#EEF2FB] sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                      >
                        View Announcement
                      </Link>

                      {socialPlatforms.map((entry) =>
                        entry.link ? (
                          <Link
                            key={`${entry.platform}-${entry.link}`}
                            href={entry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#D9E2F0] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1B3A8C] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1B3A8C] hover:bg-[#EEF2FB] sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                          >
                            {formatSocialPlatform(entry.platform)}

                            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Link>
                        ) : null,
                      )}
                    </div>
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