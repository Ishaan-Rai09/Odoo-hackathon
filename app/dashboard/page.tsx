'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Ticket,
  Settings,
  Activity,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100/70">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
              <p className="text-white/60 mb-8">Please sign in to access your dashboard</p>
              <Link href="/sign-in">
                <Button variant="cyber" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-xl text-white/80">
                Here's your event dashboard overview
              </p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glassmorphism border-cyan-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100/70 text-sm">Total Bookings</p>
                        <p className="text-2xl font-bold text-white">0</p>
                      </div>
                      <Ticket className="h-8 w-8 text-cyan-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="glassmorphism border-green-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100/70 text-sm">Upcoming Events</p>
                        <p className="text-2xl font-bold text-white">0</p>
                      </div>
                      <Calendar className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="glassmorphism border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100/70 text-sm">Total Spent</p>
                        <p className="text-2xl font-bold text-white">$0</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="glassmorphism border-yellow-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100/70 text-sm">Account Status</p>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Active
                        </Badge>
                      </div>
                      <Activity className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="lg:col-span-1"
              >
                <Card className="glassmorphism border-white/20">
                  <CardHeader>
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <User className="h-5 w-5 mr-2 text-cyan-400" />
                      Profile Information
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-cyan-400" />
                      <span className="text-white/80">{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-green-400" />
                        <span className="text-white/80">{user.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span className="text-white/80">
                        Joined {user.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    {user.lastLogin && (
                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-yellow-400" />
                        <span className="text-white/80">
                          Last login: {user.lastLogin.toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-4">
                      <Link href="/profile">
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="lg:col-span-2 space-y-6"
              >
                <Card className="glassmorphism border-white/20">
                  <CardHeader>
                    <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/events">
                        <Button variant="cyber" size="lg" className="w-full h-20 flex-col">
                          <Calendar className="h-6 w-6 mb-2" />
                          Browse Events
                        </Button>
                      </Link>
                      
                      <Link href="/my-bookings">
                        <Button variant="outline" size="lg" className="w-full h-20 flex-col border-white/20 text-white hover:bg-white/10">
                          <Ticket className="h-6 w-6 mb-2" />
                          My Bookings
                        </Button>
                      </Link>
                      
                      <Link href="/referral">
                        <Button variant="outline" size="lg" className="w-full h-20 flex-col border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                          <TrendingUp className="h-6 w-6 mb-2" />
                          Referral Program
                        </Button>
                      </Link>
                      
                      <Link href="/profile">
                        <Button variant="outline" size="lg" className="w-full h-20 flex-col border-white/20 text-white hover:bg-white/10">
                          <Settings className="h-6 w-6 mb-2" />
                          Account Settings
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Welcome Message */}
                <Card className="glassmorphism border-green-500/30">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        🎉 Welcome to Elite Events!
                      </h4>
                      <p className="text-white/70 mb-4">
                        Start exploring amazing events and book your tickets today.
                      </p>
                      <Link href="/events">
                        <Button variant="cyber">
                          Explore Events
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
