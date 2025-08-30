'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Image as ImageIcon, Tag, Trophy } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import eventsData from '@/data/events.json'

interface EventFormProps {
  isOpen: boolean
  onClose: () => void
  event?: any
}

export function EventForm({ isOpen, onClose, event }: EventFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    image: '',
    category: '',
    club: '',
    maxParticipants: '',
    registrationLink: '',
    badges: [] as string[],
    difficulty: '',
    prizes: '',
  })

  const [availableBadges] = useState([
    'Hot', 'New', 'Popular', 'Registration Closing Soon', 
    'Championship', 'Cultural', 'Creative', 'Urban', 
    'Fast-paced', 'Gaming'
  ])

  const [difficulties] = useState([
    'Beginner', 'Intermediate', 'Advanced', 'Expert', 'All Levels', 'Competitive'
  ])

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        venue: event.venue || '',
        image: event.image || '',
        category: event.categoryId || '',
        club: event.clubName || '',
        maxParticipants: event.maxParticipants?.toString() || '',
        registrationLink: event.registrationLink || '',
        badges: event.badges || [],
        difficulty: event.difficulty || '',
        prizes: event.prizes || '',
      })
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        image: '',
        category: '',
        club: '',
        maxParticipants: '',
        registrationLink: '',
        badges: [],
        difficulty: '',
        prizes: '',
      })
    }
  }, [event, isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBadgeToggle = (badge: string) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Here you would typically send the data to your backend
      // For now, we'll just show a success message
      
      toast({
        title: event ? "Event Updated" : "Event Created",
        description: `${formData.title} has been ${event ? 'updated' : 'created'} successfully`,
      })
      
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyber-blue transition-colors"
                required
              >
                <option value="">Select Category</option>
                {Object.entries(eventsData.categories).map(([key, category]: [string, any]) => (
                  <option key={key} value={key} className="bg-black">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors resize-vertical"
              placeholder="Describe your event..."
              required
            />
          </div>

          {/* Date, Time, Venue */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyber-blue transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyber-blue transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Venue *
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                placeholder="Event venue"
                required
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyber-blue transition-colors"
              >
                <option value="">Select Difficulty</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty} className="bg-black">
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL and Registration Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <ImageIcon className="inline h-4 w-4 mr-1" />
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Registration Link
              </label>
              <input
                type="url"
                value={formData.registrationLink}
                onChange={(e) => handleInputChange('registrationLink', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
                placeholder="https://forms.google.com/..."
              />
            </div>
          </div>

          {/* Prizes */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Trophy className="inline h-4 w-4 mr-1" />
              Prizes
            </label>
            <input
              type="text"
              value={formData.prizes}
              onChange={(e) => handleInputChange('prizes', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyber-blue transition-colors"
              placeholder="e.g., $5,000 in prizes, Trophy + Certificate"
            />
          </div>

          {/* Badges */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              <Tag className="inline h-4 w-4 mr-1" />
              Event Badges
            </label>
            <div className="flex flex-wrap gap-2">
              {availableBadges.map((badge) => (
                <Badge
                  key={badge}
                  variant={formData.badges.includes(badge) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.badges.includes(badge)
                      ? 'bg-cyber-blue text-white'
                      : 'border-white/20 text-white/60 hover:border-cyber-blue hover:text-cyber-blue'
                  }`}
                  onClick={() => handleBadgeToggle(badge)}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" variant="glow">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}