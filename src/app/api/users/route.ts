import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const laravelUrl = `${LARAVEL_API_URL}/users${url.search}`;

        const res = await fetch(laravelUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
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
