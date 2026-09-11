"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Building,
  Landmark,
  ShoppingBag,
  Trees,
  Train,
  Hotel,
  Lock,
  Globe,
  Users,
  MonitorPlay,
  CalendarDays,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2
} from "lucide-react";

type LocalizedFaq = { q: string; a: string };

type SpaceType = {
  id: string;
  icon: React.ElementType;
  title: string;
  titleJa: string;
  tagline: string;
  taglineJa: string;
  pricingLabel: string;
  pricingLabelJa: string;
  overview: {
    description: string;
    descriptionJa: string;
    pricing: string;
    pricingJa: string;
    inclusions: string[];
    inclusionsJa: string[];
    terms: string[];
    termsJa: string[];
  };
  faqs: LocalizedFaq[];
  faqsJa: LocalizedFaq[];
};

const spaceTypes: SpaceType[] = [
  {
    id: "private",
    icon: Lock,
    title: "Private Office",
    titleJa: "個室オフィス",
    tagline: "Fully furnished. Move-in ready.",
    taglineJa: "家具付き、すぐに入居可能。",
    pricingLabel: "From ₱11,000 / seat / mo",
    pricingLabelJa: "₱11,000 / 席 / 月〜",
    overview: {
      description:
        "A private office fully furnished is a ready-to-use workspace designed for individuals or teams, equipped with modern office furniture, high-speed internet, and essential facilities. It provides a professional and secure environment where businesses can operate immediately without the need for setup or additional investment.",
      descriptionJa:
        "家具付きの個室オフィスは、個人やチーム向けにすぐご利用いただけるワークスペースです。モダンなオフィス家具、高速インターネット、必要な設備を完備しており、初期設定や追加投資なしにすぐに事業を開始できる、プロフェッショナルで安全な環境を提供します。",
      pricing:
        "Starts at PHP 11,000.00 per seat / month (Corridor Side) – PHP 12,000 per seat / month (Window Side)",
      pricingJa:
        "1席あたり月額PHP 11,000より(廊下側)- 1席あたり月額PHP 12,000(窓側)",
      inclusions: [
        "Fully furnished private office workstation",
        "Prestigious business address",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Mail and parcel handling",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned office environment",
        "Regular housekeeping services",
        "Meeting room usage credits",
        "Pantry access with complimentary use of common areas",
        "Printing and scanning",
        "24/7 secure access to the facility",
        "Company signage display (subject to availability)",
        "Access cards for secure entry",
        "Phone booth access for private calls",
        "Conference room access (based on entitlement or booking)",
        "Lounge and common area access",
      ],
      inclusionsJa: [
        "家具付き個室オフィスワークステーション",
        "格式あるビジネス住所",
        "高速インターネット(最大600Mbps)",
        "プロフェッショナルな受付サービス",
        "郵便物・荷物の受け取り対応",
        "光熱費(電気・水道・メンテナンス)込み",
        "空調完備のオフィス環境",
        "定期清掃サービス",
        "会議室利用クレジット",
        "共用エリア無料利用付きパントリーアクセス",
        "印刷・スキャン",
        "24時間365日の安全な施設アクセス",
        "会社サイネージ表示(空き状況による)",
        "安全な入退室用アクセスカード",
        "プライベート通話用電話ブース利用",
        "会議室アクセス(権利または予約に基づく)",
        "ラウンジ・共用エリアの利用",
      ],
      terms: ["3 Months", "6 Months", "9 Months", "12 Months"],
      termsJa: ["3ヶ月", "6ヶ月", "9ヶ月", "12ヶ月"],
    },
    faqs: [
      { q: "What is included in a private office rental?", a: "A private office includes fully furnished workspace, high-speed internet, utilities, reception services, and access to shared facilities such as meeting rooms and pantry areas." },
      { q: "Can I move in immediately?", a: "Move-in is typically available within 3 to 4 weeks after completing the required documents and payment. This allows time for preparation, onboarding, and ensuring your private office is fully ready for operations." },
      { q: "What is the minimum contract term?", a: "We offer flexible contract terms starting from 3 months, with options for 6, 9, and 12 months depending on your business needs." },
      { q: "Is the office space exclusive to my company?", a: "Yes, each private office is fully enclosed and dedicated solely to your company to ensure privacy and security." },
      { q: "Are utilities included in the monthly rate?", a: "Yes, electricity, water, air-conditioning, and general maintenance are included in the monthly rental fee." },
      { q: "Do I have 24/7 access to the office?", a: "24/7 access is available depending on your selected branch or add-on, allowing flexibility for different work schedules." },
      { q: "Can I upgrade or expand my office space later?", a: "Yes, office expansion is possible depending on availability, allowing you to add more seats or move to a larger unit as your team grows." },
      { q: "Are meeting rooms included in the package?", a: "Yes, meeting room credits are included in most rates, with additional usage available through add-on booking rates." },
      { q: "Is there a security deposit required?", a: "Yes, a refundable security deposit equivalent to 1–2 months' rent is required, subject to contract terms and account clearance." },
      { q: "Can I use the business address for company registration?", a: "Yes, the private office address can be used as your official business address for registration and corporate documentation." },
      { q: "Can I customize the office layout or branding inside my unit?", a: "Yes, minor layout adjustments and internal branding are allowed depending on management approval and space conditions." },
      { q: "What internet speed and setup do you provide?", a: "We provide high-speed shared business internet, with options to upgrade to a dedicated line for companies requiring higher stability or secure connections." },
      { q: "How is privacy maintained inside the office?", a: "Each private office is fully enclosed with controlled access, ensuring confidentiality and minimal external disruption." },
      { q: "Are there limits on the number of people inside my office?", a: "Yes, occupancy depends on the size of the office unit and is defined in your agreement to ensure safety and comfort." },
      { q: "Can I bring my own equipment or furniture?", a: "Yes, clients may bring additional equipment or replace select furniture items, subject to space and safety guidelines." },
      { q: "What happens if I need to increase or reduce my team size?", a: "You may upgrade or downgrade to a different office size depending on availability and contract terms." },
      { q: "Is there a dedicated support person for office concerns?", a: "Yes, an on-site team is available to assist with operational concerns such as maintenance, internet issues, and facility support." },
      { q: "Can I receive clients or guests in my office?", a: "Yes, clients and guests are welcome, with access managed through reception for security and proper coordination." },
      { q: "Are there restrictions on working hours for tenants?", a: "Most offices allow flexible, with extended or 24/7 access available as an upgrade." },
      { q: "What makes your private office different from traditional leasing?", a: "Our private offices are fully serviced and ready-to-use, eliminating the need for long-term build-out, utility setup, and operational staffing." },
    ],
    faqsJa: [
      { q: "個室オフィスのレンタルには何が含まれますか？", a: "個室オフィスには、家具付きワークスペース、高速インターネット、光熱費、受付サービス、会議室やパントリーエリアなどの共用施設の利用が含まれます。" },
      { q: "すぐに入居できますか？", a: "必要書類とお支払いの完了後、通常3～4週間以内にご入居いただけます。これは準備やオンボーディング、個室オフィスを完全に稼働できる状態にするための期間です。" },
      { q: "最低契約期間はどれくらいですか？", a: "3ヶ月からの柔軟な契約期間をご用意しており、ビジネスニーズに応じて6ヶ月、9ヶ月、12ヶ月のオプションもございます。" },
      { q: "オフィススペースは自社専用になりますか？", a: "はい、各個室オフィスは完全に区画され、プライバシーとセキュリティを確保するため貴社専用となります。" },
      { q: "光熱費は月額料金に含まれますか？", a: "はい、電気、水道、空調、一般メンテナンス費用は月額賃料に含まれています。" },
      { q: "オフィスに24時間アクセスできますか？", a: "選択された拠点やアドオンにより24時間アクセスが可能で、さまざまな勤務スケジュールに柔軟に対応できます。" },
      { q: "後からオフィススペースをアップグレードや拡張できますか？", a: "はい、空き状況に応じてオフィスの拡張が可能で、チームの成長に合わせて席数を増やしたり、より広いユニットへ移動することができます。" },
      { q: "パッケージに会議室は含まれていますか？", a: "はい、ほとんどの料金プランに会議室クレジットが含まれており、追加利用はアドオンの予約料金でご利用いただけます。" },
      { q: "敷金は必要ですか？", a: "はい、契約条件およびアカウント精算に基づき、家賃1～2ヶ月分に相当する返金可能な敷金が必要です。" },
      { q: "会社登録にビジネス住所を利用できますか？", a: "はい、個室オフィスの住所は、登記や法人書類のための正式なビジネス住所としてご利用いただけます。" },
      { q: "オフィス内のレイアウトやブランディングをカスタマイズできますか？", a: "はい、管理会社の承認およびスペースの状況に応じて、軽微なレイアウト変更や内装ブランディングが可能です。" },
      { q: "どのようなインターネット速度・環境が提供されますか？", a: "高速の共有ビジネス用インターネットを提供しており、より高い安定性やセキュアな接続が必要な企業様には、専用回線へのアップグレードも可能です。" },
      { q: "オフィス内のプライバシーはどのように確保されますか？", a: "各個室オフィスは完全に仕切られ、入退室が管理されているため、機密性が保たれ、外部からの妨げを最小限に抑えます。" },
      { q: "オフィス内の人数に制限はありますか？", a: "はい、収容人数はオフィスユニットの広さによって異なり、安全性と快適性を確保するため契約書に明記されます。" },
      { q: "自分の機材や家具を持ち込むことはできますか？", a: "はい、スペースおよび安全に関するガイドラインの範囲内で、追加機材の持ち込みや一部家具の交換が可能です。" },
      { q: "チームの人数を増減する必要がある場合はどうなりますか？", a: "空き状況と契約条件に応じて、異なるサイズのオフィスへのアップグレードまたはダウングレードが可能です。" },
      { q: "オフィスに関する相談を受け付ける専任担当者はいますか？", a: "はい、メンテナンスやインターネットの問題、施設サポートなど、運営に関するご相談に対応する常駐チームがございます。" },
      { q: "オフィスでお客様やゲストを迎えることはできますか？", a: "はい、セキュリティと適切な調整のため受付を通じてアクセスを管理しながら、お客様やゲストをお迎えいただけます。" },
      { q: "入居者の勤務時間に制限はありますか？", a: "ほとんどのオフィスは柔軟な勤務時間に対応しており、アップグレードにより延長または24時間アクセスもご利用いただけます。" },
      { q: "従来型の賃貸と個室オフィスの違いは何ですか？", a: "当社の個室オフィスは完全にサービス提供済みですぐにご利用いただけるため、長期の内装工事、設備設置、運営スタッフの手配が不要です。" },
    ],
  },
  {
    id: "virtual",
    icon: Globe,
    title: "Virtual Office",
    titleJa: "バーチャルオフィス",
    tagline: "Professional address. Zero overhead.",
    taglineJa: "プロフェッショナルな住所を、コストなしで。",
    pricingLabel: "From ₱2,000 / month",
    pricingLabelJa: "₱2,000 / 月〜",
    overview: {
      description:
        "A Virtual Office provides businesses with a prestigious professional address, complete business support services, and access to essential office facilities without the need for a physical workspace. It is ideal for companies that want to establish a credible presence, manage mail and communications efficiently, and access meeting spaces whenever needed.",
      descriptionJa:
        "バーチャルオフィスは、物理的なワークスペースを持つことなく、企業に格式あるビジネス住所、充実したビジネスサポートサービス、そして必要不可欠なオフィス設備へのアクセスを提供します。信頼性のある事業拠点を確立し、郵便や連絡を効率的に管理し、必要なときに会議スペースを利用したい企業に最適です。",
      pricing:
        "Basic – PHP 2,000/mo | Standard – PHP 3,000/mo | Premium – PHP 5,000/mo",
      pricingJa:
        "ベーシック – 月額PHP 2,000 | スタンダード – 月額PHP 3,000 | プレミアム – 月額PHP 5,000",
      inclusions: [
        "Business address",
        "Business registration documents assistance",
        "Mail handling",
        "Basic call handling",
        "Co-working space access (per plan)",
        "Conference room access (per plan)",
      ],
      inclusionsJa: [
        "ビジネス住所",
        "会社登録書類作成のサポート",
        "郵便物対応",
        "基本的な電話対応",
        "コワーキングスペースの利用(プランによる)",
        "会議室の利用(プランによる)",
      ],
      terms: ["6 Months", "12 Months"],
      termsJa: ["6ヶ月", "12ヶ月"],
    },
    faqs: [
      { q: "What is a Virtual Office?", a: "A Virtual Office provides a professional business address and essential support services without requiring a physical office space." },
      { q: "What is included in a Virtual Office package?", a: "It includes a business address, mail handling, reception support, and access to meeting rooms based on credits or booking." },
      { q: "Can I use the address for company registration?", a: "Yes, the Virtual Office address can be used for business registration, subject to applicable requirements and documentation." },
      { q: "How is mail handled under the Virtual Office service?", a: "Mail and parcels are received, recorded, and either stored for pickup or coordinated for forwarding upon request." },
      { q: "Can mail be forwarded to another location?", a: "Yes, mail forwarding is available as an add-on service, subject to courier fees and handling charges." },
      { q: "Do I get access to physical office facilities?", a: "Yes, clients can access meeting rooms, lounges, and common areas based on their package inclusions or bookings." },
      { q: "Is there a limit on meeting room usage?", a: "Yes, meeting room usage is typically allocated through credits or hourly booking depending on your plan." },
      { q: "Can I upgrade to a physical office later?", a: "Yes, you may upgrade to a private office or coworking space anytime, subject to availability." },
      { q: "Do I get a dedicated phone line?", a: "A dedicated business phone line or VoIP setup is available as an add-on service." },
      { q: "Is receptionist support included?", a: "Yes, professional reception services are included for handling calls, guests, and mail coordination." },
      { q: "Can I receive walk-in clients at the address?", a: "Yes, you may receive clients and guests in designated meeting or reception areas." },
      { q: "Is there 24/7 access to the facility?", a: "Access depends on your selected plan, with 24/7 access available for eligible packages or upgrades." },
      { q: "What industries commonly use Virtual Offices?", a: "Startups, freelancers, remote teams, international companies, and SMEs commonly use Virtual Offices." },
      { q: "What documents are required to sign up?", a: "Basic company and identification documents are required, depending on registration and compliance needs." },
      { q: "What makes a Virtual Office better than a home address?", a: "It provides a professional business identity, privacy protection, and access to corporate facilities that a home address cannot offer." },
    ],
    faqsJa: [
      { q: "バーチャルオフィスとは何ですか？", a: "バーチャルオフィスは、物理的なオフィススペースを持たずに、プロフェッショナルなビジネス住所と必要不可欠なサポートサービスを提供します。" },
      { q: "バーチャルオフィスのパッケージには何が含まれますか？", a: "ビジネス住所、郵便物対応、受付サポート、クレジットまたは予約に基づく会議室の利用が含まれます。" },
      { q: "会社登録にこの住所を利用できますか？", a: "はい、該当する要件および書類に基づき、バーチャルオフィスの住所を会社登録にご利用いただけます。" },
      { q: "バーチャルオフィスサービスでは郵便物はどのように扱われますか？", a: "郵便物や荷物は受領・記録され、受け取りのために保管されるか、ご要望に応じて転送の手配を行います。" },
      { q: "郵便物を別の場所へ転送できますか？", a: "はい、郵便物転送はアドオンサービスとしてご利用いただけます。配送料および手数料が別途発生します。" },
      { q: "物理的なオフィス施設を利用できますか？", a: "はい、パッケージの内容や予約状況に応じて、会議室、ラウンジ、共用エリアをご利用いただけます。" },
      { q: "会議室の利用に制限はありますか？", a: "はい、会議室の利用は通常、プランに応じたクレジットまたは時間単位の予約で割り当てられます。" },
      { q: "後から物理オフィスへアップグレードできますか？", a: "はい、空き状況に応じて、いつでも個室オフィスやコワーキングスペースへアップグレードいただけます。" },
      { q: "専用の電話回線は付いていますか？", a: "専用のビジネス用電話回線またはVoIP環境は、アドオンサービスとしてご利用いただけます。" },
      { q: "受付サポートは含まれますか？", a: "はい、電話対応、来客対応、郵便物の調整を行うプロフェッショナルな受付サービスが含まれます。" },
      { q: "その住所に直接来客を迎えることはできますか？", a: "はい、指定された会議室や受付エリアでお客様やゲストをお迎えいただけます。" },
      { q: "施設への24時間アクセスはありますか？", a: "選択したプランによって異なり、対象パッケージやアップグレードにより24時間アクセスが可能です。" },
      { q: "どのような業種がバーチャルオフィスをよく利用していますか？", a: "スタートアップ、フリーランサー、リモートチーム、外資系企業、中小企業などが一般的にバーチャルオフィスを利用しています。" },
      { q: "申し込みに必要な書類は何ですか？", a: "登録およびコンプライアンス要件に応じて、基本的な会社書類と本人確認書類が必要です。" },
      { q: "自宅住所よりバーチャルオフィスが優れている点は何ですか？", a: "プロフェッショナルなビジネスとしての印象、プライバシー保護、そして自宅住所では得られない法人向け施設へのアクセスを提供します。" },
    ],
  },
  {
    id: "coworking",
    icon: Users,
    title: "Co-working Space",
    titleJa: "コワーキングスペース",
    tagline: "Flexible desks. Collaborative energy.",
    taglineJa: "柔軟なデスク利用と、活気ある協働空間。",
    pricingLabel: "From ₱550 / day",
    pricingLabelJa: "₱550 / 日〜",
    overview: {
      description:
        "A co-working space is a flexible and fully serviced shared workspace designed for individuals, freelancers, startups, and teams who need a productive and professional working environment without the commitment of a private office.",
      descriptionJa:
        "コワーキングスペースは、個室オフィスの契約にこだわらず、生産的でプロフェッショナルな作業環境を必要とする個人、フリーランサー、スタートアップ、チーム向けに設計された、柔軟でフルサービスの共有ワークスペースです。",
      pricing: "PHP 550 (Daily) / PHP 2,000 (Weekly) / PHP 5,500 (Monthly)",
      pricingJa: "PHP 550(1日)/ PHP 2,000(1週間)/ PHP 5,500(1ヶ月)",
      inclusions: [
        "Flexible co-working workstation",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned workspace environment",
        "Meeting room usage credits",
        "Pantry access with shared common areas",
        "24/7 secure access to the facility",
        "Access cards for secure entry",
        "Phone booth access for private calls",
        "Conference room access (based on entitlement or booking)",
        "Lounge and collaboration area access",
        "Unlimited Coffee, Tea and Water",
      ],
      inclusionsJa: [
        "柔軟に利用できるコワーキングワークステーション",
        "高速インターネット(最大600Mbps)",
        "プロフェッショナルな受付サービス",
        "光熱費(電気・水道・メンテナンス)込み",
        "空調完備のワークスペース環境",
        "会議室利用クレジット",
        "共用エリア付きパントリーアクセス",
        "24時間365日の安全な施設アクセス",
        "安全な入退室用アクセスカード",
        "プライベート通話用電話ブース利用",
        "会議室アクセス(権利または予約に基づく)",
        "ラウンジ・コラボレーションエリアの利用",
        "コーヒー・紅茶・お水が飲み放題",
      ],
      terms: ["Daily", "Weekly", "Monthly", "Yearly"],
      termsJa: ["1日", "1週間", "1ヶ月", "1年"],
    },
    faqs: [
      { q: "What is included in a co-working space membership?", a: "It includes a dedicated workstation in a shared environment, high-speed internet, access to common areas, reception services, and basic office amenities." },
      { q: "Do I need to bring my own equipment?", a: "You may bring your own laptop and personal devices. Basic office essentials such as desks, chairs, and internet access are already provided." },
      { q: "Is there a fixed seat assigned to me?", a: "Depending on your plan, you may either have a dedicated seat or a flexible seating arrangement within the co-working area." },
      { q: "Can I use the space for meetings or client presentations?", a: "Yes, meeting rooms and conference rooms are available, subject to booking and entitlement under your plan or add-ons." },
      { q: "Is co-working suitable for teams or only individuals?", a: "It is suitable for both individuals and small teams who prefer a flexible and cost-efficient workspace solution." },
      { q: "Are there privacy options available?", a: "Yes, private phone booths are available for confidential calls and discussions." },
      { q: "What are the operating hours of the co-working space?", a: "Operating hours depend on your package, with 24/7 access available for selected branches or upgrades." },
      { q: "Can I upgrade to a private office later?", a: "Yes, you may upgrade to a private office depending on availability and your business requirements." },
      { q: "Is the co-working space noisy or crowded?", a: "The environment is designed to be professional and well-managed to maintain productivity and minimize disruption." },
      { q: "Can I register my business using the co-working address?", a: "Yes, the business address can be used for registration depending on your selected plan and compliance requirements." },
    ],
    faqsJa: [
      { q: "コワーキングスペースの会員登録には何が含まれますか？", a: "共有環境内の専用ワークステーション、高速インターネット、共用エリアの利用、受付サービス、基本的なオフィス設備が含まれます。" },
      { q: "自分の機材を持参する必要がありますか？", a: "ご自身のノートパソコンや個人デバイスをお持ち込みいただけます。デスクや椅子、インターネット接続など基本的なオフィス設備はすでに完備しています。" },
      { q: "固定席は割り当てられますか？", a: "プランによって、専用席をご用意する場合と、コワーキングエリア内で自由に席を選べる場合があります。" },
      { q: "会議や顧客向けプレゼンテーションにスペースを利用できますか？", a: "はい、プランやアドオンの権利、予約状況に応じて会議室・カンファレンスルームをご利用いただけます。" },
      { q: "コワーキングはチーム向けですか、それとも個人向けですか？", a: "柔軟でコスト効率の良いワークスペースを求める個人および小規模チームの両方に適しています。" },
      { q: "プライバシーを確保するオプションはありますか？", a: "はい、機密性の高い通話や打ち合わせ用にプライベート電話ブースをご利用いただけます。" },
      { q: "コワーキングスペースの営業時間はどうなっていますか？", a: "パッケージによって異なり、選択された拠点やアップグレードによっては24時間アクセスも可能です。" },
      { q: "後から個室オフィスにアップグレードできますか？", a: "はい、空き状況およびビジネスニーズに応じて個室オフィスへアップグレードいただけます。" },
      { q: "コワーキングスペースは騒がしかったり混雑したりしませんか？", a: "生産性を維持し、支障を最小限に抑えるよう、プロフェッショナルに管理された環境を整えています。" },
      { q: "コワーキングの住所で会社登録できますか？", a: "はい、選択したプランおよびコンプライアンス要件に応じて、ビジネス住所を登録にご利用いただけます。" },
    ],
  },
  {
    id: "conference",
    icon: MonitorPlay,
    title: "Conference Room",
    titleJa: "会議室",
    tagline: "Impress clients. Lead every meeting.",
    taglineJa: "顧客を魅了し、すべての会議をリードする。",
    pricingLabel: "From ₱1,500 / hour",
    pricingLabelJa: "₱1,500 / 時間〜",
    overview: {
      description:
        "A fully furnished conference room designed for professional meetings, presentations, training sessions, and business discussions with complete AV equipment and support.",
      descriptionJa:
        "プロフェッショナルな会議、プレゼンテーション、研修、ビジネス上の議論のために設計された、家具付きの会議室です。AV機器一式とサポートを完備しています。",
      pricing: "PHP 1,500 (Hourly) / PHP 9,000 (Daily)",
      pricingJa: "PHP 1,500(1時間)/ PHP 9,000(1日)",
      inclusions: [
        "Fully-furnished Conference Room",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned workspace environment",
        "Projector and Screen",
        "Pantry access with shared common areas",
        "24/7 secure access to the facility",
        "Access cards for secure entry",
        "Phone booth access for private calls",
        "Unlimited Coffee, Tea and Water",
      ],
      inclusionsJa: [
        "家具付き会議室",
        "高速インターネット(最大600Mbps)",
        "プロフェッショナルな受付サービス",
        "光熱費(電気・水道・メンテナンス)込み",
        "空調完備のワークスペース環境",
        "プロジェクターとスクリーン",
        "共用エリア付きパントリーアクセス",
        "24時間365日の安全な施設アクセス",
        "安全な入退室用アクセスカード",
        "プライベート通話用電話ブース利用",
        "コーヒー・紅茶・お水が飲み放題",
      ],
      terms: ["Hourly", "Daily"],
      termsJa: ["時間単位", "1日単位"],
    },
    faqs: [
      { q: "What is included when I book the conference room?", a: "The booking includes a fully equipped meeting space, high-speed internet, seating arrangement, and access to basic office amenities." },
      { q: "How many people can the conference room accommodate?", a: "Capacity depends on the room size, typically suitable for small to medium-sized groups for meetings, presentations, or training sessions." },
      { q: "Do I need to book in advance?", a: "Yes, advance booking is recommended to ensure availability, especially during peak business hours." },
      { q: "Can I extend my booking if the room is still available?", a: "Yes, extensions are possible depending on schedule availability and prior reservations." },
      { q: "Is food and beverage allowed inside the conference room?", a: "Light refreshments are allowed, and catering can be arranged upon request depending on the package." },
      { q: "Is technical equipment provided for presentations?", a: "Basic display and presentation equipment may be available, with additional upgrades offered as add-ons." },
      { q: "Can I use the conference room for client meetings?", a: "Yes, the space is designed specifically for professional meetings, client presentations, and business discussions." },
      { q: "Is there privacy in the conference room?", a: "Yes, the room is fully enclosed to ensure privacy and confidentiality during meetings." },
      { q: "Can I access other facilities during my booking?", a: "Yes, guests may access shared areas such as lounges and pantry facilities depending on the booking terms." },
      { q: "What happens if I exceed my booked time?", a: "Additional charges may apply if you exceed your reserved time, subject to availability and management approval." },
    ],
    faqsJa: [
      { q: "会議室を予約すると何が含まれますか？", a: "予約には、設備の整った会議スペース、高速インターネット、座席配置、基本的なオフィス設備の利用が含まれます。" },
      { q: "会議室には何名収容できますか？", a: "収容人数は部屋の広さによって異なり、通常は会議、プレゼンテーション、研修向けの小～中規模グループに適しています。" },
      { q: "事前予約は必要ですか？", a: "はい、特にビジネスのピーク時間帯は、空き状況を確保するため事前予約をおすすめします。" },
      { q: "部屋が空いていれば予約を延長できますか？", a: "はい、スケジュールの空き状況や既存の予約状況に応じて延長が可能です。" },
      { q: "会議室内での飲食は可能ですか？", a: "軽食は可能で、パッケージによってはご要望に応じてケータリングの手配も承ります。" },
      { q: "プレゼンテーション用の機材は提供されますか？", a: "基本的なディスプレイやプレゼンテーション機材をご利用いただける場合があり、追加のアップグレードはアドオンとして提供しています。" },
      { q: "顧客との打ち合わせに会議室を利用できますか？", a: "はい、このスペースはプロフェッショナルな会議、顧客向けプレゼンテーション、ビジネス上の議論のために特別に設計されています。" },
      { q: "会議室内のプライバシーは確保されますか？", a: "はい、会議中のプライバシーと機密性を確保するため、部屋は完全に仕切られています。" },
      { q: "予約中に他の施設も利用できますか？", a: "はい、予約条件に応じて、ラウンジやパントリー施設などの共用エリアをゲストがご利用いただけます。" },
      { q: "予約時間を超過した場合はどうなりますか？", a: "予約時間を超過した場合、空き状況および管理会社の承認に応じて追加料金が発生することがあります。" },
    ],
  },
  {
    id: "event",
    icon: CalendarDays,
    title: "Event / Activity Area",
    titleJa: "イベント・アクティビティスペース",
    tagline: "Workshops. Launches. Networking.",
    taglineJa: "ワークショップ、ローンチ、ネットワーキングに。",
    pricingLabel: "From ₱5,000 / event",
    pricingLabelJa: "₱5,000 / イベント〜",
    overview: {
      description:
        "An event or activity area is a flexible, fully serviced space designed for corporate events, workshops, training, networking sessions, product launches, and group activities.",
      descriptionJa:
        "イベント・アクティビティスペースは、企業イベント、ワークショップ、研修、ネットワーキングセッション、製品発表、グループ活動のために設計された、柔軟でフルサービスのスペースです。",
      pricing: "Starts at PHP 5,000.00 (depending on setup and number of participants)",
      pricingJa: "PHP 5,000より(セッティングおよび参加人数による)",
      inclusions: [
        "Flexible event space setup (café area, office space, workshop, or networking style)",
        "High-speed internet (up to 600 Mbps)",
        "Professional reception services",
        "Utilities (electricity, water, and maintenance)",
        "Air-conditioned event environment",
        "Basic furniture setup (tables and chairs)",
        "Access to common lounge and collaboration areas",
        "Pantry access with shared facilities",
        "Unlimited coffee, tea, and drinking water",
        "24/7 secure access to the facility (subject to booking schedule)",
        "Access cards for entry",
        "Phone booth access for private calls",
        "Conference room access (if included in package or booking agreement)",
      ],
      inclusionsJa: [
        "柔軟なイベントスペースのセッティング(カフェスタイル、オフィススタイル、ワークショップ、ネットワーキングスタイルなど)",
        "高速インターネット(最大600Mbps)",
        "プロフェッショナルな受付サービス",
        "光熱費(電気・水道・メンテナンス)込み",
        "空調完備のイベント環境",
        "基本的な家具セッティング(テーブル・椅子)",
        "共用ラウンジ・コラボレーションエリアの利用",
        "共用設備付きパントリーアクセス",
        "コーヒー・紅茶・お水が飲み放題",
        "24時間365日の安全な施設アクセス(予約スケジュールによる)",
        "入退室用アクセスカード",
        "プライベート通話用電話ブース利用",
        "会議室アクセス(パッケージまたは予約契約に含まれる場合)",
      ],
      terms: ["Daily rental", "Monthly arrangements", "Yearly partnership agreements"],
      termsJa: ["1日レンタル", "月極利用", "年間パートナーシップ契約"],
    },
    faqs: [
      { q: "What types of events can be held in space?", a: "The space can accommodate corporate events, training, workshops, seminars, networking sessions, and small business gatherings." },
      { q: "How many guests can the event space accommodate?", a: "Capacity depends on the setup and layout, ranging from small group sessions to medium-sized corporate events." },
      { q: "Can the layout of the space be customized?", a: "Yes, the setup can be arranged in theater, classroom, workshop, or networking formats depending on your requirements." },
      { q: "Do you provide event equipment?", a: "Basic setup is included, while additional equipment such as microphones, projectors, and sound systems are available as add-ons." },
      { q: "Is catering allowed inside the event area?", a: "Yes, catering is allowed and can be arranged upon request or coordinated with your preferred provider." },
      { q: "Can I book the space regularly for training sessions?", a: "Yes, recurring bookings are available for companies or organizations conducting regular programs or workshops." },
      { q: "Is there support staff during events?", a: "Yes, on-site staff is available to assist with setup, technical support, and basic coordination during the event." },
      { q: "Can I use the space for private or exclusive events?", a: "Yes, the event area can be fully reserved for exclusive use to ensure privacy and focus during your activity." },
    ],
    faqsJa: [
      { q: "どのようなイベントをこのスペースで開催できますか？", a: "企業イベント、研修、ワークショップ、セミナー、ネットワーキングセッション、小規模なビジネス懇親会などに対応可能です。" },
      { q: "イベントスペースには何名収容できますか？", a: "収容人数はセッティングやレイアウトによって異なり、少人数のセッションから中規模の企業イベントまで対応しています。" },
      { q: "スペースのレイアウトはカスタマイズできますか？", a: "はい、ご要望に応じてシアター形式、教室形式、ワークショップ形式、ネットワーキング形式でセッティングいただけます。" },
      { q: "イベント用の機材は提供されますか？", a: "基本的なセッティングは含まれており、マイク、プロジェクター、音響システムなどの追加機材はアドオンとしてご利用いただけます。" },
      { q: "イベントエリア内でのケータリングは可能ですか？", a: "はい、ケータリングは可能で、ご要望に応じて手配するか、お好みの業者と調整いただけます。" },
      { q: "研修のためにこのスペースを定期的に予約できますか？", a: "はい、定期的なプログラムやワークショップを実施する企業・団体様向けに、継続予約をご利用いただけます。" },
      { q: "イベント中のサポートスタッフはいますか？", a: "はい、セッティング、技術サポート、基本的な運営調整を行う常駐スタッフがイベント中対応いたします。" },
      { q: "プライベートまたは貸し切りイベントにこのスペースを利用できますか？", a: "はい、プライバシーと集中を確保するため、イベントエリアを貸し切りで完全にご予約いただくことも可能です。" },
    ],
  },
];

