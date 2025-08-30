'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar,
  Clock,
  DollarSign,
  Edit,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  Ticket,
  CreditCard
} from 'lucide-react'
import { LoyaltyService, BookingCancellation, BookingModification } from '@/backend/services/loyalty-service'

interface Booking {
  id: string
  eventTitle: string
  eventDate: string
  totalAmount: number
  ticketQuantity: number
  ticketType: string
  attendeeName: string
  attendeeEmail: string
  status: 'confirmed' | 'cancelled' | 'checked_in'
  bookingDate: string
  canModify: boolean
  canCancel: boolean
}

interface BookingManagementProps {
  userId: string
  bookings: Booking[]
  onBookingUpdated?: () => void
}

export default function BookingManagement({ userId, bookings, onBookingUpdated }: BookingManagementProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [modifyData, setModifyData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    ticketQuantity: 1,
    ticketType: 'general'
  })
  const [refundPreview, setRefundPreview] = useState<{
    refundAmount: number
    refundPercentage: number
    processingFee: number
  } | null>(null)
  const [modifications, setModifications] = useState<Record<string, BookingModification[]>>({})
  const [cancellations, setCancellations] = useState<Record<string, BookingCancellation>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load booking modifications and cancellations for each booking
    bookings.forEach(booking => {
      const bookingMods = LoyaltyService.getBookingModifications(booking.id)
      if (bookingMods.length > 0) {
        setModifications(prev => ({
          ...prev,
          [booking.id]: bookingMods
        }))
      }

      const cancellation = LoyaltyService.getCancellationDetails(booking.id)
      if (cancellation) {
        setCancellations(prev => ({
          ...prev,
          [booking.id]: cancellation
        }))
      }
    })
  }, [bookings])

  const handleCancelBooking = async (booking: Booking) => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason')
      return
    }

    setLoading(true)
    try {
      const cancellation = await LoyaltyService.cancelBooking(
        booking.id,
        userId,
        cancelReason,
        booking.totalAmount,
        booking.eventDate
      )

      setCancellations(prev => ({
        ...prev,
        [booking.id]: cancellation
      }))

      alert(`Booking cancelled successfully. Refund of $${cancellation.refundAmount} will be processed.`)
      setCancelReason('')
      onBookingUpdated?.()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
    setLoading(false)
  }

  const handleModifyBooking = async (booking: Booking, modificationType: 'attendee_info' | 'ticket_quantity' | 'ticket_type') => {
    setLoading(true)
    try {
      let oldValue: any
      let newValue: any
      let additionalCost = 0

      switch (modificationType) {
        case 'attendee_info':
          oldValue = { name: booking.attendeeName, email: booking.attendeeEmail }
          newValue = { name: modifyData.attendeeName, email: modifyData.attendeeEmail }
          break
        case 'ticket_quantity':
          oldValue = booking.ticketQuantity
          newValue = modifyData.ticketQuantity
          // Calculate additional cost based on quantity change
          const quantityDiff = newValue - oldValue
          additionalCost = quantityDiff * (booking.totalAmount / booking.ticketQuantity)
          break
        case 'ticket_type':
          oldValue = booking.ticketType
          newValue = modifyData.ticketType
          // Mock price differences for different ticket types
          const priceDiff = newValue === 'vip' ? 50 : newValue === 'premium' ? 25 : 0
          additionalCost = priceDiff
          break
      }

      const modification = await LoyaltyService.modifyBooking(
        booking.id,
        modificationType,
        oldValue,
        newValue,
        additionalCost
      )

      setModifications(prev => ({
        ...prev,
        [booking.id]: [...(prev[booking.id] || []), modification]
      }))

      alert(`Booking modified successfully. ${additionalCost > 0 ? `Additional charge: $${additionalCost}` : additionalCost < 0 ? `Refund: $${Math.abs(additionalCost)}` : 'No additional charges'}`)
      onBookingUpdated?.()
    } catch (error) {
      console.error('Error modifying booking:', error)
      alert('Failed to modify booking')
    }
    setLoading(false)
  }

  const calculateRefundPreview = (booking: Booking) => {
    const preview = LoyaltyService.calculateRefundPreview(booking.totalAmount, booking.eventDate)
    setRefundPreview(preview)
  }

  const getBookingStatus = (booking: Booking) => {
    if (cancellations[booking.id]) {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    
    switch (booking.status) {
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>
      case 'checked_in':
        return <Badge variant="secondary">Checked In</Badge>
      default:
        return <Badge variant="outline">{booking.status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const canCancelBooking = (booking: Booking) => {
    if (cancellations[booking.id]) return false
    if (booking.status === 'checked_in') return false
    
    const eventDate = new Date(booking.eventDate)
    const now = new Date()
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return hoursUntilEvent > 0 // Can cancel until event starts
  }

  const canModifyBooking = (booking: Booking) => {
    if (cancellations[booking.id]) return false
    if (booking.status === 'checked_in') return false
    
    const eventDate = new Date(booking.eventDate)
    const now = new Date()
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return hoursUntilEvent > 24 // Can modify until 24 hours before event
  }

  const activeBookings = bookings.filter(booking => !cancellations[booking.id])
  const cancelledBookings = bookings.filter(booking => cancellations[booking.id])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600">Manage your event bookings and tickets</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Bookings ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled Bookings ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">No active bookings</h3>
                    <p className="text-gray-500">Start by booking an event!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{booking.eventTitle}</CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(booking.eventDate)}
                          </span>
                          <span className="flex items-center">
                            <Ticket className="h-4 w-4 mr-1" />
                            {booking.ticketQuantity} × {booking.ticketType}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getBookingStatus(booking)}
                        <span className="text-lg font-bold">${booking.totalAmount}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Booking Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span><strong>Name:</strong> {booking.attendeeName}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">@</span>
                          <span><strong>Email:</strong> {booking.attendeeEmail}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span><strong>Booked:</strong> {formatDate(booking.bookingDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">#</span>
                          <span><strong>Booking ID:</strong> {booking.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Modifications History */}
                    {modifications[booking.id] && modifications[booking.id].length > 0 && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Modifications:</strong> This booking has been modified {modifications[booking.id].length} time(s).
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-blue-600">View history</summary>
                            <div className="mt-2 space-y-2">
                              {modifications[booking.id].map((mod, index) => (
                                <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                                  <div className="font-medium">{mod.modificationType.replace('_', ' ').toUpperCase()}</div>
                                  <div>Changed on: {formatDate(mod.modificationDate)}</div>
                                  {mod.additionalCost !== 0 && (
                                    <div className={mod.additionalCost > 0 ? 'text-red-600' : 'text-green-600'}>
                                      {mod.additionalCost > 0 ? '+' : ''}${mod.additionalCost}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {canModifyBooking(booking) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setModifyData({
                                  attendeeName: booking.attendeeName,
                                  attendeeEmail: booking.attendeeEmail,
                                  ticketQuantity: booking.ticketQuantity,
                                  ticketType: booking.ticketType
                                })
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modify
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Modify Booking</DialogTitle>
                              <DialogDescription>
                                Update your booking details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Tabs defaultValue="attendee" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="attendee">Info</TabsTrigger>
                                  <TabsTrigger value="quantity">Quantity</TabsTrigger>
                                  <TabsTrigger value="type">Type</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="attendee" className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <Input
                                      value={modifyData.attendeeName}
                                      onChange={(e) => setModifyData(prev => ({
                                        ...prev,
                                        attendeeName: e.target.value
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input
                                      type="email"
                                      value={modifyData.attendeeEmail}
                                      onChange={(e) => setModifyData(prev => ({
                                        ...prev,
                                        attendeeEmail: e.target.value
                                      }))}
                                    />
                                  </div>
                                  <Button 
                                    onClick={() => handleModifyBooking(booking, 'attendee_info')}
                                    disabled={loading}
                                    className="w-full"
                                  >
                                    Update Attendee Info
                                  </Button>
                                </TabsContent>
                                
                                <TabsContent value="quantity" className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
                                      Ticket Quantity (Current: {booking.ticketQuantity})
                                    </label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={modifyData.ticketQuantity}
                                      onChange={(e) => setModifyData(prev => ({
                                        ...prev,
                                        ticketQuantity: Number(e.target.value)
                                      }))}
                                    />
                                    {modifyData.ticketQuantity !== booking.ticketQuantity && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        Cost difference: {(() => {
                                          const diff = modifyData.ticketQuantity - booking.ticketQuantity
                                          const costPerTicket = booking.totalAmount / booking.ticketQuantity
                                          const totalDiff = diff * costPerTicket
                                          return totalDiff > 0 ? `+$${totalDiff.toFixed(2)}` : `-$${Math.abs(totalDiff).toFixed(2)}`
                                        })()}
                                      </p>
                                    )}
                                  </div>
                                  <Button 
                                    onClick={() => handleModifyBooking(booking, 'ticket_quantity')}
                                    disabled={loading || modifyData.ticketQuantity === booking.ticketQuantity}
                                    className="w-full"
                                  >
                                    Update Quantity
                                  </Button>
                                </TabsContent>
                                
                                <TabsContent value="type" className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
                                      Ticket Type (Current: {booking.ticketType})
                                    </label>
                                    <select
                                      value={modifyData.ticketType}
                                      onChange={(e) => setModifyData(prev => ({
                                        ...prev,
                                        ticketType: e.target.value
                                      }))}
                                      className="w-full p-2 border rounded-md"
                                    >
                                      <option value="general">General ($0)</option>
                                      <option value="premium">Premium (+$25)</option>
                                      <option value="vip">VIP (+$50)</option>
                                    </select>
                                  </div>
                                  <Button 
                                    onClick={() => handleModifyBooking(booking, 'ticket_type')}
                                    disabled={loading || modifyData.ticketType === booking.ticketType}
                                    className="w-full"
                                  >
                                    Update Ticket Type
                                  </Button>
                                </TabsContent>
                              </Tabs>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {canCancelBooking(booking) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking)
                                calculateRefundPreview(booking)
                                setCancelReason('')
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Cancel Booking</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to cancel this booking?
                              </DialogDescription>
                            </DialogHeader>
                            
                            {refundPreview && (
                              <Alert className="my-4">
                                <DollarSign className="h-4 w-4" />
                                <AlertDescription>
                                  <div className="space-y-1">
                                    <div><strong>Refund Preview:</strong></div>
                                    <div>Original Amount: ${booking.totalAmount}</div>
                                    <div>Refund Percentage: {refundPreview.refundPercentage}%</div>
                                    {refundPreview.processingFee > 0 && (
                                      <div>Processing Fee: ${refundPreview.processingFee}</div>
                                    )}
                                    <div className="font-bold text-green-600">
                                      Final Refund: ${refundPreview.refundAmount}
                                    </div>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Cancellation Reason *
                                </label>
                                <Textarea
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  placeholder="Please tell us why you're cancelling..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                variant="destructive"
                                onClick={() => handleCancelBooking(booking)}
                                disabled={loading || !cancelReason.trim()}
                              >
                                {loading ? 'Processing...' : 'Confirm Cancellation'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Download Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">No cancelled bookings</h3>
                    <p className="text-gray-500">All your bookings are active!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cancelledBookings.map((booking) => {
                const cancellation = cancellations[booking.id]
                return (
                  <Card key={booking.id} className="opacity-75">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-gray-600">{booking.eventTitle}</CardTitle>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(booking.eventDate)}
                            </span>
                            <span className="flex items-center">
                              <Ticket className="h-4 w-4 mr-1" />
                              {booking.ticketQuantity} × {booking.ticketType}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">Cancelled</Badge>
                          <span className="text-lg font-bold text-gray-500">${booking.totalAmount}</span>
                        </div>
                      </div>
                    </CardHeader>

                    {cancellation && (
                      <CardContent>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <div><strong>Cancelled:</strong> {formatDate(cancellation.cancellationDate)}</div>
                              <div><strong>Reason:</strong> {cancellation.reason}</div>
                              <div><strong>Refund:</strong> ${cancellation.refundAmount}</div>
                              {cancellation.processingFee > 0 && (
                                <div><strong>Processing Fee:</strong> ${cancellation.processingFee}</div>
                              )}
                              <div className="flex items-center">
                                <strong>Refund Status:</strong>
                                <Badge 
                                  variant={cancellation.refundProcessed ? "default" : "secondary"}
                                  className="ml-2"
                                >
                                  {cancellation.refundProcessed ? 'Processed' : 'Processing'}
                                </Badge>
                              </div>
                              {cancellation.refundTransactionId && (
                                <div className="text-sm text-gray-600">
                                  <strong>Transaction ID:</strong> {cancellation.refundTransactionId}
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
