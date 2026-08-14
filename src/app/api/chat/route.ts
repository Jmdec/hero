const API_URL =
    process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL || "http://127.0.0.1:8000";

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
    agent?: {
        id?: number | null;
        name?: string | null;
        email?: string | null;
    } | null;
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

    // Ensure Authorization header is included when running in the browser
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
    } as Record<string, string>;

    if (typeof window !== "undefined" && !headers.Authorization) {
        const token = localStorage.getItem("token");
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response: Response;

    try {
        response = await fetch(url, {
            ...options,
            headers,
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