'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Building, User, Phone, Globe } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function OrganizerSignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    phone: '',
    website: '',
    description: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/organizer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Account created successfully!",
          description: "Welcome to Elite Events Organizer Portal."
        })
        
        // Store organizer data in localStorage
        localStorage.setItem('organizer', JSON.stringify(data.organizer))
        
        // Redirect to organizer dashboard
        router.push('/organizer/dashboard')
      } else {
        toast({
          title: "Registration failed",
          description: data.error || "Please check your information and try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <main className="pt-20 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/">
              <Button variant="ghost" className="text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>

          {/* Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glassmorphism border-cyber-blue/30">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyber-purple to-cyber-pink rounded-2xl flex items-center justify-center">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold gradient-text">
                  Join as Organizer
                </CardTitle>
                <p className="text-white/60 mt-2">
                  Create an account to start organizing amazing events
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                        Personal Information
                      </h3>
                      
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                          Full Name *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyber-blue"
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email Address *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyber-blue"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">
                          Password *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyber-blue"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Organization Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                        Organization Details
                      </h3>
                      
                      {/* Organization Name */}
                      <div className="space-y-2">
                        <Label htmlFor="organizationName" className="text-white">
                          Organization Name *
                        </Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                          <Input
                            id="organizationName"
                            name="organizationName"
                            type="text"
                            placeholder="Your Company/Organization"
                            value={formData.organizationName}
                            onChange={handleChange}
                            required
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyber-blue"
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyber-blue"
                          />
                        </div>
                      </div>

                      {/* Website Field */}
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-white">
                          Website
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            placeholder="https://yourcompany.com"
                            value={formData.website}
                            onChange={handleChange}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyber-blue"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Organization Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Tell us about your organization and what types of events you organize..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyber-blue resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="glow"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Organizer Account'}
                  </Button>
                </form>

                {/* Sign In Link */}
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-white/60">
                    Already have an organizer account?{' '}
                    <Link 
                      href="/organizer/signin" 
                      className="text-cyber-blue hover:text-cyber-pink transition-colors font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-cyber-purple/10 border border-cyber-purple/20 rounded-lg p-4">
                  <p className="text-cyber-purple text-sm">
                    <strong>Benefits:</strong> Access to event creation tools, registration management, analytics dashboard, attendee communication, and promotional features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
