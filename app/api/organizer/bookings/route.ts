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

// GET - Fetch all bookings for organizer's events
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const organizerId = await getOrganizerFromRequest(request)
    if (!organizerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get organizer's events first
    let eventIds: string[] = []
    
    if (eventId) {
      // Verify the specific event belongs to this organizer
      const event = await Event.findOne({ _id: eventId, organizer: organizerId })
      if (!event) {
        return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 })
      }
      eventIds = [eventId]
    } else {
      // Get all events for this organizer
      const events = await Event.find({ organizer: organizerId }).select('_id')
      eventIds = events.map(event => event._id.toString())
    }

    if (eventIds.length === 0) {
      return NextResponse.json({ 
        bookings: [],
        attendees: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      }, { status: 200 })
    }

    // Fetch booking data from MySQL
    const connection = await mysqlPool.getConnection()
    
    try {
      // First, check if the bookings table exists
      const [tables] = await connection.execute<RowDataPacket[]>(
        "SHOW TABLES LIKE 'bookings'"
      )
      
      if (tables.length === 0) {
        console.log('📊 Bookings table does not exist in MySQL')
        connection.release()
        return NextResponse.json({
          bookings: [],
          attendees: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          summary: {
            totalBookings: 0,
            totalAttendees: 0,
            totalRevenue: 0,
            statusBreakdown: { confirmed: 0, pending: 0, cancelled: 0 }
          },
          message: 'No bookings table found - please create a booking first to initialize the database'
        }, { status: 200 })
      }
      
      // Build WHERE clause for event IDs
      let whereClause: string
      let queryParams: any[]
      
      if (eventIds.length === 1) {
        whereClause = 'b.event_id = ?'
        queryParams = [eventIds[0]]
      } else {
        const eventPlaceholders = eventIds.map(() => '?').join(',')
        whereClause = `b.event_id IN (${eventPlaceholders})`
        queryParams = [...eventIds]
      }
      
      // Add status filter if provided
      if (status && ['confirmed', 'pending', 'cancelled'].includes(status)) {
        whereClause += ' AND b.status = ?'
        queryParams.push(status)
      }
      
      // Get total count for pagination
      const [countRows] = await connection.execute<RowDataPacket[]>(`
        SELECT COUNT(DISTINCT b.booking_id) as total
        FROM bookings b
        WHERE ${whereClause}
      `, queryParams)
      
      const total = countRows[0]?.total || 0
      const totalPages = Math.ceil(total / limit)
      
      // Get bookings with pagination - using simpler query without complex joins
      console.log('🔍 Debug: whereClause:', whereClause)
      console.log('🔍 Debug: queryParams:', queryParams)
      console.log('🔍 Debug: limit:', limit, 'offset:', offset)
      
      // Use string interpolation to avoid parameter binding issues
      const eventIdCondition = eventIds.length === 1 
        ? `b.event_id = '${eventIds[0]}'`
        : `b.event_id IN (${eventIds.map(id => `'${id}'`).join(',')})`
      
      const statusCondition = status && ['confirmed', 'pending', 'cancelled'].includes(status)
        ? ` AND b.status = '${status}'`
        : ''
        
      const finalQuery = `
        SELECT * FROM bookings b
        WHERE ${eventIdCondition}${statusCondition}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      
      console.log('📊 Final SQL:', finalQuery)
      
      const [bookingRows] = await connection.execute<RowDataPacket[]>(finalQuery)
      
      console.log('📊 Found', bookingRows.length, 'bookings')
      
      // Get all attendees for these bookings
      const bookingIds = bookingRows.map(b => b.booking_id)
      
      let attendeeRows: RowDataPacket[] = []
      if (bookingIds.length > 0) {
        const bookingIdsList = bookingIds.map(id => `'${id}'`).join(',')
        const attendeeQuery = `
          SELECT 
            a.*,
            b.status as booking_status,
            b.total_amount as booking_total,
            b.created_at as booking_date,
            b.event_title,
            b.event_date,
            b.event_time,
            b.event_venue
          FROM attendees a
          JOIN bookings b ON a.booking_id = b.booking_id
          WHERE a.booking_id IN (${bookingIdsList})
          ORDER BY b.created_at DESC, a.id ASC
        `
        
        console.log('📅 Attendee SQL:', attendeeQuery)
        const [attendeeResult] = await connection.execute<RowDataPacket[]>(attendeeQuery)
        
        attendeeRows = attendeeResult
        console.log('👥 Found', attendeeRows.length, 'attendees')
      }
      
      connection.release()
      
      // Format booking data with attendee counts
      const bookings = bookingRows.map(booking => {
        const bookingAttendees = attendeeRows.filter(a => a.booking_id === booking.booking_id)
        return {
          bookingId: booking.booking_id,
          userId: booking.user_id,
          userEmail: booking.user_email,
          eventId: booking.event_id,
          eventTitle: booking.event_title,
          eventDate: booking.event_date,
          eventTime: booking.event_time,
          eventVenue: booking.event_venue,
          eventImage: booking.event_image,
          standardTickets: booking.standard_tickets || 0,
          vipTickets: booking.vip_tickets || 0,
          totalTickets: (booking.standard_tickets || 0) + (booking.vip_tickets || 0),
          totalAmount: parseFloat(booking.total_amount) || 0,
          status: booking.status,
          createdAt: booking.created_at,
          updatedAt: booking.updated_at,
          attendeeCount: bookingAttendees.length,
          paymentMethod: booking.payment_method,
          transactionId: booking.transaction_id
        }
      })
      
      // Format attendee data
      const attendees = attendeeRows.map(attendee => ({
        id: attendee.id,
        bookingId: attendee.booking_id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        gender: attendee.gender,
        ticketType: attendee.ticket_type,
        bookingStatus: attendee.booking_status,
        bookingTotal: parseFloat(attendee.booking_total) || 0,
        bookingDate: attendee.booking_date,
        eventTitle: attendee.event_title,
        eventDate: attendee.event_date,
        eventTime: attendee.event_time,
        eventVenue: attendee.event_venue
      }))
      
      return NextResponse.json({
        bookings,
        attendees,
        pagination: {
          page,
          limit,
          total,
          totalPages
        },
        summary: {
          totalBookings: bookings.length,
          totalAttendees: attendees.length,
          totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
          statusBreakdown: {
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            pending: bookings.filter(b => b.status === 'pending').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length
          }
        }
      }, { status: 200 })
      
    } catch (mysqlError) {
      console.error('MySQL query error:', mysqlError)
      connection.release()
      
      // Return empty data instead of error for now
      return NextResponse.json({
        bookings: [],
        attendees: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        summary: {
          totalBookings: 0,
          totalAttendees: 0,
          totalRevenue: 0,
          statusBreakdown: {
            confirmed: 0,
            pending: 0,
            cancelled: 0
          }
        },
        message: 'No booking data available - this may be because no tickets have been purchased yet'
      }, { status: 200 })
    }

  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update booking status (for organizer management)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const organizerId = await getOrganizerFromRequest(request)
    if (!organizerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, status, eventId } = body

    // Verify the event belongs to this organizer
    const event = await Event.findOne({ _id: eventId, organizer: organizerId })
    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 })
    }

    // Update booking status in MySQL
    const connection = await mysqlPool.getConnection()
    
    try {
      const [result] = await connection.execute<RowDataPacket[]>(`
        UPDATE bookings 
        SET status = ?, updated_at = NOW() 
        WHERE booking_id = ? AND event_id = ?
      `, [status, bookingId, eventId])
      
      connection.release()
      
      return NextResponse.json({ 
        message: 'Booking status updated successfully',
        bookingId,
        newStatus: status
      }, { status: 200 })
      
    } catch (mysqlError) {
      console.error('MySQL update error:', mysqlError)
      connection.release()
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
    }

  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
