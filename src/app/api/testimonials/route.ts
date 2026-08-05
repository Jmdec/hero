import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

async function readBackendPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return { message: text || "Unexpected backend response." };
}

export async function GET(request: NextRequest) {
  try {
    const query = new URL(request.url).search;

    const res = await fetch(`${API_URL}/api/testimonials${query}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await readBackendPayload(res);
    return NextResponse.json(payload, {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach testimonial service." },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/api/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await readBackendPayload(res);
    return NextResponse.json(payload, {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to submit testimonial right now." },
      { status: 502 },
    );
  }
}
