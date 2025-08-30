import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await AuthService.getUserByEmail(email)
    
    // Always return success for security (don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

      // Store reset token in database
      await AuthService.storeResetToken(user.id, resetToken, resetTokenExpires)

      // In a real app, you would send an email here
      // For now, we'll just log the reset URL
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      
      console.log(`Password reset requested for ${email}`)
      console.log(`Reset URL: ${resetUrl}`)
      
      // TODO: Send actual email with reset link
      // await sendResetPasswordEmail(email, resetUrl)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent password reset instructions.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
