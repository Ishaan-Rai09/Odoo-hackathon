import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    const result = await AuthService.signUp({ name, email, password, phone })

    if (result.success && result.token) {
      // Set HTTP-only cookie
      cookies().set({
        name: 'auth-token',
        value: result.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return NextResponse.json({
        success: true,
        user: result.user,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Sign up failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Sign up API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
