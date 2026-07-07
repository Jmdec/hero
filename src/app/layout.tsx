import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { ToastProvider } from "../components/Toast";
import { AuthProvider } from "@/contexts/AuthContext";

import { Montserrat, Geist_Mono } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

// Metadata

export const metadata: Metadata = {
  metadataBase: new URL("https://heroph.net"),

  title: {
    default:
      "HERO Serviced Office | Premium Flexible Workspace in Makati, Philippines",
    template: "%s | HERO Serviced Office",
  },
  description:
    "HERO Serviced Office offers premium private offices, co-working, virtual offices, and meeting rooms on Ayala Avenue, Makati. Bilingual Japanese–English support. PEZA-certified. Move in within 24 hours.",
  keywords: [
    // Core service keywords
    "serviced office Makati",
    "office space Makati Philippines",
    "private office Makati",
    "virtual office Philippines",
    "coworking space Makati",
    "meeting room rental Makati",
    // Japanese market
    "Japanese business support Philippines",
    "フィリピン サービスオフィス",
    "マカティ オフィス レンタル",
    "日本語対応 フィリピン オフィス",
    // Location signals
    "Ayala Avenue office rental",
    "Tower 6789 office",
    "Insular Life Building office",
    "PEZA office Philippines",
    // Competitor-adjacent long-tail
    "flexible workspace Manila CBD",
    "short-term office lease Philippines",
    "plug-and-play office Makati",
    "SEC registered address Philippines",
  ],

  authors: [{ name: "HERO Serviced Office, Inc.", url: "https://heroph.net" }],
  creator: "HERO Serviced Office, Inc.",
  publisher: "HERO Serviced Office, Inc.",
  applicationName: "HERO Serviced Office",
  referrer: "origin-when-cross-origin",
  category: "Business Services",
  classification: "Serviced Office and Business Center",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_PH",
    alternateLocale: ["en_US", "ja_JP"],
    url: "https://heroph.net",
    siteName: "HERO Serviced Office",
    title:
      "HERO Serviced Office | Premium Flexible Workspace in Makati, Philippines",
    description:
      "Private offices, co-working, virtual offices, and meeting rooms on Ayala Avenue, Makati. Bilingual Japanese–English support. PEZA-certified. Move in within 24 hours.",
    images: [
      {
        url: "https://heroph.net/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HERO Serviced Office — Premium Workspace on Ayala Avenue, Makati",
        type: "image/jpeg",
      },
    ],
    countryName: "Philippines",
  },

  // Twitter / X
  twitter: {
    card: "summary_large_image",
    site: "@herophilippines",
    creator: "@herophilippines",
    title: "HERO Serviced Office | Premium Flexible Workspace in Makati",
    description:
      "Private offices, co-working, and virtual offices on Ayala Avenue, Makati. Bilingual Japanese–English support. PEZA-certified.",
    images: [
      {
        url: "https://heroph.net/og-image.jpg",
        alt: "HERO Serviced Office — Premium Workspace on Ayala Avenue, Makati",
      },
    ],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // Alternates / hreflang
  alternates: {
    canonical: "https://heroph.net",
    languages: {
      "en-PH": "https://heroph.net/en",
      "ja-JP": "https://heroph.net/ja",
      "x-default": "https://heroph.net",
    },
  },

  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.png",
  },

  // PWA / Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HERO Office",
  },

  // Verification
  verification: {
    google: "your-google-search-console-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },

  // Other
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "HERO Office",
    "application-name": "HERO Serviced Office",
    "msapplication-TileColor": "#0f2d52",
    "msapplication-config": "/browserconfig.xml",
    "format-detection": "telephone=yes",
    "geo.region": "PH-00",
    "geo.placename": "Makati City, Metro Manila",
    "geo.position": "14.5568556;121.0168084",
    ICBM: "14.5568556, 121.0168084",
    language: "English, Japanese",
    revisit: "7 days",
    distribution: "global",
    rating: "general",
    HandheldFriendly: "True",
    MobileOptimized: "320",
  },
};

