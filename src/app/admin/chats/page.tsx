"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    ArrowRightLeft,
    Bot,
    CheckCircle2,
    Headset,
    Inbox,
    Mail,
    Search,
    Send,
    User,
    XCircle,
} from "lucide-react";
import { chatApi, type ChatConversation, type ConversationResponse } from "@/lib/chatApi";

/* ---------------------------------------------------------------------- */
/*  Status system                                                          */
/* ---------------------------------------------------------------------- */

type StatusKey = "active" | "waiting_admin" | "agent_requested" | "agent_active" | "agent_closed" | "closed";

const STATUS: Record<StatusKey, { label: string; rail: string; dot: string; chip: string; live?: boolean; ended?: boolean }> = {
    active: { label: "AI handling", rail: "bg-emerald-500", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
    waiting_admin: { label: "Needs you", rail: "bg-amber-500", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-600/20", live: true },
    agent_requested: { label: "Needs you", rail: "bg-amber-500", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-600/20", live: true },
    agent_active: { label: "You're live", rail: "bg-[#0D47A1]", dot: "bg-[#0D47A1]", chip: "bg-blue-50 text-[#0D47A1] ring-blue-600/20" },
    agent_closed: { label: "Ended", rail: "bg-slate-300", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-500 ring-slate-500/10", ended: true },
    closed: { label: "Ended", rail: "bg-slate-300", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-500 ring-slate-500/10", ended: true },
};

// Statuses where the visitor is waiting on a human, and no one has taken
// ownership yet. Used to (a) show the "needs you" pulse and (b) let the
// admin reply straight away without a separate "take over" click first.
const NEEDS_ADMIN: StatusKey[] = ["waiting_admin", "agent_requested"];

function statusOf(status: string) {
    return STATUS[status as StatusKey] ?? STATUS.closed;
}

/** A live-indicator dot with a proper radiating ping ring, used instead of
 *  a plain opacity pulse so "needs you" actually reads as urgent at a glance. */
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

/** Skeleton shown in the thread pane while a newly-selected conversation is
 *  still being fetched, so switching threads doesn't show stale messages
 *  or a blank pane while the request is in flight. */
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

/* ---------------------------------------------------------------------- */

export default function AdminChatsPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [agentRequestNotice, setAgentRequestNotice] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Tracks which conversation ids we've already surfaced an "agent requested"
    // notice for, so polling doesn't re-announce the same request every 2s.
    const notifiedRequestIds = useRef<Set<number>>(new Set());

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

    // Client-side heads-up when a visitor asks for a human. The actual email
    // to the admin inbox should be triggered server-side the moment a
    // conversation's status flips to "waiting_admin" / "agent_requested" —
    // that's the reliable place to send it, since it fires even if no admin
    // has this page open. Hook it into whatever transitions the status in
    // your backend (e.g. the endpoint the widget calls for "Talk to an agent").
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

    // Fetch the newly-selected conversation right away instead of waiting on
    // the 2s poll below, and show a skeleton for the duration of the request.
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

    const refresh = async () => {
        await loadConversations();
        if (selectedConversationId) {
            try {
                const conversation = await chatApi.getConversation(selectedConversationId);
                setSelectedConversation(conversation);
            } catch {
                // Ignore refresh errors and keep the existing view intact.
            }
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
            await chatApi.closeConversation(selectedConversationId);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to close conversation.");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [selectedConversation?.messages]);

    const filteredConversations = useMemo(() => {
        const q = query.trim().toLowerCase();
        const base = !q
            ? conversations
            : conversations.filter((c) => {
                  const name = c.inquiry?.full_name?.toLowerCase() ?? "";
                  const email = c.inquiry?.email_address?.toLowerCase() ?? "";
                  return name.includes(q) || email.includes(q);
              });

        // Most recently updated conversation first.
        return [...base].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }, [conversations, query]);

    // Conversation overview — quick counts across the whole queue.
    const overview = useMemo(() => {
        const total = conversations.length;
        const needsYou = conversations.filter((c) => NEEDS_ADMIN.includes(c.status as StatusKey)).length;
        const live = conversations.filter((c) => (c.status as StatusKey) === "agent_active").length;
        const ended = conversations.filter((c) => statusOf(c.status).ended).length;
        return { total, needsYou, live, ended };
    }, [conversations]);

    const selectedIsEnded = selectedConversation ? statusOf(selectedConversation.status).ended : false;

    // True while we're waiting on the thread for the currently-selected id —
    // covers both the in-flight fetch and the moment right after a click,
    // before the effect above has swapped selectedConversation over.
    const isSwitchingConversation =
        selectedConversationId !== null &&
        (conversationLoading || selectedConversation?.id !== selectedConversationId);

    return (
        <div className="flex h-screen flex-col">
            <main className="mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col gap-3">
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

                {error ? (
                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                ) : null}

                <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="shrink-0 border-b border-slate-100 p-3">
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

                        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2.5">
                            {loading ? (
                                <div className="space-y-1.5 p-1">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="h-[72px] animate-pulse rounded-xl bg-slate-100" />
                                    ))}
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-8 text-center">
                                    <Inbox className="h-5 w-5 text-slate-300" />
                                    <p className="text-sm text-slate-500">
                                        {conversations.length === 0 ? "No conversations yet." : "Nothing matches that search."}
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
                                            onClick={() => setSelectedConversationId(conversation.id)}
                                            className={`group relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-2.5 pl-3.5 text-left transition ${
                                                isActive ? "border-[#0D47A1]/30 bg-[#0D47A1]/[0.04]" : "border-transparent hover:bg-slate-50"
                                            }`}
                                        >
                                            <span className={`absolute inset-y-2 left-0 w-[3px] rounded-full ${s.rail}`} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                                                    <span className="shrink-0 font-mono text-[10px] text-slate-400">{timeAgo(conversation.updated_at)}</span>
                                                </div>
                                                <p className="truncate text-xs text-slate-500">{conversation.inquiry?.email_address ?? "No email"}</p>
                                                <div className="mt-1.5 flex items-center justify-between gap-2">
                                                    <StatusChip status={conversation.status} />
                                                    <span className="font-mono text-[10px] text-slate-400">{conversation.message_count} msgs</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

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
                                                </div>
                                                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Mail className="h-3 w-3" />
                                                    {selectedConversation.inquiry?.email_address ?? "No email supplied"}
                                                    <span className="text-slate-300">·</span>
                                                    {selectedConversation.messages.length} messages
                                                    <span className="text-slate-300">·</span>
                                                    {durationSince(selectedConversation.messages[0]?.sent_at ?? selectedConversation.updated_at)} old
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => void handleTakeOver()}
                                                disabled={selectedIsEnded}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-[#0D47A1]/30 hover:bg-[#0D47A1]/5 hover:text-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                                            >
                                                <Headset className="h-3.5 w-3.5" />
                                                Take over
                                            </button>
                                            <button
                                                onClick={() => void handleReturnToAI()}
                                                disabled={selectedIsEnded}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                                            >
                                                <Bot className="h-3.5 w-3.5" />
                                                Return to AI
                                            </button>
                                            <button
                                                onClick={() => void handleCloseConversation()}
                                                disabled={selectedIsEnded}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Close
                                            </button>
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
                                                // "system" messages (e.g. "Visitor requested an agent",
                                                // "Chat ended") render as a centered note, not a bubble
                                                // belonging to either side of the conversation.
                                                if (message.sender === "system") {
                                                    return (
                                                        <div key={message.id} className="flex justify-center">
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-medium text-slate-500">
                                                                {message.message}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                const isAdmin = message.sender === "admin";
                                                return (
                                                    <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                                        <div
                                                            className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                                                                isAdmin
                                                                    ? "rounded-br-sm bg-[#0D47A1] text-white"
                                                                    : "rounded-bl-sm border border-slate-100 bg-white text-slate-700"
                                                            }`}
                                                        >
                                                            <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide ${isAdmin ? "text-blue-100/80" : "text-slate-400"}`}>
                                                                {isAdmin ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                                                <span>{message.sender}</span>
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
                                        // Chat-ended indicator: replaces the composer once a
                                        // conversation is closed, so it's obvious there's nothing
                                        // left to reply to here.
                                        <div className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                                            <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                            This conversation has ended.
                                        </div>
                                    ) : (
                                        <div className="mt-3 shrink-0 rounded-xl border border-slate-200 p-3">
                                            {NEEDS_ADMIN.includes(selectedConversation.status as StatusKey) ? (
                                                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                                    <LiveDot />
                                                    This visitor asked for a person — sending a reply takes over the chat.
                                                </p>
                                            ) : null}
                                            <textarea
                                                value={reply}
                                                onChange={(event) => setReply(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" && !event.shiftKey) {
                                                        event.preventDefault();
                                                        void handleSendReply();
                                                    }
                                                }}
                                                placeholder="Type a reply to the visitor..."
                                                rows={3}
                                                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#0D47A1] focus:ring-2 focus:ring-[#0D47A1]/10"
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