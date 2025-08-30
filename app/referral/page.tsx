'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import ReferralSystem from '@/components/referral-system'

export default function ReferralPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black cyber-grid">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-cyber-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Loading...</h3>
              <p className="text-white/60">Please wait while we load your referral dashboard</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    redirect('/sign-in?redirectUrl=/referral')
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-20 pb-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReferralSystem 
            userId={user?.id || ''} 
            userEmail={user?.email || ''} 
          />
        </div>
      </motion.main>
    </div>
  )
}
