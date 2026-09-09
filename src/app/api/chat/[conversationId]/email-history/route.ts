import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "../../../../../lib/mailer";

const configuredApiUrl = process.env.LARAVEL_API_URL?.trim();
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?\/?$/i.test(
  configuredApiUrl ?? "",
);
const API_URL = (
  process.env.NODE_ENV === "production" && isLocalApiUrl
    ? "https://infinitech-api23.site"
    : configuredApiUrl || "https://infinitech-api23.site"
).replace(/\/+$/g, "");

function isValidConversationId(id: string) {
  return /^\d+$/.test(id);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;

  if (!isValidConversationId(conversationId)) {
    return NextResponse.json(
      { message: "Invalid conversation id." },
      { status: 400 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const to = typeof body?.to === "string" ? body.to.trim() : undefined;
    const authorization = request.headers.get("authorization");
    const conversationResponse = await fetch(`${API_URL}/api/chat/${conversationId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const responseText = await conversationResponse.text();
    let conversation: {
      inquiry?: { full_name?: string | null; email_address?: string | null } | null;
      messages?: Array<{ sender?: string; message?: string; sent_at?: string }>;
    } | null = null;

    try {
      conversation = responseText ? JSON.parse(responseText) : null;
    } catch {
      conversation = null;
    }

    if (!conversationResponse.ok || !conversation) {
      return NextResponse.json(
        conversation ?? { message: responseText || "Unable to load chat history." },
        { status: conversationResponse.status || 502 },
      );
    }

    const recipient = to || conversation.inquiry?.email_address?.trim();
    if (!recipient) {
      return NextResponse.json(
        { message: "No client email is available for this conversation." },
        { status: 422 },
      );
    }

    const customerName = conversation.inquiry?.full_name?.trim() || "there";
    const messages = conversation.messages ?? [];
    const transcriptText = messages
      .map((message) => {
        const sender = message.sender === "user"
          ? "Client"
          : message.sender === "admin"
            ? "HERO Team"
            : message.sender === "system"
              ? "System"
              : "HERO Assistant";
        const sentAt = message.sent_at
          ? new Date(message.sent_at).toLocaleString("en-PH")
          : "";
        return `[${sentAt}] ${sender}:\n${message.message ?? ""}`;
      })
      .join("\n\n");

    const htmlTranscript = messages
      .map((message) => {
        const sender = message.sender === "user"
          ? "Client"
          : message.sender === "admin"
            ? "HERO Team"
            : message.sender === "system"
              ? "System"
              : "HERO Assistant";
        const sentAt = message.sent_at
          ? new Date(message.sent_at).toLocaleString("en-PH")
          : "";
        return `<div style="margin:16px 0;padding:12px 16px;border-radius:8px;background:#f5f5f5"><strong>${escapeHtml(sender)}</strong><div style="color:#666;font-size:12px;margin:4px 0">${escapeHtml(sentAt)}</div><div>${escapeHtml(message.message ?? "").replace(/\n/g, "<br>")}</div></div>`;
      })
      .join("");

    await sendMail({
      to: recipient,
      subject: "Your Hero Serviced Office, Inc. Conversation",
      text: `Hello ${customerName},\n\nHere is a copy of your chat conversation.\n\n${transcriptText}`,
      html: `<h2>Hero Serviced Office, Inc. Chat Transcript</h2><p>Hello ${escapeHtml(customerName)},</p><p>Here is a copy of your chat conversation.</p>${htmlTranscript}`,
    });

    return NextResponse.json({ sent: true, to: recipient });
  } catch (error) {
    console.error("Failed to proxy chat history email:", error);
    return NextResponse.json(
      { message: "Unable to send chat history right now." },
      { status: 502 },
    );
  }
}
