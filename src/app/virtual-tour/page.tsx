"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  MapPin,
  ArrowLeft,
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
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Minus,
  Compass,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const Immersive360Tour = dynamic(
  () => import("../../components/PanoramaViewer").then((mod) => ({ default: mod.Immersive360Tour })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 sm:h-105 md:h-125 lg:h-140 bg-[#0f172a] rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-[3px] border-[#FFC107] border-t-transparent mx-auto mb-3 sm:mb-4" />
          <p className="text-white/60 text-xs sm:text-sm">Loading 360° viewer…</p>
        </div>
      </div>
    ),
  }
);

// Floor plan hotspot

interface FloorPlanHotspot {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface FloorPlanData {
  src: string;
  alt: string;
  width: number;
  height: number;
  hotspots: FloorPlanHotspot[];
}

interface TourRoom {
  id: string;
  name: string;
  panoramaUrl: string;
}

// ── Floor plan viewer: zoom via buttons + drag to pan, SVG room highlighting, hover thumbnails, fullscreen ──

const DEFAULT_REGION_W = 16;
const DEFAULT_REGION_H = 12;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

function FloorPlanViewer({
  floorPlan,
  activeRoomId,
  onSelectRoom,
}: {
  floorPlan: FloorPlanData;
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isPanning = useRef(false);
  const didDrag = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Reset zoom/pan whenever the building/floor plan changes.

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  const zoomBy = (delta: number) => {
    setScale((prev) => {
      const next = clampScale(prev + delta);
      if (next === MIN_SCALE) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Note: intentionally no wheel/scroll zoom handler here. Zooming the floor
  // plan is done exclusively via the +/- buttons so that scrolling the page
  // while the cursor happens to be over the floor plan behaves like normal
  // page scroll. Dragging still pans the plan once zoomed in.

  const onPointerDown = (e: React.PointerEvent) => {
    isPanning.current = true;
    didDrag.current = false;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
    if (scale > 1) {
      setPan((prev) => ({ x: prev.x + dx / scale, y: prev.y + dy / scale }));
    }
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    isPanning.current = false;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleHotspotClick = (id: string) => {
    if (didDrag.current) return; // ignore clicks that were actually a drag/pan
    onSelectRoom(id);
  };

  const controlButtonClass =
    "w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white/90 border border-gray-200 text-gray-600 shadow-sm hover:bg-white hover:text-[#1B3A8C] hover:border-gray-300 transition-colors backdrop-blur-sm";

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-white ${isFullscreen ? "h-screen bg-white" : ""
        }`}
      style={!isFullscreen ? { aspectRatio: `${floorPlan.width} / ${floorPlan.height}` } : undefined}
    >
      {/* Pannable / zoomable layer */}
      <div
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out",
        }}
      >
        <Image src={floorPlan.src} alt={floorPlan.alt} fill className="object-contain" unoptimized />

        {/* Room region highlights */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {floorPlan.hotspots.map((h) => {
            const isActive = activeRoomId === h.id;
            const isHovered = hoveredId === h.id;
            return (
              <rect
                key={h.id}
                x={h.x - DEFAULT_REGION_W / 2}
                y={h.y - DEFAULT_REGION_H / 2}
                rx={2}
                vectorEffect="non-scaling-stroke"
                style={{
                  cursor: "pointer",
                  fill: isActive
                    ? "rgba(27, 58, 140, 0.22)"
                    : isHovered
                      ? "rgba(27, 58, 140, 0.12)"
                      : "rgba(27, 58, 140, 0)",
                  stroke: isActive ? "#1B3A8C" : isHovered ? "#1B3A8C" : "rgba(27, 58, 140, 0.35)",
                  strokeWidth: isActive ? 1.5 : 1,
                  strokeDasharray: isActive ? "none" : "3 2",
                  transition: "fill 0.15s ease, stroke 0.15s ease",
                }}
                onMouseEnter={() => setHoveredId(h.id)}
                onMouseLeave={() => setHoveredId((cur) => (cur === h.id ? null : cur))}
                onClick={() => handleHotspotClick(h.id)}
              />
            );
          })}
        </svg>

        {/* Marker dots + labels (kept from the original design, now also active-aware) */}
        {floorPlan.hotspots.map((h) => {
          const isActive = activeRoomId === h.id;
          return (
            <button
              key={h.id}
              onClick={() => handleHotspotClick(h.id)}
              onMouseEnter={() => setHoveredId(h.id)}
              onMouseLeave={() => setHoveredId((cur) => (cur === h.id ? null : cur))}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              className="group/hotspot absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none p-2 -m-2"
              aria-label={`View ${h.label} in 360°`}
            >
              <span className="relative flex h-4 w-4">
                {isActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC107] opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-4 w-4 rounded-full ring-2 ring-white shadow-md group-hover/hotspot:scale-110 transition-transform ${isActive ? "bg-[#C9A15D]" : "bg-[#1B3A8C]"
                    }`}
                />
              </span>

              {/* Hover thumbnail preview — counter-scaled so it stays a consistent size while zoomed */}
              <AnimatePresence>
                {hoveredId === h.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    style={{ transform: `scale(${1 / scale})`, transformOrigin: "bottom center" }}
                    className="absolute bottom-full mb-2 w-32 rounded-lg overflow-hidden shadow-xl ring-1 ring-black/10 pointer-events-none"
                  >
                    <div className="bg-[#0f172a] text-white text-lg text-center py-1">
                      {h.label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Zoom + fullscreen controls (unscaled, pinned to the outer frame) */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
        <button className={controlButtonClass} onClick={() => zoomBy(0.4)} title="Zoom in">
          <Plus className="w-4 h-4" />
        </button>
        <button className={controlButtonClass} onClick={() => zoomBy(-0.4)} title="Zoom out">
          <Minus className="w-4 h-4" />
        </button>
        <button className={controlButtonClass} onClick={resetView} title="Reset view">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <button
        className={`absolute top-3 right-3 z-20 ${controlButtonClass}`}
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {scale > 1 && (
        <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-md bg-white/90 border border-gray-200 text-[11px] font-medium text-gray-600 backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}

export default function VirtualTourPage() {
  const [activeTab, setActiveTab] = useState("tower6789");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const viewerSectionRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<HTMLDivElement>(null);

  const tourLocations = {
    tower6789: [
      {
        id: "reception",
        title: "Reception",
        description:
          "A welcoming reception area where guests are greeted and assisted by our professional bilingual team.",
        features: [
          "Japanese-speaking reception staff",
          "Guest assistance",
          "Comfortable waiting lounge",
          "Mail & package handling",
        ],
      },
      {
        id: "conference-room-a",
        title: "Conference Room A",
        description:
          "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
      },
      {
        id: "conference-room-b",
        title: "Conference Room B",
        description:
          "A professional meeting space designed for productive discussions, presentations, and business events.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
      },
      {
        id: "conference-room-c",
        title: "Conference Room C",
        description:
          "A modern conference room built for meetings, workshops, interviews, and collaborative sessions.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
      },
      {
        id: "pantry",
        title: "Pantry",
        description:
          "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.",
        features: ["Complimentary coffee & tea", "Casual seating", "Refreshment area", "Relaxing atmosphere"],
      },
      {
        id: "lounge",
        title: "Lounge",
        description:
          "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.",
        features: ["Comfortable seating", "High-speed Wi-Fi", "Networking area", "Quiet ambiance"],
      },
      {
        id: "brochure-lockers",
        title: "Brochure & Locker Area",
        description:
          "A dedicated space with secure lockers and brochure displays for members and visitors.",
        features: ["Secure storage lockers", "Member-only access", "Brochure display", "Clean and organized area"],
      },
      {
        id: "hallway-1",
        title: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
      },
      // {
      //   id: "two-seats-corridor",
      //   title: "2 Seats (Corridor)",
      //   description: "A compact private office along the corridor, suited for a small team of two.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Private workspace", "Corridor access"],
      // },
      // {
      //   id: "four-seats-corridor",
      //   title: "4 Seats (Corridor)",
      //   description: "A private office along the corridor designed for a team of four.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Collaborative workspace", "Corridor access"],
      // },
      // {
      //   id: "six-seats-corridor",
      //   title: "6 Seats (Corridor)",
      //   description: "A private office along the corridor designed for a team of six.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Collaborative workspace", "Corridor access"],
      // },
      // {
      //   id: "eight-seats-corridor",
      //   title: "8 Seats (Corridor)",
      //   description: "A spacious corridor-facing workspace comfortably designed for teams of up to eight.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Collaborative workspace", "Corridor access"],
      // },
      // {
      //   id: "fifteen-seats-corridor",
      //   title: "15 Seats (Corridor)",
      //   description: "A large corridor-facing office suite tailored for growing teams.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Team collaboration area", "Corridor access"],
      // },
      // {
      //   id: "twentyfive-seats-corridor",
      //   title: "25 Seats (Corridor)",
      //   description: "A large-scale corridor-facing office suite designed for sizeable teams.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Team collaboration area", "Corridor access"],
      // },
      // {
      //   id: "four-seats-window",
      //   title: "4 Seats (Window)",
      //   description: "A window-side private office designed for a team of four.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "six-seats-window",
      //   title: "6 Seats (Window)",
      //   description: "A window-side private office designed for a team of six.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "ten-seats-window",
      //   title: "10 Seats (Window)",
      //   description: "A window-side office suite designed for a team of ten.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "fifteen-seats-window",
      //   title: "15 Seats (Window)",
      //   description: "A window-side office suite designed for growing teams of up to fifteen.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "twentyfive-seats-window",
      //   title: "25 Seats (Window)",
      //   description: "A large window-side office suite designed for sizeable teams.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
    ],

    insularLife: [
      {
        id: "reception",
        title: "Reception",
        description:
          "A welcoming reception area where guests are greeted and assisted by our professional bilingual team.",
        features: ["Japanese-speaking reception staff", "Guest assistance", "Mail & package handling", "Reception services"],
      },
      {
        id: "lounge",
        title: "Lounge",
        description:
          "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.",
        features: ["Comfortable seating", "High-speed Wi-Fi", "Networking area", "Quiet ambiance"],
      },
      {
        id: "conference-room-a",
        title: "Conference Room A",
        description:
          "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Flexible seating"],
      },
      {
        id: "conference-room-b",
        title: "Conference Room B",
        description:
          "A professional meeting space designed for productive discussions, presentations, and business events.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Flexible seating"],
      },
      {
        id: "meeting-box",
        title: "Meeting Box",
        description:
          "A private meeting space designed for focused discussions, virtual meetings, and client consultations.",
        features: ["Presentation display", "Video conferencing", "High-speed Wi-Fi", "Private setting"],
      },
      {
        id: "pantry",
        title: "Pantry",
        description:
          "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.",
        features: ["Complimentary coffee & tea", "Casual seating", "Refreshment area", "Relaxing atmosphere"],
      },
      {
        id: "mailbox",
        title: "Mailbox",
        description:
          "A secure business mailing service for receiving and managing your correspondence with ease.",
        features: ["Professional business address", "Mail receiving", "Package handling", "Mail notifications"],
      },
      {
        id: "hallway",
        title: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
      },
      // {
      //   id: "five-seats-corridor",
      //   title: "5 Seats (Corridor)",
      //   description: "A private office along the corridor designed for a team of five.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Collaborative workspace", "Corridor access"],
      // },
      // {
      //   id: "ten-seats-corridor",
      //   title: "10 Seats (Corridor)",
      //   description: "A private office along the corridor designed for a team of ten.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Collaborative workspace", "Corridor access"],
      // },
      // {
      //   id: "twelve-seats-corridor",
      //   title: "12 Seats (Corridor)",
      //   description: "A spacious corridor-facing office suite designed for a team of twelve.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Team collaboration area", "Corridor access"],
      // },
      // {
      //   id: "fifteen-seats-corridor",
      //   title: "15 Seats (Corridor)",
      //   description: "A large corridor-facing office suite designed for growing teams.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Team collaboration area", "Corridor access"],
      // },
      // {
      //   id: "twenty-seats-corridor",
      //   title: "20 Seats (Corridor)",
      //   description: "A large-scale corridor-facing office suite designed for sizeable teams.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Team collaboration area", "Corridor access"],
      // },
      // {
      //   id: "two-seats-window",
      //   title: "2 Seats (Window)",
      //   description: "A compact window-side private office suited for a small team of two.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "four-seats-window",
      //   title: "4 Seats (Window)",
      //   description: "A window-side private office designed for a team of four.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "eight-seats-window",
      //   title: "8 Seats (Window)",
      //   description: "A spacious window-side workspace comfortably designed for teams of up to eight.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "ten-seats-window",
      //   title: "10 Seats (Window)",
      //   description: "A window-side office suite designed for a team of ten.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "twelve-seats-window",
      //   title: "12 Seats (Window)",
      //   description: "A window-side office suite designed for a team of twelve.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "fifteen-seats-window",
      //   title: "15 Seats (Window)",
      //   description: "A window-side office suite designed for growing teams of up to fifteen.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "twenty-seats-window",
      //   title: "20 Seats (Window)",
      //   description: "A large window-side office suite designed for a team of twenty.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "twentyfive-seats-window",
      //   title: "25 Seats (Window)",
      //   description: "A large window-side office suite designed for sizeable teams.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
      // {
      //   id: "thirty-seats-window",
      //   title: "30 Seats (Window)",
      //   description: "A large-scale window-side office suite designed for sizeable teams.",
      //   features: ["Ergonomic seating", "High-speed Wi-Fi", "Natural light", "Window view"],
      // },
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
      "conference Rooms",
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
    "conference Rooms": <Video className="w-3.5 h-3.5" />,
    "Mail Handling": <Mail className="w-3.5 h-3.5" />,
    "Café & Pantry": <Coffee className="w-3.5 h-3.5" />,
    "Business Lounge": <Armchair className="w-3.5 h-3.5" />,
    "Secure Lockers": <Lock className="w-3.5 h-3.5" />,
  };

  const roomsByTab: Record<string, TourRoom[]> = {
    tower6789: [
      {
        id: "reception",
        name: "Reception",
        panoramaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2400&q=85",
      },
      {
        id: "lounge",
        name: "Lounge",
        panoramaUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
      },
      {
        id: "hallway-1",
        name: "Hallway",
        panoramaUrl: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=2400&q=85",
      },
      {
        id: "hallway-2",
        name: "Hallway",
        panoramaUrl: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=2400&q=85",
      },
      {
        id: "conference-room-a",
        name: "Conference Room A",
        panoramaUrl: "/360-view/IMG_20210318_174813_00_060.jpg",
      },
      {
        id: "conference-room-b",
        name: "Conference Room B",
        panoramaUrl: "/360-view/IMG_20210318_173158_00_049.jpg",
      },
      {
        id: "conference-room-c",
        name: "Conference Room C",
        panoramaUrl: "/360-view/IMG_20210318_171813_00_046.jpg",
      },
      {
        id: "pantry",
        name: "Pantry",
        panoramaUrl: "/360-view/IMG_20210318_183019_00_073.jpg",
      },
      {
        id: "brochure-lockers",
        name: "Brochure & Locker Area",
        panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      },
      // {
      //   id: "two-seats-corridor",
      //   name: "2 Seats (Corridor)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "four-seats-corridor",
      //   name: "4 Seats (Corridor)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "six-seats-corridor",
      //   name: "6 Seats (Corridor)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "eight-seats-corridor",
      //   name: "8 Seats (Corridor)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "fifteen-seats-corridor",
      //   name: "15 Seats (Corridor)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "twentyfive-seats-corridor",
      //   name: "25 Seats (Corridor)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "four-seats-window",
      //   name: "4 Seats (Window)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "six-seats-window",
      //   name: "6 Seats (Window)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "ten-seats-window",
      //   name: "10 Seats (Window)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "fifteen-seats-window",
      //   name: "15 Seats (Window)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
      // {
      //   id: "twentyfive-seats-window",
      //   name: "25 Seats (Window)",
      //   panoramaUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2400&q=85",
      // },
    ],

    insularLife: [
      {
        id: "reception",
        name: "Reception",
        panoramaUrl: "https://images.unsplash.com/photo-1486946255434-2466348c2166?w=2400&q=85",
      },
      {
        id: "lounge",
        name: "Lounge",
        panoramaUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
      },
      {
        id: "meeting-box",
        name: "Meeting Box",
        panoramaUrl: "/360-view/IMG_20210318_154223_00_039.jpg",
      },
      {
        id: "hallway",
        name: "Hallway",
        panoramaUrl: "/360-view/IMG_20210318_133045_00_019.jpg",
      },
      {
        id: "conference-room-a",
        name: "Conference Room A",
        panoramaUrl: "/360-view/IMG_20210318_134026_00_023.jpg",
      },
      {
        id: "conference-room-b",
        name: "Conference Room B",
        panoramaUrl: "/360-view/IMG_20210318_134026_00_023.jpg",
      },
      {
        id: "pantry",
        name: "Pantry",
        panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      },
      {
        id: "mailbox",
        name: "Mailbox",
        panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      },
      // {
      //   id: "five-seats-corridor",
      //   name: "5 Seats (Corridor)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "ten-seats-corridor",
      //   name: "10 Seats (Corridor)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "twelve-seats-corridor",
      //   name: "12 Seats (Corridor)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "fifteen-seats-corridor",
      //   name: "15 Seats (Corridor)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "twenty-seats-corridor",
      //   name: "20 Seats (Corridor)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "two-seats-window",
      //   name: "2 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "four-seats-window",
      //   name: "4 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "eight-seats-window",
      //   name: "8 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "ten-seats-window",
      //   name: "10 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "twelve-seats-window",
      //   name: "12 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "fifteen-seats-window",
      //   name: "15 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "twenty-seats-window",
      //   name: "20 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "twentyfive-seats-window",
      //   name: "25 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
      // {
      //   id: "thirty-seats-window",
      //   name: "30 Seats (Window)",
      //   panoramaUrl: "/360-view/IMG_20210318_155931_00_043.jpg",
      // },
    ],
  };

  const floorPlans: Record<string, FloorPlanData> = {
    tower6789: {
      src: "/tower6789-layout.jpg",
      alt: "Tower 6789 floor layout",
      width: 1054,
      height: 1054,
      hotspots: [
        { id: "reception", label: "Reception", x: 50, y: 13.5 },
        { id: "conference-room-a", label: "Conference Room A", x: 69, y: 6 },
        { id: "conference-room-b", label: "Conference Room B", x: 31.5, y: 6 },
        { id: "conference-room-c", label: "Conference Room C", x: 21, y: 75 },
        { id: "pantry", label: "Pantry", x: 50, y: 54 },
        { id: "lounge", label: "Lounge", x: 39, y: 21 },
        { id: "brochure-lockers", label: "Brochure & Locker Area", x: 76, y: 21 },
        { id: "hallway-1", label: "Hallway", x: 15, y: 50 },
        { id: "hallway-2", label: "Hallway", x: 86, y: 50 },
        // { id: "two-seats-corridor", label: "2 Seats (Corridor)", x: 90, y: 45 },
        // { id: "four-seats-corridor", label: "4 Seats (Corridor)", x: 90, y: 45 },
        // { id: "six-seats-corridor", label: "6 Seats (Corridor)", x: 90, y: 45 },
        // { id: "eight-seats-corridor", label: "8 Seats (Corridor)", x: 90, y: 45 },
        // { id: "fifteen-seats-corridor", label: "15 Seats (Corridor)", x: 90, y: 45 },
        // { id: "twentyfive-seats-corridor", label: "25 Seats (Corridor)", x: 90, y: 45 },
        // { id: "four-seats-window", label: "4 Seats (Window)", x: 90, y: 45 },
        // { id: "six-seats-window", label: "6 Seats (Window)", x: 90, y: 45 },
        // { id: "ten-seats-window", label: "10 Seats (Window)", x: 90, y: 45 },
        // { id: "fifteen-seats-window", label: "15 Seats (Window)", x: 90, y: 45 },
        // { id: "twentyfive-seats-window", label: "25 Seats (Window)", x: 90, y: 45 },
      ],
    },
    insularLife: {
      src: "/insular-life-layout.jpg",
      alt: "Insular Life floor layout",
      width: 1631,
      height: 964,
      hotspots: [
        { id: "reception", label: "Reception", x: 58, y: 46 },
        { id: "lounge", label: "Lounge", x: 52, y: 55 },
        { id: "conference-room-a", label: "Conference Room A", x: 48, y: 38 },
        { id: "conference-room-b", label: "Conference Room B", x: 40, y: 38 },
        { id: "meeting-box", label: "Meeting Box", x: 50, y: 50 },
        { id: "Pantry", label: "Pantry", x: 55, y: 20 },
        { id: "mailbox", label: "Mailbox", x: 48, y: 30 },
        { id: "hallway", label: "Hallway", x: 40, y: 48 },
        // { id: "five-seats-corridor", label: "5 Seats (Corridor)", x: 20, y: 50 },
        // { id: "ten-seats-corridor", label: "10 Seats (Corridor)", x: 20, y: 50 },
        // { id: "twelve-seats-corridor", label: "12 Seats (Corridor)", x: 20, y: 50 },
        // { id: "fifteen-seats-corridor", label: "15 Seats (Corridor)", x: 20, y: 50 },
        // { id: "twenty-seats-corridor", label: "20 Seats (Corridor)", x: 20, y: 50 },
        // { id: "two-seats-window", label: "2 Seats (Window)", x: 62, y: 38 },
        // { id: "four-seats-window", label: "4 Seats (Window)", x: 62, y: 38 },
        // { id: "eight-seats-window", label: "8 Seats (Window)", x: 62, y: 38 },
        // { id: "ten-seats-window", label: "10 Seats (Window)", x: 62, y: 38 },
        // { id: "twelve-seats-window", label: "12 Seats (Window)", x: 62, y: 38 },
        // { id: "fifteen-seats-window", label: "15 Seats (Window)", x: 62, y: 38 },
        // { id: "twenty-seats-window", label: "20 Seats (Window)", x: 62, y: 38 },
        // { id: "twentyfive-seats-window", label: "25 Seats (Window)", x: 62, y: 38 },
        // { id: "thirty-seats-window", label: "30 Seats (Window)", x: 62, y: 38 },
      ],
    },
  };

  const instructions = [
    { icon: MapPin, text: "Click a marker to enter that room" },
    { icon: Compass, text: "Drag the floor plan to pan; use +/- to zoom it" },
    { icon: MousePointer2, text: "Click into the 360° view, then drag to look around and scroll to zoom" },
    { icon: Maximize2, text: "Use the fullscreen icon for an immersive view" },
  ];

  const activeRooms = roomsByTab[activeTab as keyof typeof roomsByTab];
  const activeFloorPlan = floorPlans[activeTab as keyof typeof floorPlans];

  // Put the selected room first so the viewer opens directly on it.
  const orderedRooms = selectedRoomId
    ? [...activeRooms].sort((a, b) => {
      if (a.id === selectedRoomId) return -1;
      if (b.id === selectedRoomId) return 1;
      return 0;
    })
    : activeRooms;

  const goToRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    requestAnimationFrame(() => {
      panoramaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const switchBuilding = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedRoomId(null);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative text-white py-14 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Virtual Office tour
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300">
              Explore our state-of-the-art facilities from the comfort of your home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Floor plan + 360° viewer ── */}
      <section ref={viewerSectionRef} className="py-8 sm:py-10 md:py-12 bg-gray-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Location tabs */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {locationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchBuilding(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${activeTab === tab.id
                  ? "bg-[#1B3A8C] text-white border-[#1B3A8C] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 360° viewer panel */}
          <div ref={panoramaRef} className="relative scroll-mt-24">
            <AnimatePresence mode="wait">
              {selectedRoomId === null ? (
                /* ── Floor plan with clickable hotspots ── */
                <motion.div
                  key={`floorplan-${activeTab}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-white"
                  style={{ aspectRatio: `${activeFloorPlan.width} / ${activeFloorPlan.height}` }}
                >
                  <Image
                    src={activeFloorPlan.src}
                    alt={activeFloorPlan.alt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {activeFloorPlan.hotspots.map((hotspot) => (
                    <button
                      key={hotspot.id}
                      onClick={() => goToRoom(hotspot.id)}
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                      className="group/hotspot absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none"
                      aria-label={`View ${hotspot.label} in 360°`}
                    >
                      <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B3A8C] opacity-60" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-[#1B3A8C] ring-2 ring-white shadow-md group-hover/hotspot:scale-110 transition-transform" />
                      </span>
                      <span className="mt-1.5 px-2 py-1 rounded-md bg-[#0f172a] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover/hotspot:opacity-100 group-focus/hotspot:opacity-100 transition-opacity shadow-lg pointer-events-none">
                        {hotspot.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              ) : (
                /* ── 360° viewer for the selected room ── */
                <motion.div
                  key={`viewer-${activeTab}-${selectedRoomId}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => setSelectedRoomId(null)}
                    className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-lg text-sm font-medium text-[#1B3A8C] bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to floor plan
                  </button>
                  <Immersive360Tour rooms={orderedRooms} isEmbedded={true} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hint strip */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {instructions.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-lg px-3 py-2.5"
              >
                <item.icon className="w-4 h-4 text-[#1B3A8C] shrink-0" />
                <span className="text-xs sm:text-sm text-gray-500">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour locations */}
      <section className="py-10 sm:py-14 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6 sm:mb-8 md:mb-10">
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#1B3A8C] uppercase mb-2">
              {locationTabs.find((t) => t.id === activeTab)?.label}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore our spaces</h2>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm">
              Every area is designed to support how you work best. Click a card to jump straight
              into its 360° view.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {tourLocations[activeTab as keyof typeof tourLocations].map((location, index) => {
              const isActive = selectedRoomId === location.id;
              return (
                <motion.button
                  key={location.id}
                  onClick={() => goToRoom(location.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className={`group flex flex-col h-full text-left bg-white border rounded-2xl p-4 sm:p-5 transition-all ${isActive
                    ? "border-[#1B3A8C] ring-2 ring-[#1B3A8C]/20 shadow-sm"
                    : "border-gray-150 hover:border-gray-300 hover:shadow-sm"
                    }`}
                >
                  {/* Icon + title */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-[#1B3A8C]" : "bg-blue-50"
                          }`}
                      >
                        <Play className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? "text-white" : "text-[#1B3A8C]"}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg sm:text-xl truncate">{location.title}</h3>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-semibold tracking-wide uppercase text-[#1B3A8C] bg-[#1B3A8C]/10 px-2 py-1 rounded-full shrink-0 whitespace-nowrap">
                        Viewing
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-md text-gray-500 leading-relaxed mb-4">{location.description}</p>

                  <ul className="mt-auto space-y-2">
                    {location.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          {/* Services */}
          <div className="mt-6 sm:mt-8 border border-gray-100 rounded-2xl p-4 sm:p-6">
            <p className="text-xs sm:text-[14px] font-semibold tracking-widest text-gray-400 uppercase mb-3 sm:mb-4">
              Available services
            </p>
            <div className="flex flex-wrap gap-2">
              {buildingServices[activeTab as keyof typeof buildingServices].map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] sm:text-xs text-gray-700 whitespace-nowrap"
                >
                  <span className="text-gray-400 shrink-0">{serviceIconMap[service]}</span>
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16 md:py-20 bg-linear-to-r from-[#0D47A1] to-[#00ACC1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to See It in person?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8">
            Get your space or contact us for more information about our services and amenities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/quotation"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#1B3A8C] rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              Get a Quote
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}