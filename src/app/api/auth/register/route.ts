import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/nodemailer";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/g, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=== REGISTRATION DEBUG START ===");
    console.log("Request body received:", body);

    if (!body.name || !body.email || !body.password || !body.password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password, and password confirmation are required.",
        },
        { status: 400 }
      );
    }

    if (body.password !== body.password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (body.phone && body.phone.length !== 11) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number must be exactly 11 digits.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || "",
        password: body.password,
        password_confirmation: body.password_confirmation,
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

    console.log("Laravel Response:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Registration failed.",
          errors: data.errors || {},
        },
        { status: response.status }
      );
    }

    const verificationUrl =
      data.verification_url ??
      data?.data?.verification_url;

    if (!verificationUrl) {
      console.error("Laravel did not return verification_url.");

      return NextResponse.json(
        {
          success: false,
          message: "Laravel did not return a verification URL.",
        },
        { status: 500 }
      );
    }

    console.log("Verification URL:", verificationUrl);

    try {
      await sendVerificationEmail(
        body.email.trim().toLowerCase(),
        body.name.trim(),
        verificationUrl
      );

      console.log("Verification email sent successfully.");
    } catch (emailError) {
      console.error("Email Error:", emailError);

      return NextResponse.json(
        {
          success: true,
          message:
            "Account created successfully, but verification email could not be sent.",
          emailSent: false,
          data: data.data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          data.message ??
          "Registration successful! Please check your email to verify your account.",
        emailSent: true,
        data: data.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("=== REGISTRATION ERROR ===", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Registration failed.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: body.email.trim().toLowerCase(),
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
          message:
            data.message || "Failed to resend verification email.",
        },
        { status: response.status }
      );
    }

    const verificationUrl =
      data.verification_url ??
      data?.data?.verification_url;

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
        body.email.trim().toLowerCase(),
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