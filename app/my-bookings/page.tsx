'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Download,
  Ticket,
  Mail,
  Phone,
  QrCode,
  ArrowLeft,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface BookingData {
  _id: string
  bookingId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  eventImage?: string
  totalAmount: number
  status: 'confirmed' | 'pending' | 'cancelled'
  tickets: {
    standard: number
    vip: number
  }
  attendees: Array<{
    name: string
    email: string
    phone: string
    gender: string
    ticketType: 'standard' | 'vip'
  }>
  paymentDetails: {
    transactionId: string
    paymentMethod: string
    timestamp: string
  }
  qrCodes?: Array<{
    attendeeName: string
    qrCode: string
    ticketNumber: string
  }>
  createdAt: string
}

export default function MyBookingsPage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch user's real bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      if (!isSignedIn || !user) return
      
      try {
        setLoading(true)
        setError('')
        
        const response = await fetch('/api/bookings')
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }
        
        const data = await response.json()
        setBookings(data.bookings || [])
        
      } catch (err: any) {
        console.error('Error fetching bookings:', err)
        setError(err.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [isSignedIn, user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Ticket className="h-16 w-16 text-cyber-blue mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
              <p className="text-white/60 mb-8">Please sign in to view your bookings</p>
              <Link href="/sign-in">
                <Button variant="cyber" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const downloadTickets = async (booking: BookingData) => {
    try {
      // In a real app, this would fetch the PDF from storage or regenerate it
      console.log(`Downloading tickets for booking: ${booking.bookingId}`)
      
      // For now, show a toast with booking info
      alert(`Download would start for:\nBooking ID: ${booking.bookingId}\nEvent: ${booking.eventTitle}\nTickets: ${booking.tickets.standard + booking.tickets.vip}`)
      
    } catch (error) {
      console.error('Error downloading tickets:', error)
      alert('Failed to download tickets. Please try again.')
    }
  }
  
  const showQRCodes = (booking: BookingData) => {
    if (booking.qrCodes && booking.qrCodes.length > 0) {
      // In a real app, this would open a modal with QR codes
      alert(`QR Codes available for ${booking.qrCodes.length} tickets`)
    } else {
      alert('QR codes are not available for this booking')
    }
  }
  
  const viewDetails = (booking: BookingData) => {
    // In a real app, this would open a detailed view modal
    const details = `Booking Details:\n\nBooking ID: ${booking.bookingId}\nEvent: ${booking.eventTitle}\nDate: ${new Date(booking.eventDate).toLocaleDateString()}\nVenue: ${booking.eventVenue}\nTotal: $${booking.totalAmount}\nStatus: ${booking.status}\n\nAttendees: ${booking.attendees.length}\nTransaction ID: ${booking.paymentDetails.transactionId}`
    alert(details)
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-8">
              <Link href="/">
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  My Bookings
                </h1>
                <p className="text-xl text-white/80">
                  View and manage your event tickets
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bookings */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="text-center py-8 mb-8">
                <div className="text-red-400 text-lg font-semibold mb-2">Error Loading Bookings</div>
                <div className="text-white/60 mb-4">{error}</div>
                <Button 
                  variant="cyber" 
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue mx-auto mb-4"></div>
                <p className="text-white/60">Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <Ticket className="h-16 w-16 text-white/30 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Bookings Yet</h3>
                <p className="text-white/60 mb-8">Start exploring events and make your first booking!</p>
                <Link href="/events">
                  <Button variant="cyber" size="lg">
                    Browse Events
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.bookingId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="event-card overflow-hidden">
                      <div className="md:flex">
                        {/* Event Image */}
                        <div className="md:w-64 h-48 md:h-auto relative">
                          <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${booking.eventImage || '/api/placeholder/400/200'})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                            <div className="mb-4 md:mb-0">
                              <h3 className="text-2xl font-bold text-white mb-2">{booking.eventTitle}</h3>
                              <div className="text-sm text-cyber-blue font-mono">
                                Booking ID: {booking.bookingId}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-cyber-blue">
                                ${booking.totalAmount}
                              </div>
                              <div className="text-sm text-white/60">
                                {booking.tickets.standard + booking.tickets.vip} tickets
                              </div>
                            </div>
                          </div>

                          {/* Event Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center text-white/80">
                              <Calendar className="h-4 w-4 mr-2 text-cyber-blue" />
                              <span className="text-sm">{new Date(booking.eventDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-white/80">
                              <Clock className="h-4 w-4 mr-2 text-cyber-pink" />
                              <span className="text-sm">{booking.eventTime}</span>
                            </div>
                            <div className="flex items-center text-white/80">
                              <MapPin className="h-4 w-4 mr-2 text-cyber-green" />
                              <span className="text-sm">{booking.eventVenue}</span>
                            </div>
                          </div>

                          {/* Tickets Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="glassmorphism rounded-lg p-4">
                              <h4 className="text-white font-medium mb-2">Ticket Summary</h4>
                              <div className="space-y-1 text-sm">
                                {booking.tickets.standard > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-white/60">Standard × {booking.tickets.standard}</span>
                                    <span className="text-white">Confirmed</span>
                                  </div>
                                )}
                                {booking.tickets.vip > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-white/60">VIP × {booking.tickets.vip}</span>
                                    <span className="text-yellow-400">Confirmed</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="glassmorphism rounded-lg p-4">
                              <h4 className="text-white font-medium mb-2">Attendees</h4>
                              <div className="space-y-1 text-sm">
                                {booking.attendees.slice(0, 2).map((attendee, i) => (
                                  <div key={i} className="flex justify-between">
                                    <span className="text-white/60 truncate mr-2">{attendee.name}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      attendee.ticketType === 'vip' 
                                        ? 'bg-yellow-400/20 text-yellow-400' 
                                        : 'bg-cyber-blue/20 text-cyber-blue'
                                    }`}>
                                      {attendee.ticketType.toUpperCase()}
                                    </span>
                                  </div>
                                ))}
                                {booking.attendees.length > 2 && (
                                  <div className="text-white/40 text-xs">
                                    +{booking.attendees.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                              variant="cyber" 
                              className="flex-1"
                              onClick={() => downloadTickets(booking)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Tickets
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-white/20 text-white hover:bg-white/10"
                              onClick={() => showQRCodes(booking)}
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              Show QR Codes
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-white/20 text-white hover:bg-white/10"
                              onClick={() => viewDetails(booking)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
