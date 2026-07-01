"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    MessageSquare,
    Building2,
    Bell,
    AlertTriangle,
    ArrowUpRight,
    X,
    Mail,
    Phone,
    CheckCircle2,
} from "lucide-react";

// ── Types & mock data ────────────────────────────────────────────────────
// Sample data below is illustrative only — swap for a real fetch (e.g.
// /api/inquiries) once the backend is wired up. Shapes are kept simple so
// that swap doesn't touch layout or interaction logic.

type Stage = "New" | "Contacted" | "Toured";

interface ConversationMessage {
    type: "bot" | "user";
    text: string;
    time: string;
}

interface Inquiry {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    source: string;
    stage: Stage;
    time: string;
    agentRequested: boolean;
    transcript: ConversationMessage[];
}

const stageOrder: Stage[] = ["New", "Contacted", "Toured"];

const sampleInquiries: Inquiry[] = [
    {
        id: "inq_1",
        name: "Marco Villanueva",
        email: "marco.v@brightpeak.co",
        company: "Brightpeak Consulting",
        phone: "+63 917 555 0142",
        source: "Get a Quote",
        stage: "Contacted",
        time: "2m ago",
        agentRequested: true,
        transcript: [
            { type: "user", text: "Hi, I'd like pricing for a 6-person office starting next month.", time: "10:41 AM" },
            { type: "bot", text: "We'd love to put together a quote for you! Could I get a bit more detail on what you need?", time: "10:41 AM" },
            { type: "user", text: "Actually, can I just talk to someone directly? I have a few specific questions.", time: "10:43 AM" },
        ],
    },
    {
        id: "inq_2",
        name: "Anna Reyes",
        email: "anna.reyes@gmail.com",
        source: "Meeting Rooms",
        stage: "New",
        time: "18m ago",
        agentRequested: true,
        transcript: [
            { type: "user", text: "Do you have a meeting room free tomorrow afternoon for 8 people?", time: "10:25 AM" },
            { type: "bot", text: "Our meeting rooms are equipped with high-speed Wi-Fi and video conferencing — available by the hour or day.", time: "10:25 AM" },
            { type: "user", text: "I need to confirm pricing and availability with a real person, please.", time: "10:27 AM" },
        ],
    },
    {
        id: "inq_3",
        name: "Jerome Tan",
        email: "jerome.tan@outlook.com",
        company: "Tan & Co.",
        source: "Office Spaces",
        stage: "Toured",
        time: "1h ago",
        agentRequested: false,
        transcript: [
            { type: "user", text: "Following up after my tour yesterday — everything looked great.", time: "9:10 AM" },
            { type: "bot", text: "So glad to hear it! Let us know if you'd like to move forward with a proposal.", time: "9:11 AM" },
        ],
    },
    {
        id: "inq_4",
        name: "Sofia Lim",
        email: "sofia.lim@lumina.ph",
        company: "Lumina Studio",
        source: "Our Services",
        stage: "Contacted",
        time: "Yesterday",
        agentRequested: false,
        transcript: [
            { type: "user", text: "We're ready to sign — please send over the agreement.", time: "4:52 PM" },
            { type: "bot", text: "Wonderful! Sending the agreement to your email now.", time: "4:53 PM" },
        ],
    },
    {
        id: "inq_5",
        name: "Paolo Cruz",
        email: "paolo.cruz@venturelab.io",
        source: "About Us",
        stage: "New",
        time: "Yesterday",
        agentRequested: false,
        transcript: [
            { type: "user", text: "How long have you been operating in Makati?", time: "2:03 PM" },
            { type: "bot", text: "HERO has been providing premium workspaces in the Philippines for 2+ years, with 20+ completed projects.", time: "2:03 PM" },
        ],
    },
];

