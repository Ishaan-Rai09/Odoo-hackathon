import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/database/connections/mongodb'
import Event from '@/database/models/Event'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const eventId = params.id
    
    // Fetch event details
    const event = await Event.findById(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event }, { status: 200 })

  } catch (error) {
    console.error('Get event API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const eventId = params.id
    const updates = await request.json()
    
    // Update event
    const event = await Event.findByIdAndUpdate(
      eventId, 
      updates, 
      { new: true }
    )
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event }, { status: 200 })

  } catch (error) {
    console.error('Update event API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const eventId = params.id
    
    // Delete event
    const event = await Event.findByIdAndDelete(eventId)
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Delete event API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
