import { NextRequest, NextResponse } from "next/server";

function resolveLaravelApiBase() {
  const configured = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
  const normalized = configured.replace(/\/+$/g, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

async function readBackendPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return { message: text || "Unexpected backend response." };
}

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

  const apiBase = resolveLaravelApiBase();
  const targetUrl = `${apiBase}/contact/public/${encodeURIComponent(token)}`;
  const localRoutePrefix = `${request.nextUrl.origin.replace(/\/+$/g, "")}/api/contact/public/`;

  if (targetUrl.startsWith(localRoutePrefix)) {
    return NextResponse.json(
      { message: "Server configuration error. Set LARAVEL_API_URL to your Laravel backend URL." },
      { status: 500 },
    );
  }

  const res = await fetch(targetUrl, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await readBackendPayload(res);
  return NextResponse.json(data, { status: res.status });
}
