const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export interface ChatInquiryPayload {
    full_name: string;
    email_address: string;
    phone_number: string;
    company_name?: string;
    privacy_policy_accepted: boolean;
}

export interface StartChatResponse {
    conversation_id: number;
    session_id: string;
}

export interface ChatConversation {
    id: number;
    chat_inquiry_id: number | null;
    session_id: string;
    chat_mode: "assistant" | "admin";
    status: "active" | "waiting_admin" | "agent_requested" | "agent_active" | "agent_closed" | "closed";
    message_count: number;
    started_at: string;
    ended_at: string | null;
    created_at: string;
    updated_at: string;
    addressed_at?: string | null;
    agent_requested_at?: string | null;
    agent_started_at?: string | null;
    agent_ended_at?: string | null;
    last_message_at?: string | null;
    agent_id?: number | null;
    preferred_contact_details?: string | null;
    preferred_contact_method?: "email" | "phone" | "either" | null;
    inquiry?: {
        id: number;
        full_name: string;
        email_address: string;
        phone_number: string;
        company_name?: string | null;
    };
}

export interface ChatMessage {
    id: number;
    chat_conversation_id: number;
    sender: "user" | "assistant" | "admin" | "system";
    message: string;
    sent_at: string;
    created_at: string;
    updated_at: string;
}

export interface ConversationResponse extends ChatConversation {
    messages: ChatMessage[];
}

export interface ConversationActionResponse {
    message: string;
    conversation: ConversationResponse;
}

export interface PreferredContactPayload {
    preferred_time: string;
    preferred_method?: "email" | "phone" | "either";
}

export class ChatApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public errors?: Record<string, string[]>
    ) {
        super(message);
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    baseUrl: string | null = API_URL
): Promise<T> {
    const url = baseUrl ? `${baseUrl}/api${endpoint}` : `/api${endpoint}`;

    let response: Response;

    try {
        response = await fetch(url, {
            ...options,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(options.headers ?? {}),
            },
        });
    } catch (err) {
        console.error("Network Error:", err);

        throw new ChatApiError(
            `Cannot connect to Laravel API (${url})`,
            0
        );
    }

    let body: unknown = null;

    try {
        body = await response.json();
    } catch { }

    if (!response.ok) {
        const errorBody = body as { message?: string; errors?: Record<string, string[]> } | null;

        throw new ChatApiError(
            errorBody?.message ?? "Request failed.",
            response.status,
            errorBody?.errors
        );
    }

    return body as T;
}

export const chatApi = {
    start(payload: ChatInquiryPayload) {
        return request<StartChatResponse>("/chat/start", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    sendMessage(
        conversationId: number,
        sender: "user" | "assistant" | "admin" | "system",
        message: string
    ) {
        return request<ChatMessage>(
            `/chat/${conversationId}/message`,
            {
                method: "POST",
                body: JSON.stringify({
                    sender,
                    message,
                }),
            }
        );
    },

    requestAgent(conversationId: number, message = "I'd like to talk to a live agent.") {
        return request<ConversationActionResponse>(`/chat/${conversationId}/agent-request`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    },

    submitPreferredContact(conversationId: number, payload: PreferredContactPayload) {
        return request<ConversationActionResponse>(`/chat/${conversationId}/preferred-contact`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    markAddressed(conversationId: number, addressed: boolean) {
        return request(`/chat/${conversationId}/addressed`, {
            method: "PATCH",
            body: JSON.stringify({ addressed }),
        });
    },

    getConversation(conversationId: number) {
        return request<ConversationResponse>(
            `/chat/${conversationId}`
        );
    },

    getConversationBySession(sessionId: string) {
        return request<ConversationResponse>(`/chat/session/${sessionId}`);
    },

    switchMode(
        conversationId: number,
        mode: "assistant" | "admin"
    ) {
        return request<ConversationActionResponse>(`/chat/${conversationId}/mode`, {
            method: "PATCH",
            body: JSON.stringify({
                chat_mode: mode,
            }),
        });
    },

    endLiveAgent(conversationId: number) {
        return request<ConversationActionResponse>(`/chat/${conversationId}/end-live-agent`, {
            method: "PATCH",
            body: JSON.stringify({}),
        });
    },

    closeConversation(conversationId: number, sendTranscript = true) {
        return request(`/chat/${conversationId}/close`, {
            method: "PATCH",
            body: JSON.stringify({ send_transcript: Boolean(sendTranscript) }),
        });
    },

    closeConversationOnExit(conversationId: number, sendTranscript = true) {
        const url = `${API_URL}/api/chat/${conversationId}/close`;

        const payload = { send_transcript: Boolean(sendTranscript) };

        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
            const blob = new Blob([JSON.stringify(payload)], {
                type: "application/json",
            });
            const ok = navigator.sendBeacon(url, blob);
            if (ok) return;
        }

        try {
            fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                keepalive: true,
            }).catch(() => {});
        } catch {
            // Best-effort only — nothing more we can do during teardown.
        }
    },

    emailChatHistory(conversationId: number, to?: string) {
        return request<{ sent: boolean; to: string }>(
            `/chat/${conversationId}/email-history`,
            {
                method: "POST",
                body: JSON.stringify(to ? { to } : {}),
            },
            typeof window !== "undefined" ? null : API_URL
        );
    },

    listConversations() {
        return request("/chat");
    },

    // Heartbeat/ping to keep server-side session alive and update last-activity.
    pingConversation(conversationId: number) {
        return request(`/chat/${conversationId}/heartbeat`, {
            method: "POST",
            body: JSON.stringify({}),
        });
    },
};