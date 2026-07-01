"use client"
import { useState } from "react"
import { Mail, Plus, X, MessageCircle } from "lucide-react"

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M19.321 5.562a5.124 5.124 0 0 1-3.18-1.098A5.184 5.184 0 0 1 14.306 1h-3.273v13.087a2.473 2.473 0 1 1-2.472-2.473c.217 0 .428.028.631.08V8.378a5.76 5.76 0 0 0-.631-.034A5.746 5.746 0 1 0 14.307 14.09V8.242a8.4 8.4 0 0 0 5.014 1.657V6.684z" />
  </svg>
)

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.5 6.2a2.98 2.98 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A2.98 2.98 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a2.98 2.98 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a2.98 2.98 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8ZM9.75 15.5v-7L16 12l-6.25 3.5Z" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0H12v2.3h.1c.6-1.1 2.1-2.3 4.4-2.3 4.7 0 5.5 3.1 5.5 7.1V24h-5v-7.8c0-1.9 0-4.3-2.6-4.3-2.6 0-3 2-3 4.2V24h-5V8z" />
  </svg>
)

const ViberIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 5.98 2 10.89c0 2.63 1.29 4.99 3.35 6.61L4.5 22l4.73-1.24c.88.23 1.81.35 2.77.35 5.52 0 10-3.98 10-8.89S17.52 2 12 2zm4.55 12.24c-.19.54-1.09 1.02-1.5 1.08-.39.06-.89.08-1.44-.09-.33-.1-.76-.25-1.31-.49-2.31-1-3.82-3.33-3.94-3.49-.12-.16-.94-1.24-.94-2.36 0-1.12.59-1.67.8-1.9.21-.23.46-.29.61-.29h.44c.14 0 .33-.05.52.39.19.45.64 1.56.7 1.68.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.35.42-.12.12-.24.26-.1.51.14.25.62 1.02 1.33 1.65.92.82 1.7 1.08 1.95 1.2.25.12.39.1.54-.06.15-.16.62-.72.79-.97.17-.25.35-.21.58-.13.23.08 1.48.7 1.73.82.25.12.42.18.48.28.06.1.06.58-.13 1.12z" />
  </svg>
)

// Single source of truth — brand color lives on the icon, container stays neutral.
const socialLinks = [
  { name: "Facebook", icon: FacebookIcon, href: "https://www.facebook.com/heroservicedoffice", color: "#1877F2" },
  { name: "Instagram", icon: InstagramIcon, href: "https://www.instagram.com/heroso.ph", color: "#DD2A7B" },
  { name: "LinkedIn", icon: LinkedinIcon, href: "https://www.linkedin.com/company/hero-serviced-office-inc/", color: "#0A66C2" },
  { name: "TikTok", icon: TikTokIcon, href: "https://www.tiktok.com/@heroservicedoffice", color: "#111111" },
  { name: "YouTube", icon: YouTubeIcon, href: "https://www.youtube.com/@HeroServicedOfficePH", color: "#FF0000" },
  { name: "WhatsApp", icon: MessageCircle, href: "https://wa.me/639171262939", color: "#25D366" },
  { name: "Viber", icon: ViberIcon, href: "viber://chat?number=%2B639171262939", color: "#7360F2" },
].filter((s) => s.href?.trim())

const FloatingSocialMedia = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop only (lg+) — hover-based pill rail requires a mouse, so tablets/touch devices skip this */}
      <div
        className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-50 flex-col items-center
                  bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-neutral-200/70
                  py-4 px-2 gap-3 transition-shadow hover:shadow-lg"
      >
        {socialLinks.map((social) => {
          const Icon = social.icon
          return (
            <a
              key={social.name}
              href={social.href || undefined}
              target={social.name !== "Email" ? "_blank" : undefined}
              rel={social.name !== "Email" ? "noopener noreferrer" : undefined}
              aria-label={`Visit our ${social.name}`}
              className="group/item relative w-10 h-10 rounded-full flex items-center justify-center
                        text-neutral-500 transition-colors duration-200 hover:text-white"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = social.color)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Icon className="w-6 h-6" />
              {/* Tooltip */}
              <span
                className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2
                          whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white
                          opacity-0 scale-95 transition-all duration-150
                          group-hover/item:opacity-100 group-hover/item:scale-100"
              >
                {social.name}
              </span>
            </a>
          )
        })}
      </div>

      {/* Mobile + tablet (below lg) — tap-to-expand FAB, sized up slightly on tablet, safe-area aware */}
      <div
        className="lg:hidden fixed z-50 flex flex-col items-center
                   right-4 sm:right-6
                   bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5.5rem))]"
      >
        <div
          className={`flex flex-col-reverse gap-2.5 sm:gap-3 mb-3 transition-all duration-300 origin-bottom
            ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-0 translate-y-3 pointer-events-none"}`}
        >
          {socialLinks.map((social, index) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.href || undefined}
                target={social.name !== "Email" ? "_blank" : undefined}
                rel={social.name !== "Email" ? "noopener noreferrer" : undefined}
                aria-label={`Visit our ${social.name}`}
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-md
                           transition-transform active:scale-90 shrink-0"
                style={{
                  backgroundColor: social.color,
                  animationDelay: `${index * 40}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <Icon className="w-5 h-5" />
              </a>
            )
          })}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close social menu" : "Open social menu"}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg
                     transition-transform duration-300 active:scale-90 bg-neutral-900 shrink-0"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/20 -z-10" onClick={() => setIsOpen(false)} />
        )}
      </div>
    </>
  )
}

export default FloatingSocialMedia