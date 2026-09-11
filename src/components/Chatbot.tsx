"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
    MessageCircle,
    X,
    Send,
    ChevronRight,
    AlertCircle,
    Loader2,
    UserRound,
    ExternalLink,
} from "lucide-react";
import { chatApi, ChatApiError, type ConversationResponse } from "../lib/chatApi";

interface CTA {
    label: string;
    labelJa?: string;
    href: string;
}

interface Message {
    id: string;
    type: "bot" | "user";
    text: string;
    time: string;
    source?: string;
    cta?: CTA;
}

const SESSION_STORAGE_KEY = "hero_chat_session_id";
const CHAT_SESSION_COOKIE_KEY = "hero_chat_session_id";
const CHAT_STATE_KEY = "hero_chat_state";

function getStoredLocale(): "en" | "ja" {
    if (typeof document === "undefined") return "en";

    const match = document.cookie.match(/(?:^|;\s*)hero_lang=([^;]+)/);
    return match?.[1] === "ja" ? "ja" : "en";
}

function getLocalizedText(text: { en: string; ja: string }): string {
    return getStoredLocale() === "ja" ? text.ja : text.en;
}

function getLocalizedCta(cta?: CTA): CTA | undefined {
    if (!cta) return undefined;

    return {
        ...cta,
        label: getStoredLocale() === "ja" ? cta.labelJa ?? cta.label : cta.label,
    };
}

