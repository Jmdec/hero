"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
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
  thumbnailUrl?: string[];
  hotspots?: Array<{
    targetId: string;
    targetName: string;
    lon: number;
    lat: number;
    label?: string;
  }>;
}

type BuildingId = "tower6789" | "insularLife";

export default function VirtualTourPage() {
  const [activeTab, setActiveTab] = useState<BuildingId>("insularLife");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const viewerSectionRef = useRef<HTMLDivElement>(null);

  const locationTabs: { id: BuildingId; label: string; icon: typeof Building2 }[] = [
    { id: "insularLife", label: "Insular Life", icon: Building2 },
    { id: "tower6789", label: "Tower 6789", icon: Building2 },
  ];

  const switchBuilding = (tabId: BuildingId) => {
    setActiveTab(tabId);
    setSelectedRoomId(null);
  };

  // Room connectivity graph 
  const roomsByTab: Record<BuildingId, TourRoom[]> = {
    insularLife: [
      {
        id: "reception",
        name: "Reception",
        description:
          "A welcoming reception area where guests are greeted and assisted by our professional bilingual team.",
        features: ["Japanese-speaking reception staff", "Guest assistance", "Mail & package handling", "Reception services"],
        panoramaUrl: "/360-view/IMG_20210422_174408_00_124.webp",
        thumbnailUrl: [
          "/360-view/insular-reception.webp",
          "/360-view/_ARM9618.webp"
        ],
        connectsTo: ["hallway-2", "lounge"],
        hotspots: [
          { targetId: "", targetName: "Brochure", lon: 80, lat: 2, label: "Brochure Area" },
          { targetId: "lounge", targetName: "Lounge", lon: 120, lat: -12, label: "Step into the lounge" },
          { targetId: "hallway-2", targetName: "Hallway", lon: -120, lat: -8, label: "Continue down the corridor" },
        ],
      },
      {
        id: "lounge",
        name: "Lounge",
        description:
          "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.",
        features: ["Comfortable seating", "High-speed Wi-Fi", "Networking area", "Quiet ambiance"],
        panoramaUrl: "/360-view/IMG_20210422_174807_00_125.webp",
        thumbnailUrl: [
          "/360-view/_ARM9675.webp"
        ],
        connectsTo: ["reception", "pantry", "hallway-1"],
        hotspots: [
          { targetId: "", targetName: "Phone Booth", lon: -120, lat: 2, label: "Phone Booth" },
          { targetId: "reception", targetName: "Reception", lon: 70, lat: 0, label: "Return to reception" },
          { targetId: "pantry", targetName: "Pantry", lon: 15, lat: -10, label: "Visit the pantry" },
          { targetId: "hallway-1", targetName: "Hallway", lon: -60, lat: 0, label: "Continue down the Hallway" },
        ],
      },
      {
        id: "conference-room-a",
        name: "Conference Room A",
        description:
          "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210422_175054_00_126.webp",
        thumbnailUrl: [
          "/360-view/_ARM9682_DENOISED.webp",
          "/360-view/conference_room_high_resolution.webp"
        ],
        connectsTo: ["hallway-1"],
        hotspots: [
          { targetId: "hallway-1", targetName: "Hallway", lon: -20, lat: -10, label: "Return to the main corridor" },
        ],
      },
      {
        id: "conference-room-b",
        name: "Conference Room B",
        description:
          "A professional meeting space designed for productive discussions, presentations, and business events.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210422_175212_00_127.webp",
        thumbnailUrl: [
          "/360-view/conference_room_tv_high_resolution.webp",
        ],
        connectsTo: ["hallway-1"],
        hotspots: [
          { targetId: "hallway-1", targetName: "Hallway", lon: -20, lat: -10, label: "Go back to the hallway" },
        ],
      },
      {
        id: "hallway-1",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210318_133045_00_019.webp",
        connectsTo: ["pantry", "conference-room-a", "hallway-2"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: 10, lat: -5, label: "Go back to Reception" },
          { targetId: "conference-room-b", targetName: "Conference Room B", lon: -20, lat: -10, label: "Visit Conference Room B" },
          { targetId: "hallway-2", targetName: "Hallway", lon: -200, lat: -5, label: "Go to other Hallway" },
        ],
      },
      {
        id: "hallway-2",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210422_182346_00_133.webp",
        connectsTo: ["hallway-1", "conference-room-a", "pantry"],
        hotspots: [
          { targetId: "pantry", targetName: "Pantry", lon: -175, lat: -5, label: "Go to Pantry Area" },
          { targetId: "conference-room-a", targetName: "Conference Room A", lon: -130, lat: -5, label: "Visit Conference Room A" },
          { targetId: "hallway-1", targetName: "Hallway", lon: -15, lat: -5, label: "Go to other Hallway" },
        ],
      },
      {
        id: "pantry",
        name: "Pantry",
        description:
          "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.",
        features: ["Complimentary coffee & tea", "Casual seating", "Refreshment area", "Relaxing atmosphere"],
        panoramaUrl: "/360-view/IMG_20210318_155931_00_043.webp",
        thumbnailUrl: [
          "/360-view/_ARM7477.webp",
          "/360-view/_ARM7474.webp",
        ],
        connectsTo: ["hallway-1", "hallway-2", "lounge"],
        hotspots: [
          { targetId: "lounge", targetName: "Lounge", lon: 10, lat: -9, label: "Head back to the lounge" },
          { targetId: "", targetName: "Drop Box", lon: -25, lat: -5, label: "Drop Box" },
          { targetId: "hallway-1", targetName: "Hallway", lon: 95, lat: 0, label: "Go back to the main corridor" },
          { targetId: "hallway-2", targetName: "Hallway", lon: -60, lat: 0, label: "Go back to the hallway" },
        ],
      },
    ],

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
        panoramaUrl: "/360-view/IMG_20210429_161245_00_142.webp",
        thumbnailUrl: [
          "/360-view/_ARM7593.webp",
          "/360-view/_ARM8130.webp"
        ],
        connectsTo: ["pantry", "lounge", "conference-room-a", "conference-room-b"],
        hotspots: [
          { targetId: "lounge", targetName: "Lounge", lon: -120, lat: -12, label: "Enter the lounge" },
          { targetId: "pantry", targetName: "Pantry", lon: 0, lat: 0, label: "Go to the pantry" },
          { targetId: "conference-room-a", targetName: "Conference Room A", lon: -140, lat: 0, label: "Visit Conference Room A" },
          { targetId: "conference-room-b", targetName: "Conference Room B", lon: 140, lat: 0, label: "Visit Conference Room B" },
        ],
      },
      {
        id: "lounge",
        name: "Lounge",
        description:
          "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.",
        features: ["Comfortable seating", "High-speed Wi-Fi", "Networking area", "Quiet ambiance"],
        panoramaUrl: "/360-view/IMG_20210429_162117_00_143.webp",
        thumbnailUrl: [
          "/360-view/_ARM7597.webp",
          "/360-view/_ARM7582.webp",
        ],
        connectsTo: ["reception", "hallway-1", "conference-room-a"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: -160, lat: -10, label: "Return to reception" },
          { targetId: "hallway-1", targetName: "Hallway", lon: 185, lat: 0, label: "Continue down the hall" },
          { targetId: "conference-room-a", targetName: "Conference Room A", lon: -100, lat: 0, label: "Visit Conference Room A" },
          { targetId: "", targetName: "Brochure Area", lon: 40, lat: 0, label: "Brochure" },
        ],
      },
      {
        id: "hallway-1",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210318_174407_00_055.webp",
        connectsTo: ["conference-room-c", "hallway-2"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: -5, lat: 0, label: "Return to reception" },
          { targetId: "conference-room-c", targetName: "Conference Room C", lon: -60, lat: -10, label: "Visit Conference Room C" },
          { targetId: "hallway-2", targetName: "Hallway", lon: -180, lat: 0, label: "Continue deeper into the floor" },
        ],
      },
      {
        id: "hallway-2",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210429_171553_00_158.webp",
        connectsTo: ["hallway-1", "pantry"],
        hotspots: [
          { targetId: "hallway-1", targetName: "Hallway", lon: -180, lat: -9, label: "Return to the main hall" },
          { targetId: "pantry", targetName: "Pantry", lon: 0, lat: 0, label: "See the pantry" },
        ],
      },
      {
        id: "conference-room-a",
        name: "Conference Room A",
        description:
          "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_174813_00_060.webp",
        thumbnailUrl: [
          "",
        ],
        connectsTo: ["hallway-1"],
        hotspots: [
          { targetId: "hallway-1", targetName: "Hallway", lon: 80, lat: -10, label: "Go back to the hallway" },
        ],
      },
      {
        id: "conference-room-b",
        name: "Conference Room B",
        description:
          "A professional meeting space designed for productive discussions, presentations, and business events.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_173158_00_049.webp",
        thumbnailUrl: [
          "/360-view/_ARM7558.webp",
        ],
        connectsTo: ["hallway-2"],
        hotspots: [
          { targetId: "hallway-2", targetName: "Hallway", lon: 90, lat: -10, label: "Return to the hall" },
        ],
      },
      {
        id: "conference-room-c",
        name: "Conference Room C",
        description:
          "A modern conference room built for meetings, workshops, interviews, and collaborative sessions.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
        panoramaUrl: "/360-view/IMG_20210318_171738_00_045.webp",
        thumbnailUrl: [
          "/360-view/meeting-room.webp",
        ],
        connectsTo: ["hallway-2"],
        hotspots: [
          { targetId: "hallway-2", targetName: "Hallway", lon: -90, lat: -10, label: "Go back to the hall" },
        ],
      },
      {
        id: "pantry",
        name: "Pantry",
        description:
          "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.",
        features: ["Complimentary coffee & tea", "Casual seating", "Refreshment area", "Relaxing atmosphere"],
        panoramaUrl: "/360-view/IMG_20210318_183019_00_073.webp",
        thumbnailUrl: [
          "/360-view/_ARM7611.webp",
          "/360-view/_ARM7603.webp",
        ],
        connectsTo: ["reception", "hallway-2"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: -10, lat: 0, label: "Head back to the Reception" },
          { targetId: "hallway-2", targetName: "Hallway", lon: 80, lat: 0, label: "Go back to the hall" },
          { targetId: "", targetName: "Phone Booth", lon: -40, lat: 0, label: "Phone Booth" },
        ],
      },
    ],
  };

  // Featured rooms
  const FEATURED_ROOM_IDS: Record<BuildingId, string[]> = {
    insularLife: ["reception", "lounge", "phonebooth", "conference-room-a", "conference-room-b", "pantry"],
    tower6789: ["reception", "lounge", "conference-room-a", "conference-room-b", "pantry"],
  };

  const activeRooms = roomsByTab[activeTab];

  const featuredRooms = FEATURED_ROOM_IDS[activeTab]
    .map((id) => activeRooms.find((r) => r.id === id))
    .filter((r): r is TourRoom => Boolean(r));

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