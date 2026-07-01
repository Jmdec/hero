import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).search;
  const auth = request.headers.get("Authorization");

  const res = await fetch(`${API_URL}/api/admin/announcements${query}`, {
    headers: {
      Accept: "application/json",
      Authorization: auth ?? "",
    },
    cache: "no-store",
  });

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("Authorization");
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/admin/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: auth ?? "",
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}