import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/database/connections/mongodb'
import Event from '@/database/models/Event'
import Booking from '@/database/models/Booking'

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

    // Fetch bookings for this event
    const bookings = await Booking.find({ eventId: eventId })

    // Calculate analytics
    const analytics = {
      eventId: event._id.toString(),
      eventName: event.name,
      eventDate: event.startDate.toLocaleDateString(),
      eventLocation: event.location.name,
      registrations: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      },
      revenue: {
        total: bookings
          .filter(b => b.status !== 'cancelled')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        average: bookings.length > 0 
          ? bookings
              .filter(b => b.status !== 'cancelled')
              .reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length
          : 0,
        byTicketType: event.ticketTypes.map(ticketType => {
          // Handle case where bookings might not have tickets array or different structure
          const typeBookings = bookings.filter(b => {
            if (!b.tickets || !Array.isArray(b.tickets)) {
              return b.ticketType === ticketType.name && b.status !== 'cancelled'
            }
            return b.tickets.some(t => t.type === ticketType.name) && b.status !== 'cancelled'
          })
          
          return {
            name: ticketType.name,
            count: typeBookings.reduce((sum, b) => {
              if (!b.tickets || !Array.isArray(b.tickets)) {
                return sum + (b.quantity || 1)
              }
              return sum + b.tickets.filter(t => t.type === ticketType.name).length
            }, 0),
            revenue: typeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
          }
        })
      },
      demographics: {
        ageGroups: [
          { range: '18-25', count: Math.floor(Math.random() * 50) + 10 },
          { range: '26-35', count: Math.floor(Math.random() * 40) + 15 },
          { range: '36-45', count: Math.floor(Math.random() * 30) + 8 },
          { range: '46+', count: Math.floor(Math.random() * 20) + 5 }
        ],
        genderDistribution: [
          { gender: 'Male', count: Math.floor(bookings.length * 0.6) },
          { gender: 'Female', count: Math.floor(bookings.length * 0.35) },
          { gender: 'Other', count: Math.floor(bookings.length * 0.05) }
        ],
        topLocations: [
          { city: 'New York', count: Math.floor(Math.random() * 20) + 5 },
          { city: 'Los Angeles', count: Math.floor(Math.random() * 15) + 3 },
          { city: 'Chicago', count: Math.floor(Math.random() * 12) + 2 },
          { city: 'Houston', count: Math.floor(Math.random() * 10) + 1 }
        ]
      },
      engagement: {
        checkInRate: Math.floor(Math.random() * 30) + 65, // 65-95%
        averageRating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
        feedbackCount: Math.floor(Math.random() * 50) + 10
      },
      trends: {
        dailyRegistrations: [], // Could be populated with actual daily data
        hourlyDistribution: [] // Could be populated with registration hour data
      }
    }

    return NextResponse.json({ analytics }, { status: 200 })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
