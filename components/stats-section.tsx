'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

export function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  const stats = [
    { label: 'Active Users', value: 50000, suffix: '+', icon: '👥' },
    { label: 'Events This Year', value: 1200, suffix: '+', icon: '🎉' },
    { label: 'Event Organizers', value: 200, suffix: '+', icon: '🏛️' },
    { label: 'Success Rate', value: 98, suffix: '%', icon: '⭐' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  function AnimatedCounter({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0)
    
    useEffect(() => {
      if (!isInView) return
      
      let startTime: number
      const startValue = 0
      const endValue = value
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart)
        
        setCount(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }, [isInView, value, duration])
    
    return <span>{count}{suffix}</span>
  }

  return (
    <section ref={ref} className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-purple/5 rounded-3xl" />
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Platform </span>
            <span className="gradient-text">Statistics</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Join thousands of people who are already part of our thriving community
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="text-center group"
            >
              <div className="glassmorphism rounded-2xl p-8 hover-lift">
                {/* Icon */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                
                {/* Value */}
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                
                {/* Label */}
                <div className="text-white/60 font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="glassmorphism rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to be part of something amazing?
            </h3>
            <p className="text-white/80 text-lg">
              Join our community today and discover events that will create amazing experiences.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}