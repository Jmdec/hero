"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    AlertCircle,
    ArrowRightLeft,
    Bot,
    CheckCircle2,
    Clock3,
    EllipsisVertical,
    Headset,
    Inbox,
    Mail,
    Menu,
    RefreshCw,
    Search,
    Send,
    User,
    X,
    XCircle,
} from "lucide-react";
import { ChatApiError, chatApi, type ChatConversation, type ConversationResponse } from "@/lib/chatApi";

type StatusKey = "active" | "waiting_admin" | "agent_requested" | "agent_active" | "agent_closed" | "closed";

const STATUS: Record<StatusKey, { label: string; rail: string; dot: string; chip: string; live?: boolean; ended?: boolean }> = {
    active: { label: "HERO Assistant", rail: "bg-emerald-500", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
    waiting_admin: { label: "Agent Requested", rail: "bg-amber-500", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-600/20", live: true },
    agent_requested: { label: "Agent Requested", rail: "bg-amber-500", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-600/20", live: true },
    agent_active: { label: "You're live", rail: "bg-[#0D47A1]", dot: "bg-[#0D47A1]", chip: "bg-blue-50 text-[#0D47A1] ring-blue-600/20" },
    agent_closed: { label: "Done", rail: "bg-slate-300", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-500 ring-slate-500/10", ended: true },
    closed: { label: "Done", rail: "bg-slate-300", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-500 ring-slate-500/10", ended: true },
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

function normalizedEmail(conversation: ChatConversation) {
    return (conversation.group_key ?? conversation.inquiry?.email_address ?? `conversation:${conversation.id}`).trim().toLowerCase();
}

function sessionDividerLabel(message: { conversation_session_id?: number; conversation_session_started_at?: string | null }) {
    if (!message.conversation_session_id) return null;
    const date = message.conversation_session_started_at
        ? new Date(message.conversation_session_started_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;
    return `${date ? `${date} • ` : ""}Conversation session`;
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
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${s.chip}`}>
            {s.live ? <LiveDot /> : <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
            {s.label}
        </span>
    );
}

function AddressedChip() {
    return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
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

function ConversationSkeleton() {
    return (
        <div className="flex h-full flex-col">
            <div className="shrink-0 border-b border-slate-100 p-3 sm:p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 sm:w-40" />
                        <div className="h-3 w-44 animate-pulse rounded bg-slate-100 sm:w-56" />
                    </div>
                </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3 p-2.5 sm:p-4">
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
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
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
        preferred_contact_reminders: number;
        preferred_contact_reminders_overview?: ReminderOverviewRow[];
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

function getLoggedInUserEmail() {
    if (typeof window === "undefined") return "";

    try {
        const rawUser = localStorage.getItem("user");
        if (!rawUser) return "";

        const parsedUser = JSON.parse(rawUser) as { email?: string } | null;
        return typeof parsedUser?.email === "string" ? parsedUser.email.trim() : "";
    } catch {
        return "";
    }
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

type ReminderOverviewRow = {
    name: string;
    email: string;
    preferred_date_time: string;
    contact_method: "email" | "phone" | "either";
};

type ChatStatCardProps = {
    icon: typeof Bot;
    label: string;
    value: string;
    supporting: string;
    tone: ChatStatTone;
    onClick?: () => void;
};

function ChatStatCard({ icon: Icon, label, value, supporting, tone, onClick }: ChatStatCardProps) {
    const style = CHAT_STAT_TONE_STYLES[tone];

    return (
        <article
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(event) => {
                if (onClick && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onClick();
                }
            }}
            className={`relative w-full overflow-hidden rounded-2xl border border-transparent bg-white p-3.5 text-left shadow-sm sm:p-5 lg:p-6 ${onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20" : ""}`}
        >
            <div className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />
            <div className={`mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg sm:mb-3 sm:h-9 sm:w-9 lg:h-10 lg:w-10 lg:rounded-xl ${style.bg}`}>
                <Icon className={`h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 ${style.text}`} />
            </div>
            <p className="mb-1 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
            <p className="mb-1.5 text-xl font-bold text-slate-900 sm:text-2xl lg:mb-2 lg:text-3xl">{value}</p>
            <p className="text-[11px] leading-snug text-slate-400 sm:text-xs">{supporting}</p>
        </article>
    );
}

function ChatStatCardSkeleton() {
    return (
        <div className="relative w-full animate-pulse overflow-hidden rounded-2xl border border-transparent bg-white p-3.5 shadow-sm sm:p-5 lg:p-6">
            <div className="absolute left-0 top-0 h-full w-1 bg-slate-200" />
            <div className="mb-3 h-8 w-8 rounded-lg bg-slate-200 sm:h-9 sm:w-9 lg:h-10 lg:w-10 lg:rounded-xl" />
            <div className="mb-3 h-4 w-28 rounded bg-slate-200 sm:w-32" />
            <div className="mb-3 h-8 w-24 rounded bg-slate-200 sm:h-9 sm:w-28" />
            <div className="h-3 w-32 rounded bg-slate-200 sm:w-36" />
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
        <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-full sm:max-w-sm">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`pointer-events-auto flex animate-in items-start gap-3 rounded-xl border px-3.5 py-3 shadow-lg fade-in slide-in-from-bottom-2 sm:px-4 ${t.tone === "success"
                        ? "border-green-200 bg-white"
                        : "border-red-200 bg-white"
                        }`}
                >
                    {t.tone === "success" ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    )}
                    <p className="flex-1 text-sm leading-snug text-slate-800">{t.message}</p>
                    <button
                        onClick={() => onDismiss(t.id)}
                        className="shrink-0 text-slate-400 transition hover:text-slate-600"
                        aria-label="Dismiss notification"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    )
}

function ReminderOverviewModal({
    open,
    items,
    loading,
    onClose,
}: {
    open: boolean;
    items: ReminderOverviewRow[];
    loading: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-2 sm:p-4">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0D47A1]">Overview</p>
                        <h3 className="mt-1 truncate text-base font-semibold text-slate-900 sm:text-lg">Preferred contact reminders</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-2 shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close reminder overview"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
                    {loading ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                            Loading reminder list...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                            No visitors currently have a preferred contact time and method on file.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full min-w-[560px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Name</th>
                                        <th className="px-4 py-3 font-semibold">Email</th>
                                        <th className="px-4 py-3 font-semibold">Preferred date & time</th>
                                        <th className="px-4 py-3 font-semibold">Contact method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={`${item.email}-${item.preferred_date_time}-${index}`} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{item.email}</td>
                                            <td className="px-4 py-3 text-slate-700">{item.preferred_date_time || "—"}</td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {item.contact_method === "email"
                                                    ? "Email"
                                                    : item.contact_method === "phone"
                                                        ? "Phone"
                                                        : "Email or phone"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminChatsPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [chatAnalytics, setChatAnalytics] = useState<ChatAnalytics | null>(null);
    const [reminderOverview, setReminderOverview] = useState<ReminderOverviewRow[]>([]);
    const [reminderOverviewOpen, setReminderOverviewOpen] = useState(false);
    const [reminderOverviewLoading, setReminderOverviewLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);

    const [toasts, setToasts] = useState<ToastItem[]>([])
    const toastIdRef = useRef(0)

    const pushToast = useCallback((message: string, tone: ToastTone) => {
        const id = ++toastIdRef.current
        setToasts((t) => [...t, { id, message, tone }])
        setTimeout(() => {
            setToasts((t) => t.filter((toast) => toast.id !== id))
        }, 4000)
    }, [])

    const dismissToast = (id: number) => {
        setToasts((t) => t.filter((toast) => toast.id !== id))
    }

    const [refreshing, setRefreshing] = useState(false);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [markingAddressed, setMarkingAddressed] = useState(false);

    const [sendingHistory, setSendingHistory] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [addressedFilter, setAddressedFilter] = useState<AddressedFilter>("all");

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    // Tracks whether the component is still mounted so async polling callbacks
    // don't call setState after unmount.
    const isMountedRef = useRef(true);

    const loadConversations = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await chatApi.listConversations() as { data?: ChatConversation[];[key: string]: unknown };
            const items = Array.isArray(response?.data) ? response.data : [];
            if (!isMountedRef.current) return;
            setConversations(items);

            if (!selectedConversationId && items[0]?.id) {
                setSelectedConversationId(items[0].id);
                const email = items[0].group_key ?? items[0].inquiry?.email_address;
                if (email) {
                    const grouped = await chatApi.getConversationGroup(email);
                    if (isMountedRef.current) setSelectedConversation(grouped);
                }
            }
        } catch (err) {
            if (!isMountedRef.current) return;
            const message = err instanceof Error ? err.message : "Unable to load conversations.";
            setError(message);
            pushToast(message, "error");
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    const loadConversationGroup = async (id: number) => {
        setConversationLoading(true);
        try {
            const conversation = conversations.find((item) => item.id === id);
            const email = conversation?.group_key ?? conversation?.inquiry?.email_address;
            if (!email) return;
            const grouped = await chatApi.getConversationGroup(email);
            if (isMountedRef.current) setSelectedConversation(grouped);
        } catch (err) {
            if (isMountedRef.current) setError(err instanceof Error ? err.message : "Unable to load conversation.");
        } finally {
            if (isMountedRef.current) setConversationLoading(false);
        }
    };

    // Track mount state for the lifetime of the component.
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadConversations();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    // Poll the currently open conversation's messages/status separately.
    useEffect(() => {
        if (!selectedConversationId) return;

        let cancelled = false;

        const interval = setInterval(async () => {
            if (cancelled) return;
            try {
                const email = selectedConversation?.group_key ?? selectedConversation?.inquiry?.email_address;
                if (!email) return;
                const conversation = await chatApi.getConversationGroup(email);
                if (cancelled) return;

                setSelectedConversation(prev => {
                    if (!prev) return conversation;
                    if (prev.messages.length !== conversation.messages.length) return conversation;
                    if (prev.status !== conversation.status) return conversation;
                    return prev;
                });
            } catch (err) {
                if (err instanceof ChatApiError && err.status === 404) {
                    clearInterval(interval);
                    setError("This conversation is no longer available.");
                    setSelectedConversation(null);
                    setSelectedConversationId(null);
                }
                // otherwise ignore transient polling errors
            }
        }, 2000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [selectedConversationId, selectedConversation?.group_key, selectedConversation?.inquiry?.email_address]);

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
            if (isMountedRef.current) setChatAnalytics(data);
        } catch {
            if (isMountedRef.current) setChatAnalytics(null);
        } finally {
            if (isMountedRef.current) setStatsLoading(false);
        }
    };

    const loadReminderOverview = useCallback(async () => {
        setReminderOverviewLoading(true);

        try {
            const response = await fetch("/api/analytics/reminders", {
                headers: authHeaders(),
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(`Reminder request failed (${response.status})`);
            }

            const payload = await response.json() as { data?: ReminderOverviewRow[]; count?: number };
            const items = Array.isArray(payload?.data) ? payload.data : [];
            if (isMountedRef.current) setReminderOverview(items);
        } catch (err) {
            if (isMountedRef.current) {
                setReminderOverview([]);
                pushToast(err instanceof Error ? err.message : "Unable to load reminder overview.", "error");
            }
        } finally {
            if (isMountedRef.current) setReminderOverviewLoading(false);
        }
    }, [pushToast]);

    const openReminderOverview = useCallback(async () => {
        setReminderOverviewOpen(true);
        await loadReminderOverview();
    }, [loadReminderOverview]);

    const refresh = async () => {
        await Promise.all([loadConversations(), loadChatAnalytics(true)]);
        if (selectedConversationId) {
            try {
                const email = selectedConversation?.group_key ?? selectedConversation?.inquiry?.email_address;
                if (!email) return;
                const conversation = await chatApi.getConversationGroup(email);
                if (isMountedRef.current) setSelectedConversation(conversation);
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
            if (selectedConversation && NEEDS_ADMIN.includes(selectedConversation.status as StatusKey)) {
                await chatApi.switchMode(selectedConversationId, "admin");
            }

            await chatApi.sendMessage(selectedConversationId, "admin", reply.trim());
            setReply("");
            await refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to send reply.";
            setError(message);
            pushToast(message, "error");
        } finally {
            setSending(false);
        }
    };

    const handleTakeOver = async () => {
        if (!selectedConversationId) return;
        try {
            await chatApi.takeChat(selectedConversationId);
            await refresh();
            pushToast("You've taken over this chat.", "success");
        } catch (err) {
            if (err instanceof ChatApiError && err.status === 409) {
                pushToast("This conversation is already taken by another agent.", "error");
                await refresh();
                return;
            }

            const message = err instanceof Error ? err.message : "Unable to take the chat. It may have been taken by another agent.";
            setError(message);
            pushToast(message, "error");
        }
    };

    const handleReturnToAI = async () => {
        if (!selectedConversationId) return;
        try {
            await chatApi.switchMode(selectedConversationId, "assistant");
            await refresh();
            pushToast("Conversation returned to the HERO assistant.", "success");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to return chat to AI.";
            setError(message);
            pushToast(message, "error");
        }
    };

    const handleCloseConversation = async () => {
        if (!selectedConversationId) return;

        const confirmed = typeof window !== "undefined"
            ? window.confirm("Mark this conversation as done?\n\nThis will close the conversation and indicate that the issue has been resolved.")
            : true;

        if (!confirmed) return;

        try {
            await chatApi.markConversationDone(selectedConversationId, false);
            await refresh();
            pushToast("Conversation marked as done.", "success");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to mark conversation as done.";
            setError(message);
            pushToast(message, "error");
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
            pushToast(nextAddressed ? "Marked as addressed." : "Marked as needing response.", "success");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to update addressed status.";
            setError(message);
            pushToast(message, "error");
        } finally {
            setMarkingAddressed(false);
        }
    };

    const handleSendHistory = async () => {
        if (!selectedConversationId || !selectedConversation) return;

        setSendingHistory(true);
        setError("");

        try {
            const loggedInUserEmail = getLoggedInUserEmail();
            const result = await chatApi.emailChatHistory(selectedConversationId, loggedInUserEmail || undefined);
            pushToast(
                `Chat history sent to ${result?.to || "the admin account"}.`,
                "success"
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to send chat history.";
            setError(message);
            pushToast(message, "error");
        } finally {
            setSendingHistory(false);
        }
    };

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
        setSidebarOpen(false);
        setActionsMenuOpen(false);
        void loadConversationGroup(id);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [selectedConversation?.messages]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadChatAnalytics();
        }, 0);

        return () => window.clearTimeout(timeoutId);
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
                const email = normalizedEmail(c);
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

    const isSwitchingConversation =
        selectedConversationId !== null &&
        (conversationLoading || selectedConversation?.id !== selectedConversationId);

    const filterTabs: { key: AddressedFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "needs_response", label: "Needs reply" },
        { key: "addressed", label: "Addressed" },
    ];

    const sidebarListBody = (
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2 sm:p-2.5">
            {loading || refreshing ? (
                <ConversationListSkeleton />
            ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-6 text-center sm:p-8">
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
                            className={`group relative flex w-full items-start gap-2.5 overflow-hidden rounded-xl border p-2 pl-3 text-left transition sm:gap-3 sm:p-2.5 sm:pl-3.5 ${isActive ? "border-[#0D47A1]/30 bg-[#0D47A1]/[0.04]" : "border-transparent hover:bg-slate-50"
                                }`}
                        >
                            <span className={`absolute inset-y-2 left-0 w-1 rounded-full ${s.rail}`} />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                                    <span className="shrink-0 font-mono text-[10px] text-slate-400">{timeAgo(conversation.updated_at)}</span>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
                                    <p className="min-w-0 truncate text-xs text-slate-500">{conversation.inquiry?.email_address ?? "No email"}</p>
                                    <span className="shrink-0 font-mono text-[10px] text-slate-400">{conversation.message_count} msgs</span>
                                </div>
                            </div>
                        </button>
                    );
                })
            )}
        </div>
    );

    return (
        <>
            <ReminderOverviewModal
                open={reminderOverviewOpen}
                items={reminderOverview}
                loading={reminderOverviewLoading}
                onClose={() => setReminderOverviewOpen(false)}
            />
            <div className="flex h-dvh flex-col overflow-hidden">
                <main className="mx-auto flex w-full min-h-0 max-w-[1600px] flex-1 flex-col overflow-hidden">
                    {/* Mobile/tablet top bar */}
                    <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-2 md:hidden">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open conversations menu"
                            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1]"
                        >
                            <Menu className="h-4 w-4" />
                            <span className="text-sm font-medium">Conversations</span>
                        </button>
                        <button
                            onClick={() => void handleManualRefresh()}
                            disabled={refreshing || loading}
                            aria-label="Refresh conversations"
                            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Chat Filters */}
                    <div className="mb-3 flex gap-3 items-center justify-center">
                        {/* Search + Filter Tabs */}
                        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                {/* Search */}
                                <div className="relative min-w-0 flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search by name or email"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#0D47A1] focus:bg-white focus:ring-2 focus:ring-[#0D47A1]/10"
                                    />
                                </div>

                                {/* Filter Tabs */}
                                <div className="min-w-0 lg:max-w-[60%]">
                                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                                        {filterTabs.map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setAddressedFilter(tab.key)}
                                                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${addressedFilter === tab.key
                                                    ? "bg-[#0D47A1] text-white shadow-sm"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={() => void handleManualRefresh()}
                            disabled={refreshing || loading}
                            title="Refresh conversations"
                            aria-label="Refresh conversations"
                            className="hidden md:inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto xl:h-[46px]"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                            />
                            <span>Refresh</span>
                        </button>
                    </div>

                    <div className="grid min-h-0 flex-1 gap-2.5 overflow-hidden sm:gap-3 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
                        {/* Persistent sidebar column from tablet (md) up */}
                        <div className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:flex">
                            {sidebarListBody}
                        </div>

                        {/* Mobile off-canvas drawer with the same content */}
                        {sidebarOpen ? (
                            <div className="fixed inset-0 z-50 md:hidden">
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
                                    {sidebarListBody}
                                </div>
                            </div>
                        ) : null}

                        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            {selectedConversationId === null ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center sm:p-8">
                                    <Inbox className="h-6 w-6 text-slate-300" />
                                    <p className="text-sm text-slate-500">Select a conversation to read the thread and reply.</p>
                                </div>
                            ) : isSwitchingConversation ? (
                                <ConversationSkeleton />
                            ) : selectedConversation ? (
                                <>
                                    {/* Header */}
                                    <div className="shrink-0 border-b border-slate-100 bg-white p-3 sm:p-4">
                                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                                            {/* Left: Conversation information */}
                                            <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                                                {/* Avatar */}
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D47A1]/10 text-sm font-semibold text-[#0D47A1] sm:h-11 sm:w-11">
                                                    {initialsOf(selectedConversation.inquiry?.full_name)}
                                                </div>

                                                {/* Details */}
                                                <div className="min-w-0 flex-1">
                                                    {/* Name + Status */}
                                                    <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                                                        <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                                            {selectedConversation.inquiry?.full_name ??
                                                                "Guest visitor"}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <StatusChip status={selectedConversation.status} />

                                                            {selectedIsAddressed ? <AddressedChip /> : null}
                                                        </div>
                                                    </div>

                                                    {/* Email + Messages */}
                                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                                        <span className="flex min-w-0 items-center gap-1.5">
                                                            <Mail className="h-3 w-3 shrink-0" />

                                                            <span className="truncate">
                                                                {selectedConversation.inquiry?.email_address ??
                                                                    "No email supplied"}
                                                            </span>
                                                        </span>

                                                        <span className="hidden text-slate-300 sm:inline">·</span>

                                                        <span className="shrink-0">
                                                            {selectedConversation.messages.length} messages
                                                        </span>
                                                    </div>

                                                    {/* Agent Information */}
                                                    {selectedConversation.agent && selectedIsAgentOwned ? (
                                                        <div className="mt-2.5 rounded-lg bg-slate-50 px-2.5 py-2 sm:px-3">
                                                            <div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-0.5">
                                                                <p className="text-xs font-semibold text-slate-700">
                                                                    Taken by:
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {selectedConversation.agent.name ?? "Agent"}
                                                                </p>

                                                                {selectedConversation.agent.email ? (
                                                                    <>
                                                                        <span className="hidden text-slate-300 sm:inline">
                                                                            ·
                                                                        </span>

                                                                        <p className="max-w-full truncate text-xs text-slate-500">
                                                                            {selectedConversation.agent.email}
                                                                        </p>
                                                                    </>
                                                                ) : null}

                                                                {selectedConversation.agent_started_at ? (
                                                                    <>
                                                                        <span className="hidden text-slate-300 sm:inline">
                                                                            ·
                                                                        </span>

                                                                        <p className="text-xs font-semibold text-slate-700">
                                                                            Taken at:{" "}
                                                                        </p>

                                                                        <p className="text-xs text-slate-500">
                                                                            {new Date(
                                                                                selectedConversation.agent_started_at,
                                                                            ).toLocaleString()}
                                                                        </p>
                                                                    </>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div
                                                ref={actionsMenuRef}
                                                className="relative shrink-0"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActionsMenuOpen((open) => !open)
                                                    }
                                                    aria-label="Open conversation actions"
                                                    aria-haspopup="menu"
                                                    aria-expanded={actionsMenuOpen}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] sm:h-10 sm:w-10"
                                                >
                                                    <EllipsisVertical className="h-4 w-4" />
                                                </button>

                                                {actionsMenuOpen ? (
                                                    <div className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[min(14rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                                        {/* Mark as Addressed */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionsMenuOpen(false);
                                                                void handleToggleAddressed();
                                                            }}
                                                            disabled={markingAddressed}
                                                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedIsAddressed
                                                                ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                                                                : "text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                                                                }`}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 shrink-0" />

                                                            <span>
                                                                {selectedIsAddressed
                                                                    ? "Addressed"
                                                                    : "Mark as addressed"}
                                                            </span>
                                                        </button>

                                                        {/* Send History */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionsMenuOpen(false);
                                                                void handleSendHistory();
                                                            }}
                                                            disabled={sendingHistory}
                                                            title={
                                                                selectedHasEmail
                                                                    ? "Email the full chat transcript to the currently signed-in admin"
                                                                    : "Email the full chat transcript to the currently signed-in admin"
                                                            }
                                                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedRequestedHistory
                                                                ? "bg-sky-50 text-sky-700 hover:bg-sky-100"
                                                                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                                                                }`}
                                                        >
                                                            <Mail className="h-4 w-4 shrink-0" />

                                                            <span>
                                                                {sendingHistory
                                                                    ? "Sending…"
                                                                    : "Send history"}
                                                            </span>
                                                        </button>

                                                        {/* Take Chat */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionsMenuOpen(false);
                                                                void handleTakeOver();
                                                            }}
                                                            disabled={
                                                                selectedIsEnded ||
                                                                Boolean(selectedConversation?.agent) ||
                                                                selectedConversation.status === "agent_active"
                                                            }
                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            <Headset className="h-4 w-4 shrink-0" />

                                                            <span>
                                                                {selectedConversation.agent
                                                                    ? `Taken by ${selectedConversation.agent.name ?? "another agent"}`
                                                                    : selectedConversation.status === "agent_active"
                                                                        ? "Live agent session active"
                                                                        : "Take Chat"}
                                                            </span>
                                                        </button>

                                                        {/* Return to AI */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActionsMenuOpen(false);
                                                                void handleReturnToAI();
                                                            }}
                                                            disabled={selectedIsEnded}
                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            <Bot className="h-4 w-4 shrink-0" />

                                                            <span>Return to System</span>
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content area */}
                                    <div className="flex min-h-0 flex-1 flex-col p-2.5 sm:p-4">
                                        <div
                                            className="min-h-0 flex-1 space-y-2.5 overflow-y-auto rounded-xl bg-slate-50 p-2.5 sm:space-y-3 sm:p-4"
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
                                                selectedConversation.messages.map((message, index) => {
                                                    const isSystem = message.sender === "system";
                                                    const senderKey = isSystem ? "assistant" : senderKeyOf(message.sender);
                                                    const style = isSystem ? SYSTEM_STYLE : SENDER_STYLE[senderKey as SenderKey];
                                                    const SenderIcon = style.icon;
                                                    const isAdmin = senderKey === "admin";

                                                    const previousMessage = selectedConversation.messages[index - 1];
                                                    const hasSessionBoundary = previousMessage && previousMessage.conversation_session_id !== message.conversation_session_id;
                                                    return (
                                                        <div key={`${message.conversation_session_id ?? selectedConversation.id}-${message.id}`}>
                                                            {hasSessionBoundary && (
                                                                <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                                    <span className="h-px flex-1 bg-slate-200" />
                                                                    <span>{sessionDividerLabel(message)}</span>
                                                                    <span className="h-px flex-1 bg-slate-200" />
                                                                </div>
                                                            )}
                                                            <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                                            <div
                                                                className={`max-w-[88%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[75%] sm:px-3.5 sm:py-2.5 lg:max-w-[65%] ${style.bubble}`}
                                                            >
                                                                <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide ${style.label}`}>
                                                                    <SenderIcon className="h-3 w-3" />
                                                                    <span>{isSystem ? "System" : message.sender}</span>
                                                                    <span>·</span>
                                                                    <span>{new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                                </div>
                                                                {/* Render a contact button when the system message contains a contact URL */}
                                                                {isSystem && /contact/i.test(message.message) ? (
                                                                    (() => {
                                                                        const match = message.message.match(/(https?:\/\/[^\s]+\/contact|\/contact\b)/i);
                                                                        const rawUrl = match ? match[0] : null;
                                                                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                                                                        const url = rawUrl ? (rawUrl.startsWith('/') ? `${origin}${rawUrl}` : rawUrl) : `${origin}/contact`;
                                                                        const text = message.message.replace(rawUrl ?? '', '').trim();

                                                                        return (
                                                                            <div className="flex flex-col gap-2">
                                                                                {text ? <p className="text-sm leading-relaxed">{text}</p> : null}
                                                                                <a
                                                                                    href={url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-2 rounded-md bg-[#0D47A1] px-3 py-2 text-sm font-medium text-white hover:bg-[#0D47A1]/90"
                                                                                >
                                                                                    Contact Us
                                                                                    <ArrowRightLeft className="h-4 w-4" />
                                                                                </a>
                                                                            </div>
                                                                        );
                                                                    })()
                                                                ) : (
                                                                    <p className="text-sm leading-relaxed">{message.message}</p>
                                                                )}
                                                            </div>
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
                                            <div className="mt-3 shrink-0 rounded-xl border border-slate-200 p-2.5 sm:p-3">
                                                {selectedNeedsAdmin ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleTakeOver()}
                                                        disabled={selectedIsEnded || Boolean(selectedConversation?.agent) || selectedConversation?.status === "agent_active"}
                                                        className="mb-2 flex w-full items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-left text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <LiveDot />
                                                        This visitor asked for a person — tap to take over the chat.
                                                    </button>
                                                ) : selectedIsAgentOwned ? (
                                                    <>
                                                        <div
                                                            className="min-h-0 flex-1 space-y-2.5 overflow-y-auto rounded-xl bg-slate-50 p-2.5 sm:space-y-3 sm:p-4"
                                                            style={{
                                                                backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)",
                                                                backgroundSize: "16px 16px",
                                                            }}>
                                                            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#0D47A1]">
                                                                <Headset className="h-3.5 w-3.5" />
                                                                Live Agent is active — HERO assistant is paused here.
                                                            </p>

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
                                                            <div className="mt-2 flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between">
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                                    <ArrowRightLeft className="h-3.5 w-3.5" />
                                                                    <span className="hidden md:inline">Enter to send · Shift + Enter for a new line</span>
                                                                    <span className="md:hidden">Enter to send</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => void handleSendReply()}
                                                                    disabled={sending || !reply.trim()}
                                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0D47A1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0D47A1]/90 disabled:cursor-not-allowed disabled:bg-slate-300 md:w-auto"
                                                                >
                                                                    <Send className="h-4 w-4" />
                                                                    {sending ? "Sending..." : "Send"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center sm:p-8">
                                    <Inbox className="h-6 w-6 text-slate-300" />
                                    <p className="text-sm text-slate-500">Select a conversation to read the thread and reply.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main >

                <ToastStack toasts={toasts} onDismiss={dismissToast} />
            </div >
        </>
    );
}