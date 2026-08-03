import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL = (process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/g, "");

function getLaravelApiUrl(path: string) {
    return `${LARAVEL_API_URL}${LARAVEL_API_URL.endsWith("/api") ? "" : "/api"}${path}`;
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization") ?? "";
        const laravelUrl = getLaravelApiUrl("/auth/me");

        const res = await fetch(laravelUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error(`Laravel API error (${res.status}):`, text);
            return NextResponse.json(
                { message: `Authentication failed: ${res.status}`, error: text },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => null);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Auth me API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the authentication service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}
