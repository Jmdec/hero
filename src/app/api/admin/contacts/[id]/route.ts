import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function isValidId(id: string) {
  return /^\d+$/.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { message: "Invalid inquiry id." },
      { status: 400 },
    );
  }

  const res = await fetch(`${API_URL}/api/admin/contacts/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    cache: "no-store",
  });

  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { message: "Invalid inquiry id." },
      { status: 400 },
    );
  }

  const body = await request.json();

  const res = await fetch(`${API_URL}/api/admin/contacts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { message: "Invalid inquiry id." },
      { status: 400 },
    );
  }

  const res = await fetch(`${API_URL}/api/admin/contacts/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
  });

  return NextResponse.json(await res.json(), { status: res.status });
}
