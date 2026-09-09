import { NextResponse } from "next/server";
import { sendMail } from "../../../../lib/mailer";

interface ChatNotificationPayload {
  recipients?: string[];
  subject?: string;
  text?: string;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as ChatNotificationPayload;
    const recipients = Array.isArray(payload.recipients)
      ? payload.recipients.filter((email): email is string => typeof email === "string" && email.trim() !== "")
      : [];

    if (recipients.length === 0 || !payload.subject || !payload.text) {
      return NextResponse.json(
        { message: "Recipients, subject, and message are required." },
        { status: 400 },
      );
    }

    await sendMail({
      to: recipients.join(","),
      subject: payload.subject,
      text: payload.text,
      html: `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${payload.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Chat notification email route error:", error);
    return NextResponse.json(
      {
        message: "Unable to send chat notification email.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}