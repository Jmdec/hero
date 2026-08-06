// 📁 PUT THIS FILE AT: app/api/admin/contacts/[id]/reply/route.ts
// ⚠️ "reply" folder goes INSIDE the "[id]" folder, INSIDE "contacts" (plural).
// URL: POST /api/admin/contacts/5/reply

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import {
  extractContactBranchInterest,
  getContactBranchLabel,
  getContactInquiryLabel,
  getContactInquiryRecipients,
} from "@/lib/contactInquiryRouting";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

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

interface AuthMeResponse {
  data?: {
    user?: {
      name?: string;
      email?: string;
    };
  };
}

async function sendInquiryTakenNotification(args: {
  origin: string;
  inquiry: {
    id: number;
    name: string;
    email: string;
    inquiry_type: string;
    dynamic_data?: Record<string, string> | null;
  };
  authHeader: string;
}) {
  let handlerName = "An admin user";
  let handlerEmail = "";

  try {
    const meRes = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: args.authHeader,
      },
      cache: "no-store",
    });

    if (meRes.ok) {
      const meData = (await meRes.json()) as AuthMeResponse;
      handlerName = meData.data?.user?.name || handlerName;
      handlerEmail = meData.data?.user?.email || "";
    }
  } catch (error) {
    console.error("Failed to resolve current admin for contact reply:", error);
  }

  const branchInterest = extractContactBranchInterest(args.inquiry.dynamic_data);
  const recipients = getContactInquiryRecipients(branchInterest);
  const inquiryLabel = getContactInquiryLabel(args.inquiry.inquiry_type);
  const branchLabel = getContactBranchLabel(branchInterest);
  const adminUrl = `${args.origin}/admin/contact`;
  const subject = `Inquiry taken: ${inquiryLabel} / ${args.inquiry.name}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:32px 20px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e8edf5;border-radius:16px;overflow:hidden;">
        <div style="height:6px;background:#0D47A1;"></div>
        <div style="padding:28px 32px;">
          <h2 style="margin:0 0 12px;color:#1e293b;">Inquiry has been taken</h2>
          <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.7;">${handlerName} has replied to this inquiry and is now handling the follow-up.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Client</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${args.inquiry.name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Inquiry Type</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${inquiryLabel}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Branch Interest</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${branchLabel}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Handled By</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${handlerName}${handlerEmail ? ` (${handlerEmail})` : ""}</td></tr>
          </table>
          <div style="margin-top:24px;">
            <a href="${adminUrl}" style="display:inline-block;padding:12px 18px;background:#0D47A1;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">Open Inquiry</a>
          </div>
        </div>
      </div>
    </div>`;

  const tasks: Promise<unknown>[] = [];
  if (recipients.standardRecipients.length > 0) {
    tasks.push(sendMail({
      to: recipients.standardRecipients.join(", "),
      subject,
      html,
      text: `${handlerName} has taken the ${inquiryLabel} inquiry from ${args.inquiry.name}. Branch: ${branchLabel}.`,
    }));
  }

  await Promise.allSettled(tasks);
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
  const getRes = await fetch(`${API_URL}/api/admin/contacts/${id}`, {
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
  const patchRes = await fetch(`${API_URL}/api/admin/contacts/${id}/reply`, {
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

  if (patchRes.ok) {
    await sendInquiryTakenNotification({
      origin: request.nextUrl.origin,
      inquiry,
      authHeader,
    }).catch((error) => {
      console.error("Inquiry taken notification failed:", error);
    });
  }

  return NextResponse.json(await patchRes.json(), {
    status: patchRes.status,
  });
}
