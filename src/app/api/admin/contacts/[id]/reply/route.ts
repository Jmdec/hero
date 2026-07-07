// 📁 PUT THIS FILE AT: app/api/admin/contacts/[id]/reply/route.ts
// ⚠️ "reply" folder goes INSIDE the "[id]" folder, INSIDE "contacts" (plural).
// URL: POST /api/admin/contacts/5/reply

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function isValidId(id: string) {
  return /^\d+$/.test(id);
}

interface ThreadEntry {
  type: "inbound" | "outbound";
  from: string;
  subject: string;
  body: string;
  created_at: string;
}

function buildGmailStyleHtml(
  replyBody: string,
  inquiryName: string,
  thread: ThreadEntry[],
) {
  const quoted = (thread || [])
    .slice()
    .reverse()
    .map((entry) => {
      const date = new Date(entry.created_at).toLocaleString();
      const who =
        entry.type === "inbound" ? inquiryName : "HERO Serviced Office";
      return `
        <div style="margin-top:16px;padding-left:12px;border-left:2px solid #ccc;color:#555;">
          <p style="margin:0 0 4px;font-size:12px;color:#888;">On ${date}, ${who} wrote:</p>
          <div style="font-size:13px;">${entry.body.replace(/\n/g, "<br/>")}</div>
        </div>`;
    })
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.6;">
      <div>${replyBody.replace(/\n/g, "<br/>")}</div>
      ${quoted}
    </div>`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { message: "Invalid inquiry id." },
      { status: 400 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const { subject, message } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { message: "Reply message is required" },
      { status: 400 },
    );
  }

  // 1. fetch the inquiry (auth required — same as your other admin calls)
  const getRes = await fetch(`${API_URL}/api/admin/contact/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
    },
    cache: "no-store",
  });

  if (!getRes.ok) {
    return NextResponse.json(await getRes.json(), { status: getRes.status });
  }

  const { data: inquiry } = await getRes.json();
  const emailSubject = subject || `Re: Your ${inquiry.inquiry_type} inquiry`;
  const html = buildGmailStyleHtml(message, inquiry.name, inquiry.thread || []);

  // 2. actually send the email (nodemailer — no Laravel auth involved here)
  await sendMail({
    to: inquiry.email,
    subject: emailSubject,
    html,
    text: message,
    replyTo: process.env.MAIL_FROM,
  });

  // 3. record the reply back in Laravel (auth required again)
  const patchRes = await fetch(`${API_URL}/api/admin/contact/${id}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      subject: emailSubject,
      body: message,
      from: "admin",
    }),
  });

  return NextResponse.json(await patchRes.json(), {
    status: patchRes.status,
  });
}
