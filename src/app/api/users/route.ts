import { NextRequest, NextResponse } from "next/server";

function resolveLaravelApiBase() {
    const configured = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
    const normalized = configured.replace(/\/+$/g, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        // Users management moved to the admin area on the backend
        const laravelUrl = `${resolveLaravelApiBase()}/admin/users${url.search}`;

        const headers: Record<string, string> = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };

        // Forward Authorization header from client if present
        const incomingAuth = request.headers.get('authorization') || '';
        if (incomingAuth) {
            headers.Authorization = incomingAuth;
        } else {
            // Or forward session cookie (if backend uses a cookie named 'session')
            const sessionCookie = request.cookies.get('session')?.value;
            if (sessionCookie) {
                headers.Authorization = `Bearer ${sessionCookie}`;
            }
        }

        const res = await fetch(laravelUrl, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error(`Laravel API error (${res.status}):`, text);
            return NextResponse.json(
                { message: `User service error: ${res.status}`, error: text },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => null);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Users API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the user service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}
