'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TicketBooking } from '@/components/ticket-booking'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Ticket,
  Trophy,
  UserX
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface EventDetails {
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
  startDate?: string
  endDate?: string
  registrationStart?: string
  registrationEnd?: string
  organizer?: {
    name: string
    organizationName: string
  }
  ticketTypes?: Array<{
    name: string
    price: number
    maxTickets: number
    maxPerUser: number
    salesStart: string
    salesEnd: string
    soldCount: number
  }>
  customQuestions?: Array<{
    id: string
    question: string
    type: string
    required: boolean
    options: string[]
  }>
  isMongoEvent?: boolean
}

export default function EventDetailsPage() {
  const params = useParams()
  const eventId = params?.id as string
  const { isSignedIn, isLoaded } = useUser()
  
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTicketBooking, setShowTicketBooking] = useState(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return

      try {
        setLoading(true)
        const response = await fetch(`/api/events?id=${eventId}`)
        
        if (!response.ok) {
          throw new Error('Event not found')
        }
        
        const data = await response.json()
        setEvent(data.event)
      } catch (err: any) {
        console.error('Error fetching event:', err)
        setError(err.message || 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  // Add default pricing if not provided
  const eventWithPricing = event ? {
    ...event,
    standardPrice: event.ticketTypes?.[0]?.price ?? (event.price === 0 ? 0 : event.price || 25),
    vipPrice: event.ticketTypes?.[1]?.price ?? (event.price === 0 ? 0 : (event.price ? event.price * 2 : 75))
  } : null

  const handleBookTickets = () => {
    if (!isLoaded) {
      // Still loading auth state, do nothing
      return
    }
    
    if (!isSignedIn) {
      // User is not signed in, show sign-in prompt
      setShowSignInPrompt(true)
      return
    }
    
    // User is signed in, proceed with booking
    setShowTicketBooking(true)
  }

  const handleCloseTicketBooking = () => {
    setShowTicketBooking(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-cyber-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Loading event...</h3>
              <p className="text-white/60">Please wait while we fetch event details</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show ticket booking popup
  if (showTicketBooking && eventWithPricing) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <Navbar />
        <TicketBooking
          event={eventWithPricing}
          isOpen={showTicketBooking}
          onClose={() => setShowTicketBooking(false)}
        />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-white mb-4">Event not found</h3>
              <p className="text-white/60 mb-6">{error || 'The event you are looking for does not exist.'}</p>
              <Link href="/events">
                <Button variant="cyber">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <main className="pt-20">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/events">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Event Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-cyber-blue/20 border-cyber-blue text-cyber-blue">
                      {event.category}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                    {event.title}
                  </h1>
                  
                  <p className="text-cyber-blue text-lg font-medium mb-4">
                    Organized by {event.organizer?.organizationName || event.organizer?.name || 'Elite Events'}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="event-card">
                    <CardHeader>
                      <h2 className="text-2xl font-bold text-white">About This Event</h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="event-card">
                    <CardHeader>
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <MapPin className="h-6 w-6 mr-2 text-cyber-green" />
                        Location
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-white font-medium">{event.location}</p>
                        {event.locationAddress && (
                          <p className="text-white/60">{event.locationAddress}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Ticket Types */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="event-card">
                    <CardHeader>
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <DollarSign className="h-6 w-6 mr-2 text-cyber-blue" />
                        Tickets Available
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Standard Ticket */}
                        <div className="border border-white/20 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <Ticket className="h-5 w-5 mr-2 text-cyber-blue" />
                              <h3 className="text-white font-medium">Standard Ticket</h3>
                            </div>
                            <span className="text-cyber-blue font-bold">
                              {eventWithPricing?.standardPrice === 0 ? 'Free' : `$${eventWithPricing?.standardPrice}`}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">
                            General admission with standard access to the event
                          </p>
                        </div>

                        {/* VIP Ticket */}
                        <div className="border border-yellow-400/30 rounded-lg p-4 bg-yellow-400/5">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                              <h3 className="text-white font-medium">VIP Ticket</h3>
                              <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                Premium
                              </Badge>
                            </div>
                            <span className="text-yellow-400 font-bold">
                              {eventWithPricing?.vipPrice === 0 ? 'Free' : `$${eventWithPricing?.vipPrice}`}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">
                            Premium access with exclusive perks and priority seating
                          </p>
                        </div>
                        
                        {/* Legacy ticket types display */}
                        {event.ticketTypes && event.ticketTypes.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold text-white mb-3">Additional Ticket Information</h4>
                            {event.ticketTypes.map((ticket, index) => (
                              <div key={index} className="border border-white/10 rounded-lg p-3 mb-2">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-white/80 text-sm">{ticket.name}</span>
                                  <span className="text-white/80 text-sm">${ticket.price}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-white/60">
                                  <div>Available: {ticket.maxTickets - ticket.soldCount}</div>
                                  <div>Max per person: {ticket.maxPerUser}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Event Details */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="event-card sticky top-24">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-white">Event Details</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Date & Time */}
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-cyber-blue mt-1" />
                        <div>
                          <div className="text-white font-medium">
                            {formatDate(event.date)}
                          </div>
                          <div className="text-white/60 text-sm">
                            {formatTime(event.time)}
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      {event.endDate && (
                        <div className="flex items-start space-x-3">
                          <Clock className="h-5 w-5 text-cyber-pink mt-1" />
                          <div>
                            <div className="text-white font-medium">Duration</div>
                            <div className="text-white/60 text-sm">
                              Until {formatDate(event.endDate)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-cyber-green mt-1" />
                        <div>
                          <div className="text-white font-medium">{event.location}</div>
                          {event.locationAddress && (
                            <div className="text-white/60 text-sm">
                              {event.locationAddress}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Capacity */}
                      {event.maxCapacity && (
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-cyber-purple mt-1" />
                          <div>
                            <div className="text-white font-medium">Capacity</div>
                            <div className="text-white/60 text-sm">
                              {event.totalRegistrations || 0} / {event.maxCapacity} registered
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator className="bg-white/20" />

                      {/* Book Tickets Button */}
                      <Button 
                        variant="cyber" 
                        className="w-full" 
                        size="lg" 
                        onClick={handleBookTickets}
                        disabled={!isLoaded}
                      >
                        {!isLoaded ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Ticket className="h-4 w-4 mr-2" />
                            Book Tickets
                          </>
                        )}
                      </Button>
                      
                      <p className="text-white/60 text-xs text-center">
                        Registration closes on {formatDate(event.registrationEnd || event.date)}
                      </p>
                      
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
            </div>
          </div>
        </section>
      </main>
      
      {/* Sign-In Prompt Dialog */}
      <Dialog open={showSignInPrompt} onOpenChange={setShowSignInPrompt}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-sm border border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center text-white">
              <UserX className="h-5 w-5 mr-2 text-cyber-blue" />
              Sign In Required
            </DialogTitle>
            <DialogDescription className="text-white/70">
              You need to be signed in to book tickets for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowSignInPrompt(false)}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Link href="/sign-in" className="flex-1">
              <Button variant="cyber" className="w-full">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
