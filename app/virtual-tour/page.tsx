"use client";

import { motion } from "framer-motion";
import {
  Play,
  MapPin,
  Expand,
  Rotate3D,
  MousePointer2,
  Info,
  ArrowRight,
  Building2,
  Users,
  Wifi,
  Coffee,
  Video,
  Shield,
  CheckCircle2,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import { useState } from "react";

// Dynamic import for the Immersive360Tour to avoid SSR issues
const Immersive360Tour = dynamic(() => import("../../components/PanoramaViewer").then(mod => ({ default: mod.Immersive360Tour })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] lg:h-[700px] bg-gray-900 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
        <p className="text-white">Loading 360° Viewer...</p>
      </div>
    </div>
  ),
});

export default function VirtualTourPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("tower6789");

  // ─── Everything below is identical to the original ─────────────────────────

  const tourLocations = {
    tower6789: [
      {
        id: "lobby",
        title: t("virtualTour.locations.tower6789") as string,
        description: t("virtualTour.locations.tower6789Desc") as string,
        features: t("virtualTour.locations.tower6789Features") as unknown as string[],
      },
      {
        id: "office-premium",
        title: t("virtualTour.locations.tower6789Office") as string,
        description: t("virtualTour.locations.tower6789OfficeDesc") as string,
        features: t("virtualTour.locations.tower6789OfficeFeatures") as unknown as string[],
      },
    ],
    insularLife: [
      {
        id: "meeting-large",
        title: t("virtualTour.locations.insularLifeMeeting") as string,
        description: t("virtualTour.locations.insularLifeMeetingDesc") as string,
        features: t("virtualTour.locations.insularLifeMeetingFeatures") as unknown as string[],
      },
      {
        id: "lounge",
        title: t("virtualTour.locations.insularLife") as string,
        description: t("virtualTour.locations.insularLifeDesc") as string,
        features: t("virtualTour.locations.insularLifeFeatures") as unknown as string[],
      },
      {
        id: "cafe",
        title: "Cafe Area",
        description: "Modern cafeteria with daily meal options",
        features: ["Hot Meals", "30-Seat Capacity", "24/7 Vending"],
      },
    ],
  };

  const locationTabs = [
    { id: "tower6789", label: "Tower 6789", icon: Building2 },
    { id: "insularLife", label: "Insular Life", icon: Building2 },
  ];

  // Rooms data for Immersive360Tour - using wide images for panoramic effect
  const rooms = [
    {
      id: "lobby",
      name: "Main Lobby",
      panoramaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2400&q=85",
      thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    },
    {
      id: "office-premium",
      name: "Premium Office Suite",
      panoramaUrl: "/360-office.jpg",
      thumbnail: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400&q=80",
    },
    {
      id: "meeting-large",
      name: "Executive Boardroom",
      panoramaUrl: "/360-office.jpg",
      thumbnail: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=400&q=80",
    },
    {
      id: "lounge",
      name: "Lounge Area",
      panoramaUrl: "/360-office.jpg",
      thumbnail: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
    },
    {
      id: "cafe",
      name: "Cafe Area",
      panoramaUrl: "/360-office.jpg",
      thumbnail: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
    },
  ];

  const features = [
    {
      icon: Rotate3D,
      title: t("virtualTour.features.immersive") as string,
      description: t("virtualTour.features.immersiveDesc") as string,
    },
    {
      icon: MousePointer2,
      title: t("virtualTour.features.interactive") as string,
      description: t("virtualTour.features.interactiveDesc") as string,
    },
    {
      icon: Expand,
      title: t("virtualTour.features.anytime") as string,
      description: t("virtualTour.features.anytimeDesc") as string,
    },
    {
      icon: MapPin,
      title: t("virtualTour.features.multiple") as string,
      description: t("virtualTour.features.multipleDesc") as string,
    },
  ];

  const amenities = [
    { icon: Wifi, title: "High-Speed Internet", description: "Fiber optic connection" },
    { icon: Video, title: "Video Conferencing", description: "4K displays & cameras" },
    { icon: Coffee, title: "Coffee & Refreshments", description: "Complimentary bar" },
    { icon: Shield, title: "24/7 Security", description: "CCTV & access control" },
    { icon: Users, title: "Meeting Rooms", description: "Various sizes available" },
    { icon: Building2, title: "Prime Location", description: "Ayala Avenue, Makati" },
  ];

  const instructions = [
    { icon: MousePointer2, text: t("virtualTour.viewer.instructions") as string },
    { icon: MapPin, text: t("virtualTour.viewer.instructions") as string },
    { icon: Expand, text: t("virtualTour.features.anytime") as string },
    { icon: Rotate3D, text: t("virtualTour.features.immersive") as string },
  ];

  const howToSteps = [
    {
      step: "1",
      title: t("virtualTour.howTo.step1") as string,
      description: t("virtualTour.howTo.step1Desc") as string,
    },
    {
      step: "2",
      title: t("virtualTour.howTo.step2") as string,
      description: t("virtualTour.howTo.step2Desc") as string,
    },
    {
      step: "3",
      title: t("virtualTour.howTo.step3") as string,
      description: t("virtualTour.howTo.step3Desc") as string,
    },
    {
      step: "4",
      title: t("virtualTour.howTo.step4") as string,
      description: t("virtualTour.howTo.step4Desc") as string,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
              <Rotate3D className="w-4 h-4" />
              360° Interactive Experience
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("virtualTour.hero.title") as string}
            </h1>
            <p className="text-xl text-gray-300">
              {t("virtualTour.hero.subtitle") as string}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main 360° Viewer */}
      <section className="py-10 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Immersive360Tour rooms={rooms} isEmbedded={true} />
          </motion.div>

          {/* Quick Instructions */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {instructions.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                <item.icon className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour Locations Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("virtualTour.locations.title") as string}
            </h2>
            <p className="text-lg text-gray-600">
              {t("virtualTour.hero.subtitle") as string}
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            {locationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#1B3A8C] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Locations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tourLocations[activeTab as keyof typeof tourLocations].map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-gray-50 rounded-2xl p-6 hover:bg-[#C5D2EC]/30 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#C5D2EC]/50 rounded-xl flex items-center justify-center group-hover:bg-[#1B3A8C] transition-colors">
                    <Play className="w-5 h-5 text-[#1B3A8C] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{location.title}</h3>
                    <p className="text-sm text-gray-600">{location.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {location.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("virtualTour.cta.title") as string}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t("virtualTour.cta.subtitle") as string}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              {t("virtualTour.cta.bookTour") as string}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              {t("virtualTour.cta.contactUs") as string}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}