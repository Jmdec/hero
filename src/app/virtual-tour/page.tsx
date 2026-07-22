"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MousePointer2,
  Building2,
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
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const Immersive360Tour = dynamic(
  () => import("../../components/PanoramaViewer").then((mod) => ({ default: mod.Immersive360Tour })));

interface TourRoom {
  id: string;
  name: string;
  description?: string;
  features?: string[];
  panoramaUrl: string;
  connectsTo?: string[];
  thumbnailUrl?: string;
}

type BuildingId = "tower6789" | "insularLife";

export default function VirtualTourPage() {
  const [activeTab, setActiveTab] = useState<BuildingId>("tower6789");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const viewerSectionRef = useRef<HTMLDivElement>(null);

  const locationTabs: { id: BuildingId; label: string; icon: typeof Building2 }[] = [
    { id: "tower6789", label: "Tower 6789", icon: Building2 },
    { id: "insularLife", label: "Insular Life", icon: Building2 },
  ];

  const switchBuilding = (tabId: BuildingId) => {
    setActiveTab(tabId);
    setSelectedRoomId(null);
  };

  // Room connectivity graph 
  const roomsByTab: Record<BuildingId, TourRoom[]> = {
    tower6789: [
      {
        id: "reception",
        name: "Reception",
        description:
          "A welcoming reception area where guests are greeted and assisted by our professional bilingual team.",
        features: [
          "Japanese-speaking reception staff",
          "Guest assistance",
          "Comfortable waiting lounge",
          "Mail & package handling",
        ],
        panoramaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2400&q=85",
        connectsTo: ["hallway-1", "lounge"],
      },
      {
        id: "lounge",
        name: "Lounge",
        description:
          "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.",
        features: ["Comfortable seating", "High-speed Wi-Fi", "Networking area", "Quiet ambiance"],
        panoramaUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
        connectsTo: ["reception", "pantry", "hallway-1"],
      },
      {
        id: "hallway-1",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=2400&q=85",
        connectsTo: ["reception", "lounge", "conference-room-a", "hallway-2"],
      },
      {
        id: "hallway-2",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=2400&q=85",
        connectsTo: ["hallway-1", "conference-room-b", "conference-room-c", "brochure-lockers"],
      },
      {
        id: "conference-room-a",
        name: "Conference Room A",
        description:
          "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_174813_00_060.jpg",
        connectsTo: ["hallway-1"],
      },
      {
        id: "conference-room-b",
        name: "Conference Room B",
        description:
          "A professional meeting space designed for productive discussions, presentations, and business events.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_173158_00_049.jpg",
        connectsTo: ["hallway-2"],
      },
      {
        id: "conference-room-c",
        name: "Conference Room C",
        description:
          "A modern conference room built for meetings, workshops, interviews, and collaborative sessions.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_171813_00_046.jpg",
        connectsTo: ["hallway-2"],
      },
      {
        id: "pantry",
        name: "Pantry",
        description:
          "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.",
        features: ["Complimentary coffee & tea", "Casual seating", "Refreshment area", "Relaxing atmosphere"],
        panoramaUrl: "/360-view/IMG_20210318_183019_00_073.jpg",
        connectsTo: ["lounge", "brochure-lockers"],
      },
      {
        id: "brochure-lockers",
        name: "Brochure & Locker Area",
        description: "A dedicated space with secure lockers and brochure displays for members and visitors.",
        features: ["Secure storage lockers", "Member-only access", "Brochure display", "Clean and organized area"],
        panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
        connectsTo: ["pantry", "hallway-2"],
      },
    ],

    insularLife: [
      {
        id: "reception",
        name: "Reception",
        description:
          "A welcoming reception area where guests are greeted and assisted by our professional bilingual team.",
        features: ["Japanese-speaking reception staff", "Guest assistance", "Mail & package handling", "Reception services"],
        panoramaUrl: "https://images.unsplash.com/photo-1486946255434-2466348c2166?w=2400&q=85",
        connectsTo: ["hallway", "lounge"],
      },
      {
        id: "lounge",
        name: "Lounge",
        description:
          "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.",
        features: ["Comfortable seating", "High-speed Wi-Fi", "Networking area", "Quiet ambiance"],
        panoramaUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
        connectsTo: ["reception", "pantry"],
      },
      {
        id: "meeting-box",
        name: "Meeting Box",
        description:
          "A private meeting space designed for focused discussions, virtual meetings, and client consultations.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Private setting"],
        panoramaUrl: "/360-view/IMG_20210318_154223_00_039.jpg",
        connectsTo: ["hallway"],
      },
      {
        id: "hallway",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210318_133045_00_019.jpg",
        connectsTo: ["reception", "meeting-box", "conference-room-a", "conference-room-b", "mailbox"],
      },
      {
        id: "conference-room-a",
        name: "Conference Room A",
        description:
          "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_134026_00_023.jpg",
        connectsTo: ["hallway"],
      },
      {
        id: "conference-room-b",
        name: "Conference Room B",
        description:
          "A professional meeting space designed for productive discussions, presentations, and business events.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_134026_00_023.jpg",
        connectsTo: ["hallway"],
      },
      {
        id: "pantry",
        name: "Pantry",
        description:
          "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.",
        features: ["Complimentary coffee & tea", "Casual seating", "Refreshment area", "Relaxing atmosphere"],
        panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
        connectsTo: ["lounge", "mailbox"],
      },
      {
        id: "mailbox",
        name: "Mailbox",
        description:
          "A secure business mailing service for receiving and managing your correspondence with ease.",
        features: ["Professional business address", "Mail receiving", "Package handling", "Mail notifications"],
        panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
        connectsTo: ["hallway", "pantry"],
      },
    ],
  };

  // Featured rooms
  const FEATURED_ROOM_IDS: Record<BuildingId, string[]> = {
    tower6789: ["reception", "lounge", "conference-room-a", "conference-room-b", "pantry"],
    insularLife: ["reception", "lounge", "meeting-box", "conference-room-a", "pantry"],
  };

  const activeRooms = roomsByTab[activeTab];

  const featuredRooms = FEATURED_ROOM_IDS[activeTab]
    .map((id) => activeRooms.find((r) => r.id === id))
    .filter((r): r is TourRoom => Boolean(r));

  // Put the selected room first so the viewer opens directly on it.
  // If the selected room isn't one of the featured rooms (e.g. the visitor
  // walked into a hallway via a hotspot), fall back to showing the full
  // featured list without reordering.
  const orderedRooms = selectedRoomId && featuredRooms.some((r) => r.id === selectedRoomId)
    ? [...featuredRooms].sort((a, b) => {
      if (a.id === selectedRoomId) return -1;
      if (b.id === selectedRoomId) return 1;
      return 0;
    })
    : featuredRooms;

  return (
    <main>
      {/* 360° viewer */}
      <section ref={viewerSectionRef} className="bg-gray-50 scroll-mt-24">
        <div>
          {/* 360° viewer panel */}
          <div className="relative scroll-mt-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={`viewer-${activeTab}-${selectedRoomId}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25 }}
              >
                <Immersive360Tour
                  rooms={orderedRooms}
                  allRooms={activeRooms}
                  initialRoomId={selectedRoomId ?? undefined}
                  isEmbedded={true}
                  buildingTabs={locationTabs}
                  activeBuildingId={activeTab}
                  onSwitchBuilding={(id) => switchBuilding(id as BuildingId)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}