"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    ArrowRightLeft,
    BadgePercent,
    Bot,
    CheckCircle2,
    Clock3,
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

type ChatStatTone = "neutral" | "amber" | "green" | "red";

type ChatAnalytics = {
    chat_leads: {
        conversations: number;
        live_agent_requests: number;
        average_response_time_seconds: number | null;
        responded_conversations: number;
        lead_conversion_rate: number;
        trends: {
            conversations: { current: number; previous: number };
            live_agent_requests: { current: number; previous: number };
            average_response_time_seconds: { current: number | null; previous: number | null };
            lead_conversion_rate: { current: number; previous: number };
        };
    };
};

const CHAT_STAT_TONE_STYLES: Record<ChatStatTone, { bg: string; text: string; accent: string }> = {
    neutral: { bg: "bg-[#F0F4FB]", text: "text-[#1B3A8C]", accent: "bg-[#0D47A1]" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-500" },
    green: { bg: "bg-green-50", text: "text-green-700", accent: "bg-green-500" },
    red: { bg: "bg-red-50", text: "text-red-600", accent: "bg-red-500" },
};

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        Authorization: `Bearer ${token ?? ""}`,
        "Content-Type": "application/json",
    };
}

function formatDurationCompact(seconds: number | null | undefined) {
    if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "--";

    const rounded = Math.max(0, Math.round(seconds));
    const mins = Math.floor(rounded / 60);
    const secs = rounded % 60;

    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;

    return `${mins}m ${secs}s`;
}

function formatCountTrend(current: number, previous: number) {
    const delta = current - previous;
    if (delta === 0) return "No change vs previous period";
    if (previous === 0) return `${delta > 0 ? "+" : ""}${delta} vs previous period`;

    const percent = Math.round((delta / previous) * 100);
    return `${percent > 0 ? "+" : ""}${percent}% vs previous period`;
}

function formatRateTrend(current: number, previous: number) {
    const delta = current - previous;
    if (Math.abs(delta) < 0.05) return "No change vs previous period";

    return `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pts vs previous period`;
}

type ChatStatCardProps = {
    label: string;
    value: string;
    supporting: string;
    tone: ChatStatTone;
};

function ChatStatCard({ label, value, supporting, tone }: ChatStatCardProps) {
    const style = CHAT_STAT_TONE_STYLES[tone];

    return (
        <article className="relative w-full overflow-hidden rounded-2xl border border-transparent bg-white p-6 text-left shadow-sm">
            <div className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />
            <div className="mb-4 flex items-start justify-between">
                <p className="mb-1 text-md font-semibold text-slate-500">{label}</p>
            </div>
            <p className="mb-2 text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{supporting}</p>
        </article>
    );
}

function ChatStatCardSkeleton() {
    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-transparent bg-white p-6 shadow-sm animate-pulse">
            <div className="absolute left-0 top-0 h-full w-1 bg-slate-200" />
            <div className="mb-4 h-10 w-10 rounded-xl bg-slate-200" />
            <div className="mb-3 h-4 w-32 rounded bg-slate-200" />
            <div className="mb-3 h-9 w-28 rounded bg-slate-200" />
            <div className="h-3 w-36 rounded bg-slate-200" />
        </div>
    );
}

function ChatStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <ChatStatCardSkeleton key={index} />
            ))}
        </div>
    );
}

function ChatStatistics({ analytics }: { analytics: ChatAnalytics | null }) {
    const cards = analytics
        ? [
            {
                icon: Bot,
                label: "Total Conversations",
                value: analytics.chat_leads.conversations.toLocaleString(),
                supporting: formatCountTrend(
                    analytics.chat_leads.trends.conversations.current,
                    analytics.chat_leads.trends.conversations.previous,
                ),
                tone: "neutral" as const,
            },
            {
                icon: Headset,
                label: "Live Agent Requests",
                value: analytics.chat_leads.live_agent_requests.toLocaleString(),
                supporting: formatCountTrend(
                    analytics.chat_leads.trends.live_agent_requests.current,
                    analytics.chat_leads.trends.live_agent_requests.previous,
                ),
                tone: "amber" as const,
            },
            {
                icon: Clock3,
                label: "Average Response Time",
                value: formatDurationCompact(analytics.chat_leads.average_response_time_seconds),
                supporting: analytics.chat_leads.responded_conversations > 0
                    ? `Across ${analytics.chat_leads.responded_conversations.toLocaleString()} responded conversations`
                    : "No replied conversations yet",
                tone: "green" as const,
            },
            {
                icon: BadgePercent,
                label: "Lead Conversion",
                value: `${analytics.chat_leads.lead_conversion_rate.toFixed(1)}%`,
                supporting: formatRateTrend(
                    analytics.chat_leads.trends.lead_conversion_rate.current,
                    analytics.chat_leads.trends.lead_conversion_rate.previous,
                ),
                tone: "red" as const,
            },
        ]
        : [
            {
                icon: Bot,
                label: "Total Conversations",
                value: "--",
                supporting: "Analytics unavailable",
                tone: "neutral" as const,
            },
            {
                icon: Headset,
                label: "Live Agent Requests",
                value: "--",
                supporting: "Analytics unavailable",
                tone: "amber" as const,
            },
            {
                icon: Clock3,
                label: "Average Response Time",
                value: "--",
                supporting: "Analytics unavailable",
                tone: "green" as const,
            },
            {
                icon: BadgePercent,
                label: "Lead Conversion",
                value: "--",
                supporting: "Analytics unavailable",
                tone: "red" as const,
            },
        ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <ChatStatCard key={card.label} {...card} />
            ))}
        </div>
    );
}


