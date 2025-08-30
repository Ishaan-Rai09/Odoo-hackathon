'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// User interface (copied from auth-service to avoid importing it)
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  emailVerified: boolean
  status: 'active' | 'inactive' | 'suspended'
  role?: string
  createdAt: Date
  lastLogin?: Date
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const TOKEN_KEY = 'auth-token'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user) {
          setUser(result.user)
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const result = await response.json()
      
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.error || 'Sign in failed' 
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (name: string, email: string, password: string, phone?: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      })
      
      const result = await response.json()
      
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.error || 'Sign up failed' 
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user) {
          setUser(result.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

