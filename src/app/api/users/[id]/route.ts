import { NextRequest, NextResponse } from "next/server";

function resolveLaravelApiBase() {
  const configured = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
  const normalized = configured.replace(/\/+$/g, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

type RouteParams = {
  params: Promise<{ id: string }>;
};

async function relayResponse(res: Response) {
  const text = await res.text().catch(() => "");

  if (!text) {
    return NextResponse.json({ message: res.ok ? "Success" : "Request failed" }, { status: res.status });
  }

  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return NextResponse.json({ message: text }, { status: res.status });
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const laravelUrl = `${resolveLaravelApiBase()}/users/${id}`;

  const res = await fetch(laravelUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    cache: "no-store",
  });

  return relayResponse(res);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const laravelUrl = `${resolveLaravelApiBase()}/users/${id}`;

  const res = await fetch(laravelUrl, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    body: JSON.stringify(body),
  });

  return relayResponse(res);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const laravelUrl = `${resolveLaravelApiBase()}/users/${id}`;

  const res = await fetch(laravelUrl, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
  });

  return relayResponse(res);
}