type ToastTone = "success" | "error"

interface ToastItem {
    id: number
    message: string
    tone: ToastTone
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
    if (toasts.length === 0) return null
    return (
        <div className="fixed bottom-5 right-5 z-[1200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${t.tone === "success"
                        ? "bg-white border-green-200"
                        : "bg-white border-red-200"
                        }`}
                >
                    {t.tone === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-slate-800 flex-1 leading-snug">{t.message}</p>
                    <button
                        onClick={() => onDismiss(t.id)}
                        className="text-slate-400 hover:text-slate-600 transition shrink-0"
                        aria-label="Dismiss notification"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
        </div>
    )
}

export default function AdminChatsPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [chatAnalytics, setChatAnalytics] = useState<ChatAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [markingAddressed, setMarkingAddressed] = useState(false);

    const [sendingHistory, setSendingHistory] = useState(false);
    const [historySentNotice, setHistorySentNotice] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [addressedFilter, setAddressedFilter] = useState<AddressedFilter>("all");
    const [agentRequestNotice, setAgentRequestNotice] = useState<string | null>(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    const notifiedRequestIds = useRef<Set<number>>(new Set());

    // Toast stack — surfaces success/error feedback for actions taken from
    // this page (reply sent, addressed toggled, history emailed, closed, etc.)
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const toastIdRef = useRef(0);
    const toastTimeoutsRef = useRef<Map<number, ReturnType<typeof window.setTimeout>>>(new Map());

    const dismissToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timeoutId = toastTimeoutsRef.current.get(id);
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            toastTimeoutsRef.current.delete(id);
        }
    };

    const pushToast = (message: string, tone: ToastTone = "success") => {
        const id = ++toastIdRef.current;
        setToasts((prev) => [...prev, { id, message, tone }]);
        const timeoutId = window.setTimeout(() => {
            dismissToast(id);
        }, 5000);
        toastTimeoutsRef.current.set(id, timeoutId);
    };

    useEffect(() => {
        return () => {
            for (const timeoutId of toastTimeoutsRef.current.values()) {
                window.clearTimeout(timeoutId);
            }
            toastTimeoutsRef.current.clear();
        };
    }, []);

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

    const loadChatAnalytics = async (silent = false) => {
        if (!silent) {
            setStatsLoading(true);
        }

        try {
            const response = await fetch("/api/analytics", {
                headers: authHeaders(),
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(`Analytics request failed (${response.status})`);
            }

            const data = (await response.json()) as ChatAnalytics;
            setChatAnalytics(data);
        } catch {
            setChatAnalytics(null);
        } finally {
            setStatsLoading(false);
        }
    };

    const refresh = async () => {
        await Promise.all([loadConversations(), loadChatAnalytics(true)]);
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
            const msg = err instanceof Error ? err.message : "Unable to send reply.";
            setError(msg);
            pushToast(msg, "error");
        } finally {
            setSending(false);
        }
    };

    const handleTakeOver = async () => {
        if (!selectedConversationId) return;
        try {
            await chatApi.switchMode(selectedConversationId, "admin");
            await refresh();
            pushToast("You've taken over this conversation.", "success");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to update chat mode.";
            setError(msg);
            pushToast(msg, "error");
        }
    };

    const handleReturnToAI = async () => {
        if (!selectedConversationId) return;
        try {
            await chatApi.switchMode(selectedConversationId, "assistant");
            await refresh();
            pushToast("Conversation returned to the AI assistant.", "success");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to return chat to AI.";
            setError(msg);
            pushToast(msg, "error");
        }
    };

    const handleCloseConversation = async () => {
        if (!selectedConversationId) return;

        try {
            await chatApi.closeConversation(selectedConversationId, false);
            await refresh();
            pushToast("Conversation closed.", "success");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to close conversation.";
            setError(msg);
            pushToast(msg, "error");
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
            pushToast(nextAddressed ? "Marked as addressed." : "Marked as needing a response.", "success");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to update addressed status.";
            setError(msg);
            pushToast(msg, "error");
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
            const to = result?.to ?? selectedConversation.inquiry?.email_address ?? "the visitor";
            setHistorySentNotice(`Chat history sent to ${to}.`);
            pushToast(`Chat history sent to ${to}.`, "success");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to send chat history.";
            setError(msg);
            pushToast(msg, "error");
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

    useEffect(() => {
        void loadChatAnalytics();
    }, []);

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
    const selectedAutoEnded = selectedConversation?.status === "agent_closed";
    const selectedEndedAt = selectedConversation?.ended_at ?? selectedConversation?.agent_ended_at ?? null;

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
        <main className="flex h-dvh flex-col overflow-hidden">
            <div className="mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col overflow-hidden">
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
                <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-start">
                    <div className="min-w-0 flex-1">
                        {statsLoading ? <ChatStatsSkeleton /> : <ChatStatistics analytics={chatAnalytics} />}
                    </div>

                    <button
                        onClick={() => void handleManualRefresh()}
                        disabled={refreshing || loading}
                        title="Refresh conversations"
                        aria-label="Refresh conversations"
                        className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>
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
                                        <div className="mt-3 space-y-2">
                                            {selectedAutoEnded ? (
                                                <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                                        <span>Ended automatically due to 10 minutes of inactivity</span>
                                                    </div>
                                                    {selectedEndedAt ? (
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(selectedEndedAt).toLocaleString([], {
                                                                dateStyle: "medium",
                                                                timeStyle: "short",
                                                            })}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                            <div className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                                                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                                This conversation has ended.
                                            </div>
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
            </div>
            <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </main>
    );
}