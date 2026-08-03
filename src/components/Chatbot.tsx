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
import { chatApi } from "../lib/chatApi";

interface CTA {
    label: string;
    href: string;
}

interface Message {
    id: string;
    type: "bot" | "user";
    text: string;
    time: string;
    cta?: CTA;
}

const SESSION_STORAGE_KEY = "hero_chat_session_id";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
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
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-xs">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />
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
                <p>Company name: Hero Serviced Office Inc.</p>
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
                By accessing or using the services provided by Hero Serviced Office
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
                Hero Serviced Office Inc. shall not be liable for any indirect,
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
                <p>Hero Serviced Office Inc.</p>
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
    company: (_: string) => "",
};

type LeadField = keyof typeof validators;

type ConversationState = {
    id: number;
    session_id: string;
    remoteConversationId?: number;
};

type ConversationWithStatus = ConversationState & {
    status?: string;
    agent_status?: string;
    messages?: Array<{
        sender: string;
        message: string;
        sent_at: string;
    }>;
};

const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Stable, collision-safe id for React keys / animation identity.
const makeId = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const WELCOME_MESSAGE: Message = {
    id: "welcome",
    type: "bot",
    text: "Hi there! 👋 I'm your HERO assistant. We deliver premium serviced offices and flexible workspace solutions in the Philippines. How can I help you today?",
    time: formatTime(),
};

const AGENT_ENDED_MESSAGE =
    "🔴 The live agent ended the chat. You're back with our AI assistant — feel free to keep chatting or pick a quick reply below.";

const AGENT_CONNECTING_MESSAGE =
    "You will be connected to an agent. Please stay on this chat — we'll notify you the moment someone joins.";

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

const OUT_OF_HOURS_MESSAGE =
    "Our live agents are offline right now (Tower 6789 hours: Mon–Fri, 8AM–8PM PHT). Let us know your preferred time and how to reach you (email or phone), and someone from the team will follow up.";

const PREFERRED_CONTACT_RECEIVED_MESSAGE =
    "Got it, thank you! We've saved your preferred contact details and someone from the team will reach out. Feel free to keep chatting with me in the meantime. 😊";

// -------------------------------------------------------------------
// CTA links: update these paths to match your actual site routes.
// -------------------------------------------------------------------
const CTA_LINKS = {
    quote: { label: "Request a Quotation", href: "/quotation" },
    privateOffice: { label: "View Private Offices", href: "/spaces/private-office" },
    virtualOffice: { label: "View Virtual Office Plans", href: "/spaces/virtual-office" },
    coworking: { label: "View Co-working Space", href: "/spaces/co-working" },
    meetingRooms: { label: "Book a Meeting Room", href: "/spaces/meeting-rooms" },
    services: { label: "See All Services", href: "/services" },
    contact: { label: "Contact Us", href: "/contact" },
} as const;

