import { NextRequest, NextResponse } from 'next/server'
import { LoyaltyService } from '@/lib/loyalty-service'

// Mock booking data - in real app, this would come from database
const mockBookings = new Map([
  ['BKG-001', {
    id: 'BKG-001',
    eventTitle: 'Tech Conference 2024',
    eventDate: '2024-02-15T10:00:00Z',
    totalAmount: 150,
    ticketQuantity: 2,
    ticketType: 'general',
    attendeeName: 'John Doe',
    attendeeEmail: 'john@example.com',
    userId: 'USER-001',
    status: 'confirmed',
    bookingDate: '2024-01-10T14:30:00Z'
  }],
  ['BKG-002', {
    id: 'BKG-002',
    eventTitle: 'Music Festival',
    eventDate: '2024-03-20T18:00:00Z',
    totalAmount: 80,
    ticketQuantity: 1,
    ticketType: 'vip',
    attendeeName: 'Jane Smith',
    attendeeEmail: 'jane@example.com',
    userId: 'USER-002',
    status: 'confirmed',
    bookingDate: '2024-01-12T09:15:00Z'
  }]
])

// GET /api/bookings/[bookingId] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params
    const booking = mockBookings.get(bookingId)
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Get modification history
    const modifications = LoyaltyService.getBookingModifications(bookingId)
    
    // Get cancellation details if cancelled
    const cancellation = LoyaltyService.getCancellationDetails(bookingId)

    return NextResponse.json({
      booking,
      modifications,
      cancellation,
      canModify: canModifyBooking(booking),
      canCancel: canCancelBooking(booking)
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[bookingId] - Modify booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params
    const body = await request.json()
    const { modificationType, newValue, userId } = body
    
    const booking = mockBookings.get(bookingId)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if booking can be modified
    if (!canModifyBooking(booking)) {
      return NextResponse.json(
        { error: 'Booking cannot be modified at this time' },
        { status: 400 }
      )
    }

    let oldValue: any
    let additionalCost = 0

    switch (modificationType) {
      case 'attendee_info':
        oldValue = { name: booking.attendeeName, email: booking.attendeeEmail }
        booking.attendeeName = newValue.name
        booking.attendeeEmail = newValue.email
        break
        
      case 'ticket_quantity':
        oldValue = booking.ticketQuantity
        const quantityDiff = newValue - oldValue
        const costPerTicket = booking.totalAmount / booking.ticketQuantity
        additionalCost = quantityDiff * costPerTicket
        
        booking.ticketQuantity = newValue
        booking.totalAmount += additionalCost
        break
        
      case 'ticket_type':
        oldValue = booking.ticketType
        
        // Mock price differences for different ticket types
        const currentTypePrice = getTicketTypePrice(booking.ticketType)
        const newTypePrice = getTicketTypePrice(newValue)
        additionalCost = (newTypePrice - currentTypePrice) * booking.ticketQuantity
        
        booking.ticketType = newValue
        booking.totalAmount += additionalCost
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid modification type' },
          { status: 400 }
        )
    }

    // Record the modification
    const modification = await LoyaltyService.modifyBooking(
      bookingId,
      modificationType,
      oldValue,
      newValue,
      additionalCost
    )

    // Update the mock database
    mockBookings.set(bookingId, booking)

    // Award/deduct loyalty points if there's a cost change
    if (additionalCost !== 0 && additionalCost > 0) {
      await LoyaltyService.awardBookingPoints(
        userId,
        bookingId,
        'EVENT-001', // Mock event ID
        additionalCost,
        booking.eventTitle
      )
    }

    return NextResponse.json({
      success: true,
      modification,
      updatedBooking: booking,
      additionalCost
    })
  } catch (error) {
    console.error('Error modifying booking:', error)
    return NextResponse.json(
      { error: 'Failed to modify booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[bookingId] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params
    const body = await request.json()
    const { reason, userId } = body
    
    const booking = mockBookings.get(bookingId)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if booking can be cancelled
    if (!canCancelBooking(booking)) {
      return NextResponse.json(
        { error: 'Booking cannot be cancelled at this time' },
        { status: 400 }
      )
    }

    // Process the cancellation
    const cancellation = await LoyaltyService.cancelBooking(
      bookingId,
      userId,
      reason,
      booking.totalAmount,
      booking.eventDate
    )

    // Update booking status
    booking.status = 'cancelled'
    mockBookings.set(bookingId, booking)

    // Send cancellation notification
    try {
      const { NotificationService } = await import('@/lib/notification-service')
      await NotificationService.sendBookingCancellation(
        booking.attendeeEmail,
        {
          eventTitle: booking.eventTitle,
          eventDate: booking.eventDate,
          bookingId: bookingId,
          refundAmount: cancellation.refundAmount,
          attendeeName: booking.attendeeName
        }
      )
    } catch (notificationError) {
      console.error('Error sending cancellation notification:', notificationError)
      // Don't fail the cancellation if notification fails
    }

    return NextResponse.json({
      success: true,
      cancellation,
      message: `Booking cancelled. Refund of $${cancellation.refundAmount} will be processed.`
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

// Helper functions
function canModifyBooking(booking: any): boolean {
  if (booking.status === 'cancelled' || booking.status === 'checked_in') {
    return false
  }
  
  const eventDate = new Date(booking.eventDate)
  const now = new Date()
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return hoursUntilEvent > 24 // Can modify until 24 hours before event
}

function canCancelBooking(booking: any): boolean {
  if (booking.status === 'cancelled' || booking.status === 'checked_in') {
    return false
  }
  
  const eventDate = new Date(booking.eventDate)
  const now = new Date()
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return hoursUntilEvent > 0 // Can cancel until event starts
}

function getTicketTypePrice(ticketType: string): number {
  switch (ticketType) {
    case 'general': return 50
    case 'premium': return 75
    case 'vip': return 100
    default: return 50
  }
}