// ─── Viewport (Next.js 14+ export) ──────────────────────────────────────────

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f2d52" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2d52" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// ─── Structured Data ─────────────────────────────────────────────────────────

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "RealEstateAgent"],
  "@id": "https://heroph.net/#business",
  name: "HERO Serviced Office, Inc.",
  alternateName: ["HERO Office", "ヒーローサービスオフィス"],
  image: [
    "https://heroph.net/og-image.jpg",
    "https://heroph.net/photos/reception.jpg",
    "https://heroph.net/photos/private-office.jpg",
  ],
  logo: "https://heroph.net/logo.jpg",
  description:
    "HERO Serviced Office provides premium private offices, shared desks, co-working areas, virtual office addresses, and meeting rooms in Makati City. Bilingual Japanese–English support. PEZA-certified location at Tower 6789.",
  priceRange: "₱₱–₱₱₱₱",
  currenciesAccepted: "PHP",
  paymentAccepted: "Cash, Credit Card, Bank Transfer, GCash, Maya",
  telephone: "+63-2-8801-3417",
  email: "sales@heroph.net",
  url: "https://heroph.net",
  hasMap: "https://maps.google.com/?cid=YOUR_GOOGLE_MAPS_CID",
  address: {
    "@type": "PostalAddress",
    streetAddress: "23F Tower 6789, Ayala Avenue",
    addressLocality: "Makati City",
    addressRegion: "Metro Manila",
    postalCode: "1209",
    addressCountry: "PH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "14.5568556",
    longitude: "121.0168084",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  specialOpeningHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      description: "24/7 access for registered tenants",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "High-Speed Wi-Fi",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Meeting Rooms",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "24/7 Access",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "PEZA Certified",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Bilingual Japanese Support",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Virtual Office",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Reception Service",
      value: true,
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "156",
    bestRating: "5",
    worstRating: "1",
  },
  potentialAction: [
    {
      "@type": "ReserveAction",
      name: "Reserve an Office",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://heroph.net/quotation",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: "Office Space Reservation",
      },
    },
    {
      "@type": "CommunicateAction",
      name: "Contact Sales",
      target: "mailto:sales@heroph.net",
    },
  ],
  sameAs: [
    "https://www.facebook.com/heroservicedoffice",
    "https://www.instagram.com/heroso.ph",
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://heroph.net/#organization",
  name: "HERO Serviced Office, Inc.",
  url: "https://heroph.net",
  logo: {
    "@type": "ImageObject",
    url: "https://heroph.net/logo.jpg",
    width: 400,
    height: 120,
  },
  image: "https://heroph.net/og-image.jpg",
  description:
    "Premium serviced office provider in Makati, Philippines. Specialised support for Japanese companies expanding into the Philippines with bilingual staff and PEZA-certified facilities.",
  email: "sales@heroph.net",
  telephone: "+63-2-8801-3417",
  foundingDate: "2009",
  numberOfEmployees: { "@type": "QuantitativeValue", value: 20 },
  address: {
    "@type": "PostalAddress",
    streetAddress: "23F Tower 6789, Ayala Avenue",
    addressLocality: "Makati City",
    addressRegion: "Metro Manila",
    postalCode: "1209",
    addressCountry: "PH",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+63-2-8801-3417",
      contactType: "sales",
      areaServed: "PH",
      availableLanguage: ["English", "Japanese"],
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    },
    {
      "@type": "ContactPoint",
      email: "sales@heroph.net",
      contactType: "customer support",
      areaServed: ["PH", "JP"],
      availableLanguage: ["English", "Japanese"],
    },
  ],
  sameAs: [
    "https://www.facebook.com/heroservicedoffice",
    "https://www.instagram.com/heroso.ph",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://heroph.net/#website",
  url: "https://heroph.net",
  name: "HERO Serviced Office",
  description:
    "Premium serviced offices in Makati, Philippines with bilingual Japanese–English support.",
  publisher: { "@id": "https://heroph.net/#organization" },
  inLanguage: ["en-PH", "ja-JP"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://heroph.net/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// Answer Engine Optimisation — concise Q&A pairs for AI overviews & featured snippets
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How quickly can I move into a HERO Serviced Office?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can move in within 24 hours of completing the reservation and payment process online.",
      },
    },
    {
      "@type": "Question",
      name: "Does HERO Serviced Office offer short-term leases?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. HERO offers flexible lease terms starting from one month for private serviced offices.",
      },
    },
    {
      "@type": "Question",
      name: "Is HERO Serviced Office PEZA-certified?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Tower 6789 location on Ayala Avenue, Makati is PEZA-certified, providing tax incentives for qualifying foreign investors and companies.",
      },
    },
    {
      "@type": "Question",
      name: "Does HERO Serviced Office have Japanese-speaking staff?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. HERO has bilingual staff fluent in both Japanese and English to support Japanese companies expanding into the Philippines.",
      },
    },
    {
      "@type": "Question",
      name: "What office types does HERO Serviced Office offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HERO offers private offices (1–35 seats), shared desk booths, co-working café areas, virtual office address registration, and conference rooms for up to 10 people.",
      },
    },
    {
      "@type": "Question",
      name: "Where is HERO Serviced Office located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HERO Serviced Office has two Makati locations: 23F Tower 6789, Ayala Avenue, and the 11F Insular Life Building, Ayala Avenue, Makati City, Philippines.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use HERO's address for SEC or business registration?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. HERO's virtual office service provides a prestigious Makati CBD address for SEC and corporate registration, including mail forwarding.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods does HERO Serviced Office accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HERO accepts cash, credit and debit cards, bank transfer, GCash, and Maya.",
      },
    },
  ],
};

