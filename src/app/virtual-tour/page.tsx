"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

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

// ── Japanese translation dictionaries ──
// Most room names/descriptions/features/hotspot labels repeat verbatim across
// many rooms and both buildings, so a lookup dictionary is used instead of
// hand-duplicating a parallel Japanese room tree (which previously didn't
// exist at all — isJapanese was computed but never applied to room content).

const NAME_JA: Record<string, string> = {
  "Reception": "受付",
  "Lounge": "ラウンジ",
  "Conference Room A": "会議室A",
  "Conference Room B": "会議室B",
  "Conference Room C": "会議室C",
  "Large Window-Side Office": "大型窓側オフィス",
  "Medium Window-Side Office": "中型窓側オフィス",
  "Hallway": "廊下",
  "Pantry": "パントリー",
};

const DESC_JA: Record<string, string> = {
  "A welcoming reception area where guests are greeted and assisted by our professional bilingual team.":
    "バイリンガル対応の専門スタッフがお客様をお出迎えし、サポートする、心地よい受付エリアです。",
  "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.":
    "カジュアルな打ち合わせやネットワーキング、休憩に最適な、くつろげる共用ラウンジです。",
  "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.":
    "プレゼンテーション、クライアントとの打ち合わせ、面接、チームでの共同作業に最適な、設備の整った会議室です。",
  "A professional meeting space designed for productive discussions, presentations, and business events.":
    "生産的な議論、プレゼンテーション、ビジネスイベントのために設計された、プロフェッショナルな会議スペースです。",
  "A modern conference room built for meetings, workshops, interviews, and collaborative sessions.":
    "会議、ワークショップ、面接、共同作業セッションのために作られたモダンな会議室です。",
  "A modern office space designed for productivity and collaboration.":
    "生産性とコラボレーションのために設計されたモダンなオフィススペースです。",
  "A connecting hallway providing access between the building's shared spaces and offices.":
    "建物内の共用スペースとオフィスをつなぐ廊下です。",
  "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.":
    "メンバーが無料の軽食・飲み物を楽しみながら、一日中くつろげる共用パントリーです。",
};

const FEATURE_JA: Record<string, string> = {
  "Japanese-speaking reception staff": "日本語対応の受付スタッフ",
  "Guest assistance": "来客対応サポート",
  "Mail & package handling": "郵便物・荷物の取り扱い",
  "Reception services": "受付サービス",
  "Comfortable waiting lounge": "快適な待合ラウンジ",
  "Comfortable seating": "快適な座席",
  "High-speed Wi-Fi": "高速Wi-Fi",
  "Networking area": "ネットワーキングエリア",
  "Quiet ambiance": "静かな雰囲気",
  "Presentation display": "プレゼンテーション用ディスプレイ",
  "Video conferencing": "ビデオ会議対応",
  "Flexible seating": "柔軟なレイアウトの座席",
  "Ergonomic furniture": "人間工学に基づいた家具",
  "Natural lighting": "自然光が差し込む明るい環境",
  "Quiet environment": "静かな環境",
  "Wayfinding signage": "案内サイン",
  "Access to offices": "オフィスへのアクセス",
  "Well-lit corridor": "明るい照明の廊下",
  "Clean and maintained": "清潔に管理された空間",
  "Complimentary coffee & tea": "無料のコーヒー・紅茶",
  "Casual seating": "カジュアルな座席",
  "Refreshment area": "リフレッシュエリア",
  "Relaxing atmosphere": "リラックスできる雰囲気",
};

// Hotspot "targetName" (the room being pointed to)
const TARGET_NAME_JA: Record<string, string> = {
  "Brochure": "パンフレット",
  "Lounge": "ラウンジ",
  "Hallway": "廊下",
  "Phone Booth": "フォンブース",
  "Reception": "受付",
  "Pantry": "パントリー",
  "Conference Room A": "会議室A",
  "Conference Room B": "会議室B",
  "Large Window-Side Office": "大型窓側オフィス",
  "Medium Window-Side Office": "中型窓側オフィス",
  "Drop Box": "ドロップボックス",
};

