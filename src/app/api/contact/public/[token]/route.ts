import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

function isValidToken(token: string) {
  return /^[A-Za-z0-9\-]+$/.test(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ message: "Invalid inquiry token." }, { status: 400 });
  }

  const res = await fetch(`${API_URL}/api/contact/public/${encodeURIComponent(token)}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
