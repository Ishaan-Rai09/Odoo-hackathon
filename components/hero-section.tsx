'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Floating Elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-10 w-20 h-20 border border-cyber-blue/30 rounded-full cyber-glow"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-40 right-20 w-16 h-16 border border-cyber-pink/30 rounded-lg cyber-glow"
        style={{ animationDelay: '1s' }}
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-40 left-20 w-12 h-12 border border-cyber-purple/30 rounded-full cyber-glow"
        style={{ animationDelay: '2s' }}
      />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-cyber-blue/30 bg-cyber-blue/10 backdrop-blur-sm">
            <span className="text-cyber-blue text-sm font-medium">
              🚀 New Platform Launch
            </span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="block text-white">Elite Events</span>
          <span className="block gradient-text">Platform</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Discover extraordinary events, connect with amazing communities, and create
          unforgettable memories on the ultimate event discovery platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link href="#categories">
            <Button
              variant="glow"
              size="lg"
              className="group text-lg px-8 py-4 h-auto"
            >
              Explore Events
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <Link href="/sign-in">
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 h-auto border-white/20 text-white hover:bg-white/10"
            >
              Join Community
            </Button>
          </Link>

          <Link href="/organizer/signin">
            <Button
              variant="cyber"
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-gradient-to-r from-cyber-purple to-cyber-pink hover:shadow-lg hover:shadow-cyber-purple/25"
            >
              Organizer Portal
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="glassmorphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-cyber-blue" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-white/60">Events Hosted</div>
          </div>
          
          <div className="glassmorphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-cyber-pink" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">50K+</div>
            <div className="text-white/60">Active Users</div>
          </div>
          
          <div className="glassmorphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-cyber-green" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">200+</div>
            <div className="text-white/60">Event Organizers</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}