// Hotspot "label" (the on-screen call-to-action text)
const HOTSPOT_LABEL_JA: Record<string, string> = {
  "Brochure Area": "パンフレットコーナー",
  "Brochure": "パンフレット",
  "Step into the lounge": "ラウンジへ進む",
  "Enter the lounge": "ラウンジに入る",
  "Continue down the corridor": "廊下を進む",
  "Continue down the Hallway": "廊下を進む",
  "Continue down the hall": "ホールを進む",
  "Continue deeper into the floor": "フロアの奥へ進む",
  "Phone Booth": "フォンブース",
  "Return to reception": "受付に戻る",
  "Go back to Reception": "受付に戻る",
  "Head back to the Reception": "受付に戻る",
  "Visit the pantry": "パントリーへ行く",
  "Go to the pantry": "パントリーへ行く",
  "Go to Pantry Area": "パントリーエリアへ行く",
  "See the pantry": "パントリーを見る",
  "Head back to the lounge": "ラウンジに戻る",
  "Return to the main corridor": "メインの廊下に戻る",
  "Go back to the main corridor": "メインの廊下に戻る",
  "Return to the main hall": "メインホールに戻る",
  "Go back to the hallway": "廊下に戻る",
  "Go back to the hall": "ホールに戻る",
  "Return to the hall": "ホールに戻る",
  "Go to other Hallway": "別の廊下へ行く",
  "Visit Conference Room A": "会議室Aへ行く",
  "Visit Conference Room B": "会議室Bへ行く",
  "Visit Medium Window-Side Office": "中型窓側オフィスへ行く",
  "Visit Large Window-Side Office": "大型窓側オフィスへ行く",
  "Large Window-Side Office": "大型窓側オフィス",
  "Drop Box": "ドロップボックス",
};

function tr(text: string, dict: Record<string, string>, isJapanese: boolean) {
  if (!isJapanese) return text;
  return dict[text] ?? text;
}

function localizeRoom(room: TourRoom, isJapanese: boolean): TourRoom {
  if (!isJapanese) return room;
  return {
    ...room,
    name: tr(room.name, NAME_JA, true),
    description: room.description ? tr(room.description, DESC_JA, true) : room.description,
    features: room.features?.map((f) => tr(f, FEATURE_JA, true)),
    hotspots: room.hotspots?.map((h) => ({
      ...h,
      targetName: tr(h.targetName, TARGET_NAME_JA, true),
      label: h.label ? tr(h.label, HOTSPOT_LABEL_JA, true) : h.label,
    })),
  };
}

