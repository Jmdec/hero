import { NextRequest, NextResponse } from "next/server";

function resolveLaravelApiBase() {
    const configured = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
    const normalized = configured.replace(/\/+$/g, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

export async function GET(request: NextRequest) {
    try {
        const search = request.nextUrl.search;

        if (!search || search === "?") {
            return NextResponse.json(
                { success: false, message: "Verification token is required." },
                { status: 400 }
            );
        }

        const response = await fetch(`${resolveLaravelApiBase()}/auth/verify-email${search}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid response from server." },
                { status: 502 }
            );
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("=== VERIFY EMAIL ERROR ===", error);
        return NextResponse.json(
            { success: false, message: "Verification failed. Please try again." },
            { status: 500 }
        );
    }
}