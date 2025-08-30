'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Building } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function OrganizerSignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/organizer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully."
        })
        
        // Store organizer data in localStorage
        localStorage.setItem('organizer', JSON.stringify(data.organizer))
        
        // Redirect to organizer dashboard
        router.push('/organizer/dashboard')
      } else {
        toast({
          title: "Sign in failed",
          description: data.error || "Please check your credentials and try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Sign in error:', error)
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
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Sign In Form */}
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
                <CardTitle className="text-2xl font-bold gradient-text">
                  Organizer Portal
                </CardTitle>
                <p className="text-white/60 mt-2">
                  Sign in to manage your events
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="organizer@company.com"
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
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="glow"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-white/60">
                    Don't have an organizer account?{' '}
                    <Link 
                      href="/organizer/signup" 
                      className="text-cyber-blue hover:text-cyber-pink transition-colors font-medium"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg p-4">
                  <p className="text-cyber-blue text-sm">
                    <strong>For Organizers:</strong> Create and manage events, track registrations, and engage with your audience through our comprehensive organizer portal.
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
