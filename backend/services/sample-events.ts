export const sampleEvents = [
  {
    id: 'tech-summit-2024',
    title: 'Tech Summit 2024',
    description: 'Join us for an exciting day of technology talks, workshops, and networking. Learn about the latest trends in AI, blockchain, and software development from industry experts.',
    image: '/api/placeholder/800/400',
    category: 'Technical',
    date: '2024-02-15',
    time: '09:00 AM',
    venue: 'Convention Center',
    location: 'San Francisco, CA',
    standardPrice: 50,
    vipPrice: 150,
    maxParticipants: 500,
    currentParticipants: 123,
    organizer: {
      name: 'Tech Events Inc.',
      organizationName: 'Elite Events Platform'
    },
    badges: ['Popular', 'Limited Seats'],
    registrationLink: 'https://example.com/register'
  },
  {
    id: 'music-festival-2024',
    title: 'Summer Music Festival',
    description: 'Experience the best of summer with top artists performing live. A full day of music, food, and entertainment for the whole family.',
    image: '/api/placeholder/800/400',
    category: 'Entertainment',
    date: '2024-07-20',
    time: '02:00 PM',
    venue: 'Central Park',
    location: 'New York, NY',
    standardPrice: 75,
    vipPrice: 200,
    maxParticipants: 1000,
    currentParticipants: 456,
    organizer: {
      name: 'Music Events Co.',
      organizationName: 'Elite Events Platform'
    },
    badges: ['Hot', 'Outdoor'],
    registrationLink: 'https://example.com/register'
  },
  {
    id: 'startup-pitch-2024',
    title: 'Startup Pitch Competition',
    description: 'Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs and learn about the latest business trends.',
    image: '/api/placeholder/800/400',
    category: 'Business',
    date: '2024-03-10',
    time: '06:00 PM',
    venue: 'Business Center',
    location: 'Austin, TX',
    standardPrice: 25,
    vipPrice: 75,
    maxParticipants: 200,
    currentParticipants: 89,
    organizer: {
      name: 'Startup Hub',
      organizationName: 'Elite Events Platform'
    },
    badges: ['Networking', 'Investment'],
    registrationLink: 'https://example.com/register'
  },
  {
    id: 'community-workshop-2024',
    title: 'Community Development Workshop',
    description: 'Free workshop for community members to learn new skills and connect with neighbors. Topics include sustainability, volunteering, and local initiatives.',
    image: '/api/placeholder/800/400',
    category: 'Community',
    date: '2024-04-05',
    time: '10:00 AM',
    venue: 'Community Hall',
    location: 'Portland, OR',
    standardPrice: 0,
    vipPrice: 0,
    maxParticipants: 100,
    currentParticipants: 34,
    organizer: {
      name: 'Community Outreach',
      organizationName: 'Elite Events Platform'
    },
    badges: ['Free', 'Community'],
    registrationLink: 'https://example.com/register'
  }
]

export const getEventById = (id: string) => {
  return sampleEvents.find(event => event.id === id)
}

export const getAllEvents = () => {
  return sampleEvents
}