// Breadcrumb for homepage (helps AI crawlers understand site hierarchy)
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://heroph.net",
    },
  ],
};

// Service catalogue — helps AI assistants surface specific offerings
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "HERO Serviced Office Services",
  description: "Office solutions available at HERO Serviced Office, Makati",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "Private Serviced Office",
        description:
          "Dedicated private rooms for 1–35 people with furniture, internet, and 24/7 access included.",
        provider: { "@id": "https://heroph.net/#organization" },
        areaServed: "Makati City, Philippines",
        url: "https://heroph.net/services",
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Shared / Co-Working Office",
        description:
          "Affordable single-person booth desks and café co-working areas with Wi-Fi included.",
        provider: { "@id": "https://heroph.net/#organization" },
        areaServed: "Makati City, Philippines",
        url: "https://heroph.net/services",
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "Virtual Office",
        description:
          "Prestigious Makati CBD address for SEC and corporate registration with mail forwarding service.",
        provider: { "@id": "https://heroph.net/#organization" },
        areaServed: "Philippines",
        url: "https://heroph.net/services/virtual-office",
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Service",
        name: "Conference Room Rental",
        description:
          "Meeting rooms for up to 10 people available for hourly rental on weekdays 9:00–18:00.",
        provider: { "@id": "https://heroph.net/#organization" },
        areaServed: "Makati City, Philippines",
        url: "https://heroph.net/services",
      },
    },
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-PH"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ── PWA install prompt early capture (must run before hydration) ── */}
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`
            window.deferredPWAInstallPrompt = null;
            window.addEventListener('beforeinstallprompt', function (e) {
              e.preventDefault();
              window.deferredPWAInstallPrompt = e;
              window.dispatchEvent(new Event('pwaInstallPromptReady'));
            });
          `}
        </Script>

        {/* ── Structured Data (SEO + AEO) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />

        {/* ── Open Graph image (redundant safety tags) ── */}
        <meta property="og:image" content="https://heroph.net/og-image.jpg" />
        <meta
          property="og:image:secure_url"
          content="https://heroph.net/og-image.jpg"
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="HERO Serviced Office — Premium Workspace on Ayala Avenue, Makati"
        />

        {/* ── Twitter image ── */}
        <meta name="twitter:image" content="https://heroph.net/og-image.jpg" />
        <meta
          name="twitter:image:alt"
          content="HERO Serviced Office — Premium Workspace, Makati"
        />

        {/* ── Japanese locale signal ── */}
        <meta name="DC.language" content="ja-JP" />
        <meta property="og:locale:alternate" content="ja_JP" />

        {/* ── Performance: preconnect ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* ── PWA manifest ── */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <ClientLayout>{children}</ClientLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
