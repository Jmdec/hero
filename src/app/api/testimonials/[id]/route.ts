import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res = await fetch(`${API_URL}/api/testimonials/${id}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}
