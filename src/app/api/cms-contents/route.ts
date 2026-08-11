import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

async function readResponsePayload(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = new URLSearchParams(url.searchParams);

  if (!query.has("status")) {
    query.set("status", "published");
  }

  const res = await fetch(`${LARAVEL_API_BASE}/cms-contents/public?${query.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return NextResponse.json(await readResponsePayload(res), {
    status: res.status,
  });
}
