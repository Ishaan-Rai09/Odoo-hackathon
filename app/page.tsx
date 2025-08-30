'use client'

import { motion } from 'framer-motion'
import { HeroSection } from '@/components/hero-section'
import { CategoriesSection } from '@/components/categories-section'
import { FeaturedEvents } from '@/components/featured-events'
import { StatsSection } from '@/components/stats-section'
import { Navbar } from '@/components/navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Hero Section */}
        <HeroSection />
        
        {/* Categories Section */}
        <CategoriesSection />
        
        {/* Featured Events */}
        <FeaturedEvents />
        
        {/* Stats Section */}
        <StatsSection />
      </motion.main>
    </div>
  )
}