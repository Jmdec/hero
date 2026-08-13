import { NextRequest, NextResponse } from "next/server";

function resolveLaravelApiBase() {
    const configured = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
    const normalized = configured.replace(/\/+$/g, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

async function forward(request: NextRequest, method: string, id: string) {
    try {
        const laravelUrl = `${resolveLaravelApiBase()}/admin/users/${encodeURIComponent(id)}`;

        const headers: Record<string, string> = {
            Accept: "application/json",
        };

        const incomingAuth = request.headers.get("authorization") || "";
        if (incomingAuth) {
            headers.Authorization = incomingAuth;
        } else {
            const sessionCookie = request.cookies.get("session")?.value;
            if (sessionCookie) headers.Authorization = `Bearer ${sessionCookie}`;
        }

        const contentType = request.headers.get("content-type");
        if (contentType) headers["Content-Type"] = contentType;

        const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

        const res = await fetch(laravelUrl, {
            method,
            headers,
            body,
            cache: "no-store",
        });

        const text = await res.text().catch(() => "");
        const status = res.status;

        // Try to parse JSON, otherwise return text
        try {
            const data = text ? JSON.parse(text) : null;
            return NextResponse.json(data, { status });
        } catch {
            return new NextResponse(text, { status, headers: { "Content-Type": "text/plain" } });
        }
    } catch (error) {
        console.error("Users proxy error:", error);
        return NextResponse.json({ message: "Unable to reach user service.", error: String(error) }, { status: 502 });
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    return forward(request, "GET", params.id);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    return forward(request, "PATCH", params.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    return forward(request, "PUT", params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    return forward(request, "DELETE", params.id);
}
