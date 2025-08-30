'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  BarChart3,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface Organizer {
  id: string
  name: string
  email: string
  organizationName: string
  phone?: string
  website?: string
  description?: string
  isVerified: boolean
  createdAt: string
}

export default function OrganizerDashboard() {
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get organizer data from localStorage
    const organizerData = localStorage.getItem('organizer')
    if (organizerData) {
      setOrganizer(JSON.parse(organizerData))
    } else {
      // Redirect to sign in if no organizer data
      router.push('/organizer/signin')
      return
    }

    // TODO: Fetch organizer's events from API
    // For now, using mock data
    const mockEvents = [
      {
        id: '1',
        name: 'Tech Conference 2024',
        startDate: '2024-04-15',
        category: 'technical',
        totalRegistrations: 156,
        maxCapacity: 200,
        status: 'published',
        revenue: 7800
      },
      {
        id: '2',
        name: 'Music Festival',
        startDate: '2024-04-22',
        category: 'entertainment',
        totalRegistrations: 89,
        maxCapacity: 150,
        status: 'draft',
        revenue: 2670
      }
    ]
    setEvents(mockEvents as any)
    setIsLoading(false)
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('organizer')
    router.push('/organizer/signin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="cyber-spinner" />
      </div>
    )
  }

  if (!organizer) {
    return null
  }

  // Calculate stats
  const stats = {
    totalEvents: events.length,
    totalRegistrations: events.reduce((sum: number, event: any) => sum + event.totalRegistrations, 0),
    totalRevenue: events.reduce((sum: number, event: any) => sum + event.revenue, 0),
    avgFillRate: Math.round(events.reduce((sum: number, event: any) => sum + (event.totalRegistrations / event.maxCapacity * 100), 0) / events.length)
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Organizer Dashboard
              </h1>
              <p className="text-white/60 text-sm">
                Welcome back, {organizer.name}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="glassmorphism border-cyber-blue/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {organizer.organizationName}
                  </h2>
                  <p className="text-white/70 mb-1">{organizer.email}</p>
                  {organizer.phone && (
                    <p className="text-white/70">{organizer.phone}</p>
                  )}
                  {organizer.website && (
                    <a 
                      href={organizer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyber-blue hover:text-cyber-pink transition-colors text-sm"
                    >
                      {organizer.website}
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <Badge 
                    className={
                      organizer.isVerified 
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {organizer.isVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                  <p className="text-white/60 text-sm mt-2">
                    Member since {new Date(organizer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-cyber-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-cyber-purple/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Fill Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.avgFillRate || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyber-purple" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Events Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Events</h2>
            <Link href="/organizer/create-event">
              <Button variant="glow" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Event
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="glassmorphism">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No events yet
                  </h3>
                  <p className="text-white/60 mb-6">
                    Create your first event to start engaging with your audience
                  </p>
                  <Link href="/organizer/create-event">
                    <Button variant="cyber">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              events.map((event: any) => (
                <Card key={event.id} className="glassmorphism">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {event.name}
                          </h3>
                          <Badge 
                            className={
                              event.status === 'published' 
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }
                          >
                            {event.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.totalRegistrations}/{event.maxCapacity} registered
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${event.revenue.toLocaleString()} revenue
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-cyber-blue to-cyber-pink h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(event.totalRegistrations / event.maxCapacity) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-white/60">
                          {Math.round((event.totalRegistrations / event.maxCapacity) * 100)}% capacity filled
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-6">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-400 border-red-400/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
