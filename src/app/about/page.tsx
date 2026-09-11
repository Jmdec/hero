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
  "HERO PH Serviced Offices": "/company-logo/hero-logo.jpg"
};

function getCompanyLogo(name: string) {
  return companyLogoMap[name] ?? null;
}

// HERO Group of Companies
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
      { name: "HERO PH Serviced Offices", website: "https://heroph.net/jp/" },
    ],
  },
];

const messageen = {
  president: {
    message:
`Thank you very much for your continued support of Hero Serviced Office, Inc.. We are deeply
grateful for the trust and encouragement you have extended to us.

Our office provides a flexible working environment tailored to the growth of your business
and the scale of your projects. Beyond our prime location, we offer comfortable workspaces
and a comprehensive support system to strongly assist your business expansion in the
Philippines.

As a growth hub capable of meeting diverse needs—from startups to expanding
enterprises—we look forward to working alongside you toward long-term development and
success.

If you are considering establishing a new office, expanding your current operations, or
looking for a cost-effective workspace, please feel free to contact us or schedule a visit.
We truly appreciate your continued support.
    `,
  },
  chairman: {
    message: 
`At Hero Serviced Office, Inc., we believe that strong relationships are built on trust, sincerity,
and continuous improvement. We are grateful for the confidence our clients and partners
have placed in us, and we remain committed to providing an environment where
businesses can grow with stability and confidence. We sincerely appreciate the continued
trust and support, and we look forward to building a brighter future together`,
  },
};

const messagejp = {
  president: {
    message: 
`Hero Serviced Office, Inc.をご愛顧いただき、誠にありがとうございます。皆様
からいただいている深いご信頼と温かいご支援に、スタッフ一同心より感謝申し
上げます。

当オフィスでは、ビジネスの成長やプロジェクトの規模に合わせて柔軟にご活用
いただけるオフィス環境を整えております。抜群のロケーションはもちろん、快
適なワークスペースと充実したサポート体制を備え、皆様のフィリピンでのビジ
ネス展開を強力にバックアップいたします。

スタートアップから事業拡大まで、多様なニーズに応える「成長の拠点」として
、これからも共に努力を重ね、末永い発展と成功を目指してまいりましょう。

新規オフィス開設や拠点拡張をご検討中の方、コストパフォーマンスに優れたワ
ークスペースをお探しの方も、ぜひお気軽にお問い合わせ・ご内覧ください。

今後とも変わらぬご支援を賜りますよう、よろしくお願い申し上げます。`,
  },
  chairman: {
    message: 
`Hero Serviced Office, Inc.では、強固な信頼関係は、信頼、誠実さ、そして絶え間ない改善
への取り組みによって築かれるものと信じております。お客様ならびにパートナーの皆
様より賜りましたご信頼に、心より感謝申し上げます。

私たちは今後も、企業の皆様が安心して事業を成長・発展できる環境をご提供できるよ
う、努めてまいります。引き続き変わらぬご支援とご愛顧を賜りますようお願い申し上
げますとともに、皆様とともにより明るい未来を築いていけることを心より願っており
ます。`,
  },
};

const allCompanies = groupCompanies.flatMap((region) => region.companies);

