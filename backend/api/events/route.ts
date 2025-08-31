import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/database/connections/mongodb'
import Event from '@/database/models/Event'
import Organizer from '@/database/models/Organizer'

export const runtime = 'nodejs'

// Static events data (matching the IDs from featured events JSON)
const staticEvents = [
  {
    id: 'hackathon-2024',
    title: 'CyberHack 2024',
    description: '48-hour coding marathon with cutting-edge challenges in AI, Web3, and IoT. Join the brightest minds in technology for non-stop coding, innovation, and creativity.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Technical',
    date: '2024-03-15',
    time: '09:00 AM',
    location: 'Tech Hub Convention Center',
    locationAddress: '123 Innovation Drive, Silicon Valley, CA 94025',
    price: 0,
    maxCapacity: 200,
    totalRegistrations: 156,
    standardPrice: 0,
    vipPrice: 50,
    organizer: {
      name: 'Alex Johnson',
      organizationName: 'Tech Innovators'
    },
    ticketTypes: [
      {
        name: 'Standard',
        price: 0,
        maxTickets: 180,
        maxPerUser: 1,
        soldCount: 120
      },
      {
        name: 'VIP',
        price: 50,
        maxTickets: 20,
        maxPerUser: 1,
        soldCount: 36
      }
    ]
  },
  {
    id: 'rock-concert-2024',
    title: 'Rock Legends Live Concert',
    description: 'Epic rock concert featuring top bands and legendary rock performers. Get ready for the most electrifying rock concert of the year!',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Entertainment',
    date: '2024-04-20',
    time: '07:00 PM',
    location: 'Elite Arena',
    locationAddress: '100 Music Boulevard, Entertainment District, LA 90028',
    price: 75,
    maxCapacity: 5000,
    totalRegistrations: 3200,
    standardPrice: 75,
    vipPrice: 250,
    organizer: {
      name: 'Emily Davis',
      organizationName: 'Elite Music Productions'
    },
    ticketTypes: [
      {
        name: 'Standard',
        price: 75,
        maxTickets: 4000,
        maxPerUser: 8,
        soldCount: 2800
      },
      {
        name: 'VIP',
        price: 250,
        maxTickets: 1000,
        maxPerUser: 4,
        soldCount: 400
      }
    ]
  },
  {
    id: 'standup-night',
    title: 'Elite Comedy Night',
    description: 'Hilarious stand-up comedy performances featuring both established comedians and rising stars for non-stop entertainment.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Entertainment',
    date: '2024-03-25',
    time: '08:00 PM',
    location: 'Comedy Club Elite',
    locationAddress: '555 Laughter Lane, Comedy District, Chicago, IL 60601',
    price: 30,
    maxCapacity: 200,
    totalRegistrations: 145,
    standardPrice: 30,
    vipPrice: 80,
    organizer: {
      name: 'David Wilson',
      organizationName: 'Comedy Central Hub'
    },
    ticketTypes: [
      {
        name: 'Standard',
        price: 30,
        maxTickets: 150,
        maxPerUser: 6,
        soldCount: 120
      },
      {
        name: 'VIP',
        price: 80,
        maxTickets: 50,
        maxPerUser: 4,
        soldCount: 25
      }
    ]
  },
  {
    id: 'entrepreneurship-seminar',
    title: 'Entrepreneurship Success Summit',
    description: 'Learn from successful entrepreneurs and business leaders in this comprehensive seminar designed for aspiring entrepreneurs.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Business',
    date: '2024-04-15',
    time: '09:00 AM',
    location: 'Business Convention Center',
    locationAddress: '321 Corporate Blvd, Business District, Austin, TX 78701',
    price: 100,
    maxCapacity: 500,
    totalRegistrations: 320,
    standardPrice: 100,
    vipPrice: 250,
    organizer: {
      name: 'Jennifer Martinez',
      organizationName: 'Entrepreneur Network'
    },
    ticketTypes: [
      {
        name: 'Standard',
        price: 100,
        maxTickets: 400,
        maxPerUser: 2,
        soldCount: 280
      },
      {
        name: 'VIP',
        price: 250,
        maxTickets: 100,
        maxPerUser: 2,
        soldCount: 40
      }
    ]
  },
  {
    id: 'championship-final',
    title: 'Gaming Championship Final',
    description: 'The ultimate esports showdown featuring top gamers competing for the championship title and massive prize pool.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Gaming',
    date: '2024-05-01',
    time: '06:00 PM',
    location: 'Elite Gaming Arena',
    locationAddress: '999 Esports Avenue, Gaming District, Seattle, WA 98101',
    price: 50,
    maxCapacity: 2000,
    totalRegistrations: 1650,
    standardPrice: 50,
    vipPrice: 150,
    organizer: {
      name: 'Ryan Thompson',
      organizationName: 'Elite Gaming League'
    },
    ticketTypes: [
      {
        name: 'Standard',
        price: 50,
        maxTickets: 1500,
        maxPerUser: 4,
        soldCount: 1200
      },
      {
        name: 'VIP',
        price: 150,
        maxTickets: 500,
        maxPerUser: 2,
        soldCount: 450
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const eventId = searchParams.get('id')

    // If requesting a specific event by ID
    if (eventId) {
      // First check static events
      const staticEvent = staticEvents.find(event => event.id === eventId)
      if (staticEvent) {
        return NextResponse.json({ event: staticEvent }, { status: 200 })
      }

      // Then check MongoDB events
      let mongoEvent
      try {
        // Try finding by _id (for ObjectId)
        mongoEvent = await Event.findById(eventId)
      } catch (error) {
        // If that fails, it might be a string ID, try exact match
        mongoEvent = await Event.findOne({ _id: eventId })
      }
      
      if (mongoEvent && mongoEvent.isPublished) {
        // Transform MongoDB event to match frontend structure
        const transformedEvent = {
          id: mongoEvent._id.toString(),
          title: mongoEvent.name,
          description: mongoEvent.description,
          image: mongoEvent.coverImage || '/api/placeholder/400/300',
          category: mongoEvent.category,
          date: mongoEvent.startDate.toISOString().split('T')[0],
          time: mongoEvent.startDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          location: mongoEvent.location.name,
          locationAddress: mongoEvent.location.address,
          locationCoordinates: mongoEvent.location.coordinates,
          price: mongoEvent.ticketTypes[0]?.price || 0,
          maxCapacity: mongoEvent.maxCapacity,
          totalRegistrations: mongoEvent.totalRegistrations,
          startDate: mongoEvent.startDate,
          endDate: mongoEvent.endDate,
          registrationStart: mongoEvent.registrationStart,
          registrationEnd: mongoEvent.registrationEnd,
          ticketTypes: mongoEvent.ticketTypes,
          customQuestions: mongoEvent.customQuestions,
          organizer: mongoEvent.organizer,
          isMongoEvent: true
        }
        
        return NextResponse.json({ event: transformedEvent }, { status: 200 })
      }

      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Fetch published MongoDB events
    const mongoEvents = await Event.find({ isPublished: true })
      .sort({ startDate: 1 })

    // Fetch organizer details for each event
    const transformedMongoEvents = await Promise.all(
      mongoEvents.map(async (event) => {
        let organizerInfo = null
        try {
          if (event.organizer) {
            organizerInfo = await Organizer.findById(event.organizer).select('name organizationName')
          }
        } catch (err) {
          console.log('Error fetching organizer:', err)
        }

        return {
          id: event._id.toString(),
          title: event.name,
          description: event.description,
          image: event.coverImage || '/api/placeholder/400/300',
          category: event.category,
          date: event.startDate.toISOString().split('T')[0],
          time: event.startDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          location: event.location.name,
          locationAddress: event.location.address,
          locationCoordinates: event.location.coordinates,
          price: event.ticketTypes[0]?.price || 0,
          maxCapacity: event.maxCapacity,
          totalRegistrations: event.totalRegistrations,
          startDate: event.startDate,
          endDate: event.endDate,
          registrationStart: event.registrationStart,
          registrationEnd: event.registrationEnd,
          ticketTypes: event.ticketTypes,
          customQuestions: event.customQuestions,
          organizer: organizerInfo,
          isMongoEvent: true
        }
      })
    )

    // Only include static events that have working detail pages (none currently)
    // For now, we'll exclude static events since they don't have detail pages
    // let allEvents = [...staticEvents, ...transformedMongoEvents]
    let allEvents = [...transformedMongoEvents]
    
    // Add isMongoEvent flag to indicate these have working detail pages
    allEvents = allEvents.map(event => ({ ...event, isMongoEvent: true }))

    // Apply filters
    if (category && category !== 'all') {
      allEvents = allEvents.filter(event => 
        event.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (search) {
      const searchLower = search.toLowerCase()
      allEvents = allEvents.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      )
    }

    // Sort by date
    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ events: allEvents }, { status: 200 })

  } catch (error) {
    console.error('Fetch events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
