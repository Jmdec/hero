"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Briefcase,
  Move,
  ShieldCheck,
  Handshake,
  Scale,
  Gauge,
  Eye,
  Award,
  Building2,
  Users,
  Globe2,
  Landmark,
  ArrowUpRight,
  Quote,
} from "lucide-react";
import { useEffect, useState } from "react";

// Strip common corporate prefixes/suffixes so the logo badge shows the
// part of the name people actually recognize a company by.
function getCompanyInitial(name: string) {
  const stripped = name
    .replace(/^株式会社|^有限会社|^医療法人社団\s*/g, "")
    .replace(/株式会社$|Co\.,\s*Ltd\.?$|Inc\.?$/gi, "")
    .trim();
  const source = stripped || name;
  return source.charAt(0).toUpperCase();
}

// Deterministic accent from a small palette so the same company always
// gets the same badge color across renders.
const BADGE_PALETTE = [
  "#1B3A8C",
  "#0D6E6E",
  "#B5541F",
  "#5B4B8A",
  "#1E7A46",
  "#8C2F4B",
];
function getBadgeColor(name: string) {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BADGE_PALETTE[sum % BADGE_PALETTE.length];
}

const companyLogoMap: Record<string, string> = {
  "株式会社ヒーロー": "/company-logo/hero-jp-logo.png",
  "株式会社ヒーロープラス": "/company-logo/hero-plus-logo.png",
  "HMソリューション株式会社": "/company-logo/hm-txt-logo.png",
  "株式会社モードツー": "/company-logo/mode2-logo.png",
  "株式会社アイモ": "/company-logo/imo-logo.png",
  "イーコンビニ株式会社": "/company-logo/e-convenience-logo.png",
  "株式会社ジョイフローラ": "/company-logo/joyflora-logo.png",
  "日本窯炉株式会社": "/company-logo/nihonyouro-logo.png",
  "ブライトン株式会社": "/company-logo/brighton-txt-logo.png",
  "株式会社ユナイテッド": "/company-logo/united-logo.png",
  "株式会社LIZ LISA": "/company-logo/lizlisa-logo.png",
  "株式会社テクノ": "/company-logo/techno-logo.png",
  "奥本建設工業株式会社": "/company-logo/okumoto-logo.png",
  "ジャスマックプラザ株式会社": "/company-logo/jasmac-logo.png",
  "医療法人社団 光星": "/company-logo/kousei-logo.png",
  "株式会社イー・サポート": "/company-logo/e-support-logo.png",
  "ボーダレス・ビジョン株式会社": "/company-logo/borderless-logo.png",
  "Kanazawa Marukoshi Department Store Co., Ltd.（株式会社 金沢丸越百貨店）": "/company-logo/kanazawa-mza-logo.png",
  "Kanazawa Sky Hotel Co., Ltd.（株式会社 金沢スカイホテル）": "/company-logo/sky-hotel-logo.png",
  "Marushin Gravure Co., Ltd.（丸新グラビア株式会社）": "/company-logo/marushin-logo.png",
  "有限会社ホビーロード": "/company-logo/hobby-road-logo.png",
  "品川窯材 株式会社": "/company-logo/shinagawa-logo.png",
};

function getCompanyLogo(name: string) {
  return companyLogoMap[name] ?? null;
}

