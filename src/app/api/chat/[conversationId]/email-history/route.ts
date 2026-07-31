import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL || "http://localhost:8000";

function isValidConversationId(id: string) {
  return /^\d+$/.test(id);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTimestamp(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
    const to = typeof body?.to === "string" ? body.to : undefined;

    const response = await fetch(`${API_URL}/api/chat/${conversationId}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsed: unknown = null;

      try {
        parsed = errorText ? JSON.parse(errorText) : null;
      } catch {
        parsed = errorText;
      }

      return NextResponse.json(
        {
          message: "Unable to load chat transcript.",
          details: parsed,
        },
        { status: response.status },
      );
    }

    const payload = await response.json();
    const conversation = (payload?.data && typeof payload.data === "object" ? payload.data : payload) as {
      inquiry?: { email_address?: string; full_name?: string };
      messages?: Array<{ sender?: string; message?: string; sent_at?: string }>;
      status?: string;
    };

    const recipientEmail = to ?? conversation.inquiry?.email_address;
    if (!recipientEmail) {
      return NextResponse.json(
        { message: "No recipient email address is available for this conversation." },
        { status: 400 },
      );
    }

    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const customerName = conversation.inquiry?.full_name || "there";
    const subject = `Your chat transcript from HERO Serviced Office`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:32px 20px;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e8edf5;border-radius:16px;overflow:hidden;">
          <div style="height:6px;background:#0D47A1;"></div>
          <div style="padding:28px 32px;">
            <h2 style="margin:0 0 12px;color:#1e293b;">Hello ${escapeHtml(customerName)},</h2>
            <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
              Here is a copy of your recent conversation with HERO Serviced Office.
            </p>
            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;background:#f8fafc;">
              ${messages.length > 0
                ? messages
                    .map((message) => {
                      const senderLabel = message.sender && message.sender !== "user" ? message.sender : "you";
                      return `
                        <div style="margin-bottom:12px;">
                          <div style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748b;">
                            ${escapeHtml(senderLabel)}${message.sent_at ? ` · ${escapeHtml(formatTimestamp(message.sent_at))}` : ""}
                          </div>
                          <div style="margin-top:4px;font-size:14px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">
                            ${escapeHtml(message.message || "")}
                          </div>
                        </div>`;
                    })
                    .join("")
                : "<p style=\"margin:0;color:#64748b;\">No messages were captured for this conversation.</p>"
              }
            </div>
          </div>
        </div>
      </div>
    `;

    const text = [
      `Hello ${customerName},`,
      "",
      "Here is a copy of your recent conversation with HERO Serviced Office.",
      "",
      ...messages.map((message) => {
        const senderLabel = message.sender && message.sender !== "user" ? message.sender : "you";
        const stamp = message.sent_at ? ` (${formatTimestamp(message.sent_at)})` : "";
        return `${senderLabel}${stamp}: ${message.message || ""}`;
      }),
    ].join("\n");

    await sendMail({
      to: recipientEmail,
      subject,
      html,
      text,
      replyTo: process.env.SMTP_USER || undefined,
    });

    return NextResponse.json({ sent: true, to: recipientEmail });
  } catch (error) {
    console.error("Failed to email chat history:", error);
    return NextResponse.json(
      { message: "Unable to send chat history right now." },
      { status: 502 },
    );
  }
}
