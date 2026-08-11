"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    ArrowRightLeft,
    Bot,
    CheckCircle2,
    EllipsisVertical,
    Headset,
    Inbox,
    Mail,
    MailCheck,
    Menu,
    RefreshCw,
    Search,
    Send,
    User,
    X,
    XCircle,
} from "lucide-react";
import { chatApi, type ChatConversation, type ConversationResponse } from "@/lib/chatApi";

type StatusKey = "active" | "waiting_admin" | "agent_requested" | "agent_active" | "agent_closed" | "closed";

const STATUS: Record<StatusKey, { label: string; rail: string; dot: string; chip: string; live?: boolean; ended?: boolean }> = {
    active: { label: "AI Assistant", rail: "bg-emerald-500", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
    waiting_admin: { label: "Agent Requested", rail: "bg-amber-500", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-600/20", live: true },
    agent_requested: { label: "Agent Requested", rail: "bg-amber-500", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-600/20", live: true },
    agent_active: { label: "You're live", rail: "bg-[#0D47A1]", dot: "bg-[#0D47A1]", chip: "bg-blue-50 text-[#0D47A1] ring-blue-600/20" },
    agent_closed: { label: "Ended", rail: "bg-slate-300", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-500 ring-slate-500/10", ended: true },
    closed: { label: "Ended", rail: "bg-slate-300", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-500 ring-slate-500/10", ended: true },
};

const NEEDS_ADMIN: StatusKey[] = ["waiting_admin", "agent_requested"];

const AGENT_OWNED: StatusKey[] = ["waiting_admin", "agent_requested", "agent_active"];

const HISTORY_REQUEST_KEYWORDS = [
    "email me this",
    "email me the chat",
    "send me this chat",
    "chat history",
    "transcript",
    "copy of this conversation",
    "copy of our chat",
];

function messagesRequestedHistory(messages: { sender: string; message: string }[]) {
    return messages.some(
        (m) =>
            m.sender !== "admin" &&
            m.sender !== "assistant" &&
            HISTORY_REQUEST_KEYWORDS.some((kw) => m.message.toLowerCase().includes(kw)),
    );
}

type AddressedFilter = "all" | "needs_response" | "addressed";

type SenderKey = "admin" | "assistant" | "client";

type ChatStatTone = "neutral" | "amber" | "blue" | "green";

type ChatAnalytics = {
    chat_leads: {
        conversations: number;
        agent_requested: number;
        average_response_time_seconds: number;
        lead_conversion_rate: number;
        conversation_volume: {
            this_month: number;
            last_month: number;
        };
        agent_requests: {
            this_month: number;
            last_month: number;
            three_month_average: number;
        };
        response_time: {
            this_month_seconds: number;
            last_month_seconds: number;
            three_month_average_seconds: number;
        };
        lead_conversion: {
            this_month: number;
            last_month: number;
            three_month_average: number;
        };
    };
};

const CHAT_STAT_TONE_STYLES: Record<ChatStatTone, { bg: string; text: string; rail: string }> = {
    neutral: { bg: "bg-[#F0F4FB]", text: "text-[#1B3A8C]", rail: "bg-[#0D47A1]" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", rail: "bg-amber-500" },
    blue: { bg: "bg-blue-50", text: "text-[#0D47A1]", rail: "bg-[#1565C0]" },
    green: { bg: "bg-emerald-50", text: "text-emerald-700", rail: "bg-emerald-500" },
};

const SENDER_STYLE: Record<SenderKey, { bubble: string; label: string; icon: typeof User }> = {
    admin: {
        bubble: "rounded-br-sm bg-[#0D47A1] text-white",
        label: "text-blue-100/80",
        icon: User,
    },
    assistant: {
        bubble: "rounded-bl-sm border border-violet-100 bg-violet-50 text-violet-900",
        label: "text-violet-400",
        icon: Bot,
    },
    client: {
        bubble: "rounded-bl-sm border border-slate-100 bg-white text-slate-700",
        label: "text-slate-400",
        icon: User,
    },
};

// System messages reuse the assistant layout but with a distinct color.
const SYSTEM_STYLE = {
    bubble: "rounded-bl-sm border border-sky-100 bg-sky-50 text-sky-900",
    label: "text-sky-400",
    icon: Bot,
};

function senderKeyOf(sender: string): SenderKey {
    if (sender === "admin") return "admin";
    if (sender === "assistant") return "assistant";
    return "client";
}

function statusOf(status: string) {
    return STATUS[status as StatusKey] ?? STATUS.closed;
}

function isAddressed(c: ChatConversation) {
    return Boolean(c.addressed_at);
}

function LiveDot({ className = "" }: { className?: string }) {
    return (
        <span className={`relative flex h-2 w-2 ${className}`}>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
    );
}

function StatusChip({ status }: { status: string }) {
    const s = statusOf(status);
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${s.chip}`}>
            {s.live ? <LiveDot /> : <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
            {s.label}
        </span>
    );
}

function AddressedChip() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
            <CheckCircle2 className="h-3 w-3" />
            Addressed
        </span>
    );
}

function initialsOf(name?: string | null) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function timeAgo(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString();
}

function durationSince(iso: string) {
    const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}h ${rem}m`;
}

function ConversationSkeleton() {
    return (
        <div className="flex h-full flex-col">
            <div className="shrink-0 border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
                    </div>
                </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3 p-4">
                <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
                <div className="ml-auto h-12 w-1/2 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-16 w-3/5 animate-pulse rounded-2xl bg-slate-100" />
                <div className="ml-auto h-10 w-2/5 animate-pulse rounded-2xl bg-slate-100" />
            </div>
        </div>
    );
}

function ConversationListSkeleton() {
    return (
        <div className="space-y-1.5 p-1">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-18 animate-pulse rounded-xl bg-slate-100" />
            ))}
        </div>
    );
}

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        Authorization: `Bearer ${token ?? ""}`,
    };
}

function formatDuration(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0s";

    const wholeSeconds = Math.round(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
}

function formatCountTrend(current: number, previous: number) {
    const delta = current - previous;
    if (delta === 0) return "No change vs last month";
    return `${delta > 0 ? "+" : ""}${delta} vs last month`;
}

function formatRateTrend(current: number, previous: number) {
    const delta = current - previous;
    if (Math.abs(delta) < 0.05) return "No change vs last month";
    return `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pts vs last month`;
}

function formatResponseTrend(currentSeconds: number, previousSeconds: number) {
    const delta = currentSeconds - previousSeconds;
    if (delta === 0) return "No change vs last month";
    return `${formatDuration(Math.abs(delta))} ${delta < 0 ? "faster" : "slower"} vs last month`;
}

type ChatStatCardProps = {
    icon: typeof Bot;
    label: string;
    value: string;
    tone: ChatStatTone;
    trend: string;
    supporting: string;
};

function ChatStatCard({ icon: Icon, label, value, tone, trend, supporting }: ChatStatCardProps) {
    const style = CHAT_STAT_TONE_STYLES[tone];

    return (
        <article className="relative overflow-hidden rounded-2xl border border-transparent bg-white p-5 shadow-sm">
            <div className={`absolute left-0 top-0 h-full w-1 ${style.rail}`} />
            <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}>
                    <Icon className={`h-5 w-5 ${style.text}`} />
                </div>
            </div>
            <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>
            <p className="mb-2 text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs font-medium text-slate-500">{trend}</p>
            <p className="mt-1 text-xs text-slate-400">{supporting}</p>
        </article>
    );
}

function StatCardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-transparent bg-white p-5 shadow-sm animate-pulse">
            <div className="absolute left-0 top-0 h-full w-1 bg-slate-200" />
            <div className="mb-4 h-10 w-10 rounded-xl bg-slate-200" />
            <div className="mb-2 h-4 w-32 rounded bg-slate-200" />
            <div className="mb-3 h-9 w-28 rounded bg-slate-200" />
            <div className="mb-2 h-3 w-36 rounded bg-slate-200" />
            <div className="h-3 w-28 rounded bg-slate-100" />
        </div>
    );
}

function ChatStatsSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
            ))}
        </>
    );
}

function ChatStatistics({ analytics }: { analytics: ChatAnalytics["chat_leads"] }) {
    const cards: ChatStatCardProps[] = [
        {
            icon: Bot,
            label: "Total Conversations",
            value: analytics.conversations.toLocaleString(),
            tone: "neutral",
            trend: formatCountTrend(
                analytics.conversation_volume.this_month,
                analytics.conversation_volume.last_month,
            ),
            supporting: `This month: ${analytics.conversation_volume.this_month}`,
        },
        {
            icon: Headset,
            label: "Live Agent Requests",
            value: analytics.agent_requested.toLocaleString(),
            tone: "amber",
            trend: formatCountTrend(analytics.agent_requests.this_month, analytics.agent_requests.last_month),
            supporting: `3-month avg: ${analytics.agent_requests.three_month_average}`,
        },
        {
            icon: ArrowRightLeft,
            label: "Average Response Time",
            value: formatDuration(analytics.average_response_time_seconds),
            tone: "blue",
            trend: formatResponseTrend(
                analytics.response_time.this_month_seconds,
                analytics.response_time.last_month_seconds,
            ),
            supporting: `3-month avg: ${formatDuration(analytics.response_time.three_month_average_seconds)}`,
        },
        {
            icon: MailCheck,
            label: "Lead Conversion",
            value: `${analytics.lead_conversion_rate.toFixed(1)}%`,
            tone: "green",
            trend: formatRateTrend(analytics.lead_conversion.this_month, analytics.lead_conversion.last_month),
            supporting: `3-month avg: ${analytics.lead_conversion.three_month_average.toFixed(1)}%`,
        },
    ];

    return (
        <>
            {cards.map((card) => (
                <ChatStatCard key={card.label} {...card} />
            ))}
        </>
    );
}

