'use client'

import { SignUp } from '@clerk/nextjs'
import { motion } from 'framer-motion'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black cyber-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-4">
            Join Elite Events
          </h1>
          <p className="text-white/80">
            Create your account to discover amazing events
          </p>
        </div>
        
        <div className="glassmorphism rounded-2xl p-8">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'cyber-button bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-blue',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white',
                headerSubtitle: 'text-white/80',
                socialButtonsBlockButton: 'cyber-button border border-white/20',
                formFieldInput: 'bg-white/10 border-white/20 text-white',
                formFieldLabel: 'text-white/80',
                footerActionLink: 'text-cyber-blue hover:text-cyber-pink',
              },
            }}
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Join thousands of users discovering amazing events
          </p>
        </div>
      </motion.div>
    </div>
  )
}