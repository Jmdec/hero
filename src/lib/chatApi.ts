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
        return request(`/chat/${conversationId}/agent-request`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    },

    submitPreferredContact(conversationId: number, payload: PreferredContactPayload) {
        return request(`/chat/${conversationId}/preferred-contact`, {
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

    switchMode(
        conversationId: number,
        mode: "assistant" | "admin"
    ) {
        return request(`/chat/${conversationId}/mode`, {
            method: "PATCH",
            body: JSON.stringify({
                chat_mode: mode,
            }),
        });
    },

    closeConversation(conversationId: number) {
        return request(`/chat/${conversationId}/close`, {
            method: "PATCH",
            body: JSON.stringify({ send_transcript: true }),
        });
    },

    /**
     * Best-effort "close on tab exit" call.
     *
     * Regular fetch() gets cancelled by the browser when the tab is
     * actually closing (unload), so this uses sendBeacon when available
     * (fire-and-forget, survives page teardown) and falls back to a
     * keepalive fetch otherwise. Both hit the SAME close endpoint as
     * closeConversation() — if your backend requires PATCH specifically
     * and can't accept a beacon (which is always a POST), add a
     * `POST /api/chat/{conversation}/close-beacon` route server-side that
     * does the same thing as the PATCH close and swap the URL below.
     *
     * NOTE: this also triggers the "email me the transcript on exit" flow.
     * The actual email send should happen SERVER-SIDE inside the close
     * handler (so it's reliable even though the browser tab is dying and
     * can't wait around for a response) — see emailChatHistoryOnExit()
     * below for the beacon that carries the "please email this" flag.
     * Required backend route (not present in this repo, needs to be added
     * to your Laravel API):
     *   POST /api/chat/{conversation}/close
     *   -> on close, if inquiry.email_address exists, send the full
     *      transcript (all ChatMessage rows for that conversation) to
     *      that email via a Mailable/queued job.
     */
    closeConversationOnExit(conversationId: number) {
        const url = `${API_URL}/api/chat/${conversationId}/close`;

        // send_transcript=1 tells the backend close handler to also email
        // the visitor their chat history, since this is the exit path.
        const payload = { send_transcript: true };

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

    /**
     * Explicitly (re-)emails the full transcript for a conversation to the
     * visitor's inquiry email. Used by:
     *   - the widget, if the visitor asks for a copy mid-chat ("can you
     *     email me this conversation?")
     *   - the admin panel, so a team member can resend the history to the
     *     client on request.
     *
     * REQUIRED BACKEND ROUTE (add to Laravel, not present in this repo):
     *   POST /api/chat/{conversation}/email-history
     *   Body: { to？: string } // optional override, else uses inquiry.email_address
     *   -> loads all ChatMessage rows ordered by sent_at, renders a simple
     *      transcript (sender + timestamp + message), and sends via
     *      Mail::to($email)->send(new ChatTranscriptMail($conversation, $messages))
     *   Response: { sent: true, to: "someone@example.com" }
     */
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
};