export default function AdminChatsPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [conversationLoading, setConversationLoading] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [markingAddressed, setMarkingAddressed] = useState(false);

    const [sendingHistory, setSendingHistory] = useState(false);
    const [historySentNotice, setHistorySentNotice] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [statsError, setStatsError] = useState("");
    const [query, setQuery] = useState("");
    const [addressedFilter, setAddressedFilter] = useState<AddressedFilter>("all");
    const [agentRequestNotice, setAgentRequestNotice] = useState<string | null>(null);
    const [chatStats, setChatStats] = useState<ChatAnalytics["chat_leads"] | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    const notifiedRequestIds = useRef<Set<number>>(new Set());

    const loadChatStats = async (silent = false) => {
        if (!silent || !chatStats) {
            setStatsLoading(true);
        }
        setStatsError("");

        try {
            const res = await fetch("/api/analytics", {
                headers: authHeaders(),
            });

            if (!res.ok) {
                throw new Error(`Request failed (${res.status})`);
            }

            const data: ChatAnalytics = await res.json();
            setChatStats(data.chat_leads);
        } catch (err) {
            setStatsError(err instanceof Error ? err.message : "Unable to load chat statistics.");
            setChatStats(null);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadConversations = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await chatApi.listConversations() as { data?: ChatConversation[];[key: string]: unknown };
            const items = Array.isArray(response?.data) ? response.data : [];
            setConversations(items);
            checkForNewAgentRequests(items);

            if (!selectedConversationId && items[0]?.id) {
                setSelectedConversationId(items[0].id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load conversations.");
        } finally {
            setLoading(false);
        }
    };

    const checkForNewAgentRequests = (items: ChatConversation[]) => {
        for (const c of items) {
            const needsAdmin = NEEDS_ADMIN.includes(c.status as StatusKey);
            if (needsAdmin && !notifiedRequestIds.current.has(c.id)) {
                notifiedRequestIds.current.add(c.id);
                setAgentRequestNotice(`${c.inquiry?.full_name ?? "A visitor"} asked to talk to an agent.`);
            }
        }
    };

    useEffect(() => {
        void loadConversations();
        void loadChatStats();
    }, []);

    useEffect(() => {
        if (!agentRequestNotice) return;
        const t = setTimeout(() => setAgentRequestNotice(null), 6000);
        return () => clearTimeout(t);
    }, [agentRequestNotice]);

    useEffect(() => {
        if (!historySentNotice) return;
        const t = setTimeout(() => setHistorySentNotice(null), 5000);
        return () => clearTimeout(t);
    }, [historySentNotice]);

    useEffect(() => {
        if (!selectedConversationId) return;

        let cancelled = false;
        setConversationLoading(true);

        (async () => {
            try {
                const conversation = await chatApi.getConversation(selectedConversationId);
                if (!cancelled) setSelectedConversation(conversation);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load conversation.");
            } finally {
                if (!cancelled) setConversationLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedConversationId]);

    useEffect(() => {
        if (!selectedConversationId) return;

        const interval = setInterval(async () => {
            try {
                const conversation = await chatApi.getConversation(selectedConversationId);

                setSelectedConversation(prev => {
                    if (!prev) return conversation;

                    if (prev.messages.length !== conversation.messages.length) {
                        return conversation;
                    }

                    if (prev.status !== conversation.status) {
                        return conversation;
                    }

                    return prev;
                });

                const response = await chatApi.listConversations() as {
                    data?: ChatConversation[];
                };

                if (response.data) {
                    setConversations(response.data);
                    checkForNewAgentRequests(response.data);
                }
            } catch {
                // Ignore polling errors
            }
        }, 2000); // every 2 seconds

        return () => clearInterval(interval);
    }, [selectedConversationId]);

    useEffect(() => {
        if (!actionsMenuOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!actionsMenuRef.current?.contains(event.target as Node)) {
                setActionsMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActionsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [actionsMenuOpen]);

    useEffect(() => {
        setActionsMenuOpen(false);
    }, [selectedConversationId]);

    const refresh = async () => {
        await Promise.all([loadConversations(), loadChatStats(true)]);
        if (selectedConversationId) {
            try {
                const conversation = await chatApi.getConversation(selectedConversationId);
                setSelectedConversation(conversation);
            } catch {
                // Ignore refresh errors and keep the existing view intact.
            }
        }
    };

    const handleManualRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        setConversationLoading(true);
        setError("");
        try {
            await refresh();
        } finally {
            setRefreshing(false);
            setConversationLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!selectedConversationId || !reply.trim()) return;

        setSending(true);
        setError("");

        try {
            // Let the admin reply the moment a visitor needs a person, without
            // a separate "take over" click first — the reply itself takes
            // ownership of the conversation.
            if (selectedConversation && NEEDS_ADMIN.includes(selectedConversation.status as StatusKey)) {
                await chatApi.switchMode(selectedConversationId, "admin");
            }

            await chatApi.sendMessage(selectedConversationId, "admin", reply.trim());
            setReply("");
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to send reply.");
        } finally {
            setSending(false);
        }
    };

    const handleTakeOver = async () => {
        if (!selectedConversationId) return;
        try {
            await chatApi.switchMode(selectedConversationId, "admin");
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to update chat mode.");
        }
    };

    const handleReturnToAI = async () => {
        if (!selectedConversationId) return;
        try {
            await chatApi.switchMode(selectedConversationId, "assistant");
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to return chat to AI.");
        }
    };

    const handleCloseConversation = async () => {
        if (!selectedConversationId) return;

        try {
            await chatApi.closeConversation(selectedConversationId, false);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to close conversation.");
        }
    };

    const handleToggleAddressed = async () => {
        if (!selectedConversationId || !selectedConversation) return;

        const nextAddressed = !isAddressed(selectedConversation);
        setMarkingAddressed(true);
        setError("");

        try {
            await chatApi.markAddressed(selectedConversationId, nextAddressed);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to update addressed status.");
        } finally {
            setMarkingAddressed(false);
        }
    };

    const handleSendHistory = async () => {
        if (!selectedConversationId || !selectedConversation) return;

        setSendingHistory(true);
        setError("");

        try {
            const result = await chatApi.emailChatHistory(selectedConversationId);
            setHistorySentNotice(
                `Chat history sent to ${result?.to ?? selectedConversation.inquiry?.email_address ?? "the visitor"}.`,
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to send chat history.");
        } finally {
            setSendingHistory(false);
        }
    };

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
        setSidebarOpen(false);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [selectedConversation?.messages]);

    const REPLY_MIN_HEIGHT = 72; // px, ~3 rows
    const REPLY_MAX_HEIGHT = 200; // px, ~8-9 rows before it scrolls

    useEffect(() => {
        const el = replyTextareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const next = Math.min(Math.max(el.scrollHeight, REPLY_MIN_HEIGHT), REPLY_MAX_HEIGHT);
        el.style.height = `${next}px`;
    }, [reply]);

    const filteredConversations = useMemo(() => {
        const q = query.trim().toLowerCase();
        let base = !q
            ? conversations
            : conversations.filter((c) => {
                const name = c.inquiry?.full_name?.toLowerCase() ?? "";
                const email = c.inquiry?.email_address?.toLowerCase() ?? "";
                return name.includes(q) || email.includes(q);
            });

        if (addressedFilter === "needs_response") {
            base = base.filter((c) => !isAddressed(c));
        } else if (addressedFilter === "addressed") {
            base = base.filter((c) => isAddressed(c));
        }

        // Most recently updated conversation first.
        return [...base].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }, [conversations, query, addressedFilter]);

    // Conversation overview — quick counts across the whole queue.
    const overview = useMemo(() => {
        const total = conversations.length;
        const needsYou = conversations.filter((c) => NEEDS_ADMIN.includes(c.status as StatusKey)).length;
        const live = conversations.filter((c) => (c.status as StatusKey) === "agent_active").length;
        const ended = conversations.filter((c) => statusOf(c.status).ended).length;
        const addressed = conversations.filter(isAddressed).length;
        const needsResponse = total - addressed;
        return { total, needsYou, live, ended, addressed, needsResponse };
    }, [conversations]);

    const selectedIsEnded = selectedConversation ? statusOf(selectedConversation.status).ended : false;
    const selectedIsAddressed = selectedConversation ? isAddressed(selectedConversation) : false;
    const selectedNeedsAdmin = selectedConversation
        ? NEEDS_ADMIN.includes(selectedConversation.status as StatusKey)
        : false;
    const selectedIsAgentOwned = selectedConversation
        ? AGENT_OWNED.includes(selectedConversation.status as StatusKey)
        : false;
    const selectedRequestedHistory = selectedConversation
        ? messagesRequestedHistory(selectedConversation.messages)
        : false;
    const selectedHasEmail = Boolean(selectedConversation?.inquiry?.email_address);

    const isSwitchingConversation =
        selectedConversationId !== null &&
        (conversationLoading || selectedConversation?.id !== selectedConversationId);

    const sidebarSearchHeader = (
        <div className="shrink-0 space-y-2 border-b border-slate-100 p-3">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#0D47A1] focus:bg-white focus:ring-2 focus:ring-[#0D47A1]/10"
                />
            </div>
        </div>
    );

    const sidebarListBody = (
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2.5">
            {loading || refreshing ? (
                <ConversationListSkeleton />
            ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-8 text-center">
                    <Inbox className="h-5 w-5 text-slate-300" />
                    <p className="text-sm text-slate-500">
                        {conversations.length === 0 ? "No conversations yet." : "Nothing matches that filter."}
                    </p>
                </div>
            ) : (
                filteredConversations.map((conversation) => {
                    const isActive = conversation.id === selectedConversationId;
                    const s = statusOf(conversation.status);
                    const name = conversation.inquiry?.full_name ?? "Guest visitor";
                    return (
                        <button
                            key={conversation.id}
                            onClick={() => handleSelectConversation(conversation.id)}
                            className={`group relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-2.5 pl-3.5 text-left transition ${isActive ? "border-[#0D47A1]/30 bg-[#0D47A1]/4" : "border-transparent hover:bg-slate-50"
                                }`}
                        >
                            <span className={`absolute inset-y-2 left-0 w-0.75 rounded-full ${s.rail}`} />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                                    <span className="shrink-0 font-mono text-[10px] text-slate-400">{timeAgo(conversation.updated_at)}</span>
                                </div>
                    
                                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
                                    <p className="truncate text-xs text-slate-500">{conversation.inquiry?.email_address ?? "No email"}</p>
                                    <span className="font-mono text-[10px] text-slate-400">{conversation.message_count} msgs</span>
                                </div>
                            </div>
                        </button>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <main className="mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col overflow-hidden">
                {/* Mobile/tablet top bar */}
                <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-2 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open conversations menu"
                        className="flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1]"
                    >
                        <Menu className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => void handleManualRefresh()}
                        disabled={refreshing || loading}
                        aria-label="Refresh conversations"
                        className="flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Agent-request toast */}
                {agentRequestNotice ? (
                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <LiveDot />
                        {agentRequestNotice}
                        <span className="ml-auto flex items-center gap-1 text-xs text-amber-600">
                            <Mail className="h-3.5 w-3.5" />
                            Email sent
                        </span>
                    </div>
                ) : null}

                {/* History-sent toast */}
                {historySentNotice ? (
                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                        <MailCheck className="h-4 w-4" />
                        {historySentNotice}
                    </div>
                ) : null}

                {error ? (
                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                ) : null}

                {/* Chat statistics */}
                <div className="mb-2 space-y-3">
                    <div className="hidden justify-end lg:flex">
                        <button
                            onClick={() => void handleManualRefresh()}
                            disabled={refreshing || loading}
                            title="Refresh conversations"
                            aria-label="Refresh conversations"
                            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>

                    {statsError ? (
                        <p className="text-xs text-rose-600">{statsError}</p>
                    ) : null}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {statsLoading ? (
                            <ChatStatsSkeleton />
                        ) : chatStats ? (
                            <ChatStatistics analytics={chatStats} />
                        ) : (
                            <ChatStatistics
                                analytics={{
                                    conversations: 0,
                                    agent_requested: 0,
                                    average_response_time_seconds: 0,
                                    lead_conversion_rate: 0,
                                    conversation_volume: { this_month: 0, last_month: 0 },
                                    agent_requests: { this_month: 0, last_month: 0, three_month_average: 0 },
                                    response_time: { this_month_seconds: 0, last_month_seconds: 0, three_month_average_seconds: 0 },
                                    lead_conversion: { this_month: 0, last_month: 0, three_month_average: 0 },
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)]">
                    {/* Desktop/tablet-landscape sidebar column */}
                    <div className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex">
                        {sidebarSearchHeader}
                        {sidebarListBody}
                    </div>

                    {/* Mobile/tablet off-canvas drawer with the same content */}
                    {sidebarOpen ? (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div
                                className="absolute inset-0 bg-slate-900/40"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-hidden bg-white shadow-xl">
                                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-3">
                                    <p className="text-sm font-semibold text-slate-800">Conversations</p>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        aria-label="Close conversations menu"
                                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                {sidebarSearchHeader}
                                {sidebarListBody}
                            </div>
                        </div>
                    ) : null}

                    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {selectedConversationId === null ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                                <Inbox className="h-6 w-6 text-slate-300" />
                                <p className="text-sm text-slate-500">Select a conversation to read the thread and reply.</p>
                            </div>
                        ) : isSwitchingConversation ? (
                            <ConversationSkeleton />
                        ) : selectedConversation ? (
                            <>
                                <div className="shrink-0 border-b border-slate-100 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D47A1]/10 text-sm font-semibold text-[#0D47A1]">
                                                {initialsOf(selectedConversation.inquiry?.full_name)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-base font-semibold text-slate-900">
                                                        {selectedConversation.inquiry?.full_name ?? "Guest visitor"}
                                                    </p>
                                                    <StatusChip status={selectedConversation.status} />
                                                    {selectedIsAddressed ? <AddressedChip /> : null}
                                                    {selectedRequestedHistory ? (
                                                        <span
                                                            title="Visitor asked for a copy of this chat"
                                                            className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20"
                                                        >
                                                            <Mail className="h-3 w-3" />
                                                            Requested history
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="flex items-center gap-1.5 text-xs text-slate-500 py-1">
                                                    <Mail className="h-3 w-3" />
                                                    {selectedConversation.inquiry?.email_address ?? "No email supplied"}
                                                    <span className="text-slate-300">·</span>
                                                    {selectedConversation.messages.length} messages
                                                </p>
                                            </div>
                                        </div>
                                        <div ref={actionsMenuRef} className="relative ml-auto shrink-0 self-start">
                                            <button
                                                type="button"
                                                onClick={() => setActionsMenuOpen((open) => !open)}
                                                aria-label="Open conversation actions"
                                                aria-haspopup="menu"
                                                aria-expanded={actionsMenuOpen}
                                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1]"
                                            >
                                                <EllipsisVertical className="h-4 w-4" />
                                            </button>

                                            {actionsMenuOpen ? (
                                                <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionsMenuOpen(false);
                                                            void handleToggleAddressed();
                                                        }}
                                                        disabled={markingAddressed}
                                                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedIsAddressed
                                                            ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                                                            : "text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                                                            }`}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        {selectedIsAddressed ? "Addressed" : "Mark as addressed"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionsMenuOpen(false);
                                                            void handleSendHistory();
                                                        }}
                                                        disabled={sendingHistory || !selectedHasEmail}
                                                        title={
                                                            selectedHasEmail
                                                                ? "Email the full chat transcript to the visitor"
                                                                : "No email on file for this visitor"
                                                        }
                                                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedRequestedHistory
                                                            ? "bg-sky-50 text-sky-700 hover:bg-sky-100"
                                                            : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                                                            }`}
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                        {sendingHistory ? "Sending…" : "Send history"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionsMenuOpen(false);
                                                            void handleTakeOver();
                                                        }}
                                                        disabled={selectedIsEnded}
                                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <Headset className="h-4 w-4" />
                                                        Take over
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionsMenuOpen(false);
                                                            void handleReturnToAI();
                                                        }}
                                                        disabled={selectedIsEnded}
                                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <Bot className="h-4 w-4" />
                                                        Return to AI
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActionsMenuOpen(false);
                                                            void handleCloseConversation();
                                                        }}
                                                        disabled={selectedIsEnded}
                                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Close
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex min-h-0 flex-1 flex-col p-4">
                                    <div
                                        className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-4"
                                        style={{
                                            backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)",
                                            backgroundSize: "16px 16px",
                                        }}
                                    >
                                        {selectedConversation.messages.length === 0 ? (
                                            <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                                                No messages yet. Start the conversation with a welcome note.
                                            </div>
                                        ) : (
                                            selectedConversation.messages.map((message) => {
                                                const isSystem = message.sender === "system";
                                                const senderKey = isSystem ? "assistant" : senderKeyOf(message.sender);
                                                const style = isSystem ? SYSTEM_STYLE : SENDER_STYLE[senderKey as SenderKey];
                                                const SenderIcon = style.icon;
                                                const isAdmin = senderKey === "admin";

                                                return (
                                                    <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                                        <div
                                                            className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm ${style.bubble}`}
                                                        >
                                                            <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide ${style.label}`}>
                                                                <SenderIcon className="h-3 w-3" />
                                                                <span>{isSystem ? "System" : message.sender}</span>
                                                                <span>·</span>
                                                                <span>{new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                            </div>
                                                            <p className="text-sm leading-relaxed">{message.message}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {selectedIsEnded ? (
                                        <div className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                                            <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                            This conversation has ended.
                                        </div>
                                    ) : (
                                        <div className="mt-3 shrink-0 rounded-xl border border-slate-200 p-3">
                                            {selectedNeedsAdmin ? (
                                                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                                    <LiveDot />
                                                    This visitor asked for a person — sending a reply takes over the chat.
                                                </p>
                                            ) : selectedIsAgentOwned ? (
                                                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#0D47A1]">
                                                    <Headset className="h-3.5 w-3.5" />
                                                    You own this chat — the AI assistant is paused here.
                                                </p>
                                            ) : null}
                                            {selectedRequestedHistory ? (
                                                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-sky-600">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    This visitor asked for a copy of the chat — use &quot;Send history&quot; above.
                                                </p>
                                            ) : null}
                                            {!selectedIsAddressed ? (
                                                <p className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    Not yet marked as addressed — check before replying to avoid a duplicate response.
                                                </p>
                                            ) : null}
                                            <textarea
                                                ref={replyTextareaRef}
                                                value={reply}
                                                onChange={(event) => setReply(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" && !event.shiftKey) {
                                                        event.preventDefault();
                                                        void handleSendReply();
                                                    }
                                                }}
                                                placeholder="Type a reply to the visitor..."
                                                rows={1}
                                                style={{ minHeight: REPLY_MIN_HEIGHT, maxHeight: REPLY_MAX_HEIGHT }}
                                                className="w-full resize-none overflow-y-auto rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#0D47A1] focus:ring-2 focus:ring-[#0D47A1]/10"
                                            />
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <ArrowRightLeft className="h-3.5 w-3.5" />
                                                    Enter to send · Shift + Enter for a new line
                                                </div>
                                                <button
                                                    onClick={() => void handleSendReply()}
                                                    disabled={sending || !reply.trim()}
                                                    className="inline-flex items-center gap-2 rounded-full bg-[#0D47A1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0D47A1]/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    {sending ? "Sending..." : "Send"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                                <Inbox className="h-6 w-6 text-slate-300" />
                                <p className="text-sm text-slate-500">Select a conversation to read the thread and reply.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}