const PREDEFINED_REPLIES: Record<string, { text: string; cta?: CTA }> = {
    "Our Services": {
        text: "We offer a range of workspace solutions:\n\n• Private Offices\n• Virtual Offices\n• Co-working Spaces\n• Meeting & Conference Rooms\n• Business Support Services\n\nAll designed to help your business operate professionally and efficiently!",
        cta: CTA_LINKS.services,
    },
    "Contact Info": {
        text: "HERO Serviced Office provides premium, fully-equipped workspaces for businesses of all sizes in the Philippines. With 2+ years of experience and 20+ completed projects, we help companies scale without the overhead of a traditional office.\n\n📍 Tower 6789\n23F Tower6789, 6789 Ayala Avenue, Makati City 1209, Metro Manila, Philippines\n🕐 Mon–Fri, 8AM–8PM\n\n📍 Insular Life Building\n11F Insular Life Building, 6781 Ayala Avenue, Corner Paseo de Roxas, Makati City, Metro Manila, Philippines\n🕐 Open 24/7\n\n📧 Email: info@heroph.net\n\nFeel free to reach out — we'd love to hear from you!",
        cta: CTA_LINKS.contact,
    },
    "Private Office": {
        text: "Our private offices are fully furnished and ready to move in — whether you need a space for 1 person or a whole team. Flexible terms, all-inclusive pricing, no fit-out hassle.",
        cta: CTA_LINKS.privateOffice,
    },
    "Virtual Office": {
        text: "Our virtual office plans give your business a prestigious Makati address, mail handling, and call answering — without the cost of a physical lease. Great for remote or early-stage teams.",
        cta: CTA_LINKS.virtualOffice,
    },
    "Co-working Space": {
        text: "Our co-working spaces are shared, flexible desks with high-speed Wi-Fi, communal areas, and networking opportunities — perfect for freelancers, startups, and small teams.",
        cta: CTA_LINKS.coworking,
    },
    "Meeting Rooms": {
        text: "Our meeting rooms are equipped with high-speed Wi-Fi, presentation displays, and video conferencing tools — perfect for client meetings, interviews, and team sessions. Available by the hour or day.",
        cta: CTA_LINKS.meetingRooms,
    },
    "Get a Quote": {
        text: "We'd love to put together a quote for you! Please email us at info@heroph.net with your requirements (team size, duration, space type), and our team will get back to you promptly.",
        cta: CTA_LINKS.quote,
    },
};

type BotRule = {
    keywords: string[];
    reply: string;
    cta?: CTA;
};

const BOT_RULES: BotRule[] = [
    {
        keywords: ["thank", "thanks", "thx", "appreciate"],
        reply:
            "You're very welcome! 😊 Is there anything else I can help you with?",
    },
    {
        keywords: ["bye", "goodbye", "see you"],
        reply: "Thanks for chatting with us! Have a great day. 👋",
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
        reply:
            "Hello! 👋 How can I help you today? You can ask about our services, private offices, virtual offices, co-working spaces, meeting rooms, pricing, or how to reach us.",
    },
    {
        keywords: ["service", "services", "what do you offer", "offer"],
        reply: PREDEFINED_REPLIES["Our Services"].text,
        cta: PREDEFINED_REPLIES["Our Services"].cta,
    },
    {
        keywords: ["about", "who are you", "company"],
        reply: PREDEFINED_REPLIES["Contact Info"].text,
        cta: PREDEFINED_REPLIES["Contact Info"].cta,
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
        reply: PREDEFINED_REPLIES["Contact Info"].text,
        cta: PREDEFINED_REPLIES["Contact Info"].cta,
    },
    {
        keywords: ["private office", "office space", "desk space"],
        reply: PREDEFINED_REPLIES["Private Office"].text,
        cta: PREDEFINED_REPLIES["Private Office"].cta,
    },
    {
        keywords: ["virtual office", "virtual address", "mail handling"],
        reply: PREDEFINED_REPLIES["Virtual Office"].text,
        cta: PREDEFINED_REPLIES["Virtual Office"].cta,
    },
    {
        keywords: ["co-working", "coworking", "shared desk", "hot desk"],
        reply: PREDEFINED_REPLIES["Co-working Space"].text,
        cta: PREDEFINED_REPLIES["Co-working Space"].cta,
    },
    {
        keywords: ["meeting room", "conference room", "boardroom"],
        reply: PREDEFINED_REPLIES["Meeting Rooms"].text,
        cta: PREDEFINED_REPLIES["Meeting Rooms"].cta,
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
        reply: PREDEFINED_REPLIES["Get a Quote"].text,
        cta: PREDEFINED_REPLIES["Get a Quote"].cta,
    },
    {
        keywords: ["agent", "human", "representative", "real person"],
        reply:
            'I can connect you with a live team member — just tap "Talk to an Agent" below.',
    },
    {
        keywords: ["hour", "open", "opening time", "business hours"],
        reply:
            "Tower 6789's live-chat desk is available Mon–Fri, 8AM–6PM (PHT). Our Insular Life location is staffed 24/7 on-site. You can also email us anytime at info@heroph.net.",
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
        reply:
            "Sure — I'll email a copy of this conversation to the address you gave us. It should land in your inbox shortly. 📧",
    },
];

