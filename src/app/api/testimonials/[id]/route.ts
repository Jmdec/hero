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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const res = await fetch(`${API_URL}/api/testimonials/${id}`, {
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