/* FAQ Accordion */
function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-[#EEF2FB] transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-md font-semibold text-gray-800">{faq.q}</span>
            {open === i ? (
              <ChevronUp className="w-4 h-4 text-[#0D47A1] shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            )}
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-4 py-3 text-sm text-gray-700 bg-white">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* Map Embed with loading state */
function MapEmbed({ src, title, loadingLabel }: { src: string; title: string; loadingLabel: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gray-100 animate-pulse">
          <Loader2 className="w-5 h-5 text-[#0D47A1] animate-spin" />
          <span className="text-xs font-medium text-gray-400">{loadingLabel}</span>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

/*  Modal  */
function SpaceModal({
  space,
  onClose,
  isJapanese,
}: {
  space: SpaceType;
  onClose: () => void;
  isJapanese: boolean;
}) {
  const [tab, setTab] = useState<"overview" | "faq">("overview");
  const Icon = space.icon;

  const title = isJapanese ? space.titleJa : space.title;
  const pricingLabel = isJapanese ? space.pricingLabelJa : space.pricingLabel;
  const description = isJapanese ? space.overview.descriptionJa : space.overview.description;
  const pricing = isJapanese ? space.overview.pricingJa : space.overview.pricing;
  const inclusions = isJapanese ? space.overview.inclusionsJa : space.overview.inclusions;
  const terms = isJapanese ? space.overview.termsJa : space.overview.terms;
  const faqs = isJapanese ? space.faqsJa : space.faqs;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-1000 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Panel */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-[#0D47A1]">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
              <p className="text-sm text-blue-200">{pricingLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["overview", "faq"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === t
                  ? "text-[#0D47A1] border-b-2 border-[#0D47A1] bg-[#EEF2FB]"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {t === "overview" ? (isJapanese ? "概要" : "Overview") : (isJapanese ? "よくあるご質問" : "FAQ")}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {tab === "overview" ? (
              <div className="space-y-5">
                <p className="text-md text-gray-600 leading-relaxed">{description}</p>

                <div>
                  <p className="text-lg font-bold uppercase tracking-wider text-[#0D47A1] mb-1">
                    {isJapanese ? "料金" : "Pricing"}
                  </p>
                  <p className="text-md text-gray-600 font-medium">{pricing}</p>
                </div>

                <div>
                  <p className="text-lg font-bold uppercase tracking-wider text-[#0D47A1] mb-2">
                    {isJapanese ? "含まれるもの" : "What's Included"}
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-md text-gray-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0D47A1] shrink-0" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-lg font-bold uppercase tracking-wider text-[#0D47A1] mb-2">
                    {isJapanese ? "契約条件" : "Contract Terms"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {terms.map((term) => (
                      <span
                        key={term}
                        className="px-3 py-1 text-sm font-semibold rounded-full bg-[#EEF2FB] text-[#0A1E3F]"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <FaqAccordion faqs={faqs} />
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <a
              href="/quotation"
              className="flex-1 text-center px-4 py-2.5 bg-[#efb916] hover:bg-[#FFC107] text-white text-sm font-bold rounded-xl transition-colors"
            >
              {isJapanese ? "今すぐ見積もりを依頼" : "Get a Quote Now"}
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ServicesPageContent() {
  const [activeSpace, setActiveSpace] = useState<SpaceType | null>(null);
  const [locale, setLocale] = useState<"en" | "ja">("en");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const getStoredLocale = () => {
      const match = document.cookie.match(/(?:^|;\s*)hero_lang=([^;]+)/);
      return match?.[1] === "ja" ? "ja" : "en";
    };

    const updateLocale = (event?: Event) => {
      const detail = (event as CustomEvent<string> | undefined)?.detail;
      const nextLocale = detail === "ja" || detail === "en" ? detail : getStoredLocale();
      setLocale(nextLocale);
    };

    updateLocale();
    window.addEventListener("localeChanged", updateLocale);
    return () => window.removeEventListener("localeChanged", updateLocale);
  }, []);

  const isJapanese = locale === "ja";

  // Deep-link support: if the page is loaded (or navigated to, e.g. from the
  // chatbot's CTA buttons) with `?modal=<space-id>`, open that space's modal
  // automatically instead of requiring the visitor to click through the grid.
  useEffect(() => {
    const modalId = searchParams.get("modal");
    if (!modalId) {
      setActiveSpace(null);
      return;
    }
    const match = spaceTypes.find((space) => space.id === modalId);
    setActiveSpace(match ?? null);
  }, [searchParams]);

  const openSpaceModal = (space: SpaceType) => {
    setActiveSpace(space);
    router.push(`${pathname}?modal=${space.id}`, { scroll: false });
  };

  const closeSpaceModal = () => {
    setActiveSpace(null);
    if (searchParams.get("modal")) {
      router.push(pathname, { scroll: false });
    }
  };

  const moveInSteps = isJapanese
    ? [
        { step: 1, title: "お問い合わせ", description: "オフィスの空室状況やご利用方法についてご相談ください。" },
        { step: 2, title: "ご案内", description: "ご希望の利用形態に合わせて、最適なオフィス案をご案内します。" },
        { step: 3, title: "見積もり", description: "ご希望のスペース、人数、利用期間に基づき、見積もりをご提案します。" },
        { step: 4, title: "必要書類", description: "ご入居に必要な書類や条件をご確認のうえ、手続きを進めます。" },
        { step: 5, title: "契約", description: "契約書の締結と入居準備を進め、スムーズなご利用をサポートします。" },
        { step: 6, title: "ご利用開始", description: "新しいオフィスで業務を開始し、継続的なサポートを受けられます。" },
      ]
    : [
        { step: 1, title: "Inquiry", description: "Contact us to learn more about our office spaces and availability." },
        { step: 2, title: "Introduction", description: "We will provide you with detailed information about our office spaces." },
        { step: 3, title: "Quotation", description: "Receive a tailored quotation based on your preferred workspace, team size, and requirements." },
        { step: 4, title: "Requirements", description: "Submit the necessary documents and requirements to proceed with your workspace application." },
        { step: 5, title: "Contract", description: "Sign the lease agreement and finalize the move-in process." },
        { step: 6, title: "Start Using", description: "Begin using your new office space and receive ongoing support." },
      ];

  const tower6789Features = isJapanese
    ? [
        "1~22名向けの個室 50室",
        "PEZA認定ビル",
        "24時間年中無休のオフィスアクセス(午前8時から午後8時まで冷房完備)",
        "最大10名収容可能な会議室",
        "アメニティ施設を無料でご利用いただけます",
      ]
    : [
        "50 private rooms (1 to 22 people)",
        "PEZA certified building",
        "24/7 Office Access (8AM to 8PM Air-Conditioning)",
        "Meeting rooms up to 10 people",
        "Free Access to Amenities",
      ];

  const insularLifeFeatures = isJapanese
    ? [
        "1~5席対応の個室 45室",
        "PEZA認定ビル",
        "24時間年中無休のオフィスアクセス(24時間年中無休の空調完備)",
        "最大20名収容可能な会議室",
        "無料アクセス可能な設備",
      ]
    : [
        "45 Private Office (1 to 25 Seats)",
        "PEZA certified building",
        "24/7 Office Access (24/7 Air-Conditioning)",
        "Meeting rooms up to 20 people",
        "Free Access Amenities",
      ];

  const landmarkCategories = isJapanese
    ? [
        {
          icon: Building,
          label: "レストラン・カフェ",
          walk: "徒歩0～5分",
          items: [
            { name: "スターバックス(タワー6789)", time: "0～1分", desc: "タワー6789の1階にあるコーヒーショップ。ちょっとした打ち合わせやコーヒーブレイクに最適です。" },
            { name: "カワラーメン", time: "3～5分", desc: "日本式のラーメンで知られる、アヤラ通り沿いの人気ラーメン店。" },
            { name: "ジョリビー", time: "3～5分", desc: "フィリピンで愛されるファストフードチェーン。オフィス近くでの手軽なランチに便利です。" },
            { name: "マクドナルド", time: "3～5分", desc: "HEROの両拠点から徒歩圏内にある、おなじみの国際的ファストフード店。" },
          ],
        },
        {
          icon: Landmark,
          label: "金融機関・政府機関",
          walk: "徒歩2～8分",
          items: [
            { name: "RCBCプラザ", time: "6～8分", desc: "多国籍企業や大使館が入居する大規模な金融複合施設。" },
            { name: "マカティ中央郵便局", time: "5～7分", desc: "主要な郵便・行政サービスの拠点。" },
            { name: "イーストウェストバンク", time: "3～6分", desc: "日常的なビジネス取引に便利な銀行支店。" },
            { name: "ユニオンバンク", time: "3～6分", desc: "アヤラ通りのビジネスエリアに位置する、利用しやすい銀行施設。" },
          ],
        },
        {
          icon: ShoppingBag,
          label: "ショッピングモール・ライフスタイル施設",
          walk: "徒歩5～12分",
          items: [
            { name: "グリーンベルトモール(アヤラセンター)", time: "8～12分", desc: "高級ショッピング、飲食、ライフスタイルを楽しめるスポット。" },
            { name: "グロリエッタモール", time: "8～12分", desc: "大型の商業・エンターテインメント複合施設。" },
            { name: "SMマカティ", time: "8～10分", desc: "アヤラMRTエリアに直結した便利なショッピングモール。" },
            { name: "ザ・ランドマーク・マカティ", time: "7～10分", desc: "百貨店とスーパーマーケットが揃う施設。" },
          ],
        },
        {
          icon: Trees,
          label: "公園・オープンスペース",
          walk: "徒歩5～10分",
          items: [
            { name: "アヤラトライアングルガーデン", time: "5～8分", desc: "主要な企業タワーに囲まれた中心部の緑地。" },
            { name: "レガスピ・アクティブ・パーク", time: "10～12分", desc: "ジョギングや週末マーケット、屋外での打ち合わせに人気。" },
            { name: "ワシントン・サイシップ・パーク", time: "10～12分", desc: "休憩や非公式な打ち合わせに最適な静かな公園。" },
          ],
        },
        {
          icon: Train,
          label: "交通拠点",
          walk: "徒歩5～12分",
          items: [
            { name: "MRTアヤラ駅", time: "10～20分", desc: "マカティとEDSA回廊を結ぶ主要な鉄道路線。" },
            { name: "ワン・アヤラ・トランスポートターミナル", time: "10～20分", desc: "首都圏各路線へのバス・ジプニー・UVエクスプレスの主要拠点。" },
          ],
        },
        {
          icon: Hotel,
          label: "ホテル・ビジネス宿泊施設",
          walk: "徒歩5～10分",
          items: [
            { name: "ザ・ペニンシュラ・マニラ", time: "6～9分", desc: "ビジネス会議によく利用される、ラグジュアリーな5つ星ホテル。" },
            { name: "マカティ・シャングリ・ラ・ホテル", time: "7～10分", desc: "法人ゲスト向けのプレミアムな国際ホテル。" },
            { name: "ニューワールド・マカティ・ホテル", time: "6～9分", desc: "グリーンベルトエリア近くにあるビジネス利用に適したホテル。" },
          ],
        },
      ]
    : [
    {
      icon: Building,
      label: "Restaurants & Coffee Shops",
      walk: "0–5 mins walk",
      items: [
        { name: "Starbucks (Tower 6789)", time: "0–1 min", desc: "Coffee shop located on the ground floor of Tower 6789, perfect for quick meetings or coffee breaks." },
        { name: "Kawa Ramen", time: "3–5 mins", desc: "Popular ramen spot along Ayala Avenue known for its Japanese-style noodle bowls." },
        { name: "Jollibee", time: "3–5 mins", desc: "Well-loved Filipino fast-food chain, convenient for quick lunches near the office." },
        { name: "McDonald's", time: "3–5 mins", desc: "Familiar international fast-food option within walking distance of both HERO locations." },
      ],
    },
    {
      icon: Landmark,
      label: "Financial & Government Institutions",
      walk: "2–8 mins walk",
      items: [
        { name: "RCBC Plaza", time: "6–8 mins", desc: "Major financial complex hosting multinational corporations and embassies." },
        { name: "Makati Central Post Office", time: "5–7 mins", desc: "Key postal and government service hub." },
        { name: "EastWest Bank", time: "3–6 mins", desc: "Convenient banking branch for day-to-day business transactions." },
        { name: "UnionBank", time: "3–6 mins", desc: "Accessible banking facility serving the Ayala Avenue business corridor." },
      ],
    },
    {
      icon: ShoppingBag,
      label: "Shopping Malls & Lifestyle Hubs",
      walk: "5–12 mins walk",
      items: [
        { name: "Greenbelt Mall (Ayala Center)", time: "8–12 mins", desc: "Premium shopping, dining, and lifestyle destination." },
        { name: "Glorietta Mall", time: "8–12 mins", desc: "Major retail and entertainment complex." },
        { name: "SM Makati", time: "8–10 mins", desc: "Convenient shopping mall connected to Ayala MRT area." },
        { name: "The Landmark Makati", time: "7–10 mins", desc: "Department store and supermarket hub." },
      ],
    },
    {
      icon: Trees,
      label: "Parks & Open Spaces",
      walk: "5–10 mins walk",
      items: [
        { name: "Ayala Triangle Gardens", time: "5–8 mins", desc: "Central green space surrounded by major corporate towers." },
        { name: "Legazpi Active Park", time: "10–12 mins", desc: "Popular for jogging, weekend markets, and outdoor meetings." },
        { name: "Washington SyCip Park", time: "10–12 mins", desc: "Quiet garden park ideal for breaks and informal meetings." },
      ],
    },
    {
      icon: Train,
      label: "Transport Hubs",
      walk: "5–12 mins walk",
      items: [
        { name: "MRT Ayala Station", time: "10–20 mins", desc: "Main rail connection linking Makati to EDSA corridor." },
        { name: "One Ayala Transport Terminal", time: "10–20 mins", desc: "Major bus, jeep, and UV Express hub for Metro Manila routes." },
      ],
    },
    {
      icon: Hotel,
      label: "Hotels & Business Accommodation",
      walk: "5–10 mins walk",
      items: [
        { name: "The Peninsula Manila", time: "6–9 mins", desc: "Luxury 5-star hotel frequently used for business meetings." },
        { name: "Makati Shangri-La Hotel", time: "7–10 mins", desc: "Premium international hotel for corporate guests." },
        { name: "New World Makati Hotel", time: "6–9 mins", desc: "Business-friendly hotel near Greenbelt area." },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A8C]/90 via-[#1B3A8C]/70 to-[#1B3A8C]/80" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-md">
              {isJapanese ? "オフィスガイダンス＆サービス" : "Office Guidance & Services"}
            </h1>
            <p className="text-xl text-gray-300 font-semibold text-shadow-md">
              {isJapanese
                ? "お客様のビジネスニーズに対応する包括的なオフィスソリューション"
                : "Comprehensive office solutions for your business needs"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isJapanese ? "当社の拠点" : "Our Locations"}
            </h2>
            <p className="text-lg text-gray-600">
              {isJapanese
                ? "事業のニーズに合うHERO Serviced Office, Inc.の拠点をお選びください"
                : "Choose the HERO Serviced Office, Inc., location that best suits your business needs"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tower 6789 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
            >
              <div className="relative h-48 overflow-hidden group">
                <MapEmbed
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7277203334647!2d121.01805607468263!3d14.557556885923752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f316aaaab%3A0xf80063632113a229!2sHERO%20PH!5e0!3m2!1sen!2sph!4v1782451174323!5m2!1sen!2sph"
                  title="Tower 6789 map"
                  loadingLabel={isJapanese ? "地図を読み込み中…" : "Loading map…"}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isJapanese ? "Google マップで見る" : "View on Google Maps"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0D47A1] rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {isJapanese ? "タワー6789" : "Tower 6789"}
                    </h3>
                    <p className="text-sm text-[#0A1E3F] font-medium">
                      {isJapanese ? "マカティ市アヤラ通り6789番地、23階" : "23rd Floor, 6789 Ayala Avenue, Makati City"}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tower6789Features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services/tower-6789"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#FFC107] hover:bg-[#FFC107]/80 text-[#1B3A8C] rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 group"
                >
                  {isJapanese ? "タワー6789を見る" : "View Tower 6789 Makati"}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Insular Life Building */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl"
            >
              <div className="relative h-48 overflow-hidden group">
                <MapEmbed
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7349367396077!2d121.01852111072995!3d14.55714458586539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90f31651de5%3A0xf2d7d4161752e079!2sHero%20Serviced%20Office!5e0!3m2!1sen!2sph!4v1781155861898!5m2!1sen!2sph"
                  title="Insular Life Building map"
                  loadingLabel={isJapanese ? "地図を読み込み中…" : "Loading map…"}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isJapanese ? "Google マップで見る" : "View on Google Maps"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0D47A1] rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {isJapanese ? "インシュラー・ライフ・ビル" : "Insular Life Building"}
                    </h3>
                    <p className="text-sm text-[#0A1E3F] font-medium">
                      {isJapanese ? "11 階、6781 アヤラ アベニュー コーナー パセオ デ ロハス、マカティ" : "11th Floor, 6781 Ayala Avenue corner Paseo de Roxas, Makati"}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {insularLifeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services/insular-life"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#FFC107] hover:bg-[#FFC107]/80 text-[#1B3A8C] rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 group"
                >
                  {isJapanese ? "インシュラー・ライフ・ビルを見る" : "View Insular Life Building"}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Space Type */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isJapanese ? "当社のスペースタイプ" : "Our Space Types"}
            </h2>
            <p className="text-lg text-gray-600">
              {isJapanese 
              ? "ビジネスの成長段階に合わせて設計された、柔軟なワークスペースソリューション。" 
              : "Flexible workspace solutions designed for every stage of business growth."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {spaceTypes.map((space, i) => {
              const Icon = space.icon;
              return (
                <motion.button
                  key={space.id}
                  onClick={() => openSpaceModal(space)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0D47A1]/30 hover:shadow-xl"
                >
                  <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-[#0D47A1] transition-transform duration-300 group-hover:scale-x-100" />

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0D47A1] transition-all duration-300 group-hover:bg-[#0D47A1] group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>

                  <div className="mt-6 space-y-3">
                    <h3 className="text-xl font-bold text-[#0A1E3F] transition-colors group-hover:text-[#0D47A1]">
                      {isJapanese ? space.titleJa : space.title}
                    </h3>

                    <span className="inline-flex rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#0D47A1]">
                      {isJapanese ? space.pricingLabelJa : space.pricingLabel}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-8 font-bold text-[#0D47A1] group-hover:gap-3 hover:text-[#FFC107] hover:underline transition-all duration-200 hover:scale-105 active:scale-95 group">
                    <span>{isJapanese ? "スペースを見る" : "Explore Space"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      {activeSpace && (
        <SpaceModal space={activeSpace} onClose={closeSpaceModal} isJapanese={isJapanese} />
      )}

      {/* Move-In Flow */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isJapanese ? "入居までの流れ" : "Flow Until Moving In"}
            </h2>
            <p className="text-lg text-gray-600">
              {isJapanese ? "オフィス利用までの簡単な6ステップ" : "Simple 6-step process to start using our office"}
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#C5D2EC] hidden lg:block" />
            <div className="space-y-8">
              {moveInSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  <div className="flex-1">
                    <div className={`bg-gray-50 rounded-2xl text-center p-6 ${index % 2 === 0 ? "lg:mr-8" : "lg:ml-8"}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isJapanese ? `ステップ${item.step}: ${item.title}` : `Step ${item.step}: ${item.title}`}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-[#0D47A1] rounded-full hidden lg:flex items-center justify-center text-white text-2xl font-bold z-10 shadow-lg shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Landmarks */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isJapanese ? "周辺施設" : "Nearby Landmarks"}
            </h2>
            <p className="text-lg text-gray-600">
              {isJapanese
                ? "アヤラ通りの両拠点周辺には、必要な施設が徒歩圏内に揃っています。"
                : "Everything you need is within walking distance from both HERO locations on Ayala Avenue."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landmarkCategories.map((cat, catIdx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: catIdx * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-[#EEF2FB] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#0D47A1]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-md font-bold text-gray-900 leading-tight">{cat.label}</p>
                      <p className="text-sm text-[#1565C0] font-semibold mt-0.5">{cat.walk}</p>
                    </div>
                  </div>

                  {/* Landmark rows */}
                  <ul className="divide-y divide-gray-50">
                    {cat.items.map((item) => (
                      <li key={item.name} className="px-5 py-3.5">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <span className="text-md font-semibold text-gray-900 leading-snug">{item.name}</span>
                          <span
                            className="text-xs font-bold whitespace-nowrap shrink-0 mt-0.5 px-2 py-0.5 rounded-full bg-[#FFC107]/40 text-gray-600"
                          >
                            ~{item.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-[#0D47A1] to-[#00ACC1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
            {isJapanese ? "フィリピンでの事業を始める準備はできていますか？" : "Ready to Start Your Business in the Philippines?"}
          </h2>
          <p className="text-md text-white/90 mb-8">
            {isJapanese
              ? "今すぐご相談いただき、最適なオフィスソリューションをご案内します。"
              : "Contact us today for a personalized tour and discover the perfect office solution for your business."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quotation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A8C] rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              {isJapanese ? "見積もりを依頼する →" : "Get a Quote →"}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              {isJapanese ? "お問い合わせ" : "Contact Us"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesPageContent />
    </Suspense>
  );
}