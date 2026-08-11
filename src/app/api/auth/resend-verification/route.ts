import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/nodemailer";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = body.email.trim().toLowerCase();

    const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
      }),
    });

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Laravel returned:", responseText);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from Laravel.",
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to resend verification email.",
        },
        { status: response.status }
      );
    }

    const verificationUrl = data.verification_url ?? data?.data?.verification_url;

    if (!verificationUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Laravel did not return a verification URL.",
        },
        { status: 500 }
      );
    }

    try {
      await sendVerificationEmail(
        normalizedEmail,
        body.name?.trim() || "User",
        verificationUrl
      );
    } catch (emailError) {
      console.error("Email Error:", emailError);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification email resent successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("=== RESEND VERIFICATION ERROR ===", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to resend verification email.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}