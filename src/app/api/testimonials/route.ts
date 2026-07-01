import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
    const query = new URL(request.url).search;

    const res = await fetch(`${API_URL}/api/testimonials${query}`, {
        headers: {
            Accept: "application/json",
        },
        cache: "no-store",
    });

    return NextResponse.json(await res.json(), {
        status: res.status,
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const res = await fetch(`${API_URL}/api/testimonials`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });

    return NextResponse.json(await res.json(), {
        status: res.status,
    });
}