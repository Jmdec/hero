import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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

function wrapPdfText(text: string, maxCharacters = 86) {
  const words = text.replace(/[\r\n\t]+/g, " ").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharacters && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

async function createTranscriptPdf(
  customerName: string,
  conversationId: string,
  messages: Array<{ sender?: string; message?: string; sent_at?: string }>,
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 42;
  const lineHeight = 14;
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  const addPage = () => {
    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
  };

  const ensureSpace = (height: number) => {
    if (y - height < margin) addPage();
  };

  const drawLines = (lines: string[], options: { bold?: boolean; size?: number } = {}) => {
    const font = options.bold ? bold : regular;
    const size = options.size ?? 10;
    ensureSpace(lines.length * lineHeight + 8);
    for (const line of lines) {
      page.drawText(line, { x: margin, y, size, font, color: rgb(0.08, 0.08, 0.08) });
      y -= lineHeight;
    }
    y -= 4;
  };

  drawLines(["Hero Serviced Office, Inc. Chat Transcript"], { bold: true, size: 16 });
  drawLines([`Conversation ID: ${conversationId}`, `Customer: ${customerName}`], { size: 10 });

  for (const message of messages) {
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

    ensureSpace(lineHeight * 3);
    drawLines([`${sender}${sentAt ? ` - ${sentAt}` : ""}`], { bold: true, size: 10 });
    drawLines(wrapPdfText(message.message ?? ""), { size: 10 });
  }

  return Buffer.from(await pdf.save());
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

    const transcriptPdf = await createTranscriptPdf(
      customerName,
      conversationId,
      messages,
    );

    await sendMail({
      to: recipient,
      subject: "Your Hero Serviced Office, Inc. Conversation",
      text: `Hello ${customerName},\n\nYour chat transcript is attached as a PDF file.\n\n${transcriptText}`,
      html:
        `<h2>Hero Serviced Office, Inc. Chat Transcript</h2>
      <p>Hello ${escapeHtml(customerName)},</p>
      <p>Your chat transcript is attached as a PDF file.</p>
      ${htmlTranscript}`,

      attachments: [{
        filename: "Hero-Chatbot-Transcript.pdf",
        content: transcriptPdf,
        contentType: "application/pdf",
      }],
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
