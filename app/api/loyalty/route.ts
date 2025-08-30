import { NextRequest, NextResponse } from 'next/server'
import { LoyaltyService } from '@/lib/loyalty-service'

// GET /api/loyalty?userId=xxx - Get loyalty account
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email') || ''
    const action = searchParams.get('action')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'leaderboard':
        const limit = Number(searchParams.get('limit')) || 10
        const leaderboard = LoyaltyService.getLoyaltyLeaderboard(limit)
        return NextResponse.json({ leaderboard })

      case 'account':
      default:
        const account = await LoyaltyService.getLoyaltyAccount(userId, email)
        
        // Clean expired points
        await LoyaltyService.cleanExpiredPoints(userId)
        
        // Get tier benefits
        const tierBenefits = LoyaltyService.getTierBenefits(account.tier)
        
        return NextResponse.json({
          account,
          tierBenefits
        })
    }
  } catch (error) {
    console.error('Error fetching loyalty data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loyalty data' },
      { status: 500 }
    )
  }
}

// POST /api/loyalty - Award points or redeem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, ...data } = body

    switch (action) {
      case 'award_booking_points':
        const { bookingId, eventId, bookingAmount, eventTitle } = data
        
        if (!bookingId || !eventId || !bookingAmount || !eventTitle) {
          return NextResponse.json(
            { error: 'Missing required fields for awarding points' },
            { status: 400 }
          )
        }

        const pointsResult = await LoyaltyService.awardBookingPoints(
          userId,
          bookingId,
          eventId,
          bookingAmount,
          eventTitle
        )

        return NextResponse.json({
          success: true,
          ...pointsResult,
          message: `Earned ${pointsResult.pointsEarned} loyalty points!`
        })

      case 'redeem_points':
        const { pointsToRedeem, description } = data
        
        if (!pointsToRedeem || pointsToRedeem <= 0) {
          return NextResponse.json(
            { error: 'Invalid points amount' },
            { status: 400 }
          )
        }

        const redeemResult = await LoyaltyService.redeemPoints(
          userId,
          pointsToRedeem,
          'manual-redemption',
          description || `Redeemed ${pointsToRedeem} points`
        )

        if (!redeemResult.success) {
          return NextResponse.json(
            { error: 'Insufficient points for redemption' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          ...redeemResult,
          message: `Successfully redeemed $${redeemResult.discountAmount.toFixed(2)} credit!`
        })

      case 'award_referral_points':
        const { referrerUserId, refereeUserId, referralBookingAmount } = data
        
        if (!referrerUserId || !refereeUserId || !referralBookingAmount) {
          return NextResponse.json(
            { error: 'Missing required fields for referral points' },
            { status: 400 }
          )
        }

        const referralResult = await LoyaltyService.awardReferralPoints(
          referrerUserId,
          refereeUserId,
          referralBookingAmount
        )

        return NextResponse.json({
          success: true,
          ...referralResult,
          message: 'Referral points awarded successfully!'
        })

      case 'simulate_booking':
        // Simulate a booking for demo purposes
        const { amount, eventName } = data
        
        const simulatedPoints = await LoyaltyService.awardBookingPoints(
          userId,
          `DEMO-${Date.now()}`,
          `EVENT-${Date.now()}`,
          amount || 100,
          eventName || 'Demo Event'
        )

        return NextResponse.json({
          success: true,
          ...simulatedPoints,
          message: `Demo booking completed! Earned ${simulatedPoints.pointsEarned} points.`
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing loyalty action:', error)
    return NextResponse.json(
      { error: 'Failed to process loyalty action' },
      { status: 500 }
    )
  }
}

// PUT /api/loyalty - Update loyalty account or clean expired points
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'clean_expired_points':
        const expiredPoints = await LoyaltyService.cleanExpiredPoints(userId)
        
        return NextResponse.json({
          success: true,
          expiredPoints,
          message: expiredPoints > 0 
            ? `Cleaned up ${expiredPoints} expired points` 
            : 'No expired points found'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error updating loyalty account:', error)
    return NextResponse.json(
      { error: 'Failed to update loyalty account' },
      { status: 500 }
    )
  }
}
