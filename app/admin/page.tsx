'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/auth-context'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Users, Calendar, TrendingUp, Eye } from 'lucide-react'
import { EventForm } from '@/components/event-form'
import eventsData from '@/data/events.json'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  // Check if user is admin (you can implement your own logic here)
  const isAdmin = user?.email?.includes('admin') || user?.role === 'admin'

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="cyber-spinner" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/60">Please sign in to access the admin panel</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-white/60">You don't have permission to access this page</p>
        </div>
      </div>
    )
  }

  // Get all events for admin view
  const getAllEvents = () => {
    const allEvents: any[] = []
    Object.values(eventsData.categories).forEach((category: any) => {
      Object.values(category.clubs).forEach((club: any) => {
        club.events.forEach((event: any) => {
          allEvents.push({
            ...event,
            clubName: club.name,
            categoryName: category.name,
            categoryId: category.id,
          })
        })
      })
    })
    return allEvents
  }

  const allEvents = getAllEvents()

  // Calculate stats
  const stats = {
    totalEvents: allEvents.length,
    totalRegistrations: allEvents.reduce((sum, event) => sum + (event.currentParticipants || 0), 0),
    totalClubs: Object.values(eventsData.categories).reduce((sum, category: any) => 
      sum + Object.keys(category.clubs).length, 0),
    avgRegistrationRate: Math.round(
      allEvents.reduce((sum, event) => {
        if (event.maxParticipants) {
          return sum + (event.currentParticipants / event.maxParticipants * 100)
        }
        return sum
      }, 0) / allEvents.filter(e => e.maxParticipants).length
    )
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-white">Admin </span>
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-white/80">Manage events, clubs, and platform analytics</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="glassmorphism border-cyber-blue/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Events</p>
                    <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-cyber-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-cyber-pink/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Registrations</p>
                    <p className="text-3xl font-bold text-white">{stats.totalRegistrations}</p>
                  </div>
                  <Users className="h-8 w-8 text-cyber-pink" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-cyber-green/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Active Clubs</p>
                    <p className="text-3xl font-bold text-white">{stats.totalClubs}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-cyber-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-cyber-purple/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Avg Fill Rate</p>
                    <p className="text-3xl font-bold text-white">{stats.avgRegistrationRate}%</p>
                  </div>
                  <Eye className="h-8 w-8 text-cyber-purple" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="events" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
                <TabsTrigger value="events">Events Management</TabsTrigger>
                <TabsTrigger value="clubs">Clubs Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Events Management */}
              <TabsContent value="events" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Events Management</h2>
                  <Button 
                    variant="glow" 
                    onClick={() => setIsEventFormOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Event
                  </Button>
                </div>

                <div className="grid gap-4">
                  {allEvents.map((event) => (
                    <Card key={event.id} className="glassmorphism">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {event.categoryName}
                              </Badge>
                              {event.badges?.map((badge: string) => (
                                <Badge key={badge} className="text-xs bg-cyber-blue/20 text-cyber-blue">
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-white/70 mb-2">{event.clubName}</p>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <span>{event.date} at {event.time}</span>
                              <span>{event.venue}</span>
                              {event.maxParticipants && (
                                <span>{event.currentParticipants}/{event.maxParticipants} registered</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingEvent(event)
                                setIsEventFormOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-400 border-red-400/30">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Clubs Overview */}
              <TabsContent value="clubs" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Clubs Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(eventsData.categories).map((category: any) =>
                    Object.values(category.clubs).map((club: any) => (
                      <Card key={club.id} className="glassmorphism">
                        <CardHeader>
                          <CardTitle className="text-white">{club.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/70 mb-4">{club.description}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{category.name}</Badge>
                            <span className="text-sm text-white/60">
                              {club.events.length} events
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="text-white">Events by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(eventsData.categories).map(([key, category]: [string, any]) => {
                        const eventCount = Object.values(category.clubs).reduce(
                          (sum: number, club: any) => sum + club.events.length, 0
                        )
                        return (
                          <div key={key} className="flex justify-between items-center py-2">
                            <span className="text-white/80">{category.name}</span>
                            <span className="text-white font-medium">{eventCount}</span>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="text-white">Registration Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-cyber-blue mb-2">
                            {stats.avgRegistrationRate}%
                          </div>
                          <div className="text-white/60">Average Fill Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyber-pink mb-2">
                            {Math.round(stats.totalRegistrations / stats.totalEvents)}
                          </div>
                          <div className="text-white/60">Avg Registrations per Event</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Event Form Modal */}
      <EventForm
        isOpen={isEventFormOpen}
        onClose={() => {
          setIsEventFormOpen(false)
          setEditingEvent(null)
        }}
        event={editingEvent}
      />
    </div>
  )
}