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

interface Event {
  _id: string
  name: string
  description: string
  category: string
  startDate: string
  endDate: string
  location: {
    name: string
    address: string
  }
  ticketTypes: Array<{
    name: string
    price: number
    maxTickets: number
    soldCount: number
  }>
  totalRegistrations: number
  maxCapacity: number
  isPublished: boolean
  coverImage?: string
  organizer: string
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
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    // Only show published events
    filtered = filtered.filter(event => event.isPublished)

    setFilteredEvents(filtered)
  }

  const categories = [...new Set(events.map(event => event.category))].filter(Boolean)

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
              {filteredEvents.map((event) => (
                <Card key={event._id} className="glassmorphism h-full">
                  <CardContent className="p-6">
                    {/* Event Image */}
                    {event.coverImage && (
                      <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                        <img
                          src={event.coverImage}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge 
                          className="absolute top-2 right-2 bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30"
                        >
                          {event.category}
                        </Badge>
                      </div>
                    )}

                    {/* Event Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {event.name}
                      </h3>
                      <p className="text-white/70 text-sm line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center text-white/60">
                        <Clock className="h-4 w-4 mr-2 text-cyber-blue" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-white/60">
                        <MapPin className="h-4 w-4 mr-2 text-cyber-pink" />
                        {event.location.name}
                      </div>
                      <div className="flex items-center text-white/60">
                        <Users className="h-4 w-4 mr-2 text-cyber-green" />
                        {event.totalRegistrations}/{event.maxCapacity} registered
                      </div>
                    </div>

                    {/* Price Range */}
                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center text-white/60 text-sm">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {event.ticketTypes.length === 1 
                            ? `$${event.ticketTypes[0].price}`
                            : `$${Math.min(...event.ticketTypes.map(t => t.price))} - $${Math.max(...event.ticketTypes.map(t => t.price))}`
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
                    <Link href={`/events/details/${event._id}`}>
                      <Button variant="cyber" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
