import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'session'

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=0`
}

export async function POST(request: NextRequest) {
  try {
    const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
    const fullUrl = `${API_URL}/api/auth/logout`

    // Send to Laravel backend
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    const data = await response.json()

    const headers = new Headers()
    headers.append('Set-Cookie', clearSessionCookie())

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: data.message || 'Logout successful',
      }, { status: 200, headers })
    }

    return NextResponse.json(data, {
      status: response.status,
      headers,
    })
  } catch (error: unknown) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Logout failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Set-Cookie': clearSessionCookie(),
        },
      }
    )
  }
}
