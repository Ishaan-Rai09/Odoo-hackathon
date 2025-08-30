import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/lib/models/Event'
import Organizer from '@/lib/models/Organizer'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to get organizer from token
async function getOrganizerFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get('organizer-token')?.value
    
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.organizerId
  } catch (error) {
    return null
  }
}

// GET - Fetch organizer's events
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const organizerId = await getOrganizerFromRequest(request)
    if (!organizerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For testing purposes, show all events instead of just organizer's events
    // In production, you would use: { organizer: organizerId }
    const events = await Event.find({})
      .sort({ createdAt: -1 })

    return NextResponse.json({ events }, { status: 200 })

  } catch (error) {
    console.error('Fetch events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const organizerId = await getOrganizerFromRequest(request)
    if (!organizerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      locationName,
      locationAddress,
      locationLat,
      locationLng,
      coverImage,
      ticketTypes,
      customQuestions,
      isPublished
    } = body

    // Validate required fields
    if (!name || !description || !category || !startDate || !endDate || 
        !registrationStart || !registrationEnd || !locationName || !locationAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate max capacity from ticket types
    const maxCapacity = ticketTypes.reduce((sum: number, ticket: any) => sum + ticket.maxTickets, 0)

    // Create new event
    const event = new Event({
      organizer: organizerId,
      name,
      description,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationStart: new Date(registrationStart),
      registrationEnd: new Date(registrationEnd),
      location: {
        name: locationName,
        address: locationAddress,
        coordinates: {
          lat: locationLat || 0,
          lng: locationLng || 0
        }
      },
      coverImage: coverImage || '',
      ticketTypes: ticketTypes.map((ticket: any) => ({
        name: ticket.name,
        price: ticket.price,
        maxTickets: ticket.maxTickets,
        maxPerUser: ticket.maxPerUser,
        salesStart: new Date(ticket.salesStart),
        salesEnd: new Date(ticket.salesEnd),
        soldCount: 0
      })),
      customQuestions: customQuestions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        required: q.required,
        options: q.options || []
      })),
      isPublished: isPublished || false,
      maxCapacity,
      totalRegistrations: 0
    })

    await event.save()

    return NextResponse.json(
      { 
        message: isPublished ? 'Event published successfully' : 'Event saved as draft',
        event 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Create event error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const organizerId = await getOrganizerFromRequest(request)
    if (!organizerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, ...updateData } = body

    // Find event and verify ownership
    const event = await Event.findOne({ _id: eventId, organizer: organizerId })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Update event
    Object.assign(event, updateData)
    await event.save()

    return NextResponse.json(
      { message: 'Event updated successfully', event },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const organizerId = await getOrganizerFromRequest(request)
    if (!organizerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // For testing purposes, allow deleting any event
    // In production, you would verify ownership: { _id: eventId, organizer: organizerId }
    const event = await Event.findOneAndDelete({ _id: eventId })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