// HERO Group of Companies — sourced from ヒーローグループ企業一覧
const groupCompanies = [
  {
    area: "Kanto Area",
    icon: Building2,
    companies: [
      { name: "株式会社ヒーロー", website: "https://www.hero-super.jp" },
      {
        name: "株式会社ヒーロープラス",
        website: "https://www.tsubasa-ushiku.jp/",
      },
      { name: "HMソリューション株式会社", website: null },
      { name: "株式会社モードツー", website: "https://www.mode2.co.jp/" },
      { name: "株式会社アイモ", website: "https://imo-inc.co.jp/" },
      {
        name: "イーコンビニ株式会社",
        website: "https://www.rakuten.ne.jp/gold/e-convini/",
      },
      { name: "株式会社ジョイフローラ", website: null },
      { name: "日本窯炉株式会社", website: "https://nihon-youro.jp/" },
      { name: "ブライトン株式会社", website: null },
      {
        name: "株式会社ユナイテッド",
        website: "https://www.united-keibi.co.jp/",
      },
      { name: "株式会社LIZ LISA", website: "https://www.lizlisa.com/" },
      { name: "株式会社テクノ", website: "https://www.techno-co.jp/" },
      {
        name: "奥本建設工業株式会社",
        website: "https://www.okumoto-kensetsu.co.jp/",
      },
    ],
  },
  {
    area: "Hokkaido Area",
    icon: Globe2,
    companies: [
      {
        name: "ジャスマックプラザ株式会社",
        website: "https://www.jasmacplaza.jp/",
      },
      {
        name: "医療法人社団 光星",
        website: "https://www.medical-plaza.jp/",
      },
      {
        name: "株式会社イー・サポート",
        website: "https://heroes-school.jp/",
      },
      {
        name: "ボーダレス・ビジョン株式会社",
        website: "https://blv.co.jp/",
      },
    ],
  },
  {
    area: "Hokuriku Area",
    icon: Landmark,
    companies: [
      {
        name: "Kanazawa Marukoshi Department Store Co., Ltd.（株式会社 金沢丸越百貨店）",
        website: "https://www.kmza.jp/",
      },
      {
        name: "Kanazawa Sky Hotel Co., Ltd.（株式会社 金沢スカイホテル）",
        website: "https://www.anahikanazawasky.com/",
      },
      {
        name: "Marushin Gravure Co., Ltd.（丸新グラビア株式会社）",
        website: "https://marushin-gravure.co.jp/",
      },
      { name: "有限会社ホビーロード", website: "https://www.hobbyroad.jp/" },
    ],
  },
  {
    area: "Nishinihon Area",
    icon: Users,
    companies: [
      {
        name: "品川窯材 株式会社",
        website: "https://shinagawayozai.co.jp/",
      },
    ],
  },
  {
    area: "Overseas",
    icon: Building2,
    companies: [
      { name: "Hero PH Serviced Offices", website: "https://heroph.net/jp/" },
    ],
  },
];

// Flattened list of every company across all regions, used to drive the
// single logo carousel on the About page.
const allCompanies = groupCompanies.flatMap((region) => region.companies);

export default function AboutPage() {
  const [spaceSlide, setSpaceSlide] = useState(0);

  const teamCarousel = [
    { image: "/_ARM1425.webp", title: "Our Team" },
    { image: "/_ARM1442.webp", title: "Operations Department" },
    { image: "/_ARM1457.webp", title: "Marketing & Sales Department" },
    { image: "/_ARM1467.webp", title: "Accounting Department" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setSpaceSlide((prev) => (prev + 1) % teamCarousel.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [teamCarousel.length]);

  const values = [
    {
      icon: Briefcase,
      title: "Professionalism",
      description:
        "We create and maintain work environments that reflect credibility, quality, and respect for business standards.",
    },
    {
      icon: Move,
      title: "Flexibility",
      description:
        "We design our services to adapt to the changing needs of modern businesses, whether they are scaling up, downsizing, or transitioning to new ways of working.",
    },
    {
      icon: ShieldCheck,
      title: "Reliability",
      description:
        "We ensure consistent service delivery and dependable workspace solutions that clients can rely on every day.",
    },
    {
      icon: Handshake,
      title: "Customer Commitment",
      description:
        "We prioritize understanding our clients’ needs and delivering solutions that support their goals and operations.",
    },
    {
      icon: Scale,
      title: "Integrity",
      description:
        "We operate with honesty, transparency, and fairness in every client relationship and business decision.",
    },
    {
      icon: Gauge,
      title: "Efficiency",
      description:
        "We simplify the way businesses work by providing complete workspace solutions that reduce operational burden and improve productivity.",
    },
  ];

  const whyHero = [
    { num: "01", title: "Prime Business Location", desc: "Located at the heart of the business district, HERO Serviced Office provides convenient access to major companies, transportation hubs, restaurants, and essential business establishments." },
    { num: "02", title: "Japanese & English Staff Support", desc: "Our professional team provides Japanese and English communication support to ensure smooth coordination and assistance for local and international clients." },
    { num: "03", title: "24/7 Office Access", desc: "Enjoy flexible working hours with round-the-clock access to your workspace whenever your business requires it." },
    { num: "04", title: "Fully Furnished, Ready to Use Offices", desc: "Move in and start working immediately with fully equipped private offices designed for productivity and convenience." },
    { num: "05", title: "Professional Corporate Environment", desc: "Create a strong business impression with a premium office setting that reflects professionalism and credibility." },
    { num: "06", title: "Flexible Office Solutions", desc: "Choose from various office options that can adapt to your company’s needs, whether for startups, growing businesses, or established companies." },
    { num: "07", title: "Dedicated Reception & Administrative Support", desc: "Receive professional front desk assistance and reliable administrative support to help manage your daily office operations." },
    { num: "08", title: "Meeting Rooms & Business Facilities", desc: "Conduct meetings and client presentations in well-equipped spaces designed for productive business discussions." },
    { num: "09", title: "Cost-Efficient Business Setup", desc: "Reduce the hassle and expenses of traditional office setup with a complete workspace solution that includes essential amenities." },
    { num: "10", title: "Reliable Internet & Office Amenities", desc: "Stay connected and productive with high-speed internet and essential office facilities prepared for your business needs." },
    { num: "11", title: "Ideal for Local & International Companies", desc: "A strategic workspace solution designed to support businesses expanding, establishing, or operating in the Philippines." },
    { num: "12", title: "Secure & Comfortable Workspace", desc: "Work with peace of mind in a safe, professional, and comfortable office environment built for business success." },
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
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto text-shadow-4xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-md">
              About HERO Serviced Office
            </h1>
            <p className="text-xl text-gray-300 text-shadow-sm">
              Your trusted partner for premium office solutions in the heart of Makati's business district
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview + Meet Our Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600 text-justify">
              <p>
                HERO Serviced Office traces its roots to a Japan-based business group established with the
                goal of developing service-oriented enterprises that support modern commercial activity. The
                group initially operated across multiple business sectors, gradually building expertise in service
                management, operational efficiency, and client-centered solutions.
              </p>
              <p>
                In 2015, the serviced office division was formally established in response to the increasing
                global demand for flexible workspace solutions. At a time when businesses were shifting toward
                more agile and cost-efficient operating models, HERO introduced fully serviced office
                environments that eliminated the complexity of traditional leasing structures.
              </p>
              <p>
                Starting from its early operations in Japan, the company expanded its concept internationally,
                refining its offerings to suit different business cultures and market environments. Over time, its
                services evolved to include private offices, virtual office packages, coworking spaces, and
                meeting facilities—forming a complete workspace ecosystem.
              </p>
              <p className="font-semibold">
                Today, HERO Serviced Office continues to operate, focusing on service quality, operational
                efficiency, and business enablement across diverse industries and markets.
              </p>
            </div>
          </motion.div>


          {/* Vision & Mission */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="p-8 bg-[#C5D2EC]/30 rounded-2xl"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#0D47A1] rounded-xl flex items-center justify-center mb-6">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Our Vision
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-justify">
                  To be one of the most trusted serviced office providers in the Philippines, recognized for
                  delivering reliable workspace solutions that support business growth and redefine how modern
                  companies work in dynamic urban environments.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-[#8FA8D6]/20 rounded-2xl"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#0D47A1] rounded-xl flex items-center justify-center mb-6">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Our Mission
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-justify">
                  To provide accessible, flexible, and fully serviced workspace solutions that empower
                  businesses to operate efficiently, grow confidently, and establish a strong professional presence
                  in the heart of Makati Citys
                </p>
              </motion.div>
            </div>
          </div>

          <div className="relative flex justify-center mt-10 h-135 w-full">
            {teamCarousel.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${index === spaceSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <div className="relative">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={800}
                    height={500}
                    className="rounded-2xl object-cover max-h-135 w-auto"
                    unoptimized
                  />

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-white">
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-[#C5D2EC] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-[#1B3A8C]" />
                </div>
                <h3 className="text-md md:text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-md">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Messages — mock/sample copy */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              A Message From Our Leadership
            </h2>
          </motion.div>

          <div className="space-y-8">
            {/* Message from the President */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid gap-8 rounded-3xl border border-[#1B3A8C]/10 bg-white p-8 shadow-sm md:grid-cols-[160px_1fr] md:p-10"
            >
              <div className="flex flex-row items-center gap-4 md:flex-col md:items-start md:gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#1B3A8C] text-xl font-bold tracking-wide text-white">
                  RC
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ramon Castillo</p>
                  <p className="text-sm text-[#1B3A8C]">President</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400 py-1">
                    HERO Serviced Office
                  </p>
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 h-8 w-8 text-[#B8935A]/35" />
                <p className="pl-9 font-serif text-lg italic leading-relaxed text-gray-700 text-justify">
                  Every business that walks through our doors is at a different stage of its journey—some
                  are opening their first office in the Philippines, others are scaling a team that has
                  outgrown its space. Our job is to remove the friction from that moment, so our clients can
                  focus on their work instead of their walls. That commitment, more than any amenity, is what
                  I hope people feel the second they step into a HERO office.
                </p>
              </div>
            </motion.div>

            {/* Message from the Chairman */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="grid gap-8 rounded-3xl border border-[#1B3A8C]/10 bg-white p-8 shadow-sm md:grid-cols-[1fr_160px] md:p-10"
            >
              <div className="relative md:order-1">
                <Quote className="absolute -top-1 -right-1 h-8 w-8 text-[#B8935A]/35" />
                <p className="pr-9 font-serif text-lg italic leading-relaxed text-gray-700 text-justify">
                  When we brought the serviced office concept from Japan to Makati, we made a deliberate
                  choice to carry over one principle above all others: hospitality that anticipates a need
                  before it is spoken. It is a small thing on any single day, and it compounds into something
                  our clients notice over years. We are still guided by that same principle as the group
                  continues to grow across new markets.
                  </p>
              </div>
              <div className="flex flex-row items-center gap-4 md:order-2 md:flex-col md:items-start md:gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0F2557] text-xl font-bold tracking-wide text-white">
                  KY
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Kenji Yamashita</p>
                  <p className="text-sm text-[#1B3A8C]">Chairman</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400 py-1">
                    HERO Group of Companies
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Group of Companies — auto-rotating carousel; hover pauses rotation */}
      <section className="pt-10 pb-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              One Group, Working across Borders
            </h2>
            <p className="text-lg text-gray-600">
              Bringing reliable, service-first
              business solutions to companies operating in Japan and the Philippines.
            </p>
          </motion.div>

          <div
            className="hero-logo-marquee-wrap overflow-hidden rounded-3xl border border-[#1B3A8C]/15 bg-white p-6 shadow-sm"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)",
            }}
          >
            <div className="hero-logo-marquee flex w-max gap-4 py-1">
              {[...allCompanies, ...allCompanies].map((company, i) => {
                const Tile: any = company.website ? "a" : "div";
                const tileProps = company.website
                  ? {
                    href: company.website,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                  : {};
                return (
                  <Tile
                    key={`${company.name}-${i}`}
                    {...tileProps}
                    className={`relative flex h-60 w-72 shrink-0 flex-col items-center justify-center gap-3 ${company.website ? "cursor-pointer" : "cursor-default"
                      }`}
                  >
                    {getCompanyLogo(company.name) ? (
                      <div className="group relative flex h-64 w-64 shrink-0 items-center justify-center overflow-hidden">
                        <Image
                          src={getCompanyLogo(company.name)!}
                          alt={`${company.name} logo`}
                          width={200}
                          height={200}
                          className="object-contain"
                          unoptimized
                        />

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-black/75 px-3 py-1 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {company.name}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
                        style={{ backgroundColor: getBadgeColor(company.name) }}
                      >
                        {getCompanyInitial(company.name)}
                      </div>
                    )}

                    {/* Hover overlay: full name + Visit site link */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#0F2557]/95 p-3 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <p className="line-clamp-2 text-xs font-semibold text-white">
                        {company.name}
                      </p>
                      {company.website ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[#B8935A] group-hover:underline">
                          Visit site
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-xs text-blue-100/70">Unlisted</span>
                      )}
                    </div>
                  </Tile>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HERO */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0A1E3F_0%,#1565C0_100%)] py-20">
        <div className="absolute -left-16 top-10 h-52 w-52 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-8 bottom-8 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
              Why Choose HERO
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.01em] text-white md:text-4xl">
              A workspace experience designed for progress
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {whyHero.map(({ num, title, desc }) => (
              <div
                key={num}
                className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="text-[28px] font-black leading-none tracking-[-0.04em] text-blue-200/55">
                    {num}
                  </div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes hero-logo-marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .hero-logo-marquee {
          animation: hero-logo-marquee-scroll 70s linear infinite;
        }
        .hero-logo-marquee-wrap:hover .hero-logo-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}