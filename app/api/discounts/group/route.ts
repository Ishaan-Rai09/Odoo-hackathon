import { NextRequest, NextResponse } from 'next/server'
import { DiscountService } from '@/backend/services/discount-service'

export async function POST(request: NextRequest) {
  try {
    const { totalTickets, ticketPrice } = await request.json()

    if (!totalTickets || !ticketPrice) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const groupDiscount = DiscountService.calculateGroupDiscount(totalTickets, ticketPrice)
    return NextResponse.json(groupDiscount)
  } catch (error) {
    console.error('Error calculating group discount:', error)
    return NextResponse.json(
      { error: 'Failed to calculate group discount' },
      { status: 500 }
    )
  }
}
