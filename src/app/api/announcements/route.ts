import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  const res = await fetch(`${API_URL}/api/announcements`, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  return NextResponse.json(await res.json(), {
    status: res.status
  });
}
