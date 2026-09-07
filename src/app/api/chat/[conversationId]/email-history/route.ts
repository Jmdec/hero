import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

function isValidConversationId(id: string) {
  return /^\d+$/.test(id);
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
    const response = await fetch(`${API_URL}/api/chat/${conversationId}/email-history`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(to ? { to } : {}),
      cache: "no-store",
    });

    const responseText = await response.text();
    let data: unknown = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = { message: responseText || "Unable to send chat history." };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to proxy chat history email:", error);
    return NextResponse.json(
      { message: "Unable to send chat history right now." },
      { status: 502 },
    );
  }
}
