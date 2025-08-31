import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Mock referral data - in production this would come from database
    const mockReferralStats = {
      totalReferrals: 5,
      totalEarned: 125.50,
      pendingRewards: 45.00,
      successfulBookings: 3,
      referralCode: `REF${userId.slice(-4).toUpperCase()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      recentReferrals: [
        {
          email: 'friend1@example.com',
          dateReferred: '2024-12-15',
          status: 'booked' as const,
          rewardEarned: 50.00
        },
        {
          email: 'friend2@example.com',
          dateReferred: '2024-12-10',
          status: 'confirmed' as const,
          rewardEarned: 35.50
        },
        {
          email: 'friend3@example.com',
          dateReferred: '2024-12-08',
          status: 'pending' as const,
          rewardEarned: 0
        }
      ]
    }

    return NextResponse.json(mockReferralStats)
  } catch (error) {
    console.error('Error fetching referral data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    )
  }
}