export default function AboutPage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Check initial language from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const updateLanguage = () => {
      const languageCookie = getCookie('hero_lang');
      if (languageCookie === 'ja') {
        setLanguage('ja');
      } else {
        setLanguage('en');
      }
    };

    updateLanguage();

    // Watch for cookie changes
    const cookieListener = setInterval(updateLanguage, 500);

    return () => clearInterval(cookieListener);
  }, []);

  const messages = language === 'ja' ? messagejp : messageen;
  const isJapanese = language === 'ja';

  const values = isJapanese
    ? [
        {
          icon: Briefcase,
          title: "プロ意識",
          description:
            "私たちは、信頼性、品質、そしてビジネス基準への敬意を反映した職場環境を構築し、維持します。",
        },
        {
          icon: Move,
          title: "柔軟性",
          description:
            "私たちは、事業規模の拡大、縮小、あるいは新たな働き方への移行など、現代企業の変化するニーズに対応できるようサービスを設計しています。",
        },
        {
          icon: ShieldCheck,
          title: "信頼性",
          description:
            "当社は、お客様が日々安心してご利用いただける、一貫したサービス提供と信頼性の高いワークスペースソリューションを保証します。",
        },
        {
          icon: Handshake,
          title: "顧客へのコミットメント",
          description:
            "私たちは、お客様のニーズを理解し、お客様の目標と事業運営を支援するソリューションを提供することを最優先事項としています。",
        },
        {
          icon: Scale,
          title: "誠実さ",
          description:
            "私たちは、あらゆる顧客関係およびビジネス上の意思決定において、誠実さ、透明性、公平さを重んじます。",
        },
        {
          icon: Gauge,
          title: "効率",
          description:
            "当社は、業務負担を軽減し生産性を向上させる包括的なワークスペースソリューションを提供することで、企業の働き方を簡素化します。",
        },
      ]
    : [
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

  const whyHero = isJapanese
    ? [
        { num: "01", title: "一等地にあるビジネス拠点", desc: "ビジネス街の中心部に位置するHero Serviced Office, Inc.は、主要企業、交通機関の拠点、レストラン、そして生活に不可欠なビジネス施設へのアクセスに大変便利です。" },
        { num: "02", title: "日本語と英語のスタッフサポート", desc: "当社の専門チームは、国内外のお客様との円滑な連携とサポートを確保するため、日本語と英語によるコミュニケーション支援を提供しています。" },
        { num: "03", title: "24時間365日オフィスアクセス可能", desc: "ビジネスに必要な時にいつでも、24時間いつでもワークスペースにアクセスできる、柔軟な勤務時間をお楽しみください。" },
        { num: "04", title: "家具完備、すぐに使用可能なオフィス", desc: "すぐに入居して、生産性と利便性を追求して設計された設備完備の個室オフィスで仕事を開始できます。" },
        { num: "05", title: "プロフェッショナルな企業環境", desc: "プロ意識と信頼性を反映する上質なオフィス環境で、力強いビジネス印象を与えましょう。" },
        { num: "06", title: "柔軟なオフィスソリューション", desc: "スタートアップ企業、成長企業、老舗企業など、貴社のニーズに合わせて選べる様々なオフィスオプションをご用意しています。" },
        { num: "07", title: "専任の受付および事務サポート", desc: "プロフェッショナルな受付業務と信頼できる事務サポートにより、日々のオフィス業務を円滑に進めることができます。" },
        { num: "08", title: "会議室およびビジネス施設", desc: "生産的なビジネス議論のために設計された、設備が整ったスペースで会議や顧客プレゼンテーションを実施します。" },
        { num: "09", title: "費用対効果の高い事業設立", desc: "必要な設備がすべて揃った包括的なワークスペースソリューションで、従来のオフィス環境構築に伴う手間と費用を削減しましょう。" },
        { num: "10", title: "信頼性の高いインターネット接続とオフィス設備", desc: "高速インターネットとビジネスニーズに対応した必須オフィス設備で、常に接続状態を維持し、生産性を高めましょう。" },
        { num: "11", title: "国内外の企業に最適", desc: "フィリピンで事業を拡大、設立、または運営する企業を支援するために設計された、戦略的なワークスペースソリューション。" },
        { num: "12", title: "安全で快適なワークスペース", desc: "ビジネスの成功のために設計された、安全でプロフェッショナルかつ快適なオフィス環境で、安心して仕事に取り組んでください。" },
      ]
    : [
        { num: "01", title: "Prime Business Location", desc: "Located at the heart of the business district, Hero Serviced Office, Inc. provides convenient access to major companies, transportation hubs, restaurants, and essential business establishments." },
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
            src="/header.webp"
            alt="About Hero Serviced Office, Inc."
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#1B3A8C]/90 via-[#1B3A8C]/70 to-[#1B3A8C]/80" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto text-shadow-4xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-md">
              {isJapanese ? "Hero Serviced Office, Inc. について" : "About Hero Serviced Office, Inc."}
            </h1>
            <p className="text-xl text-gray-300 text-semibold text-shadow-sm">
              {isJapanese
                ? "マカティのビジネス街の中心に位置する、プレミアムオフィスソリューションを提供する信頼できるパートナー"
                : "Your trusted partner for premium office solutions in the heart of Makati's business district"}
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
              {isJapanese ? "私たちの物語" : "Our Story"}
            </h2>
            <div className="space-y-4 text-gray-600 text-justify">
              <p>
                {isJapanese
                  ? "Hero Serviced Office, Inc. は、代の商業活動を支えるサービス指向型企業を育成することを目標に設立された、日本を拠点とする企業グループをルーツとしています。同グループは当初、複数の事業分野で事業を展開し、サービスマネジメント、業務効率化、顧客中心のソリューションに関する専門知識を徐々に蓄積してきました。"
                  : "Hero Serviced Office, Inc. traces its roots to a Japan-based business group established with the goal of developing service-oriented enterprises that support modern commercial activity. The group initially operated across multiple business sectors, gradually building expertise in service management, operational efficiency, and client-centered solutions."}
              </p>
              <p>
                {isJapanese
                  ? "2015年、柔軟なワークスペースソリューションに対する世界的な需要の高まりに応えるため、サービスオフィス部門が正式に設立されました。企業がより機敏でコスト効率の高い運営モデルへと移行する中で、HEROは従来のリース契約の複雑さを解消した、フルサービスのオフィス環境を提供しました。"
                  : "In 2015, the serviced office division was formally established in response to the increasing global demand for flexible workspace solutions. At a time when businesses were shifting toward more agile and cost-efficient operating models, HERO introduced fully serviced office environments that eliminated the complexity of traditional leasing structures."}
              </p>
              <p>
                {isJapanese
                  ? "同社は日本での事業開始を皮切りに、国際的に事業を拡大し、多様なビジネス文化や市場環境に合わせてサービスを洗練させてきた。時を経て、個室オフィス、バーチャルオフィスパッケージ、コワーキングスペース、会議施設などを含むサービスへと進化し、包括的なワークスペースエコシステムを構築した。"
                  : "Starting from its early operations in Japan, the company expanded its concept internationally, refining its offerings to suit different business cultures and market environments. Over time, its services evolved to include private offices, virtual office packages, coworking spaces, and meeting facilities—forming a complete workspace ecosystem."}
              </p>
              <p className="font-semibold">
                {isJapanese
                  ? "現在もHero Serviced Office, Inc.は事業を継続しており、多様な業界や市場において、サービス品質、業務効率、そしてビジネスの活性化に重点を置いています。"
                  : "Today, Hero Serviced Office, Inc. continues to operate, focusing on service quality, operational efficiency, and business enablement across diverse industries and markets."}
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
                    {isJapanese ? "私たちのビジョン" : "Our Vision"}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-justify">
                  {isJapanese
                    ? "フィリピンで最も信頼されるサービスオフィスプロバイダーの一つとなり、ビジネスの成長を支援し、ダイナミックな都市環境における現代企業の働き方を再定義する、信頼性の高いワークスペースソリューションを提供することで認知されることを目指します。"
                    : "To be one of the most trusted serviced office providers in the Philippines, recognized for delivering reliable workspace solutions that support business growth and redefine how modern companies work in dynamic urban environments."}
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
                    {isJapanese ? "私たちの使命" : "Our Mission"}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-justify">
                  {isJapanese
                    ? "マカティ市の中心部で、企業が効率的に事業を運営し、自信を持って成長し、強力なプロフェッショナルな存在感を確立できるよう、アクセスしやすく、柔軟で、フルサービスのワークスペースソリューションを提供します。"
                    : "To provide accessible, flexible, and fully serviced workspace solutions that empower businesses to operate efficiently, grow confidently, and establish a strong professional presence in the heart of Makati City"}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="relative flex justify-center mt-10 h-135 w-full">
            <div className="relative">
              <Image
                src="/_ARM1425.webp"
                alt="Our Team"
                width={800}
                height={500}
                className="rounded-2xl object-cover md:max-h-135 w-auto"
                unoptimized
              />

              <div className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-full bg-[#0A1E3F] backdrop-blur-sm border border-white/60 shadow-sm">
                <span className="text-sm font-bold text-white">
                  {isJapanese ? "私たちのチーム" : "Our Team"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isJapanese ? "中核的価値観" : "Core Values"}
            </h2>
            <p className="text-lg text-gray-600">
              {isJapanese ? "私たちが行うすべてのことを導く原則" : "The principles that guide everything we do"}
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

      {/* Leadership Messages */}
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
              {isJapanese ? "経営陣からのメッセージ" : "A Message From Our Leadership"}
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
                <div>
                  <p className="font-bold text-gray-900">
                    {isJapanese ? "小林 実 氏" : "Mr. Minoru Kobayashi"}
                  </p>
                  <p className="text-md text-[#1B3A8C]">
                    {isJapanese ? "HERO社長" : "HERO President"}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 h-8 w-8 text-[#B8935A]/35" />
                <p className="pl-9 font-serif text-lg italic leading-relaxed text-gray-700 text-justify whitespace-pre-wrap">
                  {messages.president.message}
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
                <p className="pr-9 font-serif text-lg italic leading-relaxed text-gray-700 text-justify whitespace-pre-wrap">
                  {messages.chairman.message}
                </p>
              </div>
              <div className="flex flex-row items-center gap-4 md:order-2 md:flex-col md:items-start md:gap-3">
                <div>
                  <p className="font-bold text-gray-900">\
                    {isJapanese ? "木下 誠 氏" : "Mr. Makoto Kinoshita"}
                    </p>
                  <p className="text-md text-[#1B3A8C]">
                    {isJapanese ? "HERO会長" : "HERO Chairman"}
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
              {isJapanese ? "国境を越えて活動する、一つのグループ" : "One Group, Working across Borders"}
            </h2>
            <p className="text-lg text-gray-600">
              {isJapanese
                ? "日本とフィリピンで事業を展開する企業に対し、信頼性の高い、顧客第一のビジネスソリューションを提供します。"
                : "Bringing reliable, service-first business solutions to companies operating in Japan and the Philippines."}
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
              {isJapanese ? "HEROを選ぶ理由" : "Why Choose HERO"}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.01em] text-white md:text-4xl">
              {isJapanese ? "進歩のために設計されたワークスペース体験" : "A workspace experience designed for progress"}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {whyHero.map(({ num, title, desc }) => (
              <div
                key={num}
                className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="text-[28px] font-black leading-none tracking-[-0.04em] text-blue-400/80 text-shadow-xs">
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