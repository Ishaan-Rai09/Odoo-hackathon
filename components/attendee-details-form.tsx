'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { PaymentPopup } from '@/components/payment-popup'
import { User, ArrowLeft, CreditCard, CheckCircle } from 'lucide-react'

interface AttendeeDetailsFormProps {
  event: any
  tickets: {
    standard: number
    vip: number
  }
  totalPrice: number
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

interface AttendeeInfo {
  name: string
  phone: string
  email: string
  gender: string
}

export function AttendeeDetailsForm({ 
  event, 
  tickets, 
  totalPrice, 
  isOpen, 
  onClose, 
  onBack 
}: AttendeeDetailsFormProps) {
  const { toast } = useToast()
  const totalTickets = tickets.standard + tickets.vip
  
  const [attendees, setAttendees] = useState<AttendeeInfo[]>(
    Array(totalTickets).fill(null).map(() => ({
      name: '',
      phone: '',
      email: '',
      gender: ''
    }))
  )

  const [showPaymentPopup, setShowPaymentPopup] = useState(false)

  const updateAttendee = (index: number, field: keyof AttendeeInfo, value: string) => {
    setAttendees(prev => prev.map((attendee, i) => 
      i === index ? { ...attendee, [field]: value } : attendee
    ))
  }

  const validateForm = () => {
    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i]
      if (!attendee.name || !attendee.phone || !attendee.email || !attendee.gender) {
        toast({
          title: "Validation Error",
          description: `Please fill in all details for attendee ${i + 1}`,
          variant: "destructive",
        })
        return false
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(attendee.email)) {
        toast({
          title: "Invalid Email",
          description: `Please enter a valid email for attendee ${i + 1}`,
          variant: "destructive",
        })
        return false
      }
      
      // Basic phone validation
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
      if (!phoneRegex.test(attendee.phone)) {
        toast({
          title: "Invalid Phone",
          description: `Please enter a valid phone number for attendee ${i + 1}`,
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setShowPaymentPopup(true)
  }

  const handleClosePaymentPopup = () => {
    setShowPaymentPopup(false)
  }

  const getTicketType = (index: number) => {
    if (index < tickets.standard) {
      return { type: 'Standard', price: event.standardPrice, color: 'text-cyber-blue' }
    } else {
      return { type: 'VIP', price: event.vipPrice, color: 'text-yellow-400' }
    }
  }

  if (showPaymentPopup) {
    return (
      <PaymentPopup
        event={event}
        tickets={tickets}
        attendees={attendees}
        totalAmount={totalPrice}
        isOpen={isOpen}
        onClose={onClose}
        onBack={() => setShowPaymentPopup(false)}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-black/95 border border-white/20 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <User className="h-6 w-6 mr-3 text-cyber-blue" />
            Attendee Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Event & Ticket Summary */}
          <Card className="glassmorphism border-cyber-blue/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">Event</div>
                  <div className="text-white font-medium">{event.title}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Total Tickets</div>
                  <div className="text-white font-medium">{totalTickets}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Date & Time</div>
                  <div className="text-white font-medium">{event.date} • {event.time}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Total Amount</div>
                  <div className="text-cyber-blue font-bold text-lg">
                    {totalPrice === 0 ? 'Free' : `$${totalPrice}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendee Forms */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">
              Enter Details for {totalTickets} Attendee{totalTickets > 1 ? 's' : ''}
            </h3>
            
            {attendees.map((attendee, index) => {
              const ticketInfo = getTicketType(index)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="glassmorphism border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                          Attendee {index + 1}
                        </h4>
                        <div className={`text-sm font-medium ${ticketInfo.color}`}>
                          {ticketInfo.type} Ticket - {ticketInfo.price === 0 ? 'Free' : `$${ticketInfo.price}`}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={attendee.name}
                            onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={attendee.phone}
                            onChange={(e) => updateAttendee(index, 'phone', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={attendee.email}
                            onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                            placeholder="attendee@example.com"
                            required
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Gender *
                          </label>
                          <select
                            value={attendee.gender}
                            onChange={(e) => updateAttendee(index, 'gender', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyber-blue transition-colors"
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="male" className="bg-black">Male</option>
                            <option value="female" className="bg-black">Female</option>
                            <option value="other" className="bg-black">Other</option>
                            <option value="prefer-not-to-say" className="bg-black">Prefer not to say</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Final Summary */}
          <Card className="glassmorphism border-cyber-green/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold text-white">Final Total</h4>
                  <p className="text-white/60 text-sm">
                    {tickets.standard > 0 && `${tickets.standard} Standard`}
                    {tickets.standard > 0 && tickets.vip > 0 && ' + '}
                    {tickets.vip > 0 && `${tickets.vip} VIP`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyber-blue">
                    {totalPrice === 0 ? 'Free Event' : `$${totalPrice}`}
                  </div>
                  <div className="text-white/60 text-sm">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
        
        {/* Action Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 flex gap-4 pt-6 border-t border-white/20 mt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          
          <Button
            variant="glow"
            size="lg"
            onClick={handleSubmit}
            className="flex-1"
          >
            {totalPrice === 0 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Registration
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
