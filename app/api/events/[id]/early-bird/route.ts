import { NextRequest, NextResponse } from 'next/server'
import { DiscountService } from '@/backend/services/discount-service'
import { connectToDatabase } from '@/database/connections/mongodb'
import Event from '@/lib/models/Event'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get event data from MongoDB
    await connectToDatabase()
    const event = await Event.findOne({ slug: id })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check early bird discount
    const earlyBirdDiscount = DiscountService.checkEarlyBirdDiscount(event.toObject())
    
    return NextResponse.json(earlyBirdDiscount)
  } catch (error) {
    console.error('Error checking early bird discount:', error)
    return NextResponse.json(
      { error: 'Failed to check early bird discount' },
      { status: 500 }
    )
  }
}
