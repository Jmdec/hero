import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingSocialMedia from "@/components/FloatingSocialMedia"
import ClientLayout from "./ClientLayout";
import { LanguageProvider } from "../components/LanguageProvider";
import { ToastProvider } from "../components/Toast";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://heroph.net"),
  title: {
    default: "HERO Serviced Office - Premium Office Space in Manila, Philippines",
    template: "%s | HERO Serviced Office",
  },
  description: "Premium serviced offices in Manila, Philippines. Perfect for Japanese companies expanding into the Philippines. Located on Ayala Avenue, Makati with full bilingual support system, meeting rooms, and virtual office solutions.",
  keywords: [
    "serviced office Philippines",
    "office space Manila",
    "Makati office rental",
    "virtual office Philippines",
    "Japanese business support",
    "Ayala Avenue office",
    "Tower 6789",
    "office rental Philippines",
    "serviced office Makati",
    "coworking space Manila",
    "business center Philippines",
    "Japanese company Philippines",
    "office for rent Makati",
    "executive office Manila",
    "meeting room rental",
    "bilingual office support",
  ],
  authors: [{ name: "HERO Serviced Office, Inc." }],
  creator: "HERO Serviced Office, Inc.",
  publisher: "HERO Serviced Office, Inc.",
  applicationName: "HERO Serviced Office",
  referrer: "origin-when-cross-origin",
  openGraph: {
    type: "website",
    locale: "en_PH",
    alternateLocale: ["en_US", "ja_JP"],
    url: "https://heroph.net",
    siteName: "HERO Serviced Office",
    title: "HERO Serviced Office - Premium Office Space in Manila, Philippines",
    description: "Professional workspace solutions for businesses expanding into the Philippines. Located in the heart of Makati City with bilingual support.",
    images: [
      {
        url: "https://heroph.net/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HERO Serviced Office - Premium Office Space in Manila",
        type: "image/jpeg",
      },
    ],
    countryName: "Philippines",
  },
  twitter: {
    card: "summary_large_image",
    title: "HERO Serviced Office - Premium Office Space in Manila, Philippines",
    description: "Professional workspace solutions for businesses expanding into the Philippines with bilingual support.",
    images: ["https://heroph.net/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HERO Serviced Office",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  category: "business",
  classification: "Serviced Office and Business Center",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://heroph.net",
    languages: {
      "en": "https://heroph.net/en",
      "ja": "https://heroph.net/ja",
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "HERO Serviced Office",
    "application-name": "HERO Serviced Office",
  },
};

export const viewport = {
  themeColor: "#1B3A8C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Business Schema
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://heroph.net/#business",
    "name": "HERO Serviced Office, Inc.",
    "image": ["https://heroph.net/og-image.jpg"],
    "description": "Premium serviced offices in Manila, Philippines. Specialized support for Japanese companies expanding into the Philippines with bilingual staff, meeting rooms, and virtual office solutions.",
    "priceRange": "₱₱-₱₱₱₱",
    "currenciesAccepted": "PHP",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    "telephone": "+63 2 8801-3417",
    "email": "sales@heroph.net",
    "url": "https://heroph.net",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "23F TOWER6789, Ayala Avenue 6789",
      "addressLocality": "Makati City",
      "addressRegion": "Metro Manila",
      "postalCode": "1209",
      "addressCountry": "PH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.5568556",
      "longitude": "121.0168084"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "156",
      "bestRating": "5"
    },
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://heroph.net/reservation"
      },
      "result": {
        "@type": "Reservation",
        "name": "Office Space Reservation"
      }
    }
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://heroph.net/#organization",
    "name": "HERO Serviced Office, Inc.",
    "url": "https://heroph.net",
    "logo": "https://heroph.net/logo.jpg",
    "image": "https://heroph.net/og-image.jpg",
    "description": "Premium serviced office provider in Manila, Philippines specializing in Japanese business support",
    "email": "sales@heroph.net",
    "telephone": "+63 2 8801-3417",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "23F TOWER6789, Ayala Avenue 6789",
      "addressLocality": "Makati City",
      "addressRegion": "Metro Manila",
      "postalCode": "1209",
      "addressCountry": "PH"
    },
    "sameAs": [
      "https://www.facebook.com/herophilippines",
      "https://www.instagram.com/herophilippines"
    ],
    "foundingDate": "2009"
  };

  // WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://heroph.net/#website",
    "url": "https://heroph.net",
    "name": "HERO Serviced Office - Premium Office Space in Manila",
    "description": "Premium serviced offices in Manila, Philippines with bilingual support for Japanese businesses",
    "publisher": {
      "@id": "https://heroph.net/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://heroph.net/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "en-PH"
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How quickly can I move in to HERO Serviced Office?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can move in immediately after completing the reservation and payment process, usually within 24 hours."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer short-term leases?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer flexible lease terms starting from 1 month for serviced offices."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide Japanese-speaking staff?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we have bilingual staff fluent in Japanese and English to assist you."
        }
      }
    ]
  };

  return (
    <html lang="en-PH" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <head>
        {/* Primary Structured Data - Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Open Graph Image Tags */}
        <meta property="og:image" content="https://heroph.net/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://heroph.net/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HERO Serviced Office - Premium Office Space in Manila" />

        {/* Twitter Card Image */}
        <meta name="twitter:image" content="https://heroph.net/og-image.jpg" />
        <meta name="twitter:image:alt" content="HERO Serviced Office" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Geographic meta tags */}
        <meta name="geo.region" content="PH" />
        <meta name="geo.placename" content="Makati City" />
        <meta name="geo.position" content="14.5568556;121.0168084" />
        <meta name="ICBM" content="14.5568556, 121.0168084" />

        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <ClientLayout>{children}</ClientLayout>
              <FloatingSocialMedia />
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}