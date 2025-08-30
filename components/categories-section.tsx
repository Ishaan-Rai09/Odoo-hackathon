'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Code, Palette, Trophy } from 'lucide-react'
import Link from 'next/link'

export function CategoriesSection() {
  const categories = [
    {
      id: 'technical',
      name: 'Technical',
      description: 'Technology events, workshops, and competitions',
      icon: Code,
      color: 'from-cyber-blue to-cyber-purple',
      bgColor: 'bg-cyber-blue/10',
      borderColor: 'border-cyber-blue/30',
      events: 3,
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Concerts, comedy shows, and cultural events',
      icon: Palette,
      color: 'from-cyber-pink to-cyber-green',
      bgColor: 'bg-cyber-pink/10',
      borderColor: 'border-cyber-pink/30',
      events: 3,
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Professional seminars and networking events',
      icon: Trophy,
      color: 'from-cyber-purple to-cyber-blue',
      bgColor: 'bg-cyber-purple/10',
      borderColor: 'border-cyber-purple/30',
      events: 1,
    },
    {
      id: 'sports',
      name: 'Sports',
      description: 'Athletic competitions and fitness events',
      icon: Trophy,
      color: 'from-cyber-green to-cyber-blue',
      bgColor: 'bg-cyber-green/10',
      borderColor: 'border-cyber-green/30',
      events: 1,
    },
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

  return (
    <section id="categories" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Event </span>
            <span className="gradient-text">Categories</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Explore diverse categories of events designed to challenge, inspire, and entertain
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Card className="group event-card h-full cursor-pointer">
                  <CardContent className="p-8 h-full flex flex-col">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${category.bgColor} ${category.borderColor} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {category.name}
                      </h3>
                      <p className="text-white/70 mb-6 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">
                            {category.events}
                          </div>
                          <div className="text-sm text-white/60">Events Available</div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link href="/events">
                      <Button
                        variant="cyber"
                        className="w-full group-hover:bg-white/10 transition-all duration-300"
                      >
                        Explore {category.name}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-white/80 mb-6">
            Can't find what you're looking for?
          </p>
          <Link href="/events">
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}