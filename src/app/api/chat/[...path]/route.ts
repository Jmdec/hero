import { NextRequest, NextResponse } from "next/server";

// Server-side only — never exposed to the browser, so no CORS applies here.
// Falls back to NEXT_PUBLIC_API_URL if you haven't added a separate server-only var.
const LARAVEL_API_URL =
    process.env.LARAVEL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "https://infinitech-api23.site";

async function proxy(req: NextRequest, path: string[]) {
    const targetPath = path.join("/");
    const search = req.nextUrl.search; // includes leading "?" if present
    const url = `${LARAVEL_API_URL}/api/chat/${targetPath}${search}`;

    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };

    // Forward an Authorization header if the client sent one.
    const authHeader = req.headers.get("authorization");
    if (authHeader) headers.Authorization = authHeader;

    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
        const text = await req.text();
        body = text.length > 0 ? text : undefined;
    }

    let upstream: Response;
    try {
        upstream = await fetch(url, {
            method: req.method,
            headers,
            body,
            cache: "no-store",
        });
    } catch (err) {
        console.error("Proxy -> Laravel fetch failed:", err);
        return NextResponse.json(
            { message: "Cannot reach Laravel API from the server.", error: String(err) },
            { status: 502 },
        );
    }

    const contentType = upstream.headers.get("content-type") ?? "application/json";
    const responseBody = await upstream.text();

    return new NextResponse(responseBody, {
        status: upstream.status,
        headers: { "content-type": contentType },
    });
}

// Next.js 15: dynamic route params are async.
type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxy(req, path);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxy(req, path);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const { path } = await params;
    return proxy(req, path);
}
