'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
      setTokenValid(false)
      return
    }

    // Validate token
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()
      setTokenValid(result.valid)
      
      if (!result.valid) {
        setError(result.error || 'Invalid or expired reset token')
      }
    } catch (error) {
      setTokenValid(false)
      setError('Failed to validate reset token')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // Redirect to sign-in after 3 seconds
        setTimeout(() => {
          router.push('/sign-in?message=Password reset successful')
        }, 3000)
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100/70">Validating reset token...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-red-400 mb-2">
              Invalid Token
            </h1>
            <p className="text-cyan-100/70">
              This password reset link is invalid or has expired
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 shadow-2xl">
            <div className="space-y-4 text-center">
              <p className="text-white/80">
                The password reset link you clicked is either invalid or has expired. Please request a new password reset.
              </p>
              
              <div className="space-y-3">
                <Link href="/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                    Request New Reset Link
                  </Button>
                </Link>
                
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

  if (success) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-green-400 mb-2">
              Password Reset!
            </h1>
            <p className="text-cyan-100/70">
              Your password has been successfully reset
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-green-500/30 rounded-lg p-8 shadow-2xl">
            <div className="space-y-4 text-center">
              <p className="text-white/80">
                Your password has been updated successfully. You will be redirected to the sign-in page shortly.
              </p>
              
              <Link href="/sign-in">
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                  Continue to Sign In
                </Button>
              </Link>
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
          <Lock className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">
            Reset Password
          </h1>
          <p className="text-cyan-100/70">
            Enter your new password below
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="bg-red-900/50 border-red-500/50 text-red-200">
                {error}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-cyan-100">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-300/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-cyan-100">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-300/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                placeholder="Confirm new password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <Link 
              href="/sign-in" 
              className="text-cyan-400/80 hover:text-cyan-300 text-sm transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
