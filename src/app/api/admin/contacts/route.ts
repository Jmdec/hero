import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

const LARAVEL_API_BASE = API_URL.endsWith("/api")
    ? API_URL
    : `${API_URL}/api`;

export async function GET(request: NextRequest) {
  const query = new URL(request.url).search;

  const res = await fetch(`${LARAVEL_API_BASE}/admin/inquiries${query}`, {
    headers: {
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    cache: "no-store",
  });

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}
