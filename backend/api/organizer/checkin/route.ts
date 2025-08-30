import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, attendeeId, eventId, organizerId, checkedInAt } = body

    // Validate required fields
    if (!bookingId || !eventId || !organizerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 300))

    // Simulate check-in validation and processing
    const simulatedAttendee = {
      id: attendeeId || bookingId,
      name: `Attendee ${Math.floor(Math.random() * 1000)}`,
      email: `attendee${Math.floor(Math.random() * 1000)}@example.com`,
      ticketType: Math.random() > 0.5 ? 'Regular' : 'Student',
      bookingId: bookingId,
      eventId: eventId,
      checkedInAt: checkedInAt,
      checkedInBy: organizerId
    }

    // Log the check-in for debugging
    console.log(`✅ Check-in processed: ${simulatedAttendee.name} (${bookingId})`)

    return NextResponse.json({
      success: true,
      message: 'Check-in successful',
      attendee: simulatedAttendee,
      checkedInAt: checkedInAt
    })

  } catch (error) {
    console.error('Check-in API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Simulate getting check-in stats for an event
    const mockStats = {
      totalRegistrations: 150,
      checkedIn: Math.floor(Math.random() * 150),
      checkInRate: 0,
      recentCheckIns: []
    }

    mockStats.checkInRate = mockStats.totalRegistrations > 0 
      ? (mockStats.checkedIn / mockStats.totalRegistrations) * 100 
      : 0

    return NextResponse.json({
      success: true,
      stats: mockStats
    })

  } catch (error) {
    console.error('Check-in stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
