"use client"
import { useState } from "react"
import { Mail, Phone, Share2, X } from "lucide-react"

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.33 6.33 0 0 0 6.33 6.34 6.33 6.33 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
)

const ShopeeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm2 4v8h12V8H6zm2 2h8v4H8v-4z" />
  </svg>
)

const FloatingSocialMedia = () => {
  const [isOpen, setIsOpen] = useState(false)
  // useLockBodyScroll(isOpen)

  const socialLinks = [
    {
      name: "Email",
      icon: Mail,
      href: "mailto:",
      bgColor: "bg-red-600 hover:bg-red-700",
      ariaLabel: "Send us an email",
    },
    {
      name: "TikTok",
      icon: TikTokIcon,
      href: "",
      bgColor: "bg-black hover:bg-neutral-800",
      ariaLabel: "Visit our TikTok page",
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      href: "",
      bgColor: "bg-pink-600 hover:bg-pink-700",
      ariaLabel: "Visit our Instagram page",
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      href: "",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Visit our Facebook page",
    },
  ]

  return (
    <>
      {/* Desktop View - Right Side Vertical (reversed so Facebook is on top) */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
        {[...socialLinks].reverse().map((social) => {
          const Icon = social.icon
          return (
            <a
              key={social.name}
              href={social.href}
              target={social.name !== "Email" && social.name !== "Phone" ? "_blank" : undefined}
              rel={social.name !== "Email" && social.name !== "Phone" ? "noopener noreferrer" : undefined}
              aria-label={social.ariaLabel}
              className={`
                ${social.bgColor}
                w-12 h-12 rounded-full
                flex items-center justify-center
                text-white shadow-lg
                transition-all duration-300
                hover:scale-110 hover:shadow-xl active:scale-95
                group
              `}
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          )
        })}
      </div>

      {/* Mobile View - Expandable Floating Button */}
      <div className="md:hidden fixed bottom-24 right-6 z-50 flex flex-col items-center">

        {/* Social Icons - stacked above the toggle, Facebook on top, Phone at bottom */}
        <div
          className={`
            flex flex-col-reverse gap-3 mb-3
            transition-all duration-300 origin-bottom
            ${isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-0 translate-y-4 pointer-events-none"}
          `}
        >
          {/*
            flex-col-reverse renders DOM order bottom→top visually.
            socialLinks: Facebook(0), Instagram(1), TikTok(2), Email(3), Phone(4)
            Visually from top → bottom: Facebook, Instagram, TikTok, Email, Phone, [toggle]
          */}
          {socialLinks.map((social, index) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.href}
                target={social.name !== "Email" && social.name !== "Phone" ? "_blank" : undefined}
                rel={social.name !== "Email" && social.name !== "Phone" ? "noopener noreferrer" : undefined}
                aria-label={social.ariaLabel}
                onClick={() => setIsOpen(false)}
                className={`
                  ${social.bgColor}
                  w-14 h-14 rounded-full
                  flex items-center justify-center
                  text-white shadow-lg
                  transition-all duration-300 active:scale-95
                  animate-in slide-in-from-bottom-2
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <Icon className="w-6 h-6" />
              </a>
            )
          })}
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close social menu" : "Open social menu"}
          className={`
            w-16 h-16 rounded-full
            flex items-center justify-center
            text-white shadow-xl
            transition-all duration-300 active:scale-95
            bg-[#c87a5e] hover:bg-[#b5525f]
          `}
        >
          {isOpen
            ? <X className="w-7 h-7 transition-transform duration-300" />
            : <Share2 className="w-7 h-7 transition-transform duration-300" />}
        </button>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  )
}

export default FloatingSocialMedia