export default function VirtualTourPage() {
  const [activeTab, setActiveTab] = useState<BuildingId>("tower6789");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [locale, setLocale] = useState<"en" | "ja">("en");
  const viewerSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    const getStoredLocale = () => {
      const match = document.cookie.match(/(?:^|;\s*)hero_lang=([^;]+)/);
      return match?.[1] === "ja" ? "ja" : "en";
    };

    const updateLocale = (event?: Event) => {
      const detail = (event as CustomEvent<string> | undefined)?.detail;
      const nextLocale = detail === "ja" || detail === "en"
        ? detail
        : getStoredLocale();

      setLocale(nextLocale);
    };

    updateLocale();
    window.addEventListener("localeChanged", updateLocale);
    return () => window.removeEventListener("localeChanged", updateLocale);
  }, []);

  const isJapanese = locale === "ja";

  const locationTabs: { id: BuildingId; label: string; labelJa: string; icon: typeof Building2 }[] = [
    { id: "tower6789", label: "Tower 6789", labelJa: "タワー6789", icon: Building2 },
    { id: "insularLife", label: "Insular Life", labelJa: "インシュラー・ライフ・ビル", icon: Building2 },
  ];

  const localizedLocationTabs = locationTabs.map((tab) => ({
    ...tab,
    label: isJapanese ? tab.labelJa : tab.label,
  }));

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
        panoramaUrl: "/360-view/inlife/SO2-RECEPTION.webp",
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
        panoramaUrl: "/360-view/inlife/SO2-LOUNGE-AREA.webp",
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
        panoramaUrl: "/360-view/inlife/SO2-CON-A.webp",
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
        id: "large-window-side-office",
        name: "Large Window-Side Office",
        description:
          "A modern office space designed for productivity and collaboration.",
        features: ["Ergonomic furniture", "High-speed Wi-Fi", "Natural lighting", "Quiet environment"],
        panoramaUrl: "/360-view/inlife/SO2-OFFICE-W14.webp",
        thumbnailUrl: [
          "/360-view/inlife/W-14.jpg",
        ],
        connectsTo: ["hallway-1"],
        hotspots: [
          { targetId: "hallway-1", targetName: "Hallway", lon: 0, lat: -10, label: "Go back to the hallway" },
        ],
      },
      {
        id: "large-window-side-office-2",
        name: "Large Window-Side Office",
        description:
          "A modern office space designed for productivity and collaboration.",
        features: ["Ergonomic furniture", "High-speed Wi-Fi", "Natural lighting", "Quiet environment"],
        panoramaUrl: "/360-view/inlife/SO2-OFFICE-W31.webp",
        thumbnailUrl: [
          "/360-view/inlife/_ARM7461.webp",
          "/360-view/inlife/_ARM7465.webp",
          "/360-view/inlife/_ARM7471.webp",
        ],
        connectsTo: ["hallway-2"],
        hotspots: [
          { targetId: "hallway-2", targetName: "Hallway", lon: 0, lat: -10, label: "Go back to the hallway" },
        ],
      },
      {
        id: "hallway-1",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210318_133045_00_019.webp",
        // Includes every room a hotspot in this panorama actually links to
        // (previously "reception", "conference-room-b", and
        // "large-window-side-office" were reachable via hotspot but missing
        // here, so anything relying on connectsTo for a "nearby rooms" list
        // would silently omit them).
        connectsTo: ["reception", "pantry", "conference-room-a", "conference-room-b", "large-window-side-office", "hallway-2"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: 10, lat: -5, label: "Go back to Reception" },
          { targetId: "conference-room-b", targetName: "Conference Room B", lon: -20, lat: -10, label: "Visit Conference Room B" },
          { targetId: "large-window-side-office", targetName: "Large Window-Side Office", lon: 40, lat: -10, label: "Visit Large Window-Side Office" },
          { targetId: "hallway-2", targetName: "Hallway", lon: -200, lat: -5, label: "Go to other Hallway" },
        ],
      },
      {
        id: "hallway-2",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210422_182346_00_133.webp",
        // Added "large-window-side-office-2" — reachable via hotspot below but
        // previously missing from connectsTo.
        connectsTo: ["hallway-1", "conference-room-a", "pantry", "large-window-side-office-2"],
        hotspots: [
          { targetId: "pantry", targetName: "Pantry", lon: -175, lat: -5, label: "Go to Pantry Area" },
          { targetId: "conference-room-a", targetName: "Conference Room A", lon: -130, lat: -5, label: "Visit Conference Room A" },
          { targetId: "large-window-side-office-2", targetName: "Large Window-Side Office", lon: 10, lat: -5, label: "Visit Large Window-Side Office" },
          { targetId: "hallway-1", targetName: "Hallway", lon: -15, lat: -5, label: "Go to other Hallway" },
        ],
      },
      {
        id: "pantry",
        name: "Pantry",
        description:
          "A shared pantry where members can enjoy complimentary refreshments and unwind throughout the day.",
        features: ["Complimentary coffee & tea", "Casual seating", "Refreshment area", "Relaxing atmosphere"],
        panoramaUrl: "/360-view/inlife/SO2-PANTRY.webp",
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
        panoramaUrl: "/360-view/tower6789/SO1-RECEPTION.webp",
        thumbnailUrl: [
          "/360-view/_ARM7593.webp",
          "/360-view/_ARM8130.webp"
        ],
        connectsTo: ["pantry", "lounge", "conference-room-a", "conference-room-b"],
        hotspots: [
          { targetId: "lounge", targetName: "Lounge", lon: -120, lat: -12, label: "Enter the lounge" },
          { targetId: "pantry", targetName: "Pantry", lon: 0, lat: 0, label: "Go to the pantry" },
          { targetId: "conference-room-b", targetName: "Conference Room B", lon: 118, lat: 0, label: "Visit Conference Room B" },
        ],
      },
      {
        id: "lounge",
        name: "Lounge",
        description:
          "A relaxing shared lounge perfect for casual meetings, networking, or taking a productive break.",
        features: ["Comfortable seating", "High-speed Wi-Fi", "Networking area", "Quiet ambiance"],
        panoramaUrl: "/360-view/tower6789/SO1-LOUNGE.webp",
        thumbnailUrl: [
          "/360-view/_ARM7597.webp",
          "/360-view/_ARM7582.webp",
        ],
        connectsTo: ["reception", "hallway-1", "conference-room-a"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: -160, lat: -10, label: "Return to reception" },
          { targetId: "hallway-1", targetName: "Hallway", lon: 185, lat: 0, label: "Continue down the hall" },
          { targetId: "conference-room-a", targetName: "Conference Room A", lon: -10, lat: 0, label: "Visit Conference Room A" },
          { targetId: "", targetName: "Brochure Area", lon: 40, lat: 0, label: "Brochure" },
        ],
      },
      {
        id: "hallway-1",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210318_174407_00_055.webp",
        // Added "reception" — reachable via hotspot below but previously
        // missing from connectsTo.
        connectsTo: ["reception", "large-window-side-office", "hallway-2"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: -5, lat: 0, label: "Return to reception" },
          { targetId: "large-window-side-office", targetName: "Large Window-Side Office", lon: -60, lat: 0, label: "Visit Large Window-Side Office" },
          { targetId: "hallway-2", targetName: "Hallway", lon: -180, lat: 0, label: "Continue deeper into the floor" },
        ],
      },
      {
        id: "hallway-2",
        name: "Hallway",
        description: "A connecting hallway providing access between the building's shared spaces and offices.",
        features: ["Wayfinding signage", "Access to offices", "Well-lit corridor", "Clean and maintained"],
        panoramaUrl: "/360-view/IMG_20210429_171553_00_158.webp",
        // Added "medium-window-side-office" — reachable via hotspot below but
        // previously missing from connectsTo.
        connectsTo: ["hallway-1", "pantry", "medium-window-side-office"],
        hotspots: [
          { targetId: "hallway-1", targetName: "Hallway", lon: -180, lat: 0, label: "Return to the main hall" },
          { targetId: "pantry", targetName: "Pantry", lon: 0, lat: 0, label: "See the pantry" },
          { targetId: "medium-window-side-office", targetName: "Medium Window-Side Office", lon: 35, lat: 0, label: "Visit Medium Window-Side Office" },
        ],
      },
      {
        id: "large-window-side-office",
        name: "Large Window-Side Office",
        description: "A modern office space designed for productivity and collaboration.",
        features: ["High-speed Wi-Fi", "Ergonomic furniture", "Natural lighting", "Quiet environment"],
        panoramaUrl: "/360-view/tower6789/IMG_20210318_181657_00_066.webp",
        thumbnailUrl: [
          "/360-view/tower6789/_ARM7510.webp",
          "/360-view/tower6789/_ARM7508.webp",
          "/360-view/tower6789/_ARM7506.webp",
        ],
        connectsTo: ["hallway-1"],
        hotspots: [
          { targetId: "hallway-1", targetName: "Hallway", lon: 0, lat: -9, label: "Return to the main hall" },
        ],
      },
      {
        id: "medium-window-side-office",
        name: "Medium Window-Side Office",
        description: "A modern office space designed for productivity and collaboration.",
        features: ["High-speed Wi-Fi", "Ergonomic furniture", "Natural lighting", "Quiet environment"],
        panoramaUrl: "/360-view/tower6789/SO1-OFFIC-W-21-(1).webp",
        thumbnailUrl: [
          "/360-view/tower6789/W-21.jpg",
          "/360-view/tower6789/W-21(1).jpg",
        ],
        connectsTo: ["hallway-2"],
        hotspots: [
          { targetId: "hallway-2", targetName: "Hallway", lon: -25, lat: -9, label: "Return to the main hall" },
        ],
      },
      {
        id: "conference-room-a",
        name: "Conference Room A",
        description:
          "A fully equipped meeting room ideal for presentations, client meetings, interviews, and team collaborations.",
        features: ["High-speed Wi-Fi", "Presentation display", "Video conferencing", "Flexible seating"],
        panoramaUrl: "/360-view/tower6789/SO1-CON-A.webp",
        // Removed the placeholder `[""]` thumbnail — an empty string rendered
        // a broken image; no real photo is available yet, so this simply
        // omits thumbnailUrl until one is added.
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
        panoramaUrl: "/360-view/tower6789/SO1-CON-B.webp",
        thumbnailUrl: [
          "/360-view/_ARM7558.webp",
        ],
        connectsTo: ["hallway-2"],
        hotspots: [
          { targetId: "hallway-2", targetName: "Hallway", lon: 0, lat: -10, label: "Return to the hall" },
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
        // Added "large-window-side-office" — reachable via hotspot below but
        // previously missing from connectsTo.
        connectsTo: ["reception", "hallway-2", "large-window-side-office"],
        hotspots: [
          { targetId: "reception", targetName: "Reception", lon: -10, lat: 0, label: "Head back to the Reception" },
          { targetId: "hallway-2", targetName: "Hallway", lon: 80, lat: 0, label: "Go back to the hall" },
          { targetId: "large-window-side-office", targetName: "Large Window-Side Office", lon: -40, lat: 0, label: "Large Window-Side Office" },
        ],
      },
    ],
  };

  // Featured rooms
  const FEATURED_ROOM_IDS: Record<BuildingId, string[]> = {
    // Removed "phonebooth" — no room with that id exists in insularLife's
    // room list (the phone booth is just a hotspot inside the lounge), so it
    // was silently dropped by the `.filter(Boolean)` below on every render.
    insularLife: ["reception", "lounge", "large-window-side-office", "large-window-side-office-2", "conference-room-a", "conference-room-b", "pantry"],
    tower6789: ["reception", "lounge", "large-window-side-office", "medium-window-side-office", "conference-room-a", "conference-room-b", "pantry"],
  };

  const activeRooms = roomsByTab[activeTab].map((r) => localizeRoom(r, isJapanese));

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
                  buildingTabs={localizedLocationTabs}
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