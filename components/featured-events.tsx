'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react'
import { formatDate, formatTime, getBadgeColor, getRegistrationProgress } from '@/lib/utils'
import eventsData from '@/data/events.json'
import Image from 'next/image'
import Link from 'next/link'

export function FeaturedEvents() {
  // Get featured events from all categories
  const getFeaturedEvents = () => {
    const allEvents: any[] = []
    Object.entries(eventsData.categories).forEach(([categoryKey, category]: [string, any]) => {
      category.events.forEach((event: any) => {
        if (event.featured) {
          allEvents.push({
            ...event,
            categoryId: category.id || categoryKey,
            categoryName: category.name,
          })
        }
      })
    })
    return allEvents.slice(0, 6) // Show only 6 featured events
  }

  const featuredEvents = getFeaturedEvents()

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Featured</span>
            <span className="text-white"> Events</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Don't miss out on these amazing events happening soon. Register now to secure your spot!
          </p>
        </motion.div>

        {/* Featured Events Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                      {event.categoryName}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Event Title & Organizer */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyber-blue transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-cyber-blue text-sm font-medium">
                      by {event.organizer?.organization || 'Elite Events'}
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
                      {event.venue}
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
                              event.registeredCount || event.currentParticipants,
                              event.maxParticipants
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Prizes */}
                  {event.prizes && (
                    <div className="mb-4">
                      <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
                        🏆 {Array.isArray(event.prizes) ? `${event.prizes.length} Prizes` : event.prizes}
                      </Badge>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="flex gap-3">
                    <Link href={`/events/${event.categoryId}/${event.id}`} className="flex-1">
                      <Button variant="cyber" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="glow" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Events CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/events">
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
              View All Events
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}