'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Edit3,
  Save,
  X,
  Users, 
  DollarSign, 
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Settings,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Event {
  _id: string
  name: string
  description: string
  category: string
  startDate: string
  endDate: string
  location: {
    name: string
    address: string
    coordinates?: { lat: number; lng: number }
  }
  ticketTypes: Array<{
    name: string
    price: number
    maxTickets: number
    maxPerUser: number
    soldCount: number
  }>
  maxCapacity: number
  totalRegistrations: number
  coverImage?: string
  isPublished: boolean
  registrationStart: string
  registrationEnd: string
  organizer: string
  customQuestions: Array<{
    question: string
    type: string
    required: boolean
    options?: string[]
  }>
}

export default function OrganizerEventDetails() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Event>>({})

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/organizer/events/${eventId}`)
      const result = await response.json()
      
      if (response.ok) {
        setEvent(result.event)
        setEditForm(result.event)
      } else {
        setError(result.error || 'Failed to fetch event')
      }
    } catch (err) {
      setError('Failed to load event data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/organizer/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setEvent(result.event)
        setEditing(false)
      } else {
        setError(result.error || 'Failed to update event')
      }
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm(event || {})
    setEditing(false)
    setError('')
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/organizer/events/${eventId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.push('/organizer/dashboard')
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to delete event')
      }
    } catch (err) {
      setError('Failed to delete event')
    }
  }

  const togglePublishStatus = async () => {
    try {
      const response = await fetch(`/api/organizer/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !event?.isPublished }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setEvent(result.event)
      } else {
        setError(result.error || 'Failed to update publish status')
      }
    } catch (err) {
      setError('Failed to update publish status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100/70">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Event</h1>
            <p className="text-white/70 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchEvent} variant="outline" className="w-full">
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

  if (!event) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-cyan-400 mb-4">Event Not Found</h1>
            <p className="text-white/70 mb-6">The event you're looking for doesn't exist or you don't have permission to view it.</p>
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
              <h1 className="text-3xl font-bold text-white">{event.name}</h1>
              <p className="text-cyan-100/70">Event Details & Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant={event.isPublished ? "default" : "outline"}
              className={event.isPublished ? "bg-green-500/20 text-green-400 border-green-500/30" : "border-yellow-500/30 text-yellow-400"}
            >
              {event.isPublished ? 'Published' : 'Draft'}
            </Badge>
            
            {!editing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Link href={`/organizer/analytics/${eventId}`}>
                  <Button variant="cyber" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  variant="cyber" 
                  size="sm" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <Label className="text-cyan-100">Event Name</Label>
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="bg-slate-800/50 border-cyan-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-100">Description</Label>
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="bg-slate-800/50 border-cyan-500/30 text-white min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-100">Category</Label>
                    <Input
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="bg-slate-800/50 border-cyan-500/30 text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-cyan-100/70 text-sm">Start Date</p>
                      <p className="text-white">{new Date(event.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-cyan-100/70 text-sm">Time</p>
                      <p className="text-white">{new Date(event.startDate).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-cyan-100/70 text-sm">Location</p>
                      <p className="text-white">{event.location.name}</p>
                      <p className="text-white/60 text-sm">{event.location.address}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-cyan-100/70 text-sm mb-2">Description</p>
                    <p className="text-white/80">{event.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glassmorphism border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Event Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{event.totalRegistrations}</div>
                    <p className="text-white/70 text-sm">Registrations</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{event.maxCapacity}</div>
                    <p className="text-white/70 text-sm">Max Capacity</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Category</span>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                      {event.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Registration</span>
                    <Badge 
                      variant={event.isPublished ? "default" : "outline"}
                      className={event.isPublished ? "bg-green-500/20 text-green-400 border-green-500/30" : "border-yellow-500/30 text-yellow-400"}
                    >
                      {event.isPublished ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Types */}
        <Card className="glassmorphism border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-400" />
              Ticket Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.ticketTypes.map((ticket, index) => (
                <div key={index} className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{ticket.name}</h4>
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      ${ticket.price}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Sold</span>
                      <span className="text-white">{ticket.soldCount}/{ticket.maxTickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Max per user</span>
                      <span className="text-white">{ticket.maxPerUser}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(ticket.soldCount / ticket.maxTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`/organizer/analytics/${eventId}`}>
            <Button variant="cyber" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
          
          <Link href={`/events/details/${eventId}`} target="_blank">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <Eye className="h-4 w-4 mr-2" />
              Preview Event
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
            onClick={togglePublishStatus}
          >
            <Settings className="h-4 w-4 mr-2" />
            {event.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Event
          </Button>
        </div>
      </main>
    </div>
  )
}
