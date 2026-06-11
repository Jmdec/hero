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
import Image from "next/image";
import { useState } from "react";

// Dynamic import for the Immersive360Tour to avoid SSR issues
const Immersive360Tour = dynamic(() => import("../../components/PanoramaViewer").then(mod => ({ default: mod.Immersive360Tour })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-150 lg:h-175 bg-gray-900 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
        <p className="text-white">Loading 360° Viewer...</p>
      </div>
    </div>
  ),
});

export default function VirtualTourPage() {
  const [activeTab, setActiveTab] = useState("tower6789");

  const tourLocations = {
    tower6789: [
      {
        id: "lobby",
        title: "Reception Lobby",
        description: "Main Reception Area with Concierge Services",
        features: ["Japanese-speaking Staff", "Visitor Waiting Area", "Comfortable Seating"],
      },
      {
        id: "private-office",
        title: "Private Office",
        description: "Spacious private office with modern amenities",
        features: ["High-speed Internet", "Conference Room Access", "24/7 Security"],
      },
    ],
    insularLife: [
      {
        id: "coworking-space",
        title: "Coworking Space",
        description: "Flexible workspace for freelancers and startups",
        features: ["High-speed Internet", "Printing Services", "Meeting Room Access"],
      },
      {
        id: "meeting-room",
        title: "Meeting Room",
        description: "Spacious room for team meetings and presentations",
        features: ["Large Display", "Video Conferencing", "Comfortable Seating"],
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

  const instructions = [
    { icon: MousePointer2, text: "Click on hotspots for more information." },
    { icon: Rotate3D, text: "Use your mouse to drag and look around. " },
    { icon: MapPin, text: "Navigate between different locations." },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {instructions.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 justify-center">
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
              Tour Locations
            </h2>
            <p className="text-lg text-gray-600">
              Explore our different areas and see what we have to offer.
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            {locationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === tab.id
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
      <section className="py-20 bg-linear-to-r from-[#1B3A8C] to-[#3B5EA6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to See It in person?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Book a tour or contact us for more information about our services and
            amenities.
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