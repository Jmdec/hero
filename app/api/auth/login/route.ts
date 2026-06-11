import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("=== LOGIN DEBUG START ===")
    console.log("Request body received:", { email: body.email, password: "[HIDDEN]" })

    // Validate required fields
    if (!body.email || !body.password) {
      console.log("Validation failed - missing required fields")
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
          errors: {
            email: !body.email ? ["Email is required"] : [],
            password: !body.password ? ["Password is required"] : [],
          },
        },
        { status: 400 },
      )
    }

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, '')
    const fullUrl = `${apiUrl}/api/auth/login`

    console.log("Attempting to connect to Laravel API at:", fullUrl)

    const requestData = {
      email: body.email.trim().toLowerCase(),
      password: body.password,
    }

    console.log("Sending data to Laravel:", { email: requestData.email, password: "[HIDDEN]" })

    // Send to Laravel backend
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestData),
    })

    console.log("Laravel API response status:", response.status)
    console.log("Laravel API response headers:", Object.fromEntries(response.headers.entries()))

    let data
    const responseText = await response.text()
    console.log("Laravel API raw response:", responseText)

    try {
      data = JSON.parse(responseText)
      console.log("Laravel API parsed response:", data)
    } catch (parseError) {
      console.error("Failed to parse Laravel response as JSON:", parseError)
      console.log("Response was not valid JSON, raw text:", responseText)

      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from server. Server may be down or returning HTML error page.",
          error: "Invalid JSON response",
          rawResponse: responseText.substring(0, 500), // First 500 chars for debugging
          debug: {
            url: fullUrl,
            status: response.status,
            statusText: response.statusText,
          },
        },
        { status: 502 },
      )
    }

    console.log("=== LOGIN DEBUG END ===")

    // Handle email verification error specifically
    if (response.status === 403 && data.error === 'email_not_verified') {
      return NextResponse.json({
        success: false,
        message: data.message || 'Please verify your email address before logging in.',
        error: 'email_not_verified',
      }, { status: 403 })
    }

    // Return the response with the same status code
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: unknown) {
    console.error("=== LOGIN ERROR ===")

    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name)
      console.error("Error message:", error.message)
      console.error("Full error:", error)
      console.error("Stack trace:", error.stack)
    } else {
      console.error("Non-Error thrown:", error)
    }

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("Network/Connection error detected")
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot connect to the server. Please make sure your Laravel backend is running on http://localhost:8000.s",
          error: "Connection failed to Laravel backend",
          debug: {
            errorType: "NetworkError",
            errorMessage: error instanceof Error ? error.message : String(error),
            apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
          },
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Login failed. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : [],
        },
      },
      { status: 500 },
    )
  }
}
