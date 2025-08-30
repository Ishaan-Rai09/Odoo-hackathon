'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AttendeeDetailsForm } from '@/components/attendee-details-form'
import DiscountInput, { DiscountResult } from '@/components/discount-input'
import PromotionalBanners from '@/components/promotional-banners'
import { Ticket, Users, Crown, ChevronDown, UserX } from 'lucide-react'
import Link from 'next/link'

interface TicketBookingProps {
  event: any
  isOpen: boolean
  onClose: () => void
}

interface TicketSelection {
  standard: number
  vip: number
}

export function TicketBooking({ event, isOpen, onClose }: TicketBookingProps) {
  const { isSignedIn, isLoaded, user } = useUser()
  const [tickets, setTickets] = useState<TicketSelection>({ standard: 0, vip: 0 })
  const [showAttendeeForm, setShowAttendeeForm] = useState(false)
  const [appliedDiscounts, setAppliedDiscounts] = useState<DiscountResult[]>([])
  const [totalDiscount, setTotalDiscount] = useState(0)

  if (!event) return null

  const totalTickets = tickets.standard + tickets.vip
  const originalPrice = (tickets.standard * event.standardPrice) + (tickets.vip * event.vipPrice)
  const totalPrice = Math.max(0, originalPrice - totalDiscount)

  const updateTicketCount = (type: 'standard' | 'vip', count: number) => {
    setTickets(prev => ({
      ...prev,
      [type]: count
    }))
  }

  const handleRegister = () => {
    if (totalTickets > 0) {
      setShowAttendeeForm(true)
    }
  }

  const handleClose = () => {
    setTickets({ standard: 0, vip: 0 })
    setShowAttendeeForm(false)
    setAppliedDiscounts([])
    setTotalDiscount(0)
    onClose()
  }

  const handleDiscountApplied = (discount: DiscountResult) => {
    setAppliedDiscounts(prev => [...prev, discount])
    setTotalDiscount(prev => prev + discount.discountAmount)
  }

  const handleDiscountRemoved = () => {
    // Recalculate total discount from applied discounts
    const newTotal = appliedDiscounts.reduce((sum, discount) => sum + discount.discountAmount, 0)
    setTotalDiscount(newTotal)
  }

  const handlePromotionalApply = (couponCode: string) => {
    // This will trigger the discount input component to apply the code
    // Implementation depends on how we want to handle promotional banner clicks
    console.log('Applying promotional code:', couponCode)
  }

  if (showAttendeeForm) {
    return (
      <AttendeeDetailsForm
        event={event}
        tickets={tickets}
        totalPrice={totalPrice}
        isOpen={isOpen}
        onClose={handleClose}
        onBack={() => setShowAttendeeForm(false)}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-black/95 border border-white/20 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Ticket className="h-6 w-6 mr-3 text-cyber-blue" />
            Select Tickets
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Event Info */}
          <div className="border-b border-white/20 pb-6">
            <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
            <p className="text-white/70">{event.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
              <span>{event.date} • {event.time}</span>
              <span>{event.venue}</span>
            </div>
          </div>

          {/* Promotional Banners */}
          <PromotionalBanners 
            eventData={event}
            totalTickets={totalTickets}
            onDiscountApply={handlePromotionalApply}
          />

          {/* Ticket Options */}
          <div className="space-y-4">
            {/* Standard Ticket */}
            <Card className="glassmorphism border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Ticket className="h-5 w-5 mr-2 text-cyber-blue" />
                      <h4 className="text-lg font-semibold text-white">Standard Ticket</h4>
                    </div>
                    <p className="text-white/60 text-sm mb-3">
                      General admission with standard access to the event
                    </p>
                    <div className="text-2xl font-bold text-white">
                      {event.standardPrice === 0 ? 'Free' : `$${event.standardPrice}`}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={tickets.standard}
                      onChange={(e) => updateTicketCount('standard', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyber-blue transition-colors appearance-none cursor-pointer"
                    >
                      {Array.from({ length: Math.min(11, 11 - tickets.vip) }, (_, i) => (
                        <option key={i} value={i} className="bg-black text-white">
                          {i}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VIP Ticket */}
            <Card className="glassmorphism border-cyber-purple/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                      <h4 className="text-lg font-semibold text-white">VIP Ticket</h4>
                      <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Premium
                      </Badge>
                    </div>
                    <p className="text-white/60 text-sm mb-3">
                      Premium access with exclusive perks and priority seating
                    </p>
                    <div className="text-2xl font-bold text-yellow-400">
                      ${event.vipPrice}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={tickets.vip}
                      onChange={(e) => updateTicketCount('vip', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 bg-white/10 border border-yellow-400/30 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors appearance-none cursor-pointer"
                    >
                      {Array.from({ length: Math.min(11, 11 - tickets.standard) }, (_, i) => (
                        <option key={i} value={i} className="bg-black text-white">
                          {i}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discount Input */}
          {totalTickets > 0 && user && (
            <DiscountInput
              eventId={event.id}
              userId={user.id}
              orderAmount={originalPrice}
              ticketTypes={{ standard: tickets.standard, vip: tickets.vip }}
              onDiscountApplied={handleDiscountApplied}
              onDiscountRemoved={handleDiscountRemoved}
            />
          )}

          {/* Ticket Limit Notice */}
          <div className="text-sm text-white/60 text-center">
            Maximum 10 tickets per booking
          </div>

          {/* Order Summary */}
          <AnimatePresence>
            {totalTickets > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border-t border-white/20 pt-6"
              >
                <Card className="glassmorphism border-cyber-blue/30">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Order Summary</h4>
                    <div className="space-y-3">
                      {tickets.standard > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">
                            Standard × {tickets.standard}
                          </span>
                          <span className="text-white font-medium">
                            {event.standardPrice === 0 ? 'Free' : `$${tickets.standard * event.standardPrice}`}
                          </span>
                        </div>
                      )}
                      {tickets.vip > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">
                            VIP × {tickets.vip}
                          </span>
                          <span className="text-white font-medium">
                            ${tickets.vip * event.vipPrice}
                          </span>
                        </div>
                      )}
                      
                      {/* Show discount breakdown if any discounts applied */}
                      {totalDiscount > 0 && (
                        <>
                          <div className="border-t border-white/20 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white/80">Subtotal</span>
                              <span className="text-white font-medium">
                                ${originalPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-green-400">
                              <span>Discount</span>
                              <span>-${totalDiscount.toFixed(2)}</span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-white">Total</span>
                          <span className="text-xl font-bold text-cyber-blue">
                            {totalPrice === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`}
                          </span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="text-sm text-green-400 text-right mt-1">
                            You saved ${totalDiscount.toFixed(2)}!
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Authentication Check */}
          {!isLoaded ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto mb-2"></div>
              <p className="text-white/60">Loading...</p>
            </div>
          ) : !isSignedIn ? (
            <Card className="glassmorphism border-yellow-400/30 bg-yellow-400/5">
              <CardContent className="p-6 text-center">
                <UserX className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sign In Required
                </h3>
                <p className="text-white/80 mb-6">
                  You need to be signed in to book tickets for this event. 
                  Please sign in or create an account to continue.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/sign-in" onClick={handleClose}>
                    <Button variant="cyber" size="lg">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={handleClose}>
                    <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}

        </div>
        
        {/* Action Buttons - Fixed at bottom */}
        {isSignedIn && (
          <div className="flex-shrink-0 flex gap-4 pt-6 border-t border-white/20 mt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <Button
              variant="glow"
              size="lg"
              onClick={handleRegister}
              disabled={totalTickets === 0}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Register ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
