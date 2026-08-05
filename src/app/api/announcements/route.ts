import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl() {
  const configured = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const normalized = configured.replace(/\/+$/g, "");
  return normalized.endsWith("/api") ? normalized.replace(/\/api$/, "") : normalized;
}

const API_URL = getApiBaseUrl();

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

    const res = await fetch(`${API_URL}/api/announcements${query}`, {
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
      { message: "Unable to reach announcements service." },
      { status: 502 },
    );
  }
}