function getStoredConversationSessionId(): string | null {
    if (typeof document === "undefined") return null;

    const cookieValue = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${CHAT_SESSION_COOKIE_KEY}=`))
        ?.split("=")[1];

    if (cookieValue) {
        return decodeURIComponent(cookieValue);
    }

    const fallback =
        window.localStorage.getItem(SESSION_STORAGE_KEY) ??
        window.sessionStorage.getItem(SESSION_STORAGE_KEY);

    return fallback || null;
}

function setStoredConversationSessionId(sessionId: string) {
    if (typeof document === "undefined") return;

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString();
    document.cookie = `${CHAT_SESSION_COOKIE_KEY}=${encodeURIComponent(sessionId)}; path=/; max-age=2592000; expires=${expires}; SameSite=Lax${secure}`;

    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

function clearStoredConversationSessionId() {
    if (typeof document === "undefined") return;

    document.cookie = `${CHAT_SESSION_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

function Modal({ open, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className={`fixed inset-0 z-1100 flex items-center justify-center p-4 backdrop-blur-xs ${className ?? ""}`}
        >
            <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <h2 id="modal-title" className="text-base font-bold text-gray-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-y-auto px-5 py-4 text-sm text-gray-600 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-4 last:mb-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                {children}
            </div>
        </div>
    );
}

function PrivacyPolicyContent() {
    return (
        <>
            <p className="mb-4">
                Thank you very much for using the services provided by Hero PH INC.
                (hereinafter, &quot;we/our/us&quot;).
            </p>
            <p className="mb-4">
                The Privacy Policy (hereinafter, &quot;the Policy&quot;) sets forth our
                privacy information handling principles. You or users are deemed to have
                agreed with the Policy if you use our services.
            </p>

            <Section title="(1) What is privacy information?">
                Privacy information includes both personal information; and history
                information and characteristic information. Personal information refers
                to the personal information prescribed in the Act on the Protection of
                Personal Information or information relating to a living individual,
                specifically the name, date of birth, address, telephone number and
                other contact information, and any other described information that can
                identify individuals. Information other than personal information
                corresponds to history and characteristic information, such as services
                used, products purchased, history of pages/ads viewed, search keywords
                used by users, time and date of use, methods of using, using
                environment, postal code, gender, occupation, age, user&apos;s IP
                address, cookie information, location information, and terminal
                identification information.
            </Section>

            <Section title="(2) How do you collect privacy information?">
                We may collect personal information when a user makes a user
                registration or use any of our services and/or history and
                characteristic information of a user when a user uses any of our
                services or views any of the pages of our website. If a user performs
                settings in such a way that the use of the services is linked with any
                external service, we will collect the ID to be used by the user in the
                external service and/or the information that the user agrees to disclose
                to the linked service under the external service&apos;s privacy
                settings.
            </Section>

            <Section title="(3) For what purpose do you use privacy information?">
                <ul className="list-[upper-alpha] list-inside space-y-2 mt-1">
                    <li>
                        To present registered information so that users can view and/or
                        correct their registered information and view the status of use.
                    </li>
                    <li>
                        To use an e-mail address to notify or contact users, or to send
                        products to users.
                    </li>
                    <li>
                        To use information such as name, date of birth, and address for user
                        identity verification.
                    </li>
                    <li>To use payment-related information in order to charge users.</li>
                    <li>
                        To display registered information on input screens so that users can
                        enter data easily.
                    </li>
                    <li>
                        To refuse the use of the Service by users who violate the Terms of
                        Use.
                    </li>
                    <li>To answer inquiries from users.</li>
                    <li>
                        To prepare statistical data processed in a form that does not permit
                        personal identification.
                    </li>
                    <li>
                        To distribute or display advertisements of us or a third party.
                    </li>
                    <li>To use privacy information for marketing.</li>
                    <li>Purposes incidental to the purposes of use above.</li>
                </ul>
            </Section>

            <Section title="(4) Do you provide privacy information for a third party?">
                We will not provide privacy information for a third party without prior
                approval of users except where required under laws and regulations,
                where required for protecting human life or property, or where necessary
                to help a national organization perform clerical work prescribed by law.
            </Section>

            <Section title="(5) Can I check my privacy information or request correction?">
                If a user requests disclosure of their own privacy information, we will
                disclose it without delay unless doing so would harm the interests of
                the user or third party, significantly hinder our operations, or violate
                laws and regulations. A fee of 1,000 yen applies per disclosure
                instance. Incorrect personal information can be corrected or deleted
                upon request.
            </Section>

            <Section title="(6) Can I request discontinuation of use?">
                Users may request discontinuation of use of their privacy information.
                We will conduct a necessary investigation and take appropriate measures,
                informing the user without delay.
            </Section>

            <Section title="(7) Change of Privacy Policy">
                This Privacy Policy is subject to changes without notice. Changes take
                effect when posted to this website.
            </Section>

            <Section title="(8) Inquiry Contact">
                <p>Contact person: Minoru Kobayashi</p>
                <p>Company name: Hero Serviced Office, Inc. Inc.</p>
                <p>
                    Address: 23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila,
                    Philippines
                </p>
                <p>
                    E-mail:{" "}
                    <a
                        href="mailto:salesofficer@heroph.net"
                        className="text-[#1565C0] underline"
                    >
                        salesofficer@heroph.net
                    </a>
                </p>
            </Section>
        </>
    );
}

function TermsOfServiceContent() {
    return (
        <>
            <p className="mb-4">
                By accessing or using the services provided by Hero Serviced Office, Inc.
                Inc., you agree to be bound by these Terms of Service. Please read them
                carefully before using our services.
            </p>

            <Section title="1. Use of Services">
                You agree to use our services only for lawful purposes and in accordance
                with these Terms. You must not use our services in any way that violates
                applicable laws or regulations, or in a manner that is harmful,
                fraudulent, or deceptive.
            </Section>

            <Section title="2. User Accounts">
                You are responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your account. Please
                notify us immediately of any unauthorized use of your account.
            </Section>

            <Section title="3. Payment and Charges">
                All charges for services are due as specified in your service agreement.
                Failure to pay charges may result in suspension or termination of
                services. All fees are non-refundable unless otherwise stated.
            </Section>

            <Section title="4. Limitation of Liability">
                Hero Serviced Office, Inc. Inc. shall not be liable for any indirect,
                incidental, or consequential damages arising from your use of our
                services. Our total liability shall not exceed the amount paid by you
                for the services in the preceding month.
            </Section>

            <Section title="5. Termination">
                We reserve the right to terminate or suspend access to our services
                immediately, without prior notice, if you breach these Terms of Service
                or engage in conduct that we determine to be harmful to other users or
                to us.
            </Section>

            <Section title="6. Changes to Terms">
                We reserve the right to modify these Terms at any time. Changes will be
                effective upon posting to our website. Continued use of our services
                after any such changes constitutes your acceptance of the new Terms.
            </Section>

            <Section title="7. Governing Law">
                These Terms shall be governed by and construed in accordance with the
                laws of the Republic of the Philippines. Any disputes shall be subject
                to the exclusive jurisdiction of the courts of Makati City.
            </Section>

            <Section title="8. Contact">
                <p>For questions about these Terms, please contact us:</p>
                <p>Hero Serviced Office, Inc. Inc.</p>
                <p>
                    23F TOWER6789, Ayala Avenue 6789, Makati City 1209 Manila, Philippines
                </p>
                <p>
                    <a
                        href="mailto:sales@heroph.net"
                        className="text-[#1565C0] underline"
                    >
                        sales@heroph.net
                    </a>
                </p>
            </Section>
        </>
    );
}

const validators = {
    name: (v: string) => {
        if (!v.trim()) return "Full name is required.";
        if (v.trim().length < 2) return "Name must be at least 2 characters.";
        if (!/^[a-zA-Z\s'\-\.]+$/.test(v.trim()))
            return "Name can only contain letters, spaces, hyphens, and apostrophes.";
        return "";
    },
    email: (v: string) => {
        if (!v.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
            return "Please enter a valid email address.";
        return "";
    },
    phone: (v: string) => {
        const digits = v.replace(/\D/g, "");
        if (!v.trim()) return "Phone number is required.";
        if (digits.length < 7 || digits.length > 15)
            return "Please enter a valid phone number.";
        if (!/^[\d\s\+\-\(\)]+$/.test(v.trim()))
            return "Phone number contains invalid characters.";
        return "";
    },
    company: (value: string) => {
        void value;
        return "";
    },
};

type LeadField = keyof typeof validators;

type ConversationState = {
    id: number;
    session_id: string;
    remoteConversationId?: number;
    status?: string;
};

const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const makeId = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const WELCOME_MESSAGE: Message = {
    id: "welcome",
    type: "bot",
    text: "Hi there! 👋 I'm your HERO assistant. We deliver premium serviced offices and flexible workspace solutions in the Philippines. How can I help you today?",
    time: formatTime(),
    source: "AI Assistant",
};

const BUSINESS_HOURS_WINDOW = {
    days: [1, 2, 3, 4, 5], // Mon–Fri
    openHour: 8,
    closeHour: 20,
};

function isAgentAvailableNow(): boolean {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    return (
        BUSINESS_HOURS_WINDOW.days.includes(day) &&
        hour >= BUSINESS_HOURS_WINDOW.openHour &&
        hour < BUSINESS_HOURS_WINDOW.closeHour
    );
}

const OUT_OF_HOURS_MESSAGE = {
    en: "Our live agents are offline right now. Let us know your preferred time and how to reach you (email or phone), and someone from the team will follow up.",
    ja: "現在、ライブ担当者はオフラインです。ご希望の連絡時間と連絡方法（メールまたは電話）をご入力ください。担当者がご連絡いたします。",
} as const;

const PREFERRED_CONTACT_RECEIVED_MESSAGE = {
    en: "Got it, thank you! We've saved your preferred contact details and someone from the team will reach out. Feel free to keep chatting with me in the meantime.",
    ja: "ご希望の連絡先を受け付けました。担当者がご連絡いたします。しばらくはこのまま会話をお楽しみください。",
} as const;

const LIVE_AGENT_FOLLOW_UP_MESSAGE = {
    en: "In the meantime, you can also reach us directly: salesofficer@heroph.net\n+63 02 8801 3417 | +63 917 322 4211\n\nMonday to Friday: 8AM - 8PM\n\nWe'll keep this chat open so an agent can pick up right where we left off.",
    ja: "その間、次の方法でもご連絡いただけます：salesofficer@heroph.net\n+63 02 8801 3417 | +63 917 322 4211\n\n月〜金：8:00〜20:00\n\n担当者が会話の続きをすぐに受け取れるよう、このチャットはそのまま残します。",
} as const;

const CTA_LINKS = {
    quote: { label: "Request a Quotation", labelJa: "見積もりを依頼", href: "/quotation" },
    privateOffice: { label: "View Private Offices", labelJa: "個室オフィスを見る", href: "/services?modal=private" },
    virtualOffice: { label: "View Virtual Office", labelJa: "バーチャルオフィスを見る", href: "/services?modal=virtual" },
    coworking: { label: "View Co-working Space", labelJa: "コワーキングスペースを見る", href: "/services?modal=coworking" },
    meetingRooms: { label: "View Meeting Room", labelJa: "会議室を見る", href: "/services?modal=conference" },
    services: { label: "See All Services", labelJa: "サービス一覧を見る", href: "/services" },
    contact: { label: "Contact Us", labelJa: "お問い合わせ", href: "/contact" },
} as const;

const PREDEFINED_REPLIES: Record<string, { text: { en: string; ja: string }; cta?: CTA }> = {
    "Our Services": {
        text: {
            en: "We offer a range of workspace solutions:\n\n• Private Offices\n• Virtual Offices\n• Co-working Spaces\n• Meeting & Conference Rooms\n• Business Support Services\n\nAll designed to help your business operate professionally and efficiently!",
            ja: "以下のようなワークスペースソリューションをご用意しています。\n\n• 個室オフィス\n• バーチャルオフィス\n• コワーキングスペース\n• 会議室・会議スペース\n• ビジネスサポートサービス\n\nビジネスを安心・快適に進められる環境をご提供します。",
        },
        cta: CTA_LINKS.services,
    },
    "Contact Info": {
        text: {
            en: "Hero Serviced Office, Inc. provides premium, fully-equipped workspaces for businesses of all sizes in the Philippines. With 2+ years of experience and 20+ completed projects, we help companies scale without the overhead of a traditional office.\n\n📍 Tower 6789\n23F Tower6789, 6789 Ayala Avenue, Makati City 1209, Metro Manila, Philippines\n🕐 Mon–Fri, 8AM–8PM\n\n📍 Insular Life Building\n11F Insular Life Building, 6781 Ayala Avenue, Corner Paseo de Roxas, Makati City, Metro Manila, Philippines\n🕐 Open 24/7\n\n📧 Email: salesofficer@heroph.net\n📞 Phone: +63 02 8801 3417 | +63 917 322 4211\n\nFeel free to reach out — we'd love to hear from you!",
            ja: "Hero Serviced Office, Inc. は、フィリピンで事業を運営する企業に向けて、プレミアムで整備されたワークスペースを提供しています。2年以上の経験と20件以上の実績を持ち、伝統的なオフィスのオーバーヘッドを抑えながら事業拡大を支えます。\n\n📍 Tower 6789\n23F Tower6789, 6789 Ayala Avenue, Makati City 1209, Metro Manila, Philippines\n🕐 月〜金：8:00〜20:00\n\n📍 Insular Life Building\n11F Insular Life Building, 6781 Ayala Avenue, Corner Paseo de Roxas, Makati City, Metro Manila, Philippines\n🕐 24時間営業\n\n📧 Email: salesofficer@heroph.net\n📞 Phone: +63 02 8801 3417 | +63 917 322 4211\n\nご連絡をお待ちしています。",
        },
        cta: CTA_LINKS.contact,
    },
    "Private Office": {
        text: {
            en: `
Thank you for your interest in our Private Offices!

Hero Serviced Office, Inc. offers fully furnished and professional office spaces designed for startups, SMEs, and growing businesses. Our private offices include high-speed internet, reception services, meeting room access, business support, and a prestigious Makati business address.

To receive a customized quotation or schedule an office tour, please submit your inquiry here:
`,
            ja: `
個室オフィスへのご興味ありがとうございます。

Hero Serviced Office, Inc. は、スタートアップ企業・中小企業・成長中の事業者向けに、設備が整ったプロフェッショナルな個室オフィスを提供しています。高速インターネット、受付サービス、会議室利用、ビジネスサポート、信頼性の高いマカティの住所などが含まれます。

お見積もりのご相談やオフィス見学をご希望の場合は、こちらからお問い合わせください：
`,
        },
        cta: CTA_LINKS.privateOffice,
    },
    "Virtual Office": {
        text: {
            en: `Thank you for your interest in our Virtual Office services!

Establish a credible business presence in Makati without leasing a physical office. Our Virtual Office plans include a premium business address, mail handling, business registration support, and professional reception services.

For pricing and plan recommendations, please submit your inquiry here:
`,
            ja: `バーチャルオフィスサービスへのご興味ありがとうございます。

マカティで本格的な事業拠点を構えつつ、物理オフィスを借りずに運営できます。バーチャルオフィスでは、上質な事業所住所、郵便物対応、法人登記支援、プロフェッショナルな受付サービスをご利用いただけます。

料金やおすすめプランについては、こちらからお問い合わせください：
`,
        },
        cta: CTA_LINKS.virtualOffice,
    },
    "Co-working Space": {
        text: {
            en: `Thank you for your interest in our Co-working Space!

Enjoy a comfortable and productive workspace with high-speed internet, complimentary coffee, professional amenities, and a collaborative business environment. Flexible daily, weekly, and monthly plans are available.

Reserve your seat or send us your inquiry here:
`,
            ja: `コワーキングスペースへのご興味ありがとうございます。

高速インターネット、無料コーヒー、充実した設備と、協働しやすい環境を備えた快適なワークスペースをご利用いただけます。日・週・月単位の柔軟なプランをご用意しています。

席のご予約やお問い合わせは、こちらからどうぞ：
`,
        },
        cta: CTA_LINKS.coworking,
    },
    "Meeting Rooms": {
        text: {
            en: `Thank you for your interest in our Meeting Rooms!

Our fully equipped meeting rooms are ideal for client presentations, interviews, team meetings, seminars, and business discussions. Flexible hourly and whole-day rental options are available.

Check availability or submit your reservation request here:
`,
            ja: `会議室へのご興味ありがとうございます。

設備が整った会議室は、クライアント面談、面接、チームミーティング、セミナー、商談などに最適です。時間単位や1日単位の柔軟な貸し出しにも対応しています。

空き状況の確認やご予約は、こちらからどうぞ：
`,
        },
        cta: CTA_LINKS.meetingRooms,
    },
    "Get a Quote": {
        text: {
            en: "You can request a quotation for our services by filling out our quotation request form. We'll get back to you with a detailed quote based on your requirements.",
            ja: "サービスの見積もりは、見積もり依頼フォームからご連絡いただけます。ご要望に応じた詳細な見積もりをご案内いたします。",
        },
        cta: CTA_LINKS.quote,
    },
};

type BotRule = {
    keywords: string[];
    reply?: { en: string; ja: string };
    replyKey?: keyof typeof PREDEFINED_REPLIES;
    cta?: CTA;
};

const BOT_RULES: BotRule[] = [
    {
        keywords: ["thank", "thanks", "thx", "appreciate"],
        reply: {
            en: "You're very welcome! Is there anything else I can help you with?",
            ja: "どういたしまして。その他お手伝いできることはありますか？",
        },
    },
    {
        keywords: ["bye", "goodbye", "see you"],
        reply: {
            en: "Thanks for chatting with us! Have a great day.",
            ja: "ご利用ありがとうございました。良い一日をお過ごしください。",
        },
    },
    {
        keywords: [
            "hi",
            "hello",
            "hey",
            "good morning",
            "good afternoon",
            "good evening",
        ],
        reply: {
            en: "Hello! How can I help you today? You can ask about our services, private offices, virtual offices, co-working spaces, meeting rooms, pricing, or how to reach us.",
            ja: "こんにちは！今日はどのようなご用件でしょうか？サービス内容、個室オフィス、バーチャルオフィス、コワーキングスペース、会議室、料金、連絡先など、お気軽にご質問ください。",
        },
    },
    {
        keywords: ["service", "services", "what do you offer", "offer"],
        replyKey: "Our Services",
    },
    {
        keywords: ["about", "who are you", "company"],
        replyKey: "Contact Info",
    },
    {
        keywords: [
            "contact",
            "email",
            "phone number",
            "reach you",
            "address",
            "location",
            "where are you",
        ],
        replyKey: "Contact Info",
    },
    {
        keywords: ["private office", "office space", "desk space"],
        replyKey: "Private Office",
    },
    {
        keywords: ["virtual office", "virtual address", "mail handling"],
        replyKey: "Virtual Office",
    },
    {
        keywords: ["co-working", "coworking", "shared desk", "hot desk"],
        replyKey: "Co-working Space",
    },
    {
        keywords: ["meeting room", "conference room", "boardroom"],
        replyKey: "Meeting Rooms",
    },
    {
        keywords: [
            "price",
            "pricing",
            "cost",
            "rate",
            "quote",
            "quotation",
            "how much",
        ],
        replyKey: "Get a Quote",
    },
    {
        keywords: ["agent", "human", "representative", "real person"],
        reply: {
            en: 'I can connect you with a live team member — just tap "Talk to an Agent" below.',
            ja: '担当者につなぐことができます。下の「担当者と話す」をタップしてください。',
        },
    },
    {
        keywords: ["hour", "open", "opening time", "business hours"],
        reply: {
            en: "Tower 6789's live-chat desk is available Mon–Fri, 8AM–6PM (PHT). Our Insular Life location is staffed 24/7 on-site. You can also email us anytime at salesofficer@heroph.net.",
            ja: "Tower 6789のライブチャット対応は月〜金 8:00〜18:00（PHT）です。Insular Life Buildingは24時間体制で対応しています。メールでもいつでもご連絡いただけます。",
        },
    },
    {
        keywords: [
            "email me this",
            "email me the chat",
            "send me this chat",
            "chat history",
            "transcript",
            "copy of this conversation",
            "copy of our chat",
        ],
        reply: {
            en: "Sure — I'll email a copy of this conversation to the address you gave us. It should land in your inbox shortly.",
            ja: "もちろんです。ご入力いただいたメールアドレスに会話内容を送信いたします。すぐに届きます。",
        },
    },
];

const FALLBACK_REPLY = {
    en: "Thanks for your message! I'm not sure I fully understood that, but here's what I can help with — our services, private offices, virtual offices, co-working spaces, meeting rooms, pricing, or contact details. You can also tap one of the quick replies below, or tap \"Talk to an Agent\" for a live team member.",
    ja: "メッセージありがとうございます。よく理解できていない可能性がありますが、以下のことならお手伝いできます。サービス内容、個室オフィス、バーチャルオフィス、コワーキングスペース、会議室、料金、連絡先など。下のクイック返信から選ぶか、「担当者と話す」をタップしてください。",
} as const;

const HISTORY_REQUEST_KEYWORDS = [
    "email me this",
    "email me the chat",
    "send me this chat",
    "chat history",
    "transcript",
    "copy of this conversation",
    "copy of our chat",
];

function getLocalBotReply(userText: string): { text: string; cta?: CTA } {
    const text = userText.toLowerCase();

    for (const rule of BOT_RULES) {
        if (rule.keywords.some((kw) => text.includes(kw))) {
            const replyText = rule.reply
                ? getLocalizedText(rule.reply)
                : rule.replyKey
                    ? getLocalizedText(PREDEFINED_REPLIES[rule.replyKey].text)
                    : "";

            return {
                text: replyText,
                cta: getLocalizedCta(
                    rule.cta ??
                    (rule.replyKey ? PREDEFINED_REPLIES[rule.replyKey].cta : undefined) ??
                    getContextualCta(userText),
                ),
            };
        }
    }

    return {
        text: getLocalizedText(FALLBACK_REPLY),
        cta: getLocalizedCta(getContextualCta(userText) ?? CTA_LINKS.services),
    };
}

function wantsChatHistory(userText: string): boolean {
    const text = userText.toLowerCase();
    return HISTORY_REQUEST_KEYWORDS.some((kw) => text.includes(kw));
}

function getContextualCta(userText: string): CTA | undefined {
    const text = userText.toLowerCase();

    if (/(quote|quotation|pricing|price|cost|estimate|how much)/.test(text)) {
        return CTA_LINKS.quote;
    }

    if (/(private office|office space|desk space)/.test(text)) {
        return CTA_LINKS.privateOffice;
    }

    if (/(virtual office|virtual address|mail handling)/.test(text)) {
        return CTA_LINKS.virtualOffice;
    }

    if (/(coworking|co-working|shared desk|hot desk)/.test(text)) {
        return CTA_LINKS.coworking;
    }

    if (/(meeting room|conference room|boardroom)/.test(text)) {
        return CTA_LINKS.meetingRooms;
    }

    if (/(service|services|what do you offer|offer)/.test(text)) {
        return CTA_LINKS.services;
    }

    if (/(contact|email|phone number|reach you|address|location|where are you)/.test(text)) {
        return CTA_LINKS.contact;
    }

    return undefined;
}

const humanDelay = (replyLength = 0) => {
    const base = 450;
    const variance = Math.random() * 350; // 0–350ms jitter
    const lengthBump = Math.min(replyLength * 3, 500); // cap the length bonus
    return new Promise((res) => setTimeout(res, base + variance + lengthBump));
};

const quickReplyDelay = () =>
    new Promise((res) => setTimeout(res, 1000 + Math.random() * 1500));

const nextPaint = () =>
    new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            setTimeout(resolve, 0);
        });
    });

function isAgentRequestedStatus(status?: string | null): boolean {
    return status === "waiting_admin" || status === "agent_requested";
}

function isLiveAgentActiveStatus(status?: string | null): boolean {
    return status === "agent_active";
}

function isLiveAgentOwnedStatus(status?: string | null): boolean {
    return isAgentRequestedStatus(status) || isLiveAgentActiveStatus(status);
}

function isConversationEndedStatus(status?: string | null): boolean {
    return status === "agent_closed" || status === "closed";
}

function getPersistedMessageCta(text: string): CTA | undefined {
    const predefined = Object.values(PREDEFINED_REPLIES).find(
        (reply) => (reply.text.en === text || reply.text.ja === text) && reply.cta,
    );
    if (predefined?.cta) return predefined.cta;

    const liveAgentFollowUpText = getLocalizedText(LIVE_AGENT_FOLLOW_UP_MESSAGE);
    const outOfHoursText = getLocalizedText(OUT_OF_HOURS_MESSAGE);
    const preferredContactText = getLocalizedText(PREFERRED_CONTACT_RECEIVED_MESSAGE);

    if (
        text === outOfHoursText ||
        text === preferredContactText ||
        text === liveAgentFollowUpText
    ) {
        return CTA_LINKS.contact;
    }

    return getContextualCta(text);
}

function renderBotMessageText(text: string): React.ReactNode {
    if (text !== getLocalizedText(LIVE_AGENT_FOLLOW_UP_MESSAGE)) {
        return text;
    }

    return (
        <>
            <p>In the meantime, you can also reach us directly:</p>
            <p>
                <a
                    href="mailto:salesofficer@heroph.net"
                    className="text-[#1565C0] underline break-all"
                >
                    salesofficer@heroph.net
                </a>
            </p>
            <p>+63 02 8801 3417 | +63 917 322 4211</p>
            <p>Monday to Friday: 8AM - 8PM</p>
            <p>We&apos;ll keep this chat open so an agent can pick up right where we left off.</p>
        </>
    );
}

const Chatbot = () => {
    const [isStarted, setIsStarted] = useState(false);
    const [leadSubmitted, setLeadSubmitted] = useState(false);
    const [leadInfo, setLeadInfo] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
    });
    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
    });
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        phone: false,
        company: false,
    });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const [leadError, setLeadError] = useState("");
    const [resumed, setResumed] = useState(false);
    const [conversation, setConversation] = useState<ConversationState | null>(
        null,
    );
    const [conversationStatus, setConversationStatus] = useState<string | null>(null);
    const [sendError, setSendError] = useState("");
    const [modal, setModal] = useState<"privacy" | "terms" | null>(null);
    const [agreedToPolicy, setAgreedToPolicy] = useState(false);
    const [agreementTouched, setAgreementTouched] = useState(false);
    const [agentRequested, setAgentRequested] = useState(false);
    const [agentRequestInFlight, setAgentRequestInFlight] = useState(false);
    const [cancellingAgentRequest, setCancellingAgentRequest] = useState(false);
    const [restoringConversation, setRestoringConversation] = useState(true);
    const [endConversationOpen, setEndConversationOpen] = useState(false);
    const [endingConversation, setEndingConversation] = useState(false);
    const conversationRef = useRef<ConversationState | null>(null);
    const leadSubmittedRef = useRef(false);
    const conversationClosedRef = useRef(false);
    const [conversationClosed, setConversationClosed] = useState(false);
    const [awaitingPreferredContact, setAwaitingPreferredContact] = useState(false);
    const [locale, setLocale] = useState<"en" | "ja">("en");
    const isJapanese = locale === "ja";

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const previousStatusRef = useRef<string | null>(null);

    const agentRequestInFlightRef = useRef(false);
    const isClosingChatRef = useRef(false);

    const isProcessingLocalMessageRef = useRef(false);

    const pendingLocalUserTextsRef = useRef<Set<string>>(new Set());

    const scrollRafRef = useRef<number | null>(null);

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

    const quickReplies = isJapanese
        ? [
            { value: "Private Office", label: "個室オフィス" },
            { value: "Virtual Office", label: "バーチャルオフィス" },
            { value: "Co-working Space", label: "コワーキングスペース" },
            { value: "Meeting Rooms", label: "会議室" },
            { value: "Our Services", label: "サービス紹介" },
            { value: "Contact Info", label: "お問い合わせ" },
            { value: "Talk to an Agent", label: "担当者と話す" },
            { value: "Send this Chat", label: "この会話を送る" },
        ]
        : [
            { value: "Private Office", label: "Private Office" },
            { value: "Virtual Office", label: "Virtual Office" },
            { value: "Co-working Space", label: "Co-working Space" },
            { value: "Meeting Rooms", label: "Meeting Rooms" },
            { value: "Our Services", label: "Our Services" },
            { value: "Contact Info", label: "Contact Info" },
            { value: "Talk to an Agent", label: "Talk to an Agent" },
            { value: "Send this Chat", label: "Send this Chat" },
        ];

    const showResumeNotice = useCallback(() => {
        setResumed(true);
        window.setTimeout(() => setResumed(false), 3500);
    }, []);

    const syncConversationSnapshot = useCallback(
        (
            latestConversation: ConversationResponse,
            options?: { showResumed?: boolean; preservePending?: boolean },
        ) => {
            const preservePending = options?.preservePending ?? true;
            const nextConversation: ConversationState = {
                id: latestConversation.id,
                session_id: latestConversation.session_id,
                remoteConversationId: latestConversation.id,
                status: latestConversation.status,
            };

            setConversation(nextConversation);
            conversationRef.current = nextConversation;
            setConversationStatus(latestConversation.status);
            setLeadSubmitted(true);
            setIsStarted(true);

            const liveAgentOwned = isLiveAgentOwnedStatus(latestConversation.status);
            const conversationEnded = isConversationEndedStatus(latestConversation.status);

            setAgentRequested(liveAgentOwned);
            setConversationClosed(conversationEnded);
            setAgentRequestInFlight(false);
            agentRequestInFlightRef.current = false;
            leadSubmittedRef.current = true;
            conversationClosedRef.current = conversationEnded;
            previousStatusRef.current = latestConversation.status;

            if (typeof window !== "undefined") {
                setStoredConversationSessionId(latestConversation.session_id);
            }

            for (const text of Array.from(pendingLocalUserTextsRef.current)) {
                const confirmed = (latestConversation.messages ?? []).some(
                    (remote) => remote.sender === "user" && remote.message === text,
                );
                if (confirmed) {
                    pendingLocalUserTextsRef.current.delete(text);
                }
            }

            setMessages((prev) => {
                const prevCtaByText = new Map<string, CTA>();
                for (const item of prev) {
                    if (item.cta) prevCtaByText.set(item.text, item.cta);
                }

                const remoteMessages: Message[] = (latestConversation.messages ?? []).map((remote) => ({
                    id: `remote-${latestConversation.id}-${remote.id}`,
                    type: remote.sender === "user" ? "user" : "bot",
                    text: remote.message,
                    time: new Date(remote.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    source:
                        remote.sender === "admin"
                            ? "Live Agent"
                            : remote.sender === "assistant"
                                ? "AI Assistant"
                                : remote.sender === "system"
                                    ? "System"
                                    : undefined,
                    cta:
                        remote.sender === "assistant" || remote.sender === "system"
                            ? prevCtaByText.get(remote.message) ?? getPersistedMessageCta(remote.message)
                            : undefined,
                }));

                const current =
                    prev[0]?.type === "bot" && prev[0]?.text === WELCOME_MESSAGE.text
                        ? prev.slice(1)
                        : prev;

                const pendingLocalMessages = preservePending
                    ? current.filter(
                        (message) =>
                            message.type === "user" &&
                            !message.id.startsWith("remote-") &&
                            pendingLocalUserTextsRef.current.has(message.text) &&
                            !remoteMessages.some(
                                (remote) => remote.type === "user" && remote.text === message.text,
                            ),
                    )
                    : [];

                const nextMessages = pendingLocalMessages.length > 0
                    ? [...remoteMessages, ...pendingLocalMessages]
                    : remoteMessages;

                const currentSignature = current.map((message) => `${message.type}:${message.text}`).join("|");
                const nextSignature = nextMessages.map((message) => `${message.type}:${message.text}`).join("|");

                return currentSignature === nextSignature ? prev : nextMessages;
            });

            if (options?.showResumed) {
                showResumeNotice();
            }
        },
        [showResumeNotice],
    );

    const scrollToBottom = useCallback((instant: boolean = false) => {
        if (scrollRafRef.current !== null) {
            cancelAnimationFrame(scrollRafRef.current);
        }
        scrollRafRef.current = requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: instant ? "auto" : "smooth",
                block: "end",
            });
            scrollRafRef.current = null;
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    useEffect(() => {
        if (isChatOpen && leadSubmitted) {
            scrollToBottom(true);
        }
    }, [isChatOpen, leadSubmitted, scrollToBottom]);

    useEffect(() => {
        if (isChatOpen && leadSubmitted) {
            inputRef.current?.focus();
        }
    }, [isChatOpen, leadSubmitted]);

    useEffect(() => {
        if (!leadSubmitted || !conversation?.id) return;

        const interval = window.setInterval(async () => {
            if (isProcessingLocalMessageRef.current) return;

            const pollId = conversation.remoteConversationId ?? conversation.id;

            try {
                const latestConversation = await chatApi.getConversation(pollId);
                try {
                    console.debug(
                        "CHAT: polled conversation",
                        latestConversation.id,
                        latestConversation.status,
                        "messages",
                        (latestConversation.messages || []).length,
                    );
                } catch { }

                syncConversationSnapshot(latestConversation);
                setSendError("");
            } catch (err) {
                if (err instanceof ChatApiError && err.status === 404) {
                    window.clearInterval(interval);
                    setConversationClosed(true);
                    conversationClosedRef.current = true;
                    setSendError(
                        "This conversation is no longer available. Please start a new chat.",
                    );
                    return;
                }
                // Ignore transient polling errors so the chat stays responsive.
            }
        }, 3000);

        return () => window.clearInterval(interval);
    }, [conversation?.id, conversation?.remoteConversationId, leadSubmitted, syncConversationSnapshot]);

    useEffect(() => {
        if (!conversation?.id || !leadSubmitted) return;

        let stopped = false;
        const heartbeatIntervalMs = 10 * 60 * 1000; // 10 minutes

        const ping = async () => {
            if (stopped) return;
            try {
                const targetId = conversation.remoteConversationId ?? conversation.id;
                await chatApi.pingConversation(targetId);
            } catch (err) {
                if (err instanceof ChatApiError && err.status === 404) {
                    stopped = true;
                    setConversationClosed(true);
                    conversationClosedRef.current = true;
                }
                // otherwise ignore — heartbeat is best-effort
            }
        };

        // fire once immediately, then on an interval
        void ping();
        const id = window.setInterval(ping, heartbeatIntervalMs);

        return () => {
            stopped = true;
            window.clearInterval(id);
        };
    }, [conversation?.id, conversation?.remoteConversationId, leadSubmitted]);

    const requestTranscriptEmail = useCallback(
        async (conversationId: number | undefined) => {
            if (!conversationId) return false;
            try {
                await chatApi.emailChatHistory(conversationId);
                return true;
            } catch {
                return false;
            }
        },
        [],
    );

    const restorePersistedConversation = useCallback(async () => {
        if (typeof window === "undefined") {
            setRestoringConversation(false);
            return;
        }

        const storedSessionId = getStoredConversationSessionId();
        if (!storedSessionId) {
            setRestoringConversation(false);
            return;
        }

        try {
            const existingConversation = await chatApi.getConversationBySession(storedSessionId);
            syncConversationSnapshot(existingConversation, {
                showResumed: true,
                preservePending: false,
            });
        } catch (err) {
            if (err instanceof ChatApiError && err.status === 404) {
                clearStoredConversationSessionId();
            }
        } finally {
            setRestoringConversation(false);
        }
    }, [syncConversationSnapshot]);

    useEffect(() => {
        queueMicrotask(() => {
            void restorePersistedConversation();
        });
    }, [restorePersistedConversation]);

    // Persist chat state so refresh keeps the conversation intact.
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const state = {
                conversation,
                messages,
                leadSubmitted,
                conversationClosed,
            };
            window.sessionStorage.setItem(CHAT_STATE_KEY, JSON.stringify(state));
        } catch {
            // ignore storage errors
        }
    }, [conversation, messages, leadSubmitted, conversationClosed]);

    useEffect(() => {
        conversationRef.current = conversation;
        leadSubmittedRef.current = leadSubmitted;
        conversationClosedRef.current = conversationClosed;
        try {
            console.debug("CHAT: conversation changed", conversation, { leadSubmitted, conversationClosed });
        } catch { }
    }, [conversation, leadSubmitted, conversationClosed, conversationStatus]);

    useEffect(() => {
        return () => { };
    }, []);

    const handleCloseChat = async () => {
        isClosingChatRef.current = true;
        setIsChatOpen(false);

        window.setTimeout(() => {
            isClosingChatRef.current = false;
        }, 0);
    };


    const ensureConversation = useCallback(async (): Promise<ConversationState | null> => {
        if (conversationRef.current?.remoteConversationId ?? conversationRef.current?.id) {
            return conversationRef.current;
        }

        // Session-restore is disabled; if there's no active conversation yet,
        // a new one will be created via handleContinue().
        return null;
    }, []);

    const persistMessage = useCallback(
        async (
            activeConversation: { id: number; session_id: string; remoteConversationId?: number } | null,
            sender: "user" | "assistant" | "system",
            text: string,
        ) => {
            // Prefer the latest server-backed conversation id if available.
            const serverId =
                conversationRef.current?.remoteConversationId ?? conversationRef.current?.id ??
                activeConversation?.remoteConversationId ?? activeConversation?.id;

            try {
                console.debug("CHAT: persistMessage -> serverId", serverId, "sender", sender, "text", text?.slice?.(0, 120));
            } catch { }

            if (!serverId) return;

            if (sender === "user") {
                pendingLocalUserTextsRef.current.add(text);
            }

            try {
                await chatApi.sendMessage(serverId, sender, text);
                try { console.debug("CHAT: persistMessage sent", serverId, sender); } catch { }
            } catch (err) {
                try { console.debug("CHAT: persistMessage failed", err); } catch { }
            }
        },
        [],
    );

    const handleCtaClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
    };

    const handleQuickReply = async (reply: { value: string; label: string }) => {
        // Live agent owns the chat — quick replies must not fire.
        if (conversationClosed || agentRequested || isLiveAgentOwnedStatus(conversationStatus)) return;

        if (reply.value === "Talk to an Agent") {
            await handleTalkToAgent();
            return;
        }

        if (reply.value === "Send this Chat") {
            isProcessingLocalMessageRef.current = true;

            try {
                const time = formatTime();

                setMessages((prev) => [
                    ...prev,
                    { id: makeId(), type: "user", text: reply.label, time },
                ]);
                setIsTyping(true);
                await nextPaint();
                setSendError("");

                const activeConversation = await ensureConversation();

                // Persist the user's quick reply selection so it survives polling.
                void persistMessage(activeConversation, "user", reply.value);

                // Email the chat history
                const targetId =
                    conversation?.remoteConversationId ?? conversation?.id ??
                    activeConversation?.remoteConversationId ?? activeConversation?.id;

                const transcriptSent = targetId
                    ? await requestTranscriptEmail(targetId)
                    : false;

                await quickReplyDelay();
                setIsTyping(false);
                await nextPaint();

                const transcriptReply = isJapanese
                    ? transcriptSent
                        ? "チャット履歴をメールアドレスに送信しました。すぐに届きます。"
                        : "チャット履歴を送信できませんでした。もう一度お試しいただくか、直接お問い合わせください。"
                    : transcriptSent
                        ? "I've sent your chat history to your email address. You should receive it shortly."
                        : "I couldn't send your chat history right now. Please try again or contact our team directly.";

                setMessages((prev) => [
                    ...prev,
                    {
                        id: makeId(),
                        type: "bot",
                        text: transcriptReply,
                        time: formatTime(),
                        source: "HERO Assistant",
                    },
                ]);
                void persistMessage(activeConversation, "assistant", transcriptReply);
            } finally {
                isProcessingLocalMessageRef.current = false;
            }
            return;
        }

        const predefined = PREDEFINED_REPLIES[reply.value];

        if (!predefined) {
            console.error(`No predefined reply configured for quick reply: "${reply}"`);
            return;
        }

        isProcessingLocalMessageRef.current = true;

        try {
            const time = formatTime();

            setMessages((prev) => [
                ...prev,
                { id: makeId(), type: "user", text: reply.label, time },
            ]);
            setIsTyping(true);
            await nextPaint();
            setSendError("");

            const activeConversation = await ensureConversation();

            // Persist the user's quick reply selection so it survives polling.
            void persistMessage(activeConversation, "user", reply.value);

            await quickReplyDelay();
            setIsTyping(false);
            await nextPaint();

            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: getLocalizedText(predefined.text),
                    time: formatTime(),
                    source: "Quick Reply",
                    cta: getLocalizedCta(predefined.cta),
                },
            ]);
            void persistMessage(activeConversation, "assistant", getLocalizedText(predefined.text));
        } finally {
            isProcessingLocalMessageRef.current = false;
        }
    };

    const handleTalkToAgent = async () => {
        if (
            conversationClosed ||
            agentRequested ||
            isLiveAgentOwnedStatus(conversationStatus) ||
            awaitingPreferredContact ||
            agentRequestInFlight
        ) {
            return;
        }

        if (!leadSubmitted) {
            setIsStarted(true);
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: isJapanese
                        ? "担当者につなぐ前に、チームが連絡できるようお問い合わせ情報をご入力ください。"
                        : "Before we connect you to a live agent, please provide your contact details so our team can reach you.",
                    time: formatTime(),
                    source: "HERO Assistant",
                },
            ]);
            return;
        }

        setAgentRequestInFlight(true);
        agentRequestInFlightRef.current = true;
        isProcessingLocalMessageRef.current = true;

        try {
            const time = formatTime();
            const userText = "I'd like to talk to a live agent.";

            setMessages((prev) => [
                ...prev,
                { id: makeId(), type: "user", text: userText, time },
            ]);
            // Ensure typing indicator is visible before we proceed.
            setIsTyping(true);
            await nextPaint();
            setSendError("");

            const activeConversation = await ensureConversation();

            await quickReplyDelay();
            setIsTyping(false);
            await nextPaint();

            if (!isAgentAvailableNow()) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: makeId(),
                        type: "bot",
                        text: getLocalizedText(OUT_OF_HOURS_MESSAGE),
                        time: formatTime(),
                        source: "HERO Assistant",
                        cta: getLocalizedCta(CTA_LINKS.contact),
                    },
                ]);
                void persistMessage(activeConversation, "assistant", getLocalizedText(OUT_OF_HOURS_MESSAGE));
                setAwaitingPreferredContact(true);
            }

            try {
                const targetId =
                    conversation?.remoteConversationId ?? conversation?.id ??
                    activeConversation?.remoteConversationId ?? activeConversation?.id;

                try { console.debug("CHAT: requestAgent -> targetId", targetId, "conversationRef", conversationRef.current, "activeConversation", activeConversation); } catch { }

                if (targetId) {
                    const result = await chatApi.requestAgent(targetId, userText);
                    syncConversationSnapshot(result.conversation, { preservePending: false });
                }
            } catch {
                setSendError(
                    "We could not connect you to an agent right now. Please try again.",
                );
                setMessages((prev) => [
                    ...prev,
                    {
                        id: makeId(),
                        type: "bot",
                        text: "⚠️ We could not connect you to an agent right now. Please try again.",
                        time: formatTime(),
                        source: "HERO Assistant",
                    },
                ]);
                setAgentRequested(false);
            }
        } finally {
            setAgentRequestInFlight(false);
            agentRequestInFlightRef.current = false;
            isProcessingLocalMessageRef.current = false;
        }
    };

    const handleCancelAgentRequest = async () => {
        const targetId =
            conversation?.remoteConversationId ?? conversation?.id ??
            conversationRef.current?.remoteConversationId ?? conversationRef.current?.id;

        if (!targetId || cancellingAgentRequest || !isAgentRequestedStatus(conversationStatus)) return;

        setCancellingAgentRequest(true);
        setSendError("");

        try {
            const result = await chatApi.cancelAgentRequest(targetId);
            syncConversationSnapshot(result.conversation, { preservePending: false });
        } catch (err) {
            setSendError(
                err instanceof Error ? err.message : "Unable to cancel the live-agent request.",
            );
        } finally {
            setCancellingAgentRequest(false);
        }
    };

    const handleSendMessage = async () => {
        if (conversationClosed) return;
        if (!message.trim()) return;

        const liveAgentOwnsConversation =
            agentRequested || isLiveAgentOwnedStatus(conversationStatus);

        isProcessingLocalMessageRef.current = true;

        try {
            const time = formatTime();
            const userMessage: Message = {
                id: makeId(),
                type: "user",
                text: message,
                time,
            };

            setMessages((prev) => [...prev, userMessage]);
            setMessage("");
            setSendError("");

            const activeConversation = await ensureConversation();
            await persistMessage(activeConversation, "user", userMessage.text);

            if (awaitingPreferredContact) {
                setIsTyping(true);
                await nextPaint();
                await quickReplyDelay();

                setIsTyping(false);
                await nextPaint();

                setAwaitingPreferredContact(false);

                try {
                    const targetId =
                        conversation?.remoteConversationId ?? conversation?.id ??
                        activeConversation?.remoteConversationId ?? activeConversation?.id;
                    if (targetId) {
                        await chatApi.submitPreferredContact(targetId, {
                            preferred_time: userMessage.text,
                        });
                    }
                } catch {
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        id: makeId(),
                        type: "bot",
                        text: getLocalizedText(PREFERRED_CONTACT_RECEIVED_MESSAGE),
                        time: formatTime(),
                        source: "HERO Assistant",
                        cta: getLocalizedCta(CTA_LINKS.contact),
                    },
                ]);
                void persistMessage(
                    activeConversation,
                    "assistant",
                    getLocalizedText(PREFERRED_CONTACT_RECEIVED_MESSAGE),
                );
                return;
            }

            if (liveAgentOwnsConversation) {
                return;
            }

            const { text: replyText, cta } = getLocalBotReply(userMessage.text);

            setIsTyping(true);
            await nextPaint();

            await humanDelay(replyText.length);

            setIsTyping(false);
            await nextPaint();

            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: replyText,
                    time: formatTime(),
                    source: "AI Assistant",
                    cta,
                },
            ]);
            void persistMessage(activeConversation, "assistant", replyText);

            if (wantsChatHistory(userMessage.text)) {
                const targetId =
                    conversation?.remoteConversationId ?? conversation?.id ??
                    activeConversation?.remoteConversationId ?? activeConversation?.id;
                void requestTranscriptEmail(targetId);
            }
        } finally {
            isProcessingLocalMessageRef.current = false;
        }
    };

    const handleEndLiveAgentConversation = async () => {
        const targetId =
            conversation?.remoteConversationId ?? conversation?.id ??
            conversationRef.current?.remoteConversationId ?? conversationRef.current?.id;

        if (!targetId) {
            setEndConversationOpen(false);
            return;
        }

        setEndingConversation(true);
        setSendError("");

        try {
            await chatApi.endLiveAgent(targetId);
            const latestConversation = await chatApi.getConversation(targetId);
            syncConversationSnapshot(latestConversation, { preservePending: false });
        } catch (err) {
            setSendError(
                err instanceof Error ? err.message : "Unable to end the live-agent conversation.",
            );
        } finally {
            setEndingConversation(false);
            setEndConversationOpen(false);
        }
    };

    const handleFieldChange = (key: LeadField, value: string) => {
        setLeadInfo((prev) => ({ ...prev, [key]: value }));
        if (touched[key]) {
            setFieldErrors((prev) => ({ ...prev, [key]: validators[key](value) }));
        }
    };

    const handleFieldBlur = (key: LeadField) => {
        setTouched((prev) => ({ ...prev, [key]: true }));
        setFieldErrors((prev) => ({
            ...prev,
            [key]: validators[key](leadInfo[key]),
        }));
    };

    const validateAll = () => {
        const errors = {
            name: validators.name(leadInfo.name),
            email: validators.email(leadInfo.email),
            phone: validators.phone(leadInfo.phone),
            company: validators.company(leadInfo.company),
        };
        setFieldErrors(errors);
        setTouched({ name: true, email: true, phone: true, company: true });
        return !errors.name && !errors.email && !errors.phone;
    };

    const handleContinue = async () => {
        const fieldsValid = validateAll();
        setAgreementTouched(true);

        if (!fieldsValid || !agreedToPolicy || isSubmittingLead) return;

        setIsSubmittingLead(true);
        setLeadError("");

        try {
            const payload = {
                full_name: leadInfo.name.trim(),
                email_address: leadInfo.email.trim(),
                phone_number: leadInfo.phone.trim(),
                company_name: leadInfo.company.trim() || undefined,
                privacy_policy_accepted: agreedToPolicy,
            };

            const startResponse = await chatApi.start(payload);

            const newConversation: ConversationState = {
                id: startResponse.conversation_id,
                session_id: startResponse.session_id,
                remoteConversationId: startResponse.conversation_id,
                status: "active",
            };

            setConversation(newConversation);
            // Ensure our ref is in sync immediately so subsequent calls use server id.
            conversationRef.current = newConversation;
            try { console.debug("CHAT: started conversation", startResponse, newConversation); } catch { }

            if (typeof window !== "undefined") {
                setStoredConversationSessionId(newConversation.session_id);
            }

            setConversationStatus("active");
            previousStatusRef.current = "active";
            setConversationClosed(false);
            setAgentRequested(false);
            setAwaitingPreferredContact(false);
            setIsStarted(true);
            leadSubmittedRef.current = true;

            const greeting = isJapanese
                ? `こんにちは、${leadInfo.name.trim()}さん。お問い合わせ情報を受け取りました。今日はどのようなご用件ですか？`
                : `Hi, ${leadInfo.name.trim()}! Your details have been received. How can I help you today?`;
            setMessages([
                {
                    id: makeId(),
                    type: "bot",
                    text: greeting,
                    time: formatTime(),
                    source: "AI Assistant",
                },
            ]);
            await persistMessage(newConversation, "assistant", greeting);

            // AI handles the inquiry immediately — no extra step needed before chatting.
            setLeadSubmitted(true);
        } catch (err) {
            const detail = err instanceof Error ? err.message : undefined;
            setLeadError(
                detail || (isJapanese ? "お問い合わせ情報を保存できませんでした。もう一度お試しください。" : "We couldn't save your details. Please try again."),
            );
        } finally {
            setIsSubmittingLead(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Toggle button */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-[#00C8FE] hover:bg-[#00C8FE]/70 flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
                    aria-label="Open chat"
                >
                    <MessageCircle className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
                </button>
            )}

            {/* Chat window */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        role="dialog"
                        aria-label="Hero Serviced Office, Inc. chat"
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-6 right-5 z-1000 w-[calc(100vw-40px)] h-140 lg:h-145 md:w-100 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                    >
                        <style>{`
                            @media (prefers-reduced-motion: reduce) {
                                * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
                            }
                        `}</style>

                        {/* Header */}
                        <div className="bg-[#1B3A8C] px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Image
                                        src="/header_logo_icon.png"
                                        alt="Hero Serviced Office, Inc. Logo"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 object-contain"
                                    />
                                </div>

                                <div>
                                    <p className="text-white font-semibold text-md leading-tight">
                                        Hero Serviced Office, Inc.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseChat}
                                className="text-white/70 hover:text-white hover:bg-white/15 rounded-full p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            {/* Resumed previous session badge */}
                            {resumed && (
                                <div className="px-4 py-2 bg-yellow-50 border-t border-b border-yellow-100 text-yellow-800 text-xs text-center">
                                    Resumed your previous conversation
                                </div>
                            )}

                            {restoringConversation && (
                                <div className="flex h-full items-center justify-center px-6">
                                    <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading conversation...
                                    </div>
                                </div>
                            )}

                            {/* Welcome screen */}
                            {!restoringConversation && !isStarted && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full flex flex-col items-center justify-center text-center px-6 gap-5"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-[#1B3A8C] flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl font-bold">H</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {isJapanese ? "HEROへようこそ" : "Welcome to HERO"}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                            {isJapanese
                                                ? "HEROアシスタントです。ご利用前に、より良いサポートのためにお問い合わせ内容をお伺いします。"
                                                : "I&apos;m your HERO Assistant. Before we begin, we&apos;ll collect a few details so we can better serve you."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsStarted(true)}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3A8C] text-white text-sm font-medium hover:bg-[#16318a] active:scale-95 transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                                    >
                                        {isJapanese ? "はじめる" : "Get started"} <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <p className="text-xs text-gray-400">
                                        Powered by Hero Serviced Office, Inc.
                                    </p>
                                </motion.div>
                            )}

                            {/* Lead form */}
                            {!restoringConversation && isStarted && !leadSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="p-5 space-y-3"
                                >
                                    <div className="text-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {isJapanese ? "お客様の連絡先" : "Your contact details"}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {isJapanese
                                                ? "続行する前に必要事項をご入力ください。"
                                                : "Please fill in your details before continuing."}
                                        </p>
                                    </div>

                                    {(
                                        [
                                            { key: "name", placeholder: isJapanese ? "お名前" : "Full name", type: "text" },
                                            {
                                                key: "email",
                                                placeholder: isJapanese ? "メールアドレス" : "Email address",
                                                type: "email",
                                            },
                                            { key: "phone", placeholder: isJapanese ? "電話番号" : "Phone number", type: "tel" },
                                            {
                                                key: "company",
                                                placeholder: isJapanese ? "会社名（任意）" : "Company name (optional)",
                                                type: "text",
                                            },
                                        ] as { key: LeadField; placeholder: string; type: string }[]
                                    ).map((field) => {
                                        const hasError = touched[field.key] && fieldErrors[field.key];
                                        return (
                                            <div key={field.key} className="space-y-1">
                                                <input
                                                    type={field.type}
                                                    placeholder={field.placeholder}
                                                    value={leadInfo[field.key]}
                                                    onChange={(e) =>
                                                        handleFieldChange(field.key, e.target.value)
                                                    }
                                                    onBlur={() => handleFieldBlur(field.key)}
                                                    aria-invalid={Boolean(hasError)}
                                                    aria-describedby={
                                                        hasError ? `${field.key}-error` : undefined
                                                    }
                                                    disabled={isSubmittingLead}
                                                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${hasError
                                                        ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                                                        : touched[field.key] &&
                                                            !fieldErrors[field.key] &&
                                                            leadInfo[field.key]
                                                            ? "border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                                                            : "border-gray-200 focus:border-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/20"
                                                        }`}
                                                />
                                                <AnimatePresence>
                                                    {hasError && (
                                                        <motion.p
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                            id={`${field.key}-error`}
                                                            className="text-[11px] text-red-500 pl-1 flex items-center gap-1"
                                                        >
                                                            <AlertCircle className="w-3 h-3 shrink-0" />{" "}
                                                            {fieldErrors[field.key]}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}

                                    <div className="space-y-1.5 py-3">
                                        <label className="flex items-start gap-2 text-[11px] text-gray-500 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={agreedToPolicy}
                                                onChange={(e) => {
                                                    setAgreedToPolicy(e.target.checked);
                                                    setAgreementTouched(true);
                                                }}
                                                disabled={isSubmittingLead}
                                                aria-invalid={agreementTouched && !agreedToPolicy}
                                                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/40 shrink-0"
                                            />
                                            <span>
                                                {isJapanese ? "次の内容に同意します：" : "I agree to the"}{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => setModal("privacy")}
                                                    className="text-[#1565C0] underline hover:text-[#1B3A8C] transition-colors"
                                                >
                                                    {isJapanese ? "プライバシーポリシー" : "Privacy Policy"}
                                                </button>{" "}
                                                {isJapanese ? "および" : "and"}{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => setModal("terms")}
                                                    className="text-[#1565C0] underline hover:text-[#1B3A8C] transition-colors"
                                                >
                                                    {isJapanese ? "利用規約" : "Terms of Service"}
                                                </button>
                                                {isJapanese ? "に同意します。" : "."}
                                            </span>
                                        </label>
                                        <AnimatePresence>
                                            {agreementTouched && !agreedToPolicy && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="text-[11px] text-red-500 pl-1 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {isJapanese
                                                        ? "続行するにはプライバシーポリシーおよび利用規約への同意が必要です。"
                                                        : "Please accept the Privacy Policy and Terms of Service to continue."}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {leadError && (
                                        <p className="text-[11px] text-red-500 text-center flex items-center justify-center gap-1">
                                            <AlertCircle className="w-3 h-3 shrink-0" /> {leadError}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleContinue}
                                        disabled={isSubmittingLead}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B3A8C] py-2.5 text-sm font-medium text-white transition-all hover:bg-[#16318a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                                    >
                                        {isSubmittingLead ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>{isJapanese ? "送信中..." : "Submitting..."}</span>
                                            </>
                                        ) : (
                                            <span>{isJapanese ? "続行" : "Continue"}</span>
                                        )}
                                    </button>
                                    <p className="text-[11px] text-gray-400 text-center">
                                        Powered by Hero Serviced Office, Inc.
                                    </p>
                                </motion.div>
                            )}

                            {/* Messages */}
                            {!restoringConversation && leadSubmitted && (
                                <LayoutGroup>
                                    <div className="p-4 space-y-3">
                                        <AnimatePresence initial={false}>
                                            {messages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    layout="position"
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                                                >
                                                    {msg.type === "bot" && (
                                                        <div className="w-7 h-7 rounded-full bg-[#1B3A8C] flex items-center justify-center shrink-0 mr-2 mt-1">
                                                            <span className="text-white text-xs font-bold">H</span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm ${msg.type === "user"
                                                            ? "bg-[#1B3A8C] text-white rounded-br-sm"
                                                            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                                                            }`}
                                                    >
                                                        {msg.text === getLocalizedText(LIVE_AGENT_FOLLOW_UP_MESSAGE) ? (
                                                            <div className="text-sm leading-relaxed space-y-2">
                                                                {renderBotMessageText(msg.text)}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm whitespace-pre-line leading-relaxed">
                                                                {renderBotMessageText(msg.text)}
                                                            </p>
                                                        )}
                                                        {msg.cta && (
                                                            <a
                                                                href={msg.cta.href}
                                                                target="_self"
                                                                rel="noopener noreferrer"
                                                                onClick={handleCtaClick}
                                                                className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${msg.type === "user"
                                                                    ? "bg-white/15 text-white hover:bg-white/25"
                                                                    : "bg-[#1B3A8C] text-white hover:bg-[#16318a]"
                                                                    }`}
                                                            >
                                                                {msg.cta.label}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        <p
                                                            className={`text-[10px] mt-1 ${msg.type === "user" ? "text-blue-200 text-right" : "text-gray-400"}`}
                                                        >
                                                            {msg.type === "bot" && msg.source
                                                                ? `${msg.time} · ${msg.source}`
                                                                : msg.time}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {isTyping && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                                    className="flex justify-start items-end gap-2"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-[#1B3A8C] flex items-center justify-center shrink-0">
                                                        <span className="text-white text-xs font-bold">H</span>
                                                    </div>

                                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                                        <div className="flex gap-1">
                                                            {[0, 1, 2].map((i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="w-1.5 h-1.5 rounded-full bg-gray-400"
                                                                    animate={{
                                                                        y: [0, -4, 0],
                                                                        opacity: [0.4, 1, 0.4],
                                                                        scale: [0.8, 1, 0.8],
                                                                    }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut",
                                                                        delay: i * 0.18,
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Send error */}
                                        {sendError && !isTyping && (
                                            <p className="text-[11px] text-red-500 text-center flex items-center justify-center gap-1 pt-1">
                                                <AlertCircle className="w-3 h-3 shrink-0" /> {sendError}
                                            </p>
                                        )}

                                        {/* Preferred-contact prompt hint (out of business hours) */}
                                        <AnimatePresence>
                                            {awaitingPreferredContact && !isTyping && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 ml-9"
                                                >
                                                    Type your preferred day/time and contact method (email or
                                                    phone) below
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {!conversationClosed &&
                                                !isTyping &&
                                                !awaitingPreferredContact &&
                                                !agentRequested &&
                                                messages[messages.length - 1]?.type === "bot" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                                        className="pt-1"
                                                    >
                                                        <p className="text-[11px] text-gray-400 mb-2 pl-9">
                                                            {isJapanese ? 'クイック返信' : 'Quick replies'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5 pl-9">
                                                            {quickReplies.map((reply, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleQuickReply(reply)}
                                                                    disabled={
                                                                        reply.value === "Talk to an Agent" &&
                                                                        (agentRequested || agentRequestInFlight)
                                                                    }
                                                                    className="px-3 py-1.5 text-xs border border-[#1B3A8C] text-[#1B3A8C] rounded-full hover:bg-[#1B3A8C] hover:text-white active:scale-95 transition-all font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1B3A8C] inline-flex items-center gap-1"
                                                                >
                                                                    {reply.value === "Talk to an Agent" && (
                                                                        <UserRound className="w-3 h-3" />
                                                                    )}
                                                                    {reply.value === "Talk to an Agent" && agentRequestInFlight
                                                                        ? (isJapanese ? '担当者を呼び出しています…' : 'Requesting agent…')
                                                                        : reply.value === "Talk to an Agent" && agentRequested
                                                                            ? (isJapanese ? '担当者を依頼しました' : 'Agent requested')
                                                                            : reply.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>

                                        <div ref={messagesEndRef} />
                                    </div>
                                </LayoutGroup>
                            )}
                        </div>

                        {/* Input area */}
                        {leadSubmitted && !conversationClosed && (
                            <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
                                {isAgentRequestedStatus(conversationStatus) && (
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                                        <span>{isJapanese ? "担当者への依頼を送信しました。" : "Your live-agent request has been sent."}</span>
                                        <button
                                            type="button"
                                            onClick={() => void handleCancelAgentRequest()}
                                            disabled={cancellingAgentRequest}
                                            className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {cancellingAgentRequest ? (isJapanese ? "取り消し中..." : "Cancelling...") : (isJapanese ? "取り消し" : "Cancel")}
                                        </button>
                                    </div>
                                )}
                                {isLiveAgentActiveStatus(conversationStatus) && (
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-[#1B3A8C]">
                                        <span>{isJapanese ? "担当者と接続中です。" : "You&apos;re connected to a live agent."}</span>
                                        <button
                                            type="button"
                                            onClick={() => setEndConversationOpen(true)}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-[#1B3A8C]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1B3A8C] transition hover:bg-[#1B3A8C]/5"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            {isJapanese ? "担当者チャットを終了" : "End Live Agent Chat"}
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder={
                                            awaitingPreferredContact
                                                ? (isJapanese ? "例：平日18時以降、電話でご連絡ください" : "e.g. Weekdays after 6PM, reach me by phone…")
                                                : (isJapanese ? "メッセージを入力..." : "Type a message…")
                                        }
                                        aria-label="Type a message"
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/20 bg-gray-50 transition-colors"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || restoringConversation}
                                        className="w-9 h-9 rounded-full bg-[#1B3A8C] hover:bg-[#16318a] active:scale-95 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                                        aria-label="Send message"
                                    >
                                        <Send className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 mt-2">
                                    <button
                                        onClick={() => setModal("privacy")}
                                        className="hover:text-[#1565C0] transition-colors cursor-pointer"
                                    >
                                        {isJapanese ? "プライバシーポリシー" : "Privacy Policy"}
                                    </button>
                                    <span className="text-gray-200">·</span>
                                    <button
                                        onClick={() => setModal("terms")}
                                        className="hover:text-[#1565C0] transition-colors cursor-pointer"
                                    >
                                        {isJapanese ? "利用規約" : "Terms of Service"}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-300 text-center mt-1">
                                    Powered by Hero Serviced Office, Inc.
                                </p>
                            </div>
                        )}

                        {leadSubmitted && conversationClosed && (
                            <div className="px-4 py-4 bg-white border-t border-gray-100 shrink-0 text-center space-y-2">
                                <p className="text-xs text-gray-500">
                                    {isJapanese ? "この会話は終了しました。" : "This conversation has ended."}
                                </p>
                                {sendError && (
                                    <p className="text-[11px] text-red-500 flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3 h-3 shrink-0" /> {sendError}
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-300">Powered by Hero Serviced Office, Inc.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <Modal
                open={modal === "privacy"}
                onClose={() => setModal(null)}
                title={isJapanese ? "プライバシーポリシー" : "Privacy Policy"}
            >
                <PrivacyPolicyContent />
            </Modal>

            <Modal
                open={modal === "terms"}
                onClose={() => setModal(null)}
                title={isJapanese ? "利用規約" : "Terms of Service"}
            >
                <TermsOfServiceContent />
            </Modal>

            <Modal
                open={endConversationOpen}
                onClose={() => !endingConversation && setEndConversationOpen(false)}
                title={isJapanese ? "この会話を終了しますか？" : "End this conversation?"}
                className="z-1100"
            >
                <div className="space-y-4">
                    <p>
                        {isJapanese
                            ? "担当者との会話を終了してもよろしいですか？"
                            : "Are you sure you want to end the live-agent conversation?"}
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setEndConversationOpen(false)}
                            disabled={endingConversation}
                            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isJapanese ? "キャンセル" : "Cancel"}
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleEndLiveAgentConversation()}
                            disabled={endingConversation}
                            className="inline-flex items-center gap-2 rounded-full bg-[#1B3A8C] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#16318a] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {endingConversation && <Loader2 className="h-4 w-4 animate-spin" />}
                            {endingConversation
                                ? (isJapanese ? "終了中…" : "Ending…")
                                : (isJapanese ? "会話を終了" : "End Conversation")}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Chatbot;