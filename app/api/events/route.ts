import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/lib/models/Event'
import Organizer from '@/lib/models/Organizer'

// Static events data (you can move this to a separate file if needed)
const staticEvents = [
  {
    id: '1',
    title: 'Digital Innovation Summit 2024',
    description: 'Join industry leaders as we explore the future of digital transformation, artificial intelligence, and emerging technologies that are reshaping business landscapes worldwide.',
    image: '/api/placeholder/400/300',
    category: 'Tech Conference',
    date: '2024-03-15',
    time: '09:00 AM',
    location: 'Convention Center, Downtown',
    price: 150,
    maxCapacity: 500,
    totalRegistrations: 347
  },
  {
    id: '2',
    title: 'Creative Arts Workshop',
    description: 'An immersive workshop covering various art forms including painting, sculpture, and digital arts. Perfect for beginners and intermediate artists looking to expand their skills.',
    image: '/api/placeholder/400/300',
    category: 'Workshop',
    date: '2024-03-20',
    time: '02:00 PM',
    location: 'Arts Center, Cultural District',
    price: 80,
    maxCapacity: 50,
    totalRegistrations: 23
  },
  {
    id: '3',
    title: 'Food & Wine Festival',
    description: 'Celebrate culinary excellence with renowned chefs, wine tastings, cooking demonstrations, and gourmet food stalls featuring local and international cuisines.',
    image: '/api/placeholder/400/300',
    category: 'Food & Drink',
    date: '2024-03-25',
    time: '12:00 PM',
    location: 'Riverside Park',
    price: 45,
    maxCapacity: 1000,
    totalRegistrations: 756
  },
  {
    id: '4',
    title: 'Startup Pitch Competition',
    description: 'Watch the next generation of entrepreneurs present their innovative ideas to a panel of investors and industry experts. Network with startups and potential partners.',
    image: '/api/placeholder/400/300',
    category: 'Business',
    date: '2024-04-02',
    time: '06:00 PM',
    location: 'Innovation Hub',
    price: 25,
    maxCapacity: 200,
    totalRegistrations: 156
  },
  {
    id: '5',
    title: 'Classical Music Concert',
    description: 'An evening of beautiful classical compositions performed by the City Symphony Orchestra, featuring works by Mozart, Beethoven, and contemporary composers.',
    image: '/api/placeholder/400/300',
    category: 'Music',
    date: '2024-04-10',
    time: '07:30 PM',
    location: 'Grand Theater',
    price: 75,
    maxCapacity: 800,
    totalRegistrations: 234
  },
  {
    id: '6',
    title: 'Fitness Bootcamp Weekend',
    description: 'A high-energy fitness weekend featuring various workout styles, nutrition workshops, and wellness sessions led by certified trainers and health experts.',
    image: '/api/placeholder/400/300',
    category: 'Health & Fitness',
    date: '2024-04-15',
    time: '08:00 AM',
    location: 'Sports Complex',
    price: 120,
    maxCapacity: 150,
    totalRegistrations: 89
  }
]

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
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
      const mongoEvent = await Event.findById(eventId)
      
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
