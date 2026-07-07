import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}
