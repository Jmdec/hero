"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, Megaphone, Sparkles } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  created_at: string;
}

const SEEN_KEY = "seen_announcement_id";

// Used whenever an announcement has no image of its own — so the popup
// never looks like an empty flat-color box.
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&q=80";

function getSeenId(): number | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function markSeen(id: number) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(id));
  } catch {
    // localStorage unavailable (private mode etc) — fail silently
  }
}

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

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

        const latest = [...list].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];

        const seenId = getSeenId();
        if (latest.id !== seenId) {
          setAnnouncement(latest);
          setTimeout(() => setOpen(true), 400);
        }
      } catch {
        // silently ignore — a broken announcements fetch shouldn't block the page
      }
    }

    loadLatestAnnouncement();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleClose() {
    if (announcement) markSeen(announcement.id);
    setOpen(false);
  }

  const imageSrc = announcement?.image || FALLBACK_IMAGE;

  return (
    <AnimatePresence>
      {open && announcement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20, rotate: 2 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* animated glow ring behind the card */}
            <motion.div
              className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#0D47A1] via-[#3B5EA6] to-[#00ACC1] opacity-40 blur-lg"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative overflow-hidden rounded-2xl bg-white">
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
                aria-label="Close announcement"
              >
                <X className="h-4 w-4" />
              </motion.button>

              {/* Image header — always an image now, real or fallback */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                <motion.div
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6, ease: "easeOut" }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={imageSrc}
                    alt={announcement.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>

                {/* dark gradient so text/badges stay legible over any photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

                {/* shimmer sweep across the image */}
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ duration: 1.6, delay: 0.5, ease: "easeInOut" }}
                  style={{ width: "60%" }}
                />

                {/* floating megaphone badge, bottom-left over the image */}
                <motion.div
                  initial={{ scale: 0, rotate: -25, y: 10 }}
                  animate={{ scale: 1, rotate: 0, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 14,
                    delay: 0.25,
                  }}
                  className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: [0, -12, 12, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "easeInOut",
                    }}
                  >
                    <Megaphone className="h-4 w-4 text-[#1B3A8C]" />
                  </motion.div>
                  <span className="text-xs font-semibold text-[#1B3A8C]">
                    New Announcement
                  </span>
                </motion.div>

                {/* floating sparkle accents */}
                <motion.div
                  className="absolute right-6 top-5 text-white/70"
                  animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                <motion.div
                  className="absolute right-16 top-12 text-white/50"
                  animate={{ y: [0, 5, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6,
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                </motion.div>
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                  },
                }}
                className="p-6"
              >
                <motion.h3
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="mb-2 text-xl font-bold text-gray-900"
                >
                  {announcement.title}
                </motion.h3>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="whitespace-pre-wrap text-sm text-gray-600"
                >
                  {announcement.content}
                </motion.p>

                <motion.button
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  onClick={handleClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 w-full rounded-full bg-[#1B3A8C] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#3B5EA6]"
                >
                  Got it
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