const FALLBACK_REPLY =
    "Thanks for your message! I'm not sure I fully understood that, but here's what I can help with — our services, private offices, virtual offices, co-working spaces, meeting rooms, pricing, or contact details. You can also tap one of the quick replies below, or tap \"Talk to an Agent\" for a live team member.";

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
            return {
                text: rule.reply,
                cta: rule.cta ?? getContextualCta(userText),
            };
        }
    }

    return {
        text: FALLBACK_REPLY,
        cta: getContextualCta(userText) ?? CTA_LINKS.services,
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
    new Promise((res) => setTimeout(res, 350 + Math.random() * 200));

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
    const [isResumingSession] = useState(false);
    const [conversation, setConversation] = useState<ConversationState | null>(
        null,
    );
    const [sendError, setSendError] = useState("");
    const [modal, setModal] = useState<"privacy" | "terms" | null>(null);
    const [agreedToPolicy, setAgreedToPolicy] = useState(false);
    const [agreementTouched, setAgreementTouched] = useState(false);
    const [agentRequested, setAgentRequested] = useState(false);
    const [agentRequestInFlight, setAgentRequestInFlight] = useState(false);
    const [conversationClosed, setConversationClosed] = useState(false);
    const [awaitingPreferredContact, setAwaitingPreferredContact] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const previousStatusRef = useRef<string | null>(null);

    const agentRequestInFlightRef = useRef(false);
    const isClosingChatRef = useRef(false);

    const scrollRafRef = useRef<number | null>(null);

    const quickReplies = [
        "Private Office",
        "Virtual Office",
        "Co-working Space",
        "Meeting Rooms",
        "Our Services",
        "Contact Info",
        "Talk to an Agent",
    ];

    const scrollToBottom = useCallback(() => {
        if (scrollRafRef.current !== null) {
            cancelAnimationFrame(scrollRafRef.current);
        }
        scrollRafRef.current = requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            scrollRafRef.current = null;
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    useEffect(() => {
        if (isChatOpen && leadSubmitted) {
            inputRef.current?.focus();
        }
    }, [isChatOpen, leadSubmitted]);

    useEffect(() => {
        if (!leadSubmitted || !conversation?.id) return;

        const interval = window.setInterval(async () => {
            try {
                const latestConversation = await chatApi.getConversation(
                    conversation.id,
                );

                const mappedMessages: Message[] = (
                    latestConversation.messages ?? []
                ).map((message, idx) => ({
                    id: `remote-${conversation.id}-${idx}-${message.sent_at}`,
                    type: message.sender === "user" ? "user" : "bot",
                    text: message.message,
                    time: new Date(message.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }));

                const latestConversationWithStatus =
                    latestConversation as ConversationWithStatus;

                const rawStatus: string | null =
                    latestConversationWithStatus.status ??
                    latestConversationWithStatus.agent_status ??
                    null;

                const previousStatus = previousStatusRef.current;
                const agentJustEnded =
                    (previousStatus === "agent_active" ||
                        previousStatus === "agent_requested") &&
                    (rawStatus === "agent_closed" ||
                        rawStatus === "ai" ||
                        rawStatus === "closed");

                previousStatusRef.current = rawStatus;

                setMessages((prev) => {
                    const current =
                        prev[0]?.type === "bot" && prev[0]?.text === WELCOME_MESSAGE.text
                            ? []
                            : prev;
                    const previousText = current
                        .map((m) => `${m.type}:${m.text}`)
                        .join("|");
                    const nextText = mappedMessages
                        .map((m) => `${m.type}:${m.text}`)
                        .join("|");

                    const finalMessages = agentJustEnded
                        ? [
                            ...mappedMessages,
                            {
                                id: makeId(),
                                type: "bot" as const,
                                text: AGENT_ENDED_MESSAGE,
                                time: formatTime(),
                            },
                        ]
                        : mappedMessages;

                    if (!agentJustEnded && previousText === nextText) {
                        return prev;
                    }

                    return finalMessages;
                });

                if (agentJustEnded) {
                    setAgentRequested(false);
                    agentRequestInFlightRef.current = false;
                    setSendError("");
                }
            } catch {
                // Ignore transient polling errors so the chat stays responsive.
            }
        }, 3000);

        return () => window.clearInterval(interval);
    }, [conversation?.id, leadSubmitted]);

    const requestTranscriptEmail = useCallback(
        async (conversationId: number | undefined) => {
            if (!conversationId) return;
            try {
                await chatApi.emailChatHistory(conversationId);
            } catch {
                // Swallow — the visitor already got a "sure, I'll email it"
                // bot reply; a silent backend failure shouldn't surface as
                // a scary error in the chat window.
            }
        },
        [],
    );

    const handleCloseChat = async () => {
        isClosingChatRef.current = true;

        if (leadSubmitted && conversation?.id && !conversationClosed) {
            try {
                // Closing the chat should automatically email the transcript to the
                // visitor without requiring a separate manual trigger.
                await chatApi.closeConversation(conversation.id);
            } catch {
                // Ignore close failures and still mark the conversation ended locally.
            }

            setConversationClosed(true);
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: "This conversation has ended. We've emailed you a copy of this chat for your records. 📧",
                    time: formatTime(),
                },
            ]);
        }

        setIsChatOpen(false);

        window.setTimeout(() => {
            isClosingChatRef.current = false;
        }, 0);
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isClosingChatRef.current) {
                return;
            }

            if (leadSubmitted && conversation?.id && !conversationClosed) {
                chatApi.closeConversationOnExit(conversation.id);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [leadSubmitted, conversation?.id, conversationClosed]);

    const ensureConversation = useCallback(async (): Promise<{
        id: number;
        session_id: string;
    } | null> => {
        if (conversation) return conversation;

        const newConversation = {
            id: Date.now(),
            session_id:
                typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `local-${Date.now()}`,
        };

        setConversation(newConversation);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(
                SESSION_STORAGE_KEY,
                newConversation.session_id,
            );
        }

        return newConversation;
    }, [conversation]);

    const persistMessage = useCallback(
        async (
            activeConversation: { id: number; session_id: string } | null,
            sender: "user" | "assistant",
            text: string,
        ) => {
            if (!activeConversation?.id) return;

            try {
                await chatApi.sendMessage(activeConversation.id, sender, text);
            } catch {
                // Swallow persistence errors so the chat remains usable even if the backend is temporarily unavailable.
            }
        },
        [],
    );

    const handleCtaClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
    };

    const handleQuickReply = async (reply: string) => {
        if (conversationClosed) return;

        // "Talk to an Agent" is a quick reply, but it drives its own flow
        // (live-agent request or the out-of-hours fallback) instead of a
        // canned answer.
        if (reply === "Talk to an Agent") {
            await handleTalkToAgent();
            return;
        }

        const time = formatTime();

        setMessages((prev) => [
            ...prev,
            { id: makeId(), type: "user", text: reply, time },
        ]);
        setIsTyping(true);
        setSendError("");

        const activeConversation = await ensureConversation();
        await persistMessage(activeConversation, "user", reply);

        // Quick replies are deterministic — no need to wait as long as a
        // "the bot is thinking" free-text reply.
        await quickReplyDelay();
        setIsTyping(false);

        // Quick reply buttons always map straight to their predefined answer.
        const predefined = PREDEFINED_REPLIES[reply];
        const { text: replyText, cta } = predefined
            ? { text: predefined.text, cta: predefined.cta }
            : getLocalBotReply(reply);

        setMessages((prev) => [
            ...prev,
            { id: makeId(), type: "bot", text: replyText, time: formatTime(), cta },
        ]);
        void persistMessage(activeConversation, "assistant", replyText);
    };

    const handleTalkToAgent = async () => {
        // Synchronous guard closes the race window a plain state check can't:
        // if this fires twice before the first `await` resolves and flips
        // `agentRequested` to true, the ref stops the second call cold.
        if (
            conversationClosed ||
            agentRequested ||
            awaitingPreferredContact ||
            agentRequestInFlight
        ) {
            return;
        }
        setAgentRequestInFlight(true);
        agentRequestInFlightRef.current = true;

        const time = formatTime();
        const userText = "I'd like to talk to a live agent.";

        setMessages((prev) => [
            ...prev,
            { id: makeId(), type: "user", text: userText, time },
        ]);
        setIsTyping(true);
        setSendError("");

        const activeConversation = await ensureConversation();
        void persistMessage(activeConversation, "user", userText);

        await quickReplyDelay();
        setIsTyping(false);

        // Outside business hours: collect a preferred contact time/method
        // instead of dead-ending on "no agent available".
        if (!isAgentAvailableNow()) {
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: OUT_OF_HOURS_MESSAGE,
                    time: formatTime(),
                    cta: CTA_LINKS.contact,
                },
            ]);
            void persistMessage(activeConversation, "assistant", OUT_OF_HOURS_MESSAGE);
            setAwaitingPreferredContact(true);
            setAgentRequestInFlight(false);
            agentRequestInFlightRef.current = false;
            return;
        }

        setAgentRequested(true);

        try {
            const targetId = conversation?.id ?? activeConversation?.id;

            if (targetId) {
                await chatApi.requestAgent(targetId, userText);
                // Seed the status ref so the next poll can correctly detect
                // the eventual "agent ended the chat" transition.
                previousStatusRef.current = "agent_requested";
            }

            // Confirmation message fires first and on its own, so the visitor
            // gets an unambiguous "you're being connected" the moment the
            // request succeeds — instead of only surfacing inside the longer
            // "here's how to reach us" paragraph below.
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: AGENT_CONNECTING_MESSAGE,
                    time: formatTime(),
                    cta: CTA_LINKS.contact,
                },
            ]);
            void persistMessage(activeConversation, "assistant", AGENT_CONNECTING_MESSAGE);

            // Small beat before the follow-up message lands, so the two bot
            // bubbles don't appear in the same instant (feels more like two
            // real thoughts rather than one message that got split).
            await new Promise((res) => setTimeout(res, 500));

            const agentReply =
                "In the meantime, you can also reach us directly:\n\n📧 info@heroph.net\n📞 Mon–Fri, 8AM–8PM (Tower 6789) or 24/7 (Insular Life)\n\nWe'll keep this chat open so an agent can pick up right where we left off.";

            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: agentReply,
                    time: formatTime(),
                    cta: CTA_LINKS.contact,
                },
            ]);
            void persistMessage(activeConversation, "assistant", agentReply);
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
                },
            ]);
            setAgentRequested(false);
        } finally {
            setAgentRequestInFlight(false);
            agentRequestInFlightRef.current = false;
        }
    };

    const handleSendMessage = async () => {
        if (conversationClosed) return;
        if (!message.trim()) return;

        const time = formatTime();
        const userMessage: Message = {
            id: makeId(),
            type: "user",
            text: message,
            time,
        };

        setMessages((prev) => [...prev, userMessage]);
        setMessage("");
        setIsTyping(true);
        setSendError("");

        const activeConversation = await ensureConversation();
        await persistMessage(activeConversation, "user", userMessage.text);

        // If we're waiting on a preferred contact time/method (out-of-hours
        // agent request), the next thing the visitor types is treated as
        // that answer instead of routed through the local bot rules.
        if (awaitingPreferredContact) {
            await quickReplyDelay();
            setIsTyping(false);
            setAwaitingPreferredContact(false);

            try {
                const targetId = conversation?.id ?? activeConversation?.id;
                if (targetId) {
                    await chatApi.submitPreferredContact(targetId, {
                        preferred_time: userMessage.text,
                    });
                }
            } catch {
                // Non-fatal — the message is already persisted above, and the
                // team can still see it in the conversation thread.
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    type: "bot",
                    text: PREFERRED_CONTACT_RECEIVED_MESSAGE,
                    time: formatTime(),
                    cta: CTA_LINKS.contact,
                },
            ]);
            void persistMessage(
                activeConversation,
                "assistant",
                PREFERRED_CONTACT_RECEIVED_MESSAGE,
            );
            return;
        }

        // Fully local reply — no fetch, no API, no OpenAI dependency.
        const { text: replyText, cta } = getLocalBotReply(userMessage.text);

        // Length-aware delay makes longer answers feel like they took a
        // moment longer to "type" without ever stalling.
        await humanDelay(replyText.length);
        setIsTyping(false);
        setMessages((prev) => [
            ...prev,
            { id: makeId(), type: "bot", text: replyText, time: formatTime(), cta },
        ]);
        void persistMessage(activeConversation, "assistant", replyText);

        // If the visitor explicitly asked for a copy of the chat, actually
        // trigger the backend email send (the reply text above just
        // acknowledges it locally).
        if (wantsChatHistory(userMessage.text)) {
            const targetId = conversation?.id ?? activeConversation?.id;
            void requestTranscriptEmail(targetId);
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
            };

            setConversation(newConversation);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(
                    SESSION_STORAGE_KEY,
                    newConversation.session_id,
                );
            }

            const greeting = `Thanks, ${leadInfo.name.trim()}! Your details have been received. How can I help you today?`;
            setMessages([
                {
                    id: makeId(),
                    type: "bot",
                    text: greeting,
                    time: formatTime(),
                    cta: CTA_LINKS.services,
                },
            ]);
            await persistMessage(newConversation, "assistant", greeting);

            // AI handles the inquiry immediately — no extra step needed before chatting.
            setLeadSubmitted(true);
        } catch (err) {
            const detail = err instanceof Error ? err.message : undefined;
            setLeadError(
                detail || "We couldn't save your details. Please try again.",
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
                    className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-[#1B3A8C] hover:bg-[#16318a] flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
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
                        aria-label="HERO Serviced Office chat"
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
                                        alt="HERO Serviced Office Logo"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 object-contain"
                                    />
                                </div>

                                <div>
                                    <p className="text-white font-semibold text-md leading-tight">
                                        HERO Serviced Office
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
                            {/* Resuming previous session */}
                            {isResumingSession && (
                                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <p className="text-xs">Loading your conversation…</p>
                                </div>
                            )}

                            {/* Welcome screen */}
                            {!isResumingSession && !isStarted && (
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
                                            Welcome to HERO
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                            I&apos;m your HERO Assistant. Before we begin, we&apos;ll
                                            collect a few details so we can better serve you.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsStarted(true)}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B3A8C] text-white text-sm font-medium hover:bg-[#16318a] active:scale-95 transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C]"
                                    >
                                        Get started <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <p className="text-xs text-gray-400">
                                        Powered by HERO Serviced Office
                                    </p>
                                </motion.div>
                            )}

                            {/* Lead form */}
                            {!isResumingSession && isStarted && !leadSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="p-5 space-y-3"
                                >
                                    <div className="text-center mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Your contact details
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Please fill in your details before continuing.
                                        </p>
                                    </div>

                                    {(
                                        [
                                            { key: "name", placeholder: "Full name", type: "text" },
                                            {
                                                key: "email",
                                                placeholder: "Email address",
                                                type: "email",
                                            },
                                            { key: "phone", placeholder: "Phone number", type: "tel" },
                                            {
                                                key: "company",
                                                placeholder: "Company name (optional)",
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
                                                I agree to the{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => setModal("privacy")}
                                                    className="text-[#1565C0] underline hover:text-[#1B3A8C] transition-colors"
                                                >
                                                    Privacy Policy
                                                </button>{" "}
                                                and{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => setModal("terms")}
                                                    className="text-[#1565C0] underline hover:text-[#1B3A8C] transition-colors"
                                                >
                                                    Terms of Service
                                                </button>
                                                .
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
                                                    <AlertCircle className="w-3 h-3 shrink-0" /> Please accept
                                                    the Privacy Policy and Terms of Service to continue.
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
                                                <Loader2
                                                    className="h-4 w-4 shrink-0 animate-spin"
                                                    aria-hidden="true"
                                                />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <span>Continue</span>
                                        )}
                                    </button>
                                    <p className="text-[11px] text-gray-400 text-center">
                                        Powered by HERO Serviced Office
                                    </p>
                                </motion.div>
                            )}

                            {/* Messages */}
                            {!isResumingSession && leadSubmitted && (
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
                                                        <p className="text-sm whitespace-pre-line leading-relaxed">
                                                            {msg.text}
                                                        </p>
                                                        {msg.cta && (
                                                            <a
                                                                href={msg.cta.href}
                                                                target="_blank"
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
                                                            {msg.time}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Typing indicator — same easing/duration family as message
                                            bubbles above so the handoff between "typing" and "message
                                            landed" doesn't visibly change speed. */}
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
                                                    phone) below, then hit send.
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Quick replies — animated in/out as a group so they don't
                                            hard-cut the layout the instant a new bot message (with its
                                            own CTA button) lands and shifts scroll position. */}
                                        <AnimatePresence>
                                            {!conversationClosed &&
                                                !isTyping &&
                                                !awaitingPreferredContact &&
                                                messages[messages.length - 1]?.type === "bot" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                                        className="pt-1"
                                                    >
                                                        <p className="text-[11px] text-gray-400 mb-2 pl-9">
                                                            Quick replies
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5 pl-9">
                                                            {quickReplies.map((reply, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleQuickReply(reply)}
                                                                    disabled={
                                                                        reply === "Talk to an Agent" &&
                                                                        (agentRequested || agentRequestInFlight)
                                                                    }
                                                                    className="px-3 py-1.5 text-xs border border-[#1B3A8C] text-[#1B3A8C] rounded-full hover:bg-[#1B3A8C] hover:text-white active:scale-95 transition-all font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A8C] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1B3A8C] inline-flex items-center gap-1"
                                                                >
                                                                    {reply === "Talk to an Agent" && (
                                                                        <UserRound className="w-3 h-3" />
                                                                    )}
                                                                    {reply === "Talk to an Agent" && agentRequested
                                                                        ? "Agent requested"
                                                                        : reply}
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
                        {!isResumingSession && leadSubmitted && !conversationClosed && (
                            <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder={
                                            awaitingPreferredContact
                                                ? "e.g. Weekdays after 6PM, reach me by phone…"
                                                : "Type a message…"
                                        }
                                        aria-label="Type a message"
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1B3A8C] focus:ring-1 focus:ring-[#1B3A8C]/20 bg-gray-50 transition-colors"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim()}
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
                                        Privacy Policy
                                    </button>
                                    <span className="text-gray-200">·</span>
                                    <button
                                        onClick={() => setModal("terms")}
                                        className="hover:text-[#1565C0] transition-colors cursor-pointer"
                                    >
                                        Terms of Service
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-300 text-center mt-1">
                                    Powered by HERO Serviced Office
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <Modal
                open={modal === "privacy"}
                onClose={() => setModal(null)}
                title="Privacy Policy"
            >
                <PrivacyPolicyContent />
            </Modal>

            <Modal
                open={modal === "terms"}
                onClose={() => setModal(null)}
                title="Terms of Service"
            >
                <TermsOfServiceContent />
            </Modal>
        </>
    );
};

export default Chatbot;