import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/lib/models/Event'
import Organizer from '@/lib/models/Organizer'

// Sample organizers
const sampleOrganizers = [
  {
    name: 'John Smith',
    email: 'john.smith@college.edu',
    password: 'password123',
    organizationName: 'Tech Club',
    phone: '+1234567890',
    website: 'https://techclub.college.edu',
    description: 'Leading technology and innovation events at the college',
    isVerified: true
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@college.edu',
    password: 'password123',
    organizationName: 'Arts Society',
    phone: '+1234567891',
    website: 'https://arts.college.edu',
    description: 'Promoting arts and culture through creative events',
    isVerified: true
  },
  {
    name: 'Mike Davis',
    email: 'mike.davis@college.edu',
    password: 'password123',
    organizationName: 'Business Association',
    phone: '+1234567892',
    website: 'https://business.college.edu',
    description: 'Connecting students with business opportunities',
    isVerified: true
  }
]

// Function to get sample events with organizer IDs
const getSampleEvents = (organizerIds: any[]) => [
  {
    organizer: organizerIds[0],
    name: 'AI & Machine Learning Workshop',
    description: 'Learn the fundamentals of artificial intelligence and machine learning with hands-on projects and expert guidance. This comprehensive workshop covers neural networks, data preprocessing, and practical ML applications.',
    category: 'technical',
    startDate: new Date('2024-09-15T10:00:00Z'),
    endDate: new Date('2024-09-15T16:00:00Z'),
    registrationStart: new Date('2024-08-15T00:00:00Z'),
    registrationEnd: new Date('2024-09-14T23:59:59Z'),
    location: {
      name: 'Computer Science Building',
      address: '123 University Ave, Campus',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    ticketTypes: [
      {
        name: 'Regular',
        price: 25,
        maxTickets: 50,
        maxPerUser: 2,
        salesStart: new Date('2024-08-15T00:00:00Z'),
        salesEnd: new Date('2024-09-14T23:59:59Z'),
        soldCount: 0
      }
    ],
    customQuestions: [
      {
        id: 'experience',
        question: 'What is your experience level with AI/ML?',
        type: 'select',
        required: true,
        options: ['Beginner', 'Intermediate', 'Advanced']
      }
    ],
    isPublished: true,
    totalRegistrations: 0,
    maxCapacity: 50
  },
  {
    organizer: organizerIds[1],
    name: 'Annual Art Exhibition',
    description: 'Showcase of student artwork featuring paintings, sculptures, digital art, and mixed media. Join us for an evening of creativity and artistic expression.',
    category: 'entertainment',
    startDate: new Date('2024-09-20T18:00:00Z'),
    endDate: new Date('2024-09-20T22:00:00Z'),
    registrationStart: new Date('2024-08-20T00:00:00Z'),
    registrationEnd: new Date('2024-09-19T23:59:59Z'),
    location: {
      name: 'Art Gallery',
      address: '456 Creative Blvd, Campus',
      coordinates: {
        lat: 40.7589,
        lng: -73.9851
      }
    },
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    ticketTypes: [
      {
        name: 'General Admission',
        price: 0,
        maxTickets: 200,
        maxPerUser: 4,
        salesStart: new Date('2024-08-20T00:00:00Z'),
        salesEnd: new Date('2024-09-19T23:59:59Z'),
        soldCount: 0
      }
    ],
    customQuestions: [
      {
        id: 'interest',
        question: 'Which art form interests you most?',
        type: 'select',
        required: false,
        options: ['Painting', 'Sculpture', 'Digital Art', 'Photography', 'Mixed Media']
      }
    ],
    isPublished: true,
    totalRegistrations: 0,
    maxCapacity: 200
  },
  {
    organizer: organizerIds[2],
    name: 'Startup Pitch Competition',
    description: 'Watch innovative student startups pitch their ideas to industry experts and investors. Network with entrepreneurs and learn about the startup ecosystem.',
    category: 'business',
    startDate: new Date('2024-09-25T14:00:00Z'),
    endDate: new Date('2024-09-25T18:00:00Z'),
    registrationStart: new Date('2024-08-25T00:00:00Z'),
    registrationEnd: new Date('2024-09-24T23:59:59Z'),
    location: {
      name: 'Innovation Center',
      address: '789 Business Park, Campus',
      coordinates: {
        lat: 40.7505,
        lng: -73.9934
      }
    },
    coverImage: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
    ticketTypes: [
      {
        name: 'Student',
        price: 10,
        maxTickets: 80,
        maxPerUser: 1,
        salesStart: new Date('2024-08-25T00:00:00Z'),
        salesEnd: new Date('2024-09-24T23:59:59Z'),
        soldCount: 0
      },
      {
        name: 'General',
        price: 20,
        maxTickets: 20,
        maxPerUser: 2,
        salesStart: new Date('2024-08-25T00:00:00Z'),
        salesEnd: new Date('2024-09-24T23:59:59Z'),
        soldCount: 0
      }
    ],
    customQuestions: [
      {
        id: 'background',
        question: 'Are you an entrepreneur or interested in starting a business?',
        type: 'select',
        required: true,
        options: ['Yes, I have a startup', 'Yes, I want to start one', 'No, just interested in learning']
      }
    ],
    isPublished: true,
    totalRegistrations: 0,
    maxCapacity: 100
  },
  {
    organizer: organizerIds[0],
    name: 'Cybersecurity Workshop',
    description: 'Learn essential cybersecurity skills including ethical hacking, network security, and digital forensics. Perfect for students interested in cybersecurity careers.',
    category: 'technical',
    startDate: new Date('2024-10-05T13:00:00Z'),
    endDate: new Date('2024-10-05T17:00:00Z'),
    registrationStart: new Date('2024-09-05T00:00:00Z'),
    registrationEnd: new Date('2024-10-04T23:59:59Z'),
    location: {
      name: 'Security Lab',
      address: '321 Tech Center, Campus',
      coordinates: {
        lat: 40.7614,
        lng: -73.9776
      }
    },
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    ticketTypes: [
      {
        name: 'Workshop Pass',
        price: 15,
        maxTickets: 30,
        maxPerUser: 1,
        salesStart: new Date('2024-09-05T00:00:00Z'),
        salesEnd: new Date('2024-10-04T23:59:59Z'),
        soldCount: 0
      }
    ],
    customQuestions: [
      {
        id: 'programming',
        question: 'Do you have programming experience?',
        type: 'select',
        required: true,
        options: ['Yes, experienced', 'Some experience', 'No experience']
      }
    ],
    isPublished: true,
    totalRegistrations: 0,
    maxCapacity: 30
  },
  {
    organizer: organizerIds[1],
    name: 'Music Concert Night',
    description: 'An evening of live music featuring student bands and solo artists from various genres. Come enjoy great music and support your fellow students.',
    category: 'entertainment',
    startDate: new Date('2024-10-12T19:00:00Z'),
    endDate: new Date('2024-10-12T23:00:00Z'),
    registrationStart: new Date('2024-09-12T00:00:00Z'),
    registrationEnd: new Date('2024-10-11T23:59:59Z'),
    location: {
      name: 'Main Auditorium',
      address: '100 Main Campus Dr, Campus',
      coordinates: {
        lat: 40.7282,
        lng: -74.0776
      }
    },
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    ticketTypes: [
      {
        name: 'General Admission',
        price: 5,
        maxTickets: 300,
        maxPerUser: 4,
        salesStart: new Date('2024-09-12T00:00:00Z'),
        salesEnd: new Date('2024-10-11T23:59:59Z'),
        soldCount: 0
      }
    ],
    customQuestions: [
      {
        id: 'music_preference',
        question: 'What type of music do you prefer?',
        type: 'select',
        required: false,
        options: ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip-hop']
      }
    ],
    isPublished: true,
    totalRegistrations: 0,
    maxCapacity: 300
  },
  {
    organizer: organizerIds[2],
    name: 'Digital Marketing Seminar',
    description: 'Learn modern digital marketing strategies including social media marketing, SEO, content creation, and analytics. Industry experts will share practical insights.',
    category: 'business',
    startDate: new Date('2024-10-18T14:00:00Z'),
    endDate: new Date('2024-10-18T17:00:00Z'),
    registrationStart: new Date('2024-09-18T00:00:00Z'),
    registrationEnd: new Date('2024-10-17T23:59:59Z'),
    location: {
      name: 'Business Center',
      address: '500 Marketing Ave, Campus',
      coordinates: {
        lat: 40.7480,
        lng: -73.9857
      }
    },
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    ticketTypes: [
      {
        name: 'Student Pass',
        price: 12,
        maxTickets: 120,
        maxPerUser: 1,
        salesStart: new Date('2024-09-18T00:00:00Z'),
        salesEnd: new Date('2024-10-17T23:59:59Z'),
        soldCount: 0
      }
    ],
    customQuestions: [
      {
        id: 'interest_area',
        question: 'Which area of digital marketing interests you most?',
        type: 'select',
        required: true,
        options: ['Social Media', 'SEO', 'Content Marketing', 'Email Marketing', 'Analytics']
      }
    ],
    isPublished: true,
    totalRegistrations: 0,
    maxCapacity: 120
  }
]

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Clear existing data
    await Event.deleteMany({})
    await Organizer.deleteMany({})

    // Create organizers
    const createdOrganizers = await Organizer.insertMany(sampleOrganizers)
    console.log(`Created ${createdOrganizers.length} organizers`)

    // Get organizer IDs
    const organizerIds = createdOrganizers.map(org => org._id)

    // Create events
    const sampleEvents = getSampleEvents(organizerIds)
    const createdEvents = await Event.insertMany(sampleEvents)
    console.log(`Created ${createdEvents.length} events`)

    return NextResponse.json({ 
      success: true,
      message: 'Database populated successfully!',
      data: {
        organizers: createdOrganizers.length,
        events: createdEvents.length,
        eventsList: createdEvents.map(event => ({
          id: event._id,
          name: event.name,
          category: event.category,
          startDate: event.startDate
        }))
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error populating database:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to populate database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
