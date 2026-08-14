import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl() {
  const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
  return API_URL.endsWith("/api") ? API_URL.replace(/\/api$/, "") : API_URL;
}

const API_URL = getApiBaseUrl();

function getAuthHeader(request: NextRequest) {
  return request.headers.get("authorization") ?? "";
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  formData.append("_method", "PUT"); // Laravel method spoofing

  const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
    method: "POST", // spoofed as PUT via _method field above
    headers: {
      Accept: "application/json",
      Authorization: getAuthHeader(request),
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: getAuthHeader(request),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: getAuthHeader(request),
    },
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}