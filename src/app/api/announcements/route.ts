import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL || "http://localhost:8000";
  const normalized = configured.replace(/\/+$/g, "");
  return normalized.endsWith("/api") ? normalized.replace(/\/api$/, "") : normalized;
}

const API_URL = getApiBaseUrl();

export async function GET(request: NextRequest) {
  const query = new URL(request.url).search;

  const res = await fetch(`${API_URL}/api/announcements${query}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}
