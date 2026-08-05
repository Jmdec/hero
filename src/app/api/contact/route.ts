import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import {
  extractContactBranchInterest,
  getContactBranchLabel,
  getContactInquiryLabel,
  getContactInquiryRecipients,
} from "@/lib/contactInquiryRouting";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ContactInquiryPayload {
  id?: number;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  branchInterest?: string;
  inquiryType: string;
  message: string;
  dynamicData?: Record<string, string>;
}

function buildRows(payload: ContactInquiryPayload) {
  const branch = getContactBranchLabel(payload.branchInterest ?? extractContactBranchInterest(payload.dynamicData));
  const details = Object.entries(payload.dynamicData ?? {})
    .filter(([key, value]) => key !== "branchInterest" && Boolean(value))
    .map(([key, value]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">${key.replace(/([A-Z])/g, " $1")}</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${value}</td></tr>`)
    .join("");

  return `
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Name</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.name}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Email</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.email}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Phone</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.phone}</td></tr>
    ${payload.company ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Company</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.company}</td></tr>` : ""}
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Branch Interest</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${branch}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Inquiry Type</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${getContactInquiryLabel(payload.inquiryType)}</td></tr>
    ${details}
  `;
}

function buildInternalInquiryHtml(payload: ContactInquiryPayload, openInquiryUrl: string, replyUrl: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:32px 20px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e8edf5;border-radius:16px;overflow:hidden;">
        <div style="height:6px;background:#0D47A1;"></div>
        <div style="padding:28px 32px;">
          <h2 style="margin:0 0 12px;color:#1e293b;">New ${getContactInquiryLabel(payload.inquiryType)} inquiry</h2>
          <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.7;">A new inquiry has been submitted through the website contact form. Review the details below and take ownership as needed.</p>
          <table style="width:100%;border-collapse:collapse;">${buildRows(payload)}</table>
          <div style="margin-top:18px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748b;">Client Message</p>
            <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.7;">${payload.message.replace(/\n/g, "<br/>")}</p>
          </div>
          <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
            <a href="${openInquiryUrl}" style="display:inline-block;padding:12px 18px;background:#0D47A1;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">Open Inquiry</a>
            <a href="${replyUrl}" style="display:inline-block;padding:12px 18px;background:#FFC107;color:#1B3A8C;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">Reply to Client</a>
          </div>
        </div>
      </div>
    </div>`;
}

function buildJapaneseInternalInquiryHtml(payload: ContactInquiryPayload, openInquiryUrl: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:32px 20px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e8edf5;border-radius:16px;overflow:hidden;">
        <div style="height:6px;background:#0D47A1;"></div>
        <div style="padding:28px 32px;">
          <h2 style="margin:0 0 12px;color:#1e293b;">新しいお問い合わせが届きました</h2>
          <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.7;">Webサイトのお問い合わせフォームから新規問い合わせが送信されました。内容をご確認ください。</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">顧客名</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">メール</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.email}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">電話</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.phone}</td></tr>
            ${payload.company ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">会社</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${payload.company}</td></tr>` : ""}
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">支店</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${getJapaneseBranchLabel(payload.branchInterest ?? extractContactBranchInterest(payload.dynamicData))}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">お問い合わせ種別</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${getJapaneseInquiryLabel(payload.inquiryType)}</td></tr>
            ${buildJapaneseDetails(payload.dynamicData)}
          </table>
          <div style="margin-top:18px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748b;">メッセージ</p>
            <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.7;">${payload.message.replace(/\n/g, "<br/>")}</p>
          </div>
          <div style="margin-top:24px;">
            <a href="${openInquiryUrl}" style="display:inline-block;padding:12px 18px;background:#0D47A1;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">お問い合わせを開く</a>
          </div>
        </div>
      </div>
    </div>`;
}

function getJapaneseInquiryLabel(value?: string | null) {
  const labels: Record<string, string> = {
    "private-office": "レンタルオフィス",
    "virtual-office": "バーチャルオフィス",
    "co-working-space": "コワーキングスペース",
    "meeting-room": "会議室",
    "event-space": "イベントスペース",
    "ocular-visit": "内覧予約",
    partnership: "提携",
    others: "その他",
  };

  if (!value) return "お問い合わせ";
  return labels[value] || value;
}

function getJapaneseBranchLabel(value?: string | null) {
  if (!value) return "未指定";
  const labels: Record<string, string> = {
    "tower-6789": "Tower 6789",
    "insular-life": "Insular Life Building",
    both: "両支店",
  };
  return labels[value] || value;
}

function buildJapaneseDetails(dynamicData?: Record<string, string> | null) {
  if (!dynamicData) return "";

  return Object.entries(dynamicData)
    .filter(([key]) => key !== "branchInterest")
    .map(([key, value]) => `
            <tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">${key.replace(/([A-Z])/g, " $1")}</td><td style="padding:8px 0 8px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;text-align:right;">${value}</td></tr>`)
    .join("");
}

async function sendInquiryNotifications(payload: ContactInquiryPayload, openInquiryUrl: string) {
  const branchInterest = payload.branchInterest ?? extractContactBranchInterest(payload.dynamicData);
  const recipients = getContactInquiryRecipients(branchInterest);
  const subject = `New ${getContactInquiryLabel(payload.inquiryType)} inquiry from ${payload.name}`;
  const replySubject = `Re: Your ${getContactInquiryLabel(payload.inquiryType)} inquiry`;
  const quotedMessage = payload.message
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const replyBody = [
    "",
    "",
    "",
    "---------- Original message ----------",
    `From: ${payload.name} <${payload.email}>`,
    `Subject: ${getContactInquiryLabel(payload.inquiryType)} inquiry`,
    "",
    'Message: ' + quotedMessage,
  ].join("\n");
  const replyUrl = `mailto:${payload.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;

  const html = buildInternalInquiryHtml(payload, openInquiryUrl, replyUrl);
  const japaneseHtml = buildJapaneseInternalInquiryHtml(payload, openInquiryUrl);
  const text = `${subject}\n\nBranch: ${getContactBranchLabel(branchInterest)}\nEmail: ${payload.email}\nPhone: ${payload.phone}\n\n${payload.message}`;
  const japaneseText = `新しいお問い合わせが届きました。\n\n顧客名: ${payload.name}\nメール: ${payload.email}\n電話: ${payload.phone}\n会社: ${payload.company ?? "なし"}\n支店: ${getJapaneseBranchLabel(branchInterest)}\nお問い合わせ種別: ${getJapaneseInquiryLabel(payload.inquiryType)}\n\nメッセージ:\n${payload.message}\n\n詳細: ${openInquiryUrl}`;

  const tasks: Promise<unknown>[] = [];

  if (recipients.standardRecipients.length > 0) {
    tasks.push(sendMail({
      to: recipients.standardRecipients.join(", "),
      subject,
      html,
      text,
      replyTo: payload.email,
    }));
  }

  for (const recipient of [recipients.president, recipients.chairman]) {
    if (!recipient) continue;
    tasks.push(sendMail({
      to: recipient,
      subject: `【新規お問い合わせ】${payload.name} / ${getJapaneseInquiryLabel(payload.inquiryType)}`,
      html: japaneseHtml,
      text: japaneseText,
      replyTo: payload.email,
    }));
  }

  await Promise.allSettled(tasks);
}

// Public route hit by the contact form on the website.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactInquiryPayload;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      const saved = (data?.data ?? {}) as { id?: number; public_view_token?: string; dynamic_data?: Record<string, string> };
      const publicInquiryUrl = saved.public_view_token
        ? `${request.nextUrl.origin}/contact/inquiry/${saved.public_view_token}`
        : `${request.nextUrl.origin}/admin/contact`;

      await sendInquiryNotifications(
        {
          ...body,
          id: saved.id,
          dynamicData: saved.dynamic_data ?? body.dynamicData,
        },
        publicInquiryUrl,
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed submitting contact",
      },
      {
        status: 500,
      },
    );
  }
}