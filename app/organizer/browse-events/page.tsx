'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin,
  Clock,
  Eye,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'

// Helper function to get appropriate cover image based on category
const getCoverImageForCategory = (category: string, existingImage?: string): string => {
  if (existingImage && existingImage.trim() !== '') {
    return existingImage
  }
  
  const categoryImages: Record<string, string> = {
    'comedy': 'https://images.unsplash.com/photo-1585699244537-6dd558d97da3?w=800&h=400&fit=crop&crop=center',
    'stand-up-comedy': 'https://images.unsplash.com/photo-1585699244537-6dd558d97da3?w=800&h=400&fit=crop&crop=center',
    'music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&crop=center',
    'concert': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&crop=center',
    'tech': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center',
    'technical': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center',
    'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center',
    'workshop': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop&crop=center',
    'conference': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop&crop=center',
    'business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop&crop=center',
    'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center',
    'art': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop&crop=center',
    'culture': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop&crop=center',
    'food': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop&crop=center',
    'networking': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop&crop=center'
  }
  
  const normalizedCategory = category.toLowerCase().replace(/[\s-_]+/g, '-')
  return categoryImages[normalizedCategory] || categoryImages['conference'] || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop&crop=center'
}

interface Event {
  id: string
  _id?: string
  title?: string
  name?: string
  description: string
  category: string
  date?: string
  startDate?: string
  endDate?: string
  time?: string
  location: string | {
    name: string
    address: string
  }
  price?: number
  ticketTypes?: Array<{
    name: string
    price: number
    maxTickets: number
    soldCount: number
  }>
  totalRegistrations: number
  maxCapacity: number
  isPublished?: boolean
  coverImage?: string
  image?: string
  organizer?: any
  isMongoEvent?: boolean
}

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const router = useRouter()

  useEffect(() => {
    // Check if organizer is logged in
    const organizerData = localStorage.getItem('organizer')
    if (!organizerData) {
      router.push('/organizer/signin')
      return
    }

    fetchAllEvents()
  }, [router])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, selectedCategory])

  const fetchAllEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error('Failed to fetch events')
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => {
        const eventName = event.title || event.name || ''
        const eventLocation = typeof event.location === 'string' 
          ? event.location 
          : event.location?.name || ''
        
        return eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               eventLocation.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    // Only show published events (API already filters for published events)
    // filtered = filtered.filter(event => event.isPublished !== false)

    setFilteredEvents(filtered)
  }

  const categories = Array.from(new Set(events.map(event => event.category))).filter(Boolean)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="cyber-spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold gradient-text">Browse All Events</h1>
                <p className="text-white/60 text-sm">Discover events happening in your area</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-white/60" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {filteredEvents.length} Events Found
            </h2>
            <p className="text-white/60">
              {selectedCategory !== 'all' && `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} events`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {filteredEvents.length === 0 ? (
            <Card className="glassmorphism">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No events found
                </h3>
                <p className="text-white/60 mb-6">
                  Try adjusting your search criteria to find more events
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const eventName = event.title || event.name || 'Untitled Event'
                const eventDate = event.date || event.startDate
                const eventLocation = typeof event.location === 'string' 
                  ? event.location 
                  : event.location?.name || 'Location TBD'
                const eventImage = event.image || event.coverImage
                const eventId = event.id || event._id
                
                return (
                <Card key={eventId} className="glassmorphism h-full">
                  <CardContent className="p-6">
                    {/* Event Image */}
                    <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={getCoverImageForCategory(event.category, eventImage)}
                        alt={eventName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge 
                        className="absolute top-2 right-2 bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30"
                      >
                        {event.category}
                      </Badge>
                    </div>

                    {/* Event Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {eventName}
                      </h3>
                      <p className="text-white/70 text-sm line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center text-white/60">
                        <Clock className="h-4 w-4 mr-2 text-cyber-blue" />
                        {eventDate ? new Date(eventDate).toLocaleDateString() : 'Date TBD'}
                        {event.time && ` at ${event.time}`}
                      </div>
                      <div className="flex items-center text-white/60">
                        <MapPin className="h-4 w-4 mr-2 text-cyber-pink" />
                        {eventLocation}
                      </div>
                      <div className="flex items-center text-white/60">
                        <Users className="h-4 w-4 mr-2 text-cyber-green" />
                        {event.totalRegistrations || 0}/{event.maxCapacity} registered
                      </div>
                    </div>

                    {/* Price Range */}
                    {((event.ticketTypes && event.ticketTypes.length > 0) || event.price) && (
                      <div className="mb-4">
                        <div className="flex items-center text-white/60 text-sm">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {event.ticketTypes && event.ticketTypes.length > 0
                            ? (event.ticketTypes.length === 1 
                                ? `$${event.ticketTypes[0].price}`
                                : `$${Math.min(...event.ticketTypes.map(t => t.price))} - $${Math.max(...event.ticketTypes.map(t => t.price))}`)
                            : `$${event.price || 0}`
                          }
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyber-blue to-cyber-pink h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${event.maxCapacity > 0 ? ((event.totalRegistrations || 0) / event.maxCapacity) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        {event.maxCapacity > 0 ? Math.round(((event.totalRegistrations || 0) / event.maxCapacity) * 100) : 0}% full
                      </p>
                    </div>

                    {/* Action Button */}
                    <Link href={`/events/details/${eventId}`}>
                      <Button variant="cyber" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
