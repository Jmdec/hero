import { NextRequest, NextResponse } from "next/server";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/g, "");

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Verification token is required." },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
            {
                method: "GET",
                headers: { Accept: "application/json" },
            }
        );

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