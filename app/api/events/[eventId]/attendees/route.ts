import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/database/connections/mongodb'
import Event from '@/database/models/Event'
import mysqlPool from '@/database/connections/mysql'
import { RowDataPacket } from 'mysql2'
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

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await dbConnect()
    
    const organizerId = await getOrganizerFromRequest(request)
    if (!organizerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = params
    
    // Verify event exists and belongs to organizer
    const event = await Event.findOne({ _id: eventId, organizer: organizerId })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    let attendees = []

    // Try to fetch attendee data from MySQL
    try {
      const connection = await mysqlPool.getConnection()
      
      const [attendeeRows] = await connection.execute<RowDataPacket[]>(`
        SELECT 
          a.id,
          a.name,
          a.email,
          a.phone,
          a.ticket_type as ticketType,
          b.created_at as bookingDate,
          0 as checkedIn,
          NULL as checkinTime,
          CONCAT('QR-', ?, '-', a.id) as qrCode
        FROM attendees a
        JOIN bookings b ON a.booking_id = b.booking_id
        WHERE b.event_id = ? AND b.status != 'cancelled'
        ORDER BY b.created_at DESC
      `, [eventId, eventId])

      attendees = attendeeRows.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || 'N/A',
        ticketType: row.ticketType,
        bookingDate: row.bookingDate,
        checkedIn: Boolean(row.checkedIn),
        checkinTime: row.checkinTime || undefined,
        qrCode: row.qrCode
      }))

      connection.release()
      
    } catch (mysqlError) {
      console.warn('⚠️ MySQL attendees fetch failed:', mysqlError)
    }

    // Don't show mock data if there are no real attendees
    // The dashboard will only show actual registered attendees

    return NextResponse.json({ attendees }, { status: 200 })

  } catch (error) {
    console.error('Attendees fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
