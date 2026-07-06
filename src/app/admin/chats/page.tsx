"use client";

import { useEffect, useState, useRef } from "react";
import { AlertCircle, CheckCircle2, Clock3, MessageSquare, Send, User } from "lucide-react";
import { chatApi, type ChatConversation, type ConversationResponse } from "@/lib/chatApi";

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-emerald-50 text-emerald-700",
        waiting_admin: "bg-amber-50 text-amber-700",
        agent_requested: "bg-amber-50 text-amber-700",
        agent_active: "bg-blue-50 text-blue-700",
        agent_closed: "bg-slate-100 text-slate-600",
        closed: "bg-slate-100 text-slate-600",
    };
    const labels: Record<string, string> = {
        waiting_admin: "Awaiting admin",
        agent_requested: "Awaiting admin",
        agent_active: "Live agent",
        agent_closed: "Closed",
        closed: "Closed",
        active: "Active",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
            {labels[status] ?? status}
        </span>
    );
}

export default function AdminChatsPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadConversations = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await chatApi.listConversations() as { data?: ChatConversation[];[key: string]: unknown };
            const items = Array.isArray(response?.data) ? response.data : [];
            setConversations(items);

            if (!selectedConversationId && items[0]?.id) {
                setSelectedConversationId(items[0].id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load conversations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadConversations();
    }, []);

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

    return (
        <div className="min-h-screen p-4 md:p-8">
            <main className="mx-auto space-y-6">

                {error ? (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="mb-3 flex items-center justify-between px-2">
                            <p className="text-sm font-semibold text-slate-700">Recent conversations</p>
                            <button onClick={() => void loadConversations()} className="text-sm font-medium text-[#0D47A1]">
                                Refresh
                            </button>
                        </div>

                        <div className="space-y-2">
                            {loading ? (
                                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Loading conversations...</div>
                            ) : conversations.length === 0 ? (
                                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No conversations yet.</div>
                            ) : (
                                conversations.map((conversation) => {
                                    const isActive = conversation.id === selectedConversationId;
                                    return (
                                        <button
                                            key={conversation.id}
                                            onClick={() => setSelectedConversationId(conversation.id)}
                                            className={`w-full rounded-xl border p-3 text-left transition ${isActive ? "border-[#0D47A1] bg-[#EEF2FB]" : "border-slate-200 hover:border-slate-300"}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {conversation.inquiry?.full_name ?? "Guest visitor"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{conversation.inquiry?.email_address ?? "No email"}</p>
                                                </div>
                                                <StatusBadge status={conversation.status} />
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {conversation.message_count} messages • {new Date(conversation.updated_at).toLocaleString()}
                                            </p>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {selectedConversation ? (
                            <>
                                <div className="border-b border-slate-200 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-semibold text-slate-900">
                                                {selectedConversation.inquiry?.full_name ?? "Guest visitor"}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {selectedConversation.inquiry?.email_address ?? "No email supplied"}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => void handleTakeOver()} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                Take over chat
                                            </button>
                                            <button onClick={() => void handleReturnToAI()} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                Return to AI
                                            </button>
                                            <button onClick={() => void handleCloseConversation()} className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50">
                                                Close chat
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex h-105 flex-col p-4">
                                    <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
                                        {selectedConversation.messages.length === 0 ? (
                                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                                No messages yet. Start the conversation with a welcome note.
                                            </div>
                                        ) : (
                                            selectedConversation.messages.map((message) => (
                                                <div key={message.id} className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${message.sender === "admin" ? "bg-[#0D47A1] text-white" : "bg-white text-slate-700 shadow-sm"}`}>
                                                        <div className="mb-1 flex items-center gap-2 text-[11px] opacity-80">
                                                            {message.sender === "admin" ? <User className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                                                            <span>{message.sender}</span>
                                                            <span>•</span>
                                                            <span>{new Date(message.sent_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-sm leading-6">{message.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        <div ref={messagesEndRef} />

                                    </div>

                                    <div className="mt-3 rounded-xl border border-slate-200 p-3">
                                        <textarea
                                            value={reply}
                                            onChange={(event) => setReply(event.target.value)}
                                            placeholder="Type a reply to the visitor..."
                                            rows={3}
                                            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0D47A1]"
                                        />
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Clock3 className="h-4 w-4" />
                                                Response time matters for a good experience.
                                            </div>
                                            <button
                                                onClick={() => void handleSendReply()}
                                                disabled={sending || !reply.trim()}
                                                className="inline-flex items-center gap-2 rounded-full bg-[#0D47A1] px-3.5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                                            >
                                                {sending ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                                {sending ? "Sending..." : "Send"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full min-h-120 items-center justify-center p-8 text-center text-sm text-slate-500">
                                Select a conversation to read the thread and reply.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}