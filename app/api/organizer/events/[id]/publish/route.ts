import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/database/connections/mongodb'
import Event from '@/database/models/Event'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const eventId = params.id
    const { isPublished } = await request.json()
    
    // Update event publish status
    const event = await Event.findByIdAndUpdate(
      eventId, 
      { isPublished }, 
      { new: true }
    )
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      event,
      message: `Event ${isPublished ? 'published' : 'unpublished'} successfully`
    }, { status: 200 })

  } catch (error) {
    console.error('Publish event API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
