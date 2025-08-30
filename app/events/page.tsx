'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Calendar, Clock, MapPin, Users, Loader2 } from 'lucide-react'
import { formatDate, formatTime, getBadgeColor, getRegistrationProgress } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  image: string
  category: string
  date: string
  time: string
  location: string
  locationAddress?: string
  locationCoordinates?: { lat: number, lng: number }
  price: number
  maxCapacity?: number
  totalRegistrations?: number
  venue?: string
  organizer?: {
    name: string
    organizationName: string
  }
  ticketTypes?: any[]
  customQuestions?: any[]
  isMongoEvent?: boolean
  badges?: string[]
  maxParticipants?: number
  registeredCount?: number
  currentParticipants?: number
  categoryId?: string
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/events')
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const data = await response.json()
        setEvents(data.events || [])
      } catch (err: any) {
        console.error('Error fetching events:', err)
        setError(err.message || 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Filter events based on search and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           event.category.toLowerCase().includes(selectedCategory.toLowerCase())
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-white">All </span>
                <span className="gradient-text">Events</span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Discover all the amazing events happening around you
              </p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search events, clubs, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                  <TabsList className="grid w-full grid-cols-5 bg-white/10 border border-white/20">
                    <TabsTrigger value="all" className="data-[state=active]:bg-cyber-blue">All</TabsTrigger>
                    <TabsTrigger value="technical" className="data-[state=active]:bg-cyber-blue">Technical</TabsTrigger>
                    <TabsTrigger value="entertainment" className="data-[state=active]:bg-cyber-pink">Entertainment</TabsTrigger>
                    <TabsTrigger value="business" className="data-[state=active]:bg-cyber-purple">Business</TabsTrigger>
                    <TabsTrigger value="sports" className="data-[state=active]:bg-cyber-green">Sports</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Loader2 className="h-12 w-12 animate-spin text-cyber-blue mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Loading events...</h3>
                <p className="text-white/60">Please wait while we fetch the latest events</p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Error loading events</h3>
                <p className="text-white/60">{error}</p>
                <Button 
                  variant="cyber" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </motion.div>
            ) : filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-4">No events found</h3>
                <p className="text-white/60">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="group event-card h-full overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {event.badges?.map((badge: string) => (
                            <Badge
                              key={badge}
                              className={`${getBadgeColor(badge)} text-xs font-medium`}
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge variant="outline" className="bg-black/50 border-white/20 text-white">
                            {event.category}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Event Title & Club */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyber-blue transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-cyber-blue text-sm font-medium">
                            {event.organizer?.organizationName || event.organizer?.name || 'Elite Events'}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-white/70 mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        {/* Event Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-white/60 text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-cyber-blue" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center text-white/60 text-sm">
                            <Clock className="h-4 w-4 mr-2 text-cyber-pink" />
                            {formatTime(event.time)}
                          </div>
                          <div className="flex items-center text-white/60 text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-cyber-green" />
                            {event.venue || event.location}
                          </div>
                        </div>

                        {/* Registration Progress */}
                        {event.maxParticipants && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-white/60 flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Registration
                              </span>
                              <span className="text-white">
                                {event.registeredCount || event.currentParticipants}/{event.maxParticipants}
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyber-blue to-cyber-pink h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${getRegistrationProgress(
                                    (event.registeredCount || event.currentParticipants || 0),
                                    event.maxParticipants
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <Link href={event.isMongoEvent ? `/events/details/${event.id}` : `/events/${event.categoryId}/${event.id}`}>
                          <Button variant="cyber" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
