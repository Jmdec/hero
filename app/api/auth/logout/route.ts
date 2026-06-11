import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/g, '')
    const fullUrl = `${apiUrl}/api/auth/logout`

    // Send to Laravel backend
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: data.message || 'Logout successful',
      }, { status: 200 })
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
      { status: 500 }
    )
  }
}
