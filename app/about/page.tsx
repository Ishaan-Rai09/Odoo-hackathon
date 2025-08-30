'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Users, Target, Award, Zap, Heart, Globe } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const stats = [
    { label: 'Active Users', value: '50,000+', icon: Users },
    { label: 'Events Hosted', value: '1,200+', icon: Target },
    { label: 'Awards Won', value: '100+', icon: Award },
    { label: 'Cities Connected', value: '50+', icon: Globe },
  ]

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick event discovery and instant registration process'
    },
    {
      icon: Heart,
      title: 'Community Driven',
      description: 'Built by passionate individuals, for the community with love and dedication'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Only the best events make it to our platform'
    },
    {
      icon: Globe,
      title: 'Wide Reach',
      description: 'Connecting people across multiple cities and communities'
    }
  ]

  const team = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      image: '/api/placeholder/150/150',
      description: 'Tech professional passionate about connecting people through events'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      image: '/api/placeholder/150/150',
      description: 'Full-stack developer with expertise in modern web technologies'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Events',
      image: '/api/placeholder/150/150',
      description: 'Event management expert with 5+ years of experience'
    },
    {
      name: 'Emily Davis',
      role: 'Community Manager',
      image: '/api/placeholder/150/150',
      description: 'Building bridges between people and creating lasting connections'
    }
  ]

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
                About Elite Events
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                We're revolutionizing how people discover, participate in, and organize events. 
                Our platform connects passionate individuals with amazing opportunities across technical, 
                entertainment, business, and sports categories.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center glassmorphism rounded-xl p-6"
                  >
                    <IconComponent className="h-8 w-8 text-cyber-blue mx-auto mb-4" />
                    <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold gradient-text mb-6">Our Mission</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  To create a vibrant ecosystem where people can easily discover, 
                  participate in, and organize events that enhance their personal and 
                  professional growth.
                </p>
                <p className="text-white/80 text-lg leading-relaxed mb-8">
                  We believe that the best experiences happen when people come together, 
                  and we're here to make sure no one misses out on amazing opportunities.
                </p>
                <Link href="/events">
                  <Button variant="cyber" size="lg">
                    Explore Events
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glassmorphism rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Why Choose Elite Events?</h3>
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon
                    return (
                      <div key={feature.title} className="flex items-start space-x-4">
                        <IconComponent className="h-6 w-6 text-cyber-blue mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                          <p className="text-white/70 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold gradient-text mb-6">Meet Our Team</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                We're a passionate group of professionals dedicated to 
                making event discovery and participation more engaging and connected.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glassmorphism rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-cyber-blue font-medium mb-3">{member.role}</p>
                  <p className="text-white/70 text-sm">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glassmorphism rounded-2xl p-12"
            >
              <h2 className="text-3xl font-bold gradient-text mb-6">
                Ready to Join the Elite Community?
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Start discovering amazing events and connect with like-minded people today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button variant="cyber" size="lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}