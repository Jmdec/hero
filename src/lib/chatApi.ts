// lib/chatApi.ts

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
    status: "active" | "waiting_admin" | "closed";
    message_count: number;
    started_at: string;
    ended_at: string | null;
    created_at: string;
    updated_at: string;
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
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}/api${endpoint}`;

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

    let body: any = null;

    try {
        body = await response.json();
    } catch { }

    if (!response.ok) {
        throw new ChatApiError(
            body?.message ?? "Request failed.",
            response.status,
            body?.errors
        );
    }

    return body as T;
}

export const chatApi = {
    /**
     * POST /api/chat/start
     */
    start(payload: ChatInquiryPayload) {
        return request<StartChatResponse>("/chat/start", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    /**
     * POST /api/chat/{conversation}/message
     */
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

    /**
     * GET /api/chat/{conversation}
     */
    getConversation(conversationId: number) {
        return request<ConversationResponse>(
            `/chat/${conversationId}`
        );
    },

    /**
     * PATCH /api/chat/{conversation}/mode
     */
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

    /**
     * PATCH /api/chat/{conversation}/close
     */
    closeConversation(conversationId: number) {
        return request(`/chat/${conversationId}/close`, {
            method: "PATCH",
        });
    },

    /**
     * GET /api/chat
     */
    listConversations() {
        return request("/chat");
    },
};