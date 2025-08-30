'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface EventAnalytics {
  eventId: string
  eventName: string
  eventDate: string
  eventLocation: string
  registrations: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
  }
  revenue: {
    total: number
    average: number
    byTicketType: Array<{
      name: string
      count: number
      revenue: number
    }>
  }
  demographics: {
    ageGroups: Array<{ range: string; count: number }>
    genderDistribution: Array<{ gender: string; count: number }>
    topLocations: Array<{ city: string; count: number }>
  }
  engagement: {
    checkInRate: number
    averageRating: number
    feedbackCount: number
  }
  trends: {
    dailyRegistrations: Array<{ date: string; count: number }>
    hourlyDistribution: Array<{ hour: number; count: number }>
  }
}

export default function EventAnalytics() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (eventId) {
      fetchAnalytics()
    }
  }, [eventId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/organizer/analytics/${eventId}`)
      const result = await response.json()
      
      if (response.ok) {
        setAnalytics(result.analytics)
      } else {
        setError(result.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const handleExportData = () => {
    // TODO: Implement CSV/PDF export functionality
    alert('Export functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100/70">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Analytics</h1>
            <p className="text-white/70 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchAnalytics} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link href="/organizer/dashboard">
                <Button variant="cyber" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-cyan-400 mb-4">Analytics Not Available</h1>
            <p className="text-white/70 mb-6">Analytics data is not available for this event yet.</p>
            <Link href="/organizer/dashboard">
              <Button variant="cyber" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <main className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/organizer/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{analytics.eventName}</h1>
              <p className="text-cyan-100/70">Event Analytics Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="cyber" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glassmorphism border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-cyan-100/70 text-sm">Event Date</p>
                  <p className="text-white font-semibold">{analytics.eventDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-cyan-100/70 text-sm">Location</p>
                  <p className="text-white font-semibold">{analytics.eventLocation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-cyan-100/70 text-sm">Check-in Rate</p>
                  <p className="text-white font-semibold">{analytics.engagement.checkInRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glassmorphism border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100/70 text-sm">Total Registrations</p>
                  <p className="text-3xl font-bold text-white">{analytics.registrations.total}</p>
                </div>
                <Users className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100/70 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">${analytics.revenue.total}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100/70 text-sm">Confirmed</p>
                  <p className="text-3xl font-bold text-white">{analytics.registrations.confirmed}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100/70 text-sm">Avg. Rating</p>
                  <p className="text-3xl font-bold text-white">{analytics.engagement.averageRating}/5</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-cyan-400" />
                Registration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">Confirmed</span>
                  </div>
                  <span className="text-white font-semibold">{analytics.registrations.confirmed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-white">Pending</span>
                  </div>
                  <span className="text-white font-semibold">{analytics.registrations.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-white">Cancelled</span>
                  </div>
                  <span className="text-white font-semibold">{analytics.registrations.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                Revenue by Ticket Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.revenue.byTicketType.map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                        {ticket.name}
                      </Badge>
                      <span className="text-white">{ticket.count} sold</span>
                    </div>
                    <span className="text-white font-semibold">${ticket.revenue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Age Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.demographics.ageGroups.map((group, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white/80">{group.range}</span>
                    <span className="text-white font-semibold">{group.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.demographics.genderDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white/80">{item.gender}</span>
                    <span className="text-white font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Top Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.demographics.topLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white/80">{location.city}</span>
                    <span className="text-white font-semibold">{location.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className="glassmorphism border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-2">
                  {analytics.engagement.checkInRate}%
                </div>
                <p className="text-white/70">Check-in Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {analytics.engagement.averageRating}/5
                </div>
                <p className="text-white/70">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {analytics.engagement.feedbackCount}
                </div>
                <p className="text-white/70">Feedback Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