// ── Small building blocks ────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    variant = "default",
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    variant?: "default" | "priority";
}) {
    const isPriority = variant === "priority";
    return (
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPriority ? "bg-rose-50" : "bg-[#1B3A8C]/10"
                        }`}
                >
                    <Icon className={`w-5 h-5 ${isPriority ? "text-rose-600" : "text-[#1B3A8C]"}`} />
                </span>
                {isPriority && Number(value) > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mt-1" />
                )}
            </div>
            <div>
                <p className={`text-2xl font-bold leading-none ${isPriority ? "text-rose-600" : "text-gray-900"}`}>
                    {value}
                </p>
                <p className="text-sm text-gray-500 mt-1.5">{label}</p>
            </div>
        </div>
    );
}

function PriorityBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Talk to agent
        </span>
    );
}

/** Full inquiries list — priority conversations surface first and open the transcript on click. */
function InquiriesOverview({
    inquiries,
    onSelect,
    priorityCount,
    onOpenNextPriority,
}: {
    inquiries: Inquiry[];
    onSelect: (inquiry: Inquiry) => void;
    priorityCount: number;
    onOpenNextPriority: () => void;
}) {
    const [filter, setFilter] = useState<"all" | "priority">("all");

    const visible = (filter === "priority" ? inquiries.filter((i) => i.agentRequested) : inquiries)
        .slice()
        .sort((a, b) => Number(b.agentRequested) - Number(a.agentRequested));

    return (
        <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Inquiries overview</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Every conversation, sorted by what needs you first</p>
                </div>
                {priorityCount > 0 && (
                    <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <p className="text-sm text-rose-700">
                                <strong>{priorityCount}</strong>{" "}
                                {priorityCount === 1 ? "conversation is" : "conversations are"} waiting for a
                                reply.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-1.5 mb-3">
                {([
                    { key: "all", label: "All" },
                    { key: "priority", label: "Needs agent" },
                ] as const).map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === tab.key
                            ? "bg-[#1B3A8C] text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                    <p className="text-sm text-gray-400">
                        {filter === "priority" ? "No conversations need an agent right now." : "No inquiries yet."}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {visible.map((inquiry) => (
                        <button
                            key={inquiry.id}
                            onClick={() => onSelect(inquiry)}
                            className={`w-full flex items-center justify-between gap-4 m-2 py-3 pl-3 -ml-3 pr-2 rounded-lg text-left transition-colors hover:bg-gray-50 ${inquiry.agentRequested ? "border-l-4 border-rose-500 bg-rose-50/40" : "border-l-4 border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 h-8 rounded-full bg-[#1B3A8C] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">
                                        {inquiry.name.charAt(0).toUpperCase()}
                                    </span>
                                </span>
                                <div className="min-w-0">
                                    <p className="text-md font-medium text-gray-900 truncate">{inquiry.name}</p>
                                    <p className="text-sm text-gray-400 truncate">{inquiry.source}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {inquiry.agentRequested ? <PriorityBadge /> : null}
                                <span className="text-sm text-gray-400 w-16 text-right">{inquiry.time}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/** Slide-over showing the full transcript for a selected inquiry. */
function ConversationDrawer({
    inquiry,
    onClose,
    onResolve,
}: {
    inquiry: Inquiry | null;
    onClose: () => void;
    onResolve: (id: string) => void;
}) {
    useEffect(() => {
        if (!inquiry) return;
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
    }, [inquiry, onClose]);

    if (!inquiry) return null;

    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Conversation with ${inquiry.name}`}
                className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[drawerIn_0.2s_ease-out]"
            >
                <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="w-10 h-10 rounded-full bg-[#1B3A8C] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">
                                    {inquiry.name.charAt(0).toUpperCase()}
                                </span>
                            </span>
                            <div className="min-w-0">
                                <p className="text-md font-bold text-gray-900 truncate">{inquiry.name}</p>
                                <p className="text-sm text-gray-400 truncate">
                                    {inquiry.company ? `${inquiry.company} · ` : ""}
                                </p>
                                <p className="text-sm text-gray-400 truncate underline">
                                    {inquiry.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors flex-shrink-0"
                            aria-label="Close conversation"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 py-4">
                        {inquiry.agentRequested ? <PriorityBadge /> : null}
                        <span className="text-[11px] text-gray-400">{inquiry.time}</span>
                    </div>

                    {inquiry.agentRequested && (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                            <p className="text-[11px] text-rose-700">
                                This visitor asked to speak with a person. An email notification was sent.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50 space-y-3">
                    {inquiry.transcript.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}>
                            <div
                                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm ${msg.type === "user"
                                    ? "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                                    : "bg-[#1B3A8C] text-white rounded-br-sm"
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${msg.type === "user" ? "text-gray-400" : "text-blue-200 text-right"}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">
                    <div className="flex gap-2">
                        <a
                            href={`mailto:${inquiry.email}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Mail className="w-3.5 h-3.5" /> Email
                        </a>
                        {inquiry.phone && (
                            <a
                                href={`tel:${inquiry.phone}`}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Phone className="w-3.5 h-3.5" /> Call
                            </a>
                        )}
                    </div>
                    {inquiry.agentRequested && (
                        <button
                            onClick={() => onResolve(inquiry.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1B3A8C] text-white text-xs font-semibold hover:bg-[#16318a] transition-colors"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as handled
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function OverviewPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>(sampleInquiries);
    const [selected, setSelected] = useState<Inquiry | null>(null);

    const priorityInquiries = inquiries.filter((i) => i.agentRequested);

    const stats = [
        { label: "Total inquiries", value: String(inquiries.length), icon: Users, variant: "default" as const },
        { label: "Needs agent", value: String(priorityInquiries.length), icon: Bell, variant: "priority" as const },
        {
            label: "Active conversations",
            value: String(inquiries.filter((i) => i.stage !== "Contacted").length),
            icon: MessageSquare,
            variant: "default" as const,
        },
        {
            label: "Tour conversion",
            value: inquiries.length
                ? `${Math.round((inquiries.filter((i) => i.stage === "Contacted").length / inquiries.length) * 100)}%`
                : "—",
            icon: Building2,
            variant: "default" as const,
        },
    ];

    const openFirstPriority = () => {
        if (priorityInquiries.length > 0) setSelected(priorityInquiries[0]);
    };

    const handleResolve = (id: string) => {
        setInquiries((prev) =>
            prev.map((i) => (i.id === id ? { ...i, agentRequested: false } : i))
        );
        setSelected((prev) => (prev && prev.id === id ? { ...prev, agentRequested: false } : prev));
    };

    return (
        <section className="px-8 pb-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            <InquiriesOverview
                inquiries={inquiries}
                onSelect={setSelected}
                priorityCount={priorityInquiries.length}
                onOpenNextPriority={openFirstPriority}
            />

            <ConversationDrawer inquiry={selected} onClose={() => setSelected(null)} onResolve={handleResolve} />

            <style jsx global>{`
                @keyframes drawerIn {
                    from {
                        transform: translateX(24px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </section>
    );
}