'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Upload, 
  Plus, 
  Trash2,
  DollarSign,
  Users,
  Settings,
  Save,
  Eye,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

// Types for form data
interface TicketType {
  id: string
  name: string
  price: number
  maxTickets: number
  maxPerUser: number
  salesStart: string
  salesEnd: string
}

interface CustomQuestion {
  id: string
  question: string
  type: 'text' | 'email' | 'phone' | 'select'
  required: boolean
  options?: string[]
}

interface EventFormData {
  name: string
  description: string
  category: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  registrationStart: string
  registrationStartTime: string
  registrationEnd: string
  registrationEndTime: string
  locationName: string
  locationAddress: string
  locationLat: number
  locationLng: number
  coverImage: string
  ticketTypes: TicketType[]
  customQuestions: CustomQuestion[]
  isPublished: boolean
}

export default function CreateEventPage() {
  const [organizer, setOrganizer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    category: 'technical',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    registrationStart: '',
    registrationStartTime: '',
    registrationEnd: '',
    registrationEndTime: '',
    locationName: '',
    locationAddress: '',
    locationLat: 0,
    locationLng: 0,
    coverImage: '',
    ticketTypes: [
      {
        id: 'standard',
        name: 'Standard',
        price: 0,
        maxTickets: 100,
        maxPerUser: 2,
        salesStart: '',
        salesEnd: ''
      }
    ],
    customQuestions: [
      { id: 'name', question: 'Name', type: 'text', required: true },
      { id: 'email', question: 'Email', type: 'email', required: true },
      { id: 'phone', question: 'Phone', type: 'phone', required: true }
    ],
    isPublished: false
  })

  useEffect(() => {
    const organizerData = localStorage.getItem('organizer')
    if (organizerData) {
      setOrganizer(JSON.parse(organizerData))
    } else {
      router.push('/organizer/signin')
    }
  }, [router])

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`,
      name: 'VIP',
      price: 50,
      maxTickets: 50,
      maxPerUser: 1,
      salesStart: formData.registrationStart,
      salesEnd: formData.registrationEnd
    }
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicket]
    }))
  }

  const updateTicketType = (id: string, updates: Partial<TicketType>) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map(ticket =>
        ticket.id === id ? { ...ticket, ...updates } : ticket
      )
    }))
  }

  const removeTicketType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter(ticket => ticket.id !== id)
    }))
  }

  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: `question-${Date.now()}`,
      question: '',
      type: 'text',
      required: false
    }
    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, newQuestion]
    }))
  }

  const updateCustomQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map(q =>
        q.id === id ? { ...q, ...updates } : q
      )
    }))
  }

  const removeCustomQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter(q => q.id !== id)
    }))
  }

  const handleLocationSearch = async () => {
    if (!formData.locationAddress) {
      toast({
        title: "No Address",
        description: "Please enter an address first",
        variant: "destructive"
      })
      return
    }

    setIsLoadingLocation(true)

    try {
      // Using a free geocoding service (Nominatim)
      const query = encodeURIComponent(formData.locationAddress)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const location = data[0]
        const lat = parseFloat(location.lat)
        const lng = parseFloat(location.lon)
        
        handleInputChange('locationLat', lat)
        handleInputChange('locationLng', lng)
        
        // Update location name if not set
        if (!formData.locationName) {
          handleInputChange('locationName', location.display_name.split(',')[0])
        }
        
        toast({
          title: "Location Found",
          description: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        })
      } else {
        toast({
          title: "Location Not Found",
          description: "Please check your address and try again",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search for location. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // For now, we'll use a placeholder URL
      // In production, you would upload to a service like AWS S3, Cloudinary, etc.
      const imageUrl = `https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop`
      
      handleInputChange('coverImage', imageUrl)
      
      toast({
        title: "Image Uploaded",
        description: "Cover image uploaded successfully"
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (publish: boolean = false) => {
    setIsLoading(true)
    try {
      const eventData = {
        ...formData,
        startDate: new Date(`${formData.startDate}T${formData.startTime}`),
        endDate: new Date(`${formData.endDate}T${formData.endTime}`),
        registrationStart: new Date(`${formData.registrationStart}T${formData.registrationStartTime}`),
        registrationEnd: new Date(`${formData.registrationEnd}T${formData.registrationEndTime}`),
        isPublished: publish,
        ticketTypes: formData.ticketTypes.map(ticket => ({
          ...ticket,
          salesStart: new Date(`${ticket.salesStart}T00:00`),
          salesEnd: new Date(`${ticket.salesEnd}T23:59`)
        }))
      }

      const response = await fetch('/api/organizer/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        toast({
          title: publish ? "Event Published!" : "Event Saved!",
          description: `Your event has been ${publish ? 'published' : 'saved as draft'} successfully.`
        })
        router.push('/organizer/dashboard')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create event",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!organizer) {
    return <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
      <div className="cyber-spinner" />
    </div>
  }

  const steps = [
    { id: 1, title: "Event Details", description: "Basic information about your event" },
    { id: 2, title: "Date & Time", description: "When your event will happen" },
    { id: 3, title: "Location", description: "Where your event will take place" },
    { id: 4, title: "Tickets", description: "Pricing and ticket types" },
    { id: 5, title: "Questions", description: "Registration requirements" },
    { id: 6, title: "Review", description: "Final review and publish" }
  ]

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
                <h1 className="text-xl font-bold gradient-text">Create New Event</h1>
                <p className="text-white/60 text-sm">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                variant="glow" 
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish Event
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <Card className="glassmorphism sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                      currentStep === step.id
                        ? 'bg-cyber-blue/20 border border-cyber-blue/30'
                        : currentStep > step.id
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === step.id
                        ? 'bg-cyber-blue text-black'
                        : currentStep > step.id
                        ? 'bg-green-500 text-black'
                        : 'bg-white/20 text-white'
                    }`}>
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{step.title}</p>
                      <p className="text-white/60 text-xs">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="gradient-text">Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Event Name *</Label>
                      <Input
                        placeholder="Enter event name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Description *</Label>
                      <Textarea
                        placeholder="Describe your event..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        className="bg-white/10 border-white/20 text-white resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Category *</Label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="technical" className="bg-gray-800 text-white">Technical</option>
                        <option value="entertainment" className="bg-gray-800 text-white">Entertainment</option>
                        <option value="business" className="bg-gray-800 text-white">Business</option>
                        <option value="sports" className="bg-gray-800 text-white">Sports</option>
                        <option value="other" className="bg-gray-800 text-white">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Cover Image</Label>
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Event cover preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImagePreview(null)
                                handleInputChange('coverImage', '')
                              }}
                              className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyber-blue/50 transition-colors">
                          <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
                          <p className="text-white/60 mb-4">
                            {isUploading ? 'Uploading...' : 'Upload event cover image'}
                          </p>
                          <p className="text-white/40 text-xs mb-4">Supports JPG, PNG, WebP up to 5MB</p>
                          <label htmlFor="cover-image-input">
                            <Button variant="outline" disabled={isUploading} asChild>
                              <span>
                                {isUploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  'Choose Image'
                                )}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="cover-image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="gradient-text">Date & Time</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white">Start Date *</Label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Start Time *</Label>
                        <Input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => handleInputChange('startTime', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white">End Date *</Label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">End Time *</Label>
                        <Input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => handleInputChange('endTime', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Registration Period</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-white">Registration Start Date *</Label>
                          <Input
                            type="date"
                            value={formData.registrationStart}
                            onChange={(e) => handleInputChange('registrationStart', e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Registration Start Time *</Label>
                          <Input
                            type="time"
                            value={formData.registrationStartTime}
                            onChange={(e) => handleInputChange('registrationStartTime', e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-2">
                          <Label className="text-white">Registration End Date *</Label>
                          <Input
                            type="date"
                            value={formData.registrationEnd}
                            onChange={(e) => handleInputChange('registrationEnd', e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Registration End Time *</Label>
                          <Input
                            type="time"
                            value={formData.registrationEndTime}
                            onChange={(e) => handleInputChange('registrationEndTime', e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="gradient-text">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Location Name *</Label>
                      <Input
                        placeholder="e.g. Tech Hub Convention Center"
                        value={formData.locationName}
                        onChange={(e) => handleInputChange('locationName', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Address *</Label>
                      <Textarea
                        placeholder="Enter full address..."
                        value={formData.locationAddress}
                        onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                        rows={3}
                        className="bg-white/10 border-white/20 text-white resize-none"
                      />
                    </div>

                    {/* Location Search */}
                    <div className="space-y-2">
                      <Label className="text-white">Find Location</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={handleLocationSearch}
                          disabled={isLoadingLocation || !formData.locationAddress}
                          className="flex items-center space-x-2"
                        >
                          {isLoadingLocation ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Searching...
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4" />
                              Search Location
                            </>
                          )}
                        </Button>
                        {formData.locationLat !== 0 && formData.locationLng !== 0 && (
                          <div className="flex-1 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                            <p className="text-green-400 text-sm">
                              📍 Coordinates: {formData.locationLat.toFixed(4)}, {formData.locationLng.toFixed(4)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Map Display Placeholder */}
                    <div className="space-y-2">
                      <Label className="text-white">Location Preview</Label>
                      <div className="bg-white/10 rounded-lg h-64 flex items-center justify-center border border-white/20">
                        {formData.locationLat !== 0 && formData.locationLng !== 0 ? (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-cyber-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <MapPin className="h-8 w-8 text-cyber-blue" />
                            </div>
                            <p className="text-white/80 font-medium mb-2">{formData.locationName}</p>
                            <p className="text-white/60 text-sm mb-2">{formData.locationAddress}</p>
                            <p className="text-cyber-blue text-xs">
                              Lat: {formData.locationLat.toFixed(6)}, Lng: {formData.locationLng.toFixed(6)}
                            </p>
                            <p className="text-white/40 text-xs mt-2">Google Maps integration coming soon</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <MapPin className="h-12 w-12 text-white/40 mx-auto mb-4" />
                            <p className="text-white/60 mb-2">Enter an address and search to find coordinates</p>
                            <p className="text-white/40 text-xs">Google Maps integration will be displayed here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="gradient-text">Ticket Types</CardTitle>
                      <Button variant="outline" onClick={addTicketType}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Ticket Type
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {formData.ticketTypes.map((ticket, index) => (
                      <div key={ticket.id} className="border border-white/10 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            Ticket Type #{index + 1}
                          </h3>
                          {formData.ticketTypes.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTicketType(ticket.id)}
                              className="text-red-400 border-red-400/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Ticket Name *</Label>
                            <Input
                              value={ticket.name}
                              onChange={(e) => updateTicketType(ticket.id, { name: e.target.value })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Price ($) *</Label>
                            <Input
                              type="number"
                              value={ticket.price}
                              onChange={(e) => updateTicketType(ticket.id, { price: Number(e.target.value) })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Max Tickets *</Label>
                            <Input
                              type="number"
                              value={ticket.maxTickets}
                              onChange={(e) => updateTicketType(ticket.id, { maxTickets: Number(e.target.value) })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-white">Max Per User *</Label>
                            <Input
                              type="number"
                              value={ticket.maxPerUser}
                              onChange={(e) => updateTicketType(ticket.id, { maxPerUser: Number(e.target.value) })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Sales Start Date *</Label>
                            <Input
                              type="date"
                              value={ticket.salesStart}
                              onChange={(e) => updateTicketType(ticket.id, { salesStart: e.target.value })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Sales End Date *</Label>
                            <Input
                              type="date"
                              value={ticket.salesEnd}
                              onChange={(e) => updateTicketType(ticket.id, { salesEnd: e.target.value })}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg p-4">
                      <h3 className="text-cyber-blue font-semibold mb-2">Summary</h3>
                      <div className="text-white/80 text-sm space-y-1">
                        <p>Total Capacity: {formData.ticketTypes.reduce((sum, t) => sum + t.maxTickets, 0)} tickets</p>
                        <p>Revenue Potential: ${formData.ticketTypes.reduce((sum, t) => sum + (t.price * t.maxTickets), 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 5 && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="gradient-text">Registration Questions</CardTitle>
                      <Button variant="outline" onClick={addCustomQuestion}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {formData.customQuestions.map((question, index) => (
                      <div key={question.id} className="border border-white/10 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            Question #{index + 1}
                          </h3>
                          {formData.customQuestions.length > 3 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCustomQuestion(question.id)}
                              className="text-red-400 border-red-400/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Question Text *</Label>
                            <Input
                              value={question.question}
                              onChange={(e) => updateCustomQuestion(question.id, { question: e.target.value })}
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="Enter your question"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Question Type *</Label>
                            <select
                              value={question.type}
                              onChange={(e) => updateCustomQuestion(question.id, { type: e.target.value as any })}
                              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="select">Multiple Choice</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateCustomQuestion(question.id, { required: e.target.checked })}
                              className="form-checkbox text-cyber-blue"
                            />
                            <span className="text-white">Required field</span>
                          </label>
                        </div>
                      </div>
                    ))}

                    <div className="bg-cyber-purple/10 border border-cyber-purple/20 rounded-lg p-4">
                      <p className="text-cyber-purple text-sm">
                        <strong>Note:</strong> Name, Email, and Phone are default required fields for all events. Additional questions will be shown during registration.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 6 && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="gradient-text">Review & Publish</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-white mb-2">Event Details</h3>
                          <p className="text-white/80 text-sm">{formData.name}</p>
                          <p className="text-white/60 text-sm capitalize">{formData.category}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-white mb-2">Date & Time</h3>
                          <p className="text-white/80 text-sm">
                            {formData.startDate} at {formData.startTime}
                          </p>
                          <p className="text-white/60 text-sm">
                            Registration: {formData.registrationStart} - {formData.registrationEnd}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-white mb-2">Location</h3>
                          <p className="text-white/80 text-sm">{formData.locationName}</p>
                          <p className="text-white/60 text-sm">{formData.locationAddress}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-white mb-2">Tickets</h3>
                          {formData.ticketTypes.map((ticket, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-white/80">{ticket.name}</span>
                              <span className="text-white/60">${ticket.price} x {ticket.maxTickets}</span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <h3 className="font-semibold text-white mb-2">Questions</h3>
                          <p className="text-white/80 text-sm">{formData.customQuestions.length} custom questions</p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-white mb-2">Capacity</h3>
                          <p className="text-white/80 text-sm">
                            {formData.ticketTypes.reduce((sum, t) => sum + t.maxTickets, 0)} total tickets
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="cyber"
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  disabled={currentStep === steps.length}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
