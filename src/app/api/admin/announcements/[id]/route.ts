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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
      method: "PUT",
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

  const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
    method: "PUT",
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
    method: "PATCH",
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

  return NextResponse.json(await readResponsePayload(res), {
    status: res.status,
  });
}
