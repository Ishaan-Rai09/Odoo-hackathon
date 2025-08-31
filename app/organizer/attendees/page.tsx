'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { 
  ArrowLeft,
  Users, 
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Ticket,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

interface BookingData {
  bookingId: string
  userId: string
  userEmail: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  eventImage?: string
  standardTickets: number
  vipTickets: number
  totalTickets: number
  totalAmount: number
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
  attendeeCount: number
  paymentMethod?: string
  transactionId?: string
}

interface AttendeeData {
  id: string
  bookingId: string
  name: string
  email: string
  phone: string
  gender: string
  ticketType: 'standard' | 'vip'
  bookingStatus: string
  bookingTotal: number
  bookingDate: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
}

export default function AttendeeManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [attendees, setAttendees] = useState<AttendeeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ticketTypeFilter, setTicketTypeFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  
  const eventId = searchParams.get('eventId')

  useEffect(() => {
    fetchBookingsAndAttendees()
  }, [eventId])

  const fetchBookingsAndAttendees = async () => {
    try {
      setLoading(true)
      setError('')
      
      const url = eventId 
        ? `/api/organizer/bookings?eventId=${eventId}`
        : '/api/organizer/bookings'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setBookings(data.bookings || [])
        setAttendees(data.attendees || [])
      } else {
        setError(data.error || 'Failed to fetch booking data')
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string, eventId: string) => {
    try {
      const response = await fetch('/api/organizer/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus, eventId })
      })
      
      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Booking status changed to ${newStatus}`
        })
        fetchBookingsAndAttendees() // Refresh data
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update booking status",
        variant: "destructive"
      })
    }
  }

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || attendee.bookingStatus === statusFilter
    const matchesTicketType = ticketTypeFilter === 'all' || attendee.ticketType === ticketTypeFilter
    
    return matchesSearch && matchesStatus && matchesTicketType
  })

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

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Gender', 'Ticket Type', 'Booking Status', 'Booking Date', 'Amount'],
      ...filteredAttendees.map(attendee => [
        attendee.name,
        attendee.email,
        attendee.phone,
        attendee.gender,
        attendee.ticketType,
        attendee.bookingStatus,
        new Date(attendee.bookingDate).toLocaleDateString(),
        attendee.bookingTotal.toString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Export Complete",
      description: "Attendee data has been exported to CSV"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue mx-auto mb-4"></div>
          <p className="text-white/60">Loading attendee data...</p>
        </div>
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
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Attendee Management
                </h1>
                <p className="text-white/60 text-sm">
                  Manage bookings and attendees for your events
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBookingsAndAttendees}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="cyber" 
                size="sm" 
                onClick={exportData}
                disabled={filteredAttendees.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <Card className="border-red-500/30 bg-red-900/20">
              <CardContent className="p-4">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glassmorphism border-cyber-blue/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold text-white">{bookings.length}</p>
                </div>
                <Ticket className="h-8 w-8 text-cyber-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-cyber-pink/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Attendees</p>
                  <p className="text-3xl font-bold text-white">{attendees.length}</p>
                </div>
                <Users className="h-8 w-8 text-cyber-pink" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-cyber-green/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">
                    ${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-cyber-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-cyber-purple/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Confirmed</p>
                  <p className="text-3xl font-bold text-white">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-cyber-purple" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input
                      placeholder="Search by name, email, or booking ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={ticketTypeFilter} onValueChange={setTicketTypeFilter}>
                  <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Ticket Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendees Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Attendees ({filteredAttendees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAttendees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-white/30 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-4">
                    {attendees.length === 0 ? 'No Attendees Yet' : 'No Matching Attendees'}
                  </h3>
                  <p className="text-white/60 mb-8">
                    {attendees.length === 0 
                      ? 'Attendees will appear here once users start booking tickets for your events.'
                      : 'Try adjusting your search criteria to find attendees.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAttendees.map((attendee, index) => (
                    <motion.div
                      key={attendee.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{attendee.name}</h3>
                            <Badge className={`${
                              attendee.ticketType === 'vip' 
                                ? 'bg-yellow-400/20 text-yellow-400 border-yellow-500/30' 
                                : 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30'
                            }`}>
                              {attendee.ticketType.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(attendee.bookingStatus)}>
                              {attendee.bookingStatus.charAt(0).toUpperCase() + attendee.bookingStatus.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center text-white/80">
                              <Mail className="h-4 w-4 mr-2 text-cyber-blue" />
                              <span>{attendee.email}</span>
                            </div>
                            <div className="flex items-center text-white/80">
                              <Phone className="h-4 w-4 mr-2 text-cyber-pink" />
                              <span>{attendee.phone}</span>
                            </div>
                            <div className="flex items-center text-white/80">
                              <Calendar className="h-4 w-4 mr-2 text-cyber-green" />
                              <span>{new Date(attendee.bookingDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-white/60">
                            <span className="font-mono">Booking ID: {attendee.bookingId}</span>
                            {eventId && (
                              <span className="ml-4">
                                Event: {attendee.eventTitle}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <div className="text-lg font-bold text-cyber-blue">
                              ${attendee.bookingTotal}
                            </div>
                            <div className="text-xs text-white/60">
                              {attendee.gender}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const booking = bookings.find(b => b.bookingId === attendee.bookingId)
                              if (booking) {
                                setSelectedBooking(booking)
                                setShowBookingDetails(true)
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {attendee.bookingStatus === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(attendee.bookingId, 'confirmed', attendee.eventId)}
                              className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(attendee.bookingStatus === 'confirmed' || attendee.bookingStatus === 'pending') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(attendee.bookingId, 'cancelled', attendee.eventId)}
                              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Details Modal */}
        <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
          <DialogContent className="glassmorphism border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Ticket className="h-5 w-5 mr-2" />
                Booking Details - {selectedBooking?.bookingId}
              </DialogTitle>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-6">
                {/* Event Information */}
                <div className="border border-white/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Event Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-white/80">
                      <Calendar className="h-4 w-4 mr-2 text-cyber-blue" />
                      <span>{selectedBooking.eventTitle}</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <Clock className="h-4 w-4 mr-2 text-cyber-pink" />
                      <span>{selectedBooking.eventDate} at {selectedBooking.eventTime}</span>
                    </div>
                    <div className="flex items-center text-white/80 md:col-span-2">
                      <MapPin className="h-4 w-4 mr-2 text-cyber-green" />
                      <span>{selectedBooking.eventVenue}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="border border-white/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Booking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-white/60">Customer Email:</span>
                      <p className="text-white">{selectedBooking.userEmail}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Booking Date:</span>
                      <p className="text-white">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Standard Tickets:</span>
                      <p className="text-white">{selectedBooking.standardTickets}</p>
                    </div>
                    <div>
                      <span className="text-white/60">VIP Tickets:</span>
                      <p className="text-white">{selectedBooking.vipTickets}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Total Amount:</span>
                      <p className="text-cyber-green font-semibold">${selectedBooking.totalAmount}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Payment Method:</span>
                      <p className="text-white">{selectedBooking.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Attendees for this booking */}
                <div className="border border-white/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">
                    Attendees ({attendees.filter(a => a.bookingId === selectedBooking.bookingId).length})
                  </h3>
                  <div className="space-y-3">
                    {attendees
                      .filter(a => a.bookingId === selectedBooking.bookingId)
                      .map((attendee, index) => (
                      <div key={attendee.id} className="border border-white/10 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{attendee.name}</span>
                          <Badge className={`${
                            attendee.ticketType === 'vip' 
                              ? 'bg-yellow-400/20 text-yellow-400 border-yellow-500/30' 
                              : 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30'
                          }`}>
                            {attendee.ticketType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/80">
                          <div>Email: {attendee.email}</div>
                          <div>Phone: {attendee.phone}</div>
                          <div>Gender: {attendee.gender}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
