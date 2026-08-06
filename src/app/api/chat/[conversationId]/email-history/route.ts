import { PDFDocument, StandardFonts } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

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

function sanitizePdfText(value: string) {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x00-\xFF]/g, "");
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const safeCandidate = sanitizePdfText(candidate);
    if (font.widthOfTextAtSize(safeCandidate, fontSize) <= maxWidth) {
      current = safeCandidate;
    } else {
      if (current) {
        lines.push(current);
      }
      current = sanitizePdfText(word);
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

async function createConversationPdf(
  customerName: string,
  messages: Array<{
    sender?: string;
    message?: string;
    sent_at?: string;
  }>,
) {
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 11;
  const smallFont = 9;
  const titleSize = 20;

  const lineHeight = fontSize * 1.6;
  const margin = 50;

  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();

  let y = height - margin;

  const maxWidth = width - margin * 2;

  function newPage() {
    page = pdfDoc.addPage();
    ({ width, height } = page.getSize());
    y = height - margin;
  }

  function ensureSpace(space = lineHeight) {
    if (y - space < margin) {
      newPage();
    }
  }

  function drawText(
    text: string,
    size = fontSize,
    textFont = font,
    indent = 0
  ) {
    ensureSpace(size + 6);

    page.drawText(text, {
      x: margin + indent,
      y,
      size,
      font: textFont,
    });

    y -= size + 6;
  }

  function drawWrapped(
    text: string,
    size = fontSize,
    textFont = font,
    indent = 0
  ) {
    const lines = wrapText(
      text,
      maxWidth - indent,
      textFont,
      size
    );

    for (const line of lines) {
      drawText(line, size, textFont, indent);
    }
  }

  function divider() {
    ensureSpace(20);

    page.drawLine({
      start: { x: margin, y: y + 4 },
      end: { x: width - margin, y: y + 4 },
      thickness: 0.6,
    });

    y -= 16;
  }

  // Header
  drawText("HERO Serviced Office", titleSize, bold);
  drawText("Conversation Transcript", 14, bold);

  y -= 8;
  divider();

  drawText(`Customer`, smallFont, bold);
  drawText(customerName, fontSize);

  drawText(`Generated`, smallFont, bold);
  drawText(
    new Date().toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    }),
    fontSize
  );

  divider();

  // Conversation

  for (const msg of messages) {
    const isUser = msg.sender === "user";

    const sender = isUser ? "You" : "HERO Assistant";

    const timestamp = msg.sent_at
      ? formatTimestamp(msg.sent_at)
      : "";

    drawText(
      `${sender}${timestamp ? ` • ${timestamp}` : ""}`,
      11,
      bold
    );

    drawWrapped(msg.message || "", 11, font, 16);

    y -= 8;
  }

  divider();

  drawText(
    "End of Conversation",
    smallFont,
    bold
  );

  return pdfDoc.save();
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
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:32px 20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
          
          <h2 style="margin:0 0 16px;font-size:22px;color:#1f2937;font-weight:600;">
            Hello ${escapeHtml(customerName)},
          </h2>

          <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4b5563;">
            Thank you for chatting with <strong>HERO Serviced Office</strong>.
          </p>

          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;">
            We've attached a PDF copy of your conversation for your reference.
          </p>

          <p style="margin:0;font-size:14px;color:#6b7280;">
            If you have any questions, simply reply to this email and our team will be happy to assist you.
          </p>

        </div>
      </div>
    `;

    const text = [
      `Hello ${customerName},`,
      "",
      "Your chat transcript from HERO Serviced Office is attached as a PDF file.",
      "",
      "Please open the attached PDF to view the full conversation.",
    ].join("\n");

    const pdfBuffer = await createConversationPdf(customerName, messages);
    const attachmentBuffer = Buffer.from(pdfBuffer);

    await sendMail({
      to: recipientEmail,
      subject,
      html,
      text,
      replyTo: process.env.SMTP_USER || undefined,
      attachments: [
        {
          filename: `hero-conversation-${conversationId}.pdf`,
          content: attachmentBuffer,
          contentType: "application/pdf",
        },
      ],
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
