import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL || "http://localhost:8000";
  const normalized = configured.replace(/\/+$/g, "");
  return normalized.endsWith("/api") ? normalized.replace(/\/api$/, "") : normalized;
}

const API_URL = getApiBaseUrl();

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
  const query = new URL(request.url).search;

  const res = await fetch(`${API_URL}/api/admin/announcements${query}`, {
    headers: {
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    cache: "no-store",
  });

  return NextResponse.json(await readResponsePayload(res), {
    status: res.status,
  });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    const res = await fetch(`${API_URL}/api/admin/announcements`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: request.headers.get("authorization") ?? "",
      },
      body: formData,
    });

    return NextResponse.json(await readResponsePayload(res), {
      status: res.status,
    });
  }

  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const res = await fetch(`${API_URL}/api/admin/announcements`, {
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
