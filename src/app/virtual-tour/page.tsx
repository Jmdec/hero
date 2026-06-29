"use client";

import { motion } from "framer-motion";
import {
  Play,
  MapPin,
  Rotate3D,
  MousePointer2,
  Building2,
  CheckCircle2,
  Wind,
  Wifi,
  Shield,
  Clock,
  Users,
  Printer,
  Video,
  Mail,
  Coffee,
  Lock,
  Armchair,
  MoveRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Immersive360Tour = dynamic(
  () => import("../../components/PanoramaViewer").then((mod) => ({ default: mod.Immersive360Tour })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-140 bg-[#0f172a] rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#1B3A8C] border-t-transparent mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading 360° viewer…</p>
        </div>
      </div>
    ),
  }
);

export default function VirtualTourPage() {
  const [activeTab, setActiveTab] = useState("tower6789");

  const tourLocations = {
    tower6789: [
      {
        id: "reception",
        title: "Reception",
        description:
          "Professional reception area where visitors are welcomed and assisted by our bilingual staff.",
        features: [
          "Japanese-speaking reception staff",
          "Visitor assistance",
          "Comfortable waiting lounge",
          "Mail & package receiving",
        ],
      },
      {
        id: "meeting-space",
        title: "Meeting room",
        description:
          "Modern meeting rooms designed for client presentations, interviews, seminars, and team discussions.",
        features: [
          "High-speed Wi-Fi",
          "Large presentation display",
          "Video conferencing",
          "Flexible seating layout",
        ],
      },
      {
        id: "mfp-space",
        title: "MFP space",
        description:
          "Shared business center equipped with multifunction office equipment for your daily business needs.",
        features: [
          "Printing",
          "Scanning",
          "Copying",
          "Document support",
        ],
      },
    ],

    insularLife: [
      {
        id: "reception",
        title: "Reception",
        description:
          "Elegant reception area providing professional visitor assistance and business support.",
        features: [
          "Japanese-speaking reception staff",
          "Visitor assistance",
          "Mail & package receiving",
          "Reception services",
        ],
      },
      {
        id: "meeting-space",
        title: "Meeting room",
        description:
          "Fully equipped meeting rooms suitable for conferences, interviews, and client meetings.",
        features: [
          "Presentation display",
          "Video conferencing",
          "High-speed Wi-Fi",
          "Private environment",
        ],
      },
      {
        id: "cafe",
        title: "Cafe area",
        description:
          "Relax and recharge in our shared café space with complimentary refreshments.",
        features: [
          "Coffee & tea",
          "Casual seating",
          "Networking space",
          "Break area",
        ],
      },
      {
        id: "lounge",
        title: "Business lounge",
        description:
          "Comfortable shared lounge for informal meetings, networking, or working outside your office.",
        features: [
          "Comfortable seating",
          "Free Wi-Fi",
          "Networking space",
          "Quiet atmosphere",
        ],
      },
      {
        id: "mailbox",
        title: "Mailbox",
        description:
          "Secure business mailing address with professional mail receiving and handling services.",
        features: [
          "Business address",
          "Mail receiving",
          "Package handling",
          "Mail notification",
        ],
      },
      {
        id: "locker-room",
        title: "Locker room",
        description:
          "Secure personal lockers for members to safely store belongings during the workday.",
        features: [
          "Secure lockers",
          "Member access",
          "Convenient storage",
          "Clean facilities",
        ],
      },
    ],
  };

  const locationTabs = [
    { id: "tower6789", label: "Tower 6789", icon: Building2 },
    { id: "insularLife", label: "Insular Life", icon: Building2 },
  ];

  const buildingServices = {
    tower6789: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "CCTV Security",
      "24/7 Access",
      "Reception Staff",
      "Printing & Scanning",
      "Meeting Rooms",
      "Mail Handling",
    ],
    insularLife: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "CCTV Security",
      "24/7 Access",
      "Reception Staff",
      "Café & Pantry",
      "Business Lounge",
      "Secure Lockers",
      "Mail Handling",
      "Printing & Scanning",
    ],
  };

  const serviceIconMap: Record<string, React.ReactNode> = {
    "Air Conditioning": <Wind className="w-3.5 h-3.5" />,
    "High-Speed Wi-Fi": <Wifi className="w-3.5 h-3.5" />,
    "CCTV Security": <Shield className="w-3.5 h-3.5" />,
    "24/7 Access": <Clock className="w-3.5 h-3.5" />,
    "Reception Staff": <Users className="w-3.5 h-3.5" />,
    "Printing & Scanning": <Printer className="w-3.5 h-3.5" />,
    "Meeting Rooms": <Video className="w-3.5 h-3.5" />,
    "Mail Handling": <Mail className="w-3.5 h-3.5" />,
    "Café & Pantry": <Coffee className="w-3.5 h-3.5" />,
    "Business Lounge": <Armchair className="w-3.5 h-3.5" />,
    "Secure Lockers": <Lock className="w-3.5 h-3.5" />,
  };

  const roomsByTab = {
    tower6789: [
      {
        id: "reception",
        name: "Reception",
        panoramaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
      },
      {
        id: "meeting-space",
        name: "Meeting Room",
        panoramaUrl: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=400&q=80",
      },
      {
        id: "mfp-space",
        name: "MFP Space",
        panoramaUrl: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400&q=80",
      },
    ],

    insularLife: [
      {
        id: "reception",
        name: "Reception",
        panoramaUrl: "https://images.unsplash.com/photo-1486946255434-2466348c2166?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1486946255434-2466348c2166?w=400&q=80",
      },
      {
        id: "meeting-space",
        name: "Meeting Room",
        panoramaUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400&q=80",
      },
      {
        id: "cafe",
        name: "Cafe Area",
        panoramaUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
      },
      {
        id: "lounge",
        name: "Business Lounge",
        panoramaUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
      },
      {
        id: "mailbox",
        name: "Mailbox",
        panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80",
      },
      {
        id: "locker-room",
        name: "Locker Room",
        panoramaUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2400&q=85",
        thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      },
    ],
  };

  const instructions = [
    { icon: MousePointer2, text: "Drag to look around the room" },
    { icon: Rotate3D, text: "Scroll to zoom in or out" },
    { icon: MapPin, text: "Click thumbnails to switch rooms" },
  ];

  const activeRooms = roomsByTab[activeTab as keyof typeof roomsByTab];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero — unchanged ── */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="About HERO Serviced Office"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#1B3A8C]/90 to-[#1B3A8C]/60" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Virtual Office tour
            </h1>
            <p className="text-xl text-gray-300">
              Explore our state-of-the-art facilities from the comfort of your home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 360° Viewer ── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Location tabs */}
          <div className="flex gap-2 mb-6">
            {locationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  activeTab === tab.id
                    ? "bg-[#1B3A8C] text-white border-[#1B3A8C] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Viewer */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Immersive360Tour rooms={activeRooms} isEmbedded={true} />
          </motion.div>

          {/* Hint strip */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {instructions.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-lg px-3 py-2.5"
              >
                <item.icon className="w-4 h-4 text-[#1B3A8C] shrink-0" />
                <span className="text-md text-gray-500">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour locations */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <p className="text-sm font-semibold tracking-widest text-[#1B3A8C] uppercase mb-2">
              {locationTabs.find((t) => t.id === activeTab)?.label}
            </p>
            <h2 className="text-3xl font-bold text-gray-900">Explore our spaces</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Every area is designed to support how you work best.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tourLocations[activeTab as keyof typeof tourLocations].map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                className="group flex flex-col bg-white border border-gray-150 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Play className="w-3.5 h-3.5 text-[#1B3A8C]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xl">{location.title}</h3>
                </div>

                <p className="text-md text-gray-500 leading-relaxed mb-4">{location.description}</p>

                <ul className="mt-auto space-y-2">
                  {location.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Services */}
          <div className="mt-8 border border-gray-100 rounded-2xl p-6">
            <p className="text-[14px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
              Available services
            </p>
            <div className="flex flex-wrap gap-2">
              {buildingServices[activeTab as keyof typeof buildingServices].map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700"
                >
                  <span className="text-gray-400">{serviceIconMap[service]}</span>
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-linear-to-r from-[#0D47A1] to-[#00ACC1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to See It in person?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Book a tour or contact us for more information about our services and amenities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Book a Tour
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}