import { NextRequest, NextResponse } from "next/server";
const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const laravelUrl = `${LARAVEL_API_URL}/quotations${url.search}`;
        
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
                { message: `Quotation service error: ${res.status}`, error: text },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => null);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Quotations API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the quotation service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const res = await fetch(`${LARAVEL_API_URL}/quotations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error(`Laravel API error (${res.status}):`, text);
            return NextResponse.json(
                { message: `Quotation service error: ${res.status}`, error: text },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => null);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Quotations POST API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the quotation service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}