import { NextRequest, NextResponse } from "next/server";

function resolveLaravelApiBase() {
    const configured = (
        process.env.LARAVEL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8000"
    ).trim();

    const normalized = configured.replace(/\/+$/g, "");

    return normalized.endsWith("/api")
        ? normalized
        : `${normalized}/api`;
}

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        console.log("USER ID:", id);

        if (!id) {
            return NextResponse.json(
                {
                    message: "Missing user id in request."
                },
                { status: 400 }
            );
        }

        const laravelUrl =
            `${resolveLaravelApiBase()}/admin/users/${encodeURIComponent(id)}`;

        const body = await request.text();

        console.log("Laravel URL:", laravelUrl);
        console.log("PATCH body:", body);

        const headers: Record<string, string> = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };

        const authorization = request.headers.get("authorization");

        if (authorization) {
            headers.Authorization = authorization;
        }

        const response = await fetch(laravelUrl, {
            method: "PATCH",
            headers,
            body,
            cache: "no-store",
        });

        const responseText = await response.text();

        console.log("Laravel status:", response.status);
        console.log("Laravel response:", responseText);

        let data;

        try {
            data = responseText
                ? JSON.parse(responseText)
                : null;
        } catch {
            data = {
                message: responseText
            };
        }

        return NextResponse.json(data, {
            status: response.status,
        });

    } catch (error) {
        console.error("User PATCH proxy error:", error);

        return NextResponse.json(
            {
                message: "Unable to update user.",
                error: String(error),
            },
            { status: 502 }
        );
    }
}