import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).search;

  const res = await fetch(`${API_URL}/api/admin/contacts${query}`, {
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
