'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin,
  Clock,
  Edit,
  Trash2,
  BarChart3,
  Download,
  Send,
  QrCode,
  Copy,
  ExternalLink,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Ticket,
  Filter,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { CheckInService } from '@/lib/checkin-service'
import { QRScanner } from '@/components/qr-scanner'

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

interface EventDetails {
  id: string
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
  coverImage: string
}

interface Attendee {
  id: string
  name: string
  email: string
  phone: string
  ticketType: string
  bookingDate: string
  checkedIn: boolean
  checkinTime?: string
  qrCode: string
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params?.eventId as string
  
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [checkinStats, setCheckinStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'not_checked_in'>('all')
  const [showQRScanner, setShowQRScanner] = useState(false)

  useEffect(() => {
    if (eventId) {
      loadEventDetails()
      loadAttendees()
      loadCheckinStats()
    }
  }, [eventId])

  const loadEventDetails = async () => {
    try {
      console.log('Loading event details for ID:', eventId)
      const response = await fetch(`/api/organizer/events?id=${eventId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        
        if (data.event) {
          const eventData = data.event
          
          // Map MongoDB event to frontend format
          const mappedEvent: EventDetails = {
            id: eventData._id,
            name: eventData.name,
            description: eventData.description,
            category: eventData.category,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            location: eventData.location,
            ticketTypes: eventData.ticketTypes,
            totalRegistrations: eventData.totalRegistrations || 0,
            maxCapacity: eventData.maxCapacity,
            isPublished: eventData.isPublished,
            coverImage: getCoverImageForCategory(eventData.category, eventData.coverImage)
          }
          
          console.log('Mapped event:', mappedEvent)
          setEvent(mappedEvent)
        } else {
          console.error('No event data in response:', data)
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch event details:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error loading event details:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendees = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAttendees(data.attendees || [])
      } else {
        console.log('No attendees data available from API')
        setAttendees([])
      }
    } catch (error) {
      console.error('Error loading attendees:', error)
      setAttendees([])
    }
  }

  const loadCheckinStats = async () => {
    try {
      const stats = CheckInService.getCheckInStats(eventId)
      setCheckinStats(stats)
    } catch (error) {
      console.error('Error loading checkin stats:', error)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/organizer/events?id=${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Event Deleted",
          description: "The event has been deleted successfully."
        })
        router.push('/organizer/dashboard')
      } else {
        throw new Error('Failed to delete event')
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleExportAttendees = async () => {
    try {
      const csvData = generateAttendeesCSV(filteredAttendees)
      
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${event?.name || 'event'}-attendees.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Complete",
        description: "Attendee list exported successfully."
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export attendee list.",
        variant: "destructive"
      })
    }
  }

  const generateAttendeesCSV = (attendees: Attendee[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Ticket Type', 'Booking Date', 'Checked In', 'Check-in Time']
    const rows = attendees.map(attendee => [
      attendee.name,
      attendee.email,
      attendee.phone,
      attendee.ticketType,
      new Date(attendee.bookingDate).toLocaleDateString(),
      attendee.checkedIn ? 'Yes' : 'No',
      attendee.checkinTime ? new Date(attendee.checkinTime).toLocaleString() : 'N/A'
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const copyEventLink = () => {
    const eventUrl = `${window.location.origin}/events/details/${eventId}`
    navigator.clipboard.writeText(eventUrl)
    toast({
      title: "Link Copied",
      description: "Event link copied to clipboard."
    })
  }

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'checked_in' && attendee.checkedIn) ||
                         (filterStatus === 'not_checked_in' && !attendee.checkedIn)
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="cyber-spinner mb-4" />
            <p className="text-white/60">Loading event details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Event Not Found</h3>
            <p className="text-white/60 mb-4">The event you're looking for doesn't exist</p>
            <Link href="/organizer/dashboard">
              <Button variant="cyber">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const checkedInCount = attendees.filter(a => a.checkedIn).length

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
                <h1 className="text-xl font-bold gradient-text">{event.name}</h1>
                <p className="text-white/60 text-sm">Event Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={copyEventLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Link href={`/events/details/${eventId}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public
                </Button>
              </Link>
              <Link href={`/organizer/analytics/${eventId}`}>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleDeleteEvent} className="text-red-400 border-red-400/30">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glassmorphism lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={event.coverImage}
                  alt={event.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-xl font-bold text-white">{event.name}</h2>
                    <Badge className={event.isPublished 
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {event.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-white/60">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location.name}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.totalRegistrations}/{event.maxCapacity} registered
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-cyber-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{checkedInCount}</div>
              <div className="text-white/60 text-sm">Checked In</div>
              <div className="text-cyber-blue text-xs mt-1">
                {((checkedInCount / event.totalRegistrations) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-cyber-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                ${event.ticketTypes.reduce((sum, t) => sum + (t.price * t.soldCount), 0).toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Revenue</div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="attendees" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
            <TabsTrigger value="attendees" className="data-[state=active]:bg-cyber-blue">Attendees</TabsTrigger>
            <TabsTrigger value="checkin" className="data-[state=active]:bg-cyber-pink">Check-in</TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyber-green">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="attendees" className="space-y-6 mt-6">
            <Card className="glassmorphism">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Attendee Management ({filteredAttendees.length})
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleExportAttendees}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send Update
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search attendees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="all">All Attendees</option>
                    <option value="checked_in">Checked In</option>
                    <option value="not_checked_in">Not Checked In</option>
                  </select>
                </div>

                {/* Attendees List */}
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredAttendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${attendee.checkedIn ? 'bg-green-500' : 'bg-gray-500'}`} />
                          <div>
                            <p className="text-white font-medium">{attendee.name}</p>
                            <p className="text-white/60 text-sm">{attendee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            {attendee.ticketType}
                          </Badge>
                          {attendee.checkedIn ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Checked In
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glassmorphism lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    QR Code Check-in
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QRScanner
                    eventId={eventId}
                    eventName={event.name}
                    onCheckInUpdate={() => {
                      loadAttendees()
                      loadCheckinStats()
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Check-in Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyber-blue">
                      {checkedInCount}/{event.totalRegistrations}
                    </div>
                    <p className="text-white/60">Checked In</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">Check-in Rate</span>
                      <span className="text-cyber-pink">{((checkedInCount / event.totalRegistrations) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyber-blue to-cyber-pink h-2 rounded-full"
                        style={{ width: `${(checkedInCount / event.totalRegistrations) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Present:</span>
                      <span className="text-green-400">{checkedInCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Absent:</span>
                      <span className="text-red-400">{event.totalRegistrations - checkedInCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Capacity:</span>
                      <span className="text-white">{event.maxCapacity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Information */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white">Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium mb-2">Description</h3>
                    <p className="text-white/80 text-sm">{event.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Schedule</h3>
                    <div className="space-y-1 text-sm text-white/80">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-cyber-blue" />
                        Starts: {new Date(event.startDate).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-cyber-pink" />
                        Ends: {new Date(event.endDate).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Location</h3>
                    <div className="space-y-1 text-sm text-white/80">
                      <p>{event.location.name}</p>
                      <p className="text-white/60">{event.location.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Information */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white">Ticket Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.ticketTypes.map((ticket, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{ticket.name}</span>
                        <span className="text-white">${ticket.price}</span>
                      </div>
                      <div className="flex justify-between text-sm text-white/60">
                        <span>Sold: {ticket.soldCount}</span>
                        <span>Available: {ticket.maxTickets - ticket.soldCount}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyber-blue to-cyber-pink h-2 rounded-full"
                          style={{ width: `${(ticket.soldCount / ticket.maxTickets) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-white/60 text-right">
                        Revenue: ${(ticket.price * ticket.soldCount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Total Revenue:</span>
                      <span className="text-cyber-green">
                        ${event.ticketTypes.reduce((sum, t) => sum + (t.price * t.soldCount), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
