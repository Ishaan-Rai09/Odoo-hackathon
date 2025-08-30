'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TicketBooking } from '@/components/ticket-booking'
import { Calendar, Clock, MapPin, Users, ExternalLink, Trophy, Star, Ticket } from 'lucide-react'
import { formatDate, formatTime, getBadgeColor, getRegistrationProgress, getDifficultyColor } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface EventModalProps {
  event: any
  isOpen: boolean
  onClose: () => void
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [showTicketBooking, setShowTicketBooking] = useState(false)
  
  if (!event) return null

  // Add default pricing if not provided
  const eventWithPricing = {
    ...event,
    standardPrice: event.standardPrice ?? (event.price === 0 ? 0 : event.price || 25),
    vipPrice: event.vipPrice ?? (event.price === 0 ? 0 : (event.price ? event.price * 2 : 75))
  }

  const handleBookTickets = () => {
    setShowTicketBooking(true)
  }

  const handleCloseTicketBooking = () => {
    setShowTicketBooking(false)
  }

  if (showTicketBooking) {
    return (
      <TicketBooking
        event={eventWithPricing}
        isOpen={isOpen}
        onClose={onClose}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border border-white/20">
        <div className="relative">
          {/* Event Image */}
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Badges Overlay */}
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
                {event.categoryName}
              </Badge>
            </div>
          </div>

          {/* Event Content */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-white mb-2">
                  {event.title}
                </DialogTitle>
              </DialogHeader>
              <p className="text-cyber-blue text-lg font-medium">
                Organized by {event.clubName}
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">About This Event</h3>
              <p className="text-white/80 leading-relaxed text-lg">
                {event.description}
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-3">Event Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center text-white/80">
                    <Calendar className="h-5 w-5 mr-3 text-cyber-blue" />
                    <div>
                      <div className="font-medium">{formatDate(event.date)}</div>
                      <div className="text-sm text-white/60">Event Date</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white/80">
                    <Clock className="h-5 w-5 mr-3 text-cyber-pink" />
                    <div>
                      <div className="font-medium">{formatTime(event.time)}</div>
                      <div className="text-sm text-white/60">Start Time</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white/80">
                    <MapPin className="h-5 w-5 mr-3 text-cyber-green" />
                    <div>
                      <div className="font-medium">{event.venue}</div>
                      <div className="text-sm text-white/60">Venue</div>
                    </div>
                  </div>

                  {event.difficulty && (
                    <div className="flex items-center text-white/80">
                      <Star className="h-5 w-5 mr-3 text-yellow-400" />
                      <div>
                        <div className={`font-medium ${getDifficultyColor(event.difficulty)}`}>
                          {event.difficulty}
                        </div>
                        <div className="text-sm text-white/60">Difficulty Level</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-3">Registration</h3>
                
                {/* Registration Progress */}
                {event.maxParticipants && (
                  <div className="glassmorphism rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/80 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Participants
                      </span>
                      <span className="text-white font-medium">
                        {event.currentParticipants}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-cyber-blue to-cyber-pink h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${getRegistrationProgress(
                            event.currentParticipants,
                            event.maxParticipants
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-sm text-white/60">
                      {event.maxParticipants - event.currentParticipants} spots remaining
                    </div>
                  </div>
                )}

                {/* Prizes */}
                {event.prizes && (
                  <div className="glassmorphism rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                      <span className="text-white font-medium">Prizes</span>
                    </div>
                    <div className="text-cyber-blue font-semibold">
                      {event.prizes}
                    </div>
                  </div>
                )}

                {/* Category Info */}
                <div className="glassmorphism rounded-lg p-4">
                  <div className="text-white/80 mb-2">Category</div>
                  <div className="text-white font-medium">{event.category}</div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="glassmorphism rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm">Standard Ticket</div>
                    <div className="text-white font-medium">
                      {eventWithPricing.standardPrice === 0 ? 'Free' : `$${eventWithPricing.standardPrice}`}
                    </div>
                  </div>
                  <Ticket className="h-5 w-5 text-cyber-blue" />
                </div>
              </div>
              <div className="glassmorphism rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm">VIP Ticket</div>
                    <div className="text-yellow-400 font-medium">
                      {eventWithPricing.vipPrice === 0 ? 'Free' : `$${eventWithPricing.vipPrice}`}
                    </div>
                  </div>
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20">
              <Button variant="glow" size="lg" onClick={handleBookTickets} className="flex-1">
                <Ticket className="h-5 w-5 mr-2" />
                Book Tickets
              </Button>
              
              {event.registrationLink && (
                <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full border-white/20 text-white hover:bg-white/10">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    External Link
                  </Button>
                </Link>
              )}
              
              <Button variant="outline" size="lg" onClick={onClose} className="border-white/20 text-white hover:bg-white/10">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}