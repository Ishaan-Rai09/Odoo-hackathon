import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (token) {
      // Invalidate the session in the database
      await AuthService.signOut(token)
    }

    // Clear the HTTP-only cookie
    cookieStore.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: -1 // Expires immediately
    })

    return NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    })
  } catch (error) {
    console.error('Sign out API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
