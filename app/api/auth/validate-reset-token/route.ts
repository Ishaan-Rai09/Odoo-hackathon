import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Validate the reset token
    const isValid = await AuthService.validateResetToken(token)

    if (isValid) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired reset token' 
      })
    }

  } catch (error) {
    console.error('Validate reset token error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
