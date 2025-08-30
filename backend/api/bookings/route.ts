import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { connectToDatabase } from '@/database/connections/mongodb'
import Booking from '@/database/models/Booking'
import mysqlPool, { initializeDatabase } from '@/database/connections/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try MySQL first, fallback to MongoDB
    try {
      console.log('📊 Fetching bookings from MySQL...')
      const connection = await mysqlPool.getConnection()
      
      const [bookingRows] = await connection.execute<RowDataPacket[]>(`
        SELECT 
          b.*,
          GROUP_CONCAT(
            CONCAT(
              '{"name":"', a.name, '",',
              '"email":"', a.email, '",',
              '"phone":"', a.phone, '",',
              '"gender":"', a.gender, '",',
              '"ticketType":"', a.ticket_type, '"}'
            ) SEPARATOR '###'
          ) as attendees,
          GROUP_CONCAT(
            CONCAT(
              '{"attendeeName":"', q.attendee_name, '",',
              '"ticketNumber":"', q.ticket_number, '",',
              '"qrCode":"', q.qr_code, '"}'
            ) SEPARATOR '###'
          ) as qr_codes
        FROM bookings b
        LEFT JOIN attendees a ON b.booking_id = a.booking_id
        LEFT JOIN qr_codes q ON b.booking_id = q.booking_id
        WHERE b.user_id = ?
        GROUP BY b.id
        ORDER BY b.created_at DESC
      `, [userId])
      
      connection.release()
      
      // Transform MySQL data to match frontend expectations
      const bookings = bookingRows.map((row: any) => {
        const attendees = row.attendees ? 
          row.attendees.split('###').map((str: string) => {
            try {
              const parsed = JSON.parse(str.replace(/\\/g, ''))
              return {
                name: parsed.name,
                email: parsed.email,
                phone: parsed.phone,
                gender: parsed.gender,
                ticketType: parsed.ticketType
              }
            } catch (e) {
              return null
            }
          }).filter((item: any) => item !== null) : []
        
        const qrCodes = row.qr_codes ? 
          row.qr_codes.split('###').map((str: string) => {
            try {
              return JSON.parse(str.replace(/\\/g, ''))
            } catch (e) {
              return null
            }
          }).filter((item: any) => item !== null) : []
        
        return {
          _id: row.id,
          bookingId: row.booking_id,
          eventId: row.event_id,
          eventTitle: row.event_title,
          eventDate: row.event_date,
          eventTime: row.event_time,
          eventVenue: row.event_venue,
          eventImage: row.event_image,
          totalAmount: parseFloat(row.total_amount),
          status: row.status,
          tickets: {
            standard: row.standard_tickets,
            vip: row.vip_tickets
          },
          attendees,
          paymentDetails: {
            transactionId: row.transaction_id,
            paymentMethod: row.payment_method,
            timestamp: row.payment_timestamp
          },
          qrCodes,
          createdAt: row.created_at
        }
      })
      
      console.log(`✅ Found ${bookings.length} bookings in MySQL`)
      return NextResponse.json({ success: true, bookings })
      
    } catch (mysqlError) {
      console.warn('⚠️ MySQL fetch failed, trying MongoDB:', mysqlError)
      
      // Fallback to MongoDB
      await connectToDatabase()
      const bookings = await Booking.find({ userId }).sort({ createdAt: -1 })
      
      console.log(`✅ Found ${bookings.length} bookings in MongoDB`)
      return NextResponse.json({ success: true, bookings })
    }
    
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch bookings' 
    }, { status: 500 })
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingData = await request.json()
    console.log('📝 Creating new booking:', bookingData.bookingId)
    
    let savedBooking = null
    
    // Save to MySQL first
    try {
      await initializeDatabase() // Ensure tables exist
      const connection = await mysqlPool.getConnection()
      
      // Insert booking
      const [bookingResult] = await connection.execute<ResultSetHeader>(`
        INSERT INTO bookings (
          booking_id, user_id, user_email, event_id, event_title, 
          event_date, event_time, event_venue, event_image,
          standard_tickets, vip_tickets, total_amount, status,
          payment_method, transaction_id, payment_timestamp,
          pdf_generated, emails_sent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bookingData.bookingId,
        userId,
        bookingData.userEmail || '',
        bookingData.eventId,
        bookingData.eventTitle,
        bookingData.eventDate,
        bookingData.eventTime,
        bookingData.eventVenue,
        bookingData.eventImage || '/api/placeholder/400/200',
        bookingData.tickets.standard,
        bookingData.tickets.vip,
        bookingData.totalAmount,
        bookingData.status || 'confirmed',
        bookingData.paymentDetails.paymentMethod,
        bookingData.paymentDetails.transactionId,
        new Date(bookingData.paymentDetails.timestamp),
        bookingData.pdfGenerated || false,
        bookingData.emailsSent || false
      ])
      
      // Insert attendees
      if (bookingData.attendees && bookingData.attendees.length > 0) {
        const attendeeValues = bookingData.attendees.map((attendee: any) => [
          bookingData.bookingId,
          attendee.name,
          attendee.email,
          attendee.phone,
          attendee.gender,
          attendee.ticketType
        ])
        
        await connection.query(
          'INSERT INTO attendees (booking_id, name, email, phone, gender, ticket_type) VALUES ?',
          [attendeeValues]
        )
      }
      
      // Insert QR codes
      if (bookingData.qrCodes && bookingData.qrCodes.length > 0) {
        const qrValues = bookingData.qrCodes.map((qr: any) => [
          bookingData.bookingId,
          qr.attendeeName,
          qr.ticketNumber,
          qr.qrCode
        ])
        
        await connection.query(
          'INSERT INTO qr_codes (booking_id, attendee_name, ticket_number, qr_code) VALUES ?',
          [qrValues]
        )
      }
      
      connection.release()
      console.log('✅ Booking saved to MySQL successfully')
      
      savedBooking = {
        id: bookingResult.insertId,
        ...bookingData,
        userId,
        createdAt: new Date()
      }
      
    } catch (mysqlError) {
      console.warn('⚠️ MySQL save failed, trying MongoDB:', mysqlError)
    }
    
    // Also save to MongoDB (dual storage)
    try {
      await connectToDatabase()
      
      const booking = new Booking({
        ...bookingData,
        userId,
        userEmail: bookingData.userEmail || '',
      })
      
      await booking.save()
      console.log('✅ Booking also saved to MongoDB')
      
      if (!savedBooking) {
        savedBooking = booking
      }
      
    } catch (mongoError) {
      console.warn('⚠️ MongoDB save failed:', mongoError)
      
      if (!savedBooking) {
        throw new Error('Failed to save booking to both databases')
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      booking: savedBooking 
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ 
      error: 'Failed to create booking' 
    }, { status: 500 })
  }
}

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Find and update the booking to cancelled status
    const booking = await Booking.findOneAndUpdate(
      { bookingId, userId },
      { status: 'cancelled' },
      { new: true }
    )
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      booking 
    })
    
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ 
      error: 'Failed to cancel booking' 
    }, { status: 500 })
  }
}
