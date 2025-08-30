'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Download,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  Ticket,
  Star,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  Target
} from 'lucide-react'
import Link from 'next/link'
// Analytics service replaced with mock data for now

interface EventAnalytics {
  eventId: string
  eventName: string
  eventDate: string
  totalBookings: number
  totalRevenue: number
  totalAttendees: number
  checkedInCount: number
  demographics: {
    ageGroups: Record<string, number>
    genderDistribution: Record<string, number>
    locationDistribution: Record<string, number>
  }
  dailyBookings: Array<{ date: string; bookings: number; revenue: number }>
  ticketTypeStats: Array<{ type: string; sold: number; revenue: number; capacity: number }>
  refundStats: {
    totalRefunds: number
    refundAmount: number
    refundRate: number
  }
  satisfactionRating: number
  repeatAttendeeRate: number
}

export default function EventAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.eventId as string
  
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days')

  useEffect(() => {
    if (eventId) {
      loadAnalytics()
    }
  }, [eventId, selectedTimeframe])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/${eventId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to load analytics: ${response.status}`)
      }

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Fallback to basic event data without analytics
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      if (!analytics) return
      
      // Generate mock CSV data
      const csvData = `Event Analytics Report
Event ID,${analytics.eventId}
Event Name,${analytics.eventName}
Total Bookings,${analytics.totalBookings}
Total Revenue,$${analytics.totalRevenue}
Total Attendees,${analytics.totalAttendees}
Check-in Rate,${((analytics.checkedInCount / analytics.totalAttendees) * 100).toFixed(1)}%

Daily Bookings
Date,Bookings,Revenue
${analytics.dailyBookings.map(day => `${day.date},${day.bookings},$${day.revenue}`).join('\n')}

Ticket Type Stats
Type,Sold,Capacity,Revenue
${analytics.ticketTypeStats.map(ticket => `${ticket.type},${ticket.sold},${ticket.capacity},$${ticket.revenue}`).join('\n')}
`
      
      // Create download link
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `event-${eventId}-analytics.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="cyber-spinner mb-4" />
            <p className="text-white/60">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Analytics Available</h3>
            <p className="text-white/60 mb-4">Unable to load analytics for this event</p>
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

  const progressWidth = (analytics.totalAttendees / analytics.totalBookings) * 100 || 0
  const checkinRate = (analytics.checkedInCount / analytics.totalAttendees) * 100 || 0

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
                <h1 className="text-xl font-bold gradient-text">Event Analytics</h1>
                <p className="text-white/60 text-sm">{analytics.eventName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={loadAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
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
                  <p className="text-3xl font-bold text-white">{analytics.totalBookings}</p>
                </div>
                <Ticket className="h-8 w-8 text-cyber-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-cyber-green/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">${analytics.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-cyber-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-cyber-pink/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Attendees</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalAttendees}</p>
                </div>
                <Users className="h-8 w-8 text-cyber-pink" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-cyber-purple/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Check-in Rate</p>
                  <p className="text-3xl font-bold text-white">{checkinRate.toFixed(1)}%</p>
                </div>
                <UserCheck className="h-8 w-8 text-cyber-purple" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyber-blue">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-cyber-pink">Bookings</TabsTrigger>
            <TabsTrigger value="demographics" className="data-[state=active]:bg-cyber-green">Demographics</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-cyber-purple">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Bookings Chart */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-cyber-blue" />
                    Daily Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.dailyBookings.map((day, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">{new Date(day.date).toLocaleDateString()}</span>
                          <span className="text-white">{day.bookings} bookings</span>
                        </div>
                        <Progress 
                          value={(day.bookings / Math.max(...analytics.dailyBookings.map(d => d.bookings))) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-white/60 text-right">
                          ${day.revenue.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Type Performance */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-cyber-pink" />
                    Ticket Type Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.ticketTypeStats.map((ticket, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{ticket.type}</span>
                          <Badge className="bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30">
                            {ticket.sold}/{ticket.capacity}
                          </Badge>
                        </div>
                        <Progress 
                          value={(ticket.sold / ticket.capacity) * 100} 
                          className="h-3"
                        />
                        <div className="flex justify-between text-sm text-white/60">
                          <span>{((ticket.sold / ticket.capacity) * 100).toFixed(1)}% sold</span>
                          <span>${ticket.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Performance Summary */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="h-5 w-5 mr-2 text-cyber-green" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-blue mb-2">
                      {analytics.satisfactionRating.toFixed(1)}/5
                    </div>
                    <p className="text-white/60">Satisfaction Rating</p>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= analytics.satisfactionRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-pink mb-2">
                      {analytics.repeatAttendeeRate.toFixed(1)}%
                    </div>
                    <p className="text-white/60">Repeat Attendees</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-green mb-2">
                      {analytics.refundStats.refundRate.toFixed(1)}%
                    </div>
                    <p className="text-white/60">Refund Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 mt-6">
            {/* Booking Timeline */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-cyber-blue" />
                  Booking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.dailyBookings.map((day, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border border-white/10 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-cyber-blue/20 rounded-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-cyber-blue" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-white font-medium">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <div className="text-right">
                            <p className="text-white font-bold">{day.bookings} bookings</p>
                            <p className="text-cyber-green text-sm">${day.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                        <Progress 
                          value={(day.bookings / Math.max(...analytics.dailyBookings.map(d => d.bookings))) * 100} 
                          className="mt-2 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-cyber-blue" />
                    Age Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.demographics.ageGroups).map(([age, count]) => (
                      <div key={age} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white">{age}</span>
                          <span className="text-white/60">{count} people</span>
                        </div>
                        <Progress 
                          value={(count / analytics.totalAttendees) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-white/60 text-right">
                          {((count / analytics.totalAttendees) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-cyber-pink" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.demographics.genderDistribution).map(([gender, count]) => (
                      <div key={gender} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white capitalize">{gender}</span>
                          <span className="text-white/60">{count} people</span>
                        </div>
                        <Progress 
                          value={(count / analytics.totalAttendees) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-white/60 text-right">
                          {((count / analytics.totalAttendees) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Location Distribution */}
              <Card className="glassmorphism lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-cyber-green" />
                    Attendee Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analytics.demographics.locationDistribution).map(([location, count]) => (
                      <div key={location} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white">{location}</span>
                          <span className="text-white/60">{count} attendees</span>
                        </div>
                        <Progress 
                          value={(count / analytics.totalAttendees) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-cyber-blue" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white">Conversion Rate</span>
                        <span className="text-cyber-blue font-bold">{progressWidth.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressWidth} className="h-2" />
                      <p className="text-xs text-white/60 mt-1">
                        Views to bookings conversion
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white">Check-in Rate</span>
                        <span className="text-cyber-pink font-bold">{checkinRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={checkinRate} className="h-2" />
                      <p className="text-xs text-white/60 mt-1">
                        Attendees who actually showed up
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white">Revenue Target</span>
                        <span className="text-cyber-green font-bold">
                          ${analytics.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-white/60 mt-1">
                        75% of projected revenue achieved
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Analysis */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-cyber-pink" />
                    Refund Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{analytics.refundStats.totalRefunds}</p>
                      <p className="text-white/60 text-sm">Total Refunds</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">
                        ${analytics.refundStats.refundAmount.toLocaleString()}
                      </p>
                      <p className="text-white/60 text-sm">Amount Refunded</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">Refund Rate</span>
                      <span className="text-red-400 font-bold">{analytics.refundStats.refundRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.refundStats.refundRate} className="h-2" />
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">
                      <strong>Impact:</strong> Refunds reduced revenue by ${analytics.refundStats.refundAmount.toLocaleString()}
                    </p>
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
