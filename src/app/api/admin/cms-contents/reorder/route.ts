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

export async function POST(request: NextRequest) {
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const res = await fetch(`${LARAVEL_API_BASE}/admin/cms-contents/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await readResponsePayload(res), {
    status: res.status,
  });
}
