import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      referrerUserId, 
      referrerEmail, 
      friendEmail, 
      referralCode, 
      customMessage 
    } = await request.json()

    if (!referrerUserId || !friendEmail || !referralCode) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Store the referral in the database
    // 2. Send an email to the friend with the referral link
    // 3. Track the referral status

    console.log('📧 Referral invitation:', {
      from: referrerEmail,
      to: friendEmail,
      code: referralCode,
      message: customMessage
    })

    // Mock email sending (replace with actual email service)
    const emailData = {
      to: friendEmail,
      from: 'noreply@eventbook.com',
      subject: `You're invited to join EventBook! 15% off your first event`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You've been invited to EventBook!</h2>
          <p>Hi there!</p>
          <p>${referrerEmail} has invited you to join EventBook - the best place to discover and book amazing events.</p>
          
          ${customMessage ? `<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0; color: #6b7280;">"${customMessage}"</blockquote>` : ''}
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #059669;">Special Offer: 15% Off Your First Booking!</h3>
            <p style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0;">Use code: <span style="background: #fef3c7; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${referralCode}</span></p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?ref=${referralCode}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join EventBook & Save 15%
            </a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This invitation expires in 30 days. Terms and conditions apply.
          </p>
        </div>
      `
    }

    // Log the invitation for demo purposes
    console.log('✅ Referral invitation would be sent:', emailData)

    return NextResponse.json({
      success: true,
      message: 'Referral invitation sent successfully',
      referralCode
    })
  } catch (error) {
    console.error('Error sending referral invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send referral invitation' },
      { status: 500 }
    )
  }
}
