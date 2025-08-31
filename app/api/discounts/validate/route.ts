import { NextRequest, NextResponse } from 'next/server'
import { DiscountService } from '@/backend/services/discount-service'

export async function POST(request: NextRequest) {
  try {
    const { couponCode, eventId, userId, orderAmount, ticketTypes } = await request.json()

    if (!couponCode || !eventId || !userId || !orderAmount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const validation = await DiscountService.validateCoupon(
      couponCode,
      eventId,
      userId,
      orderAmount,
      ticketTypes || { standard: 1, vip: 0 }
    )

    return NextResponse.json(validation)
  } catch (error) {
    console.error('Error validating discount:', error)
    return NextResponse.json(
      { error: 'Failed to validate discount' },
      { status: 500 }
    )
  }
}
