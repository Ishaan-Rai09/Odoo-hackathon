'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message || 'Password reset instructions sent to your email')
        setEmailSent(true)
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Mail className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">
              Check Your Email
            </h1>
            <p className="text-cyan-100/70">
              We've sent password reset instructions to {email}
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-8 shadow-2xl">
            <div className="space-y-4">
              <p className="text-white/80 text-center">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
              
              <div className="text-center space-y-4">
                <Button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                    setMessage('')
                  }}
                  variant="outline"
                  className="w-full border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10"
                >
                  Try Different Email
                </Button>
                
                <Link 
                  href="/sign-in"
                  className="block text-cyan-400/80 hover:text-cyan-300 text-sm transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">
            Forgot Password?
          </h1>
          <p className="text-cyan-100/70">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="bg-red-900/50 border-red-500/50 text-red-200">
                {error}
              </Alert>
            )}
            
            {message && (
              <Alert className="bg-green-900/50 border-green-500/50 text-green-200">
                {message}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-cyan-100">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-300/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                placeholder="Enter your email address"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <div className="text-cyan-100/70">
              Remember your password?{' '}
              <Link 
                href="/sign-in" 
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-cyan-400/80 hover:text-cyan-300 text-sm transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
