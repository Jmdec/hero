import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
    const fullUrl = `${API_URL}/api/auth/logout`
    const cookieToken = request.cookies.get('session')?.value ?? ''
    const authHeader = request.headers.get('authorization') ?? (cookieToken ? `Bearer ${cookieToken}` : '')

    // Send to Laravel backend
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    })

    const responseText = await response.text()
    let data: any = {}

    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch {
      data = { message: responseText || 'Logout failed' }
    }

    if (response.ok) {
      const nextResponse = NextResponse.json({
        success: true,
        message: data.message || 'Logout successful',
      }, { status: 200 })

      nextResponse.cookies.set('session', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      })

      return nextResponse
    }

    return NextResponse.json(data, {
      status: response.status,
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
      }
    )
  }
}
