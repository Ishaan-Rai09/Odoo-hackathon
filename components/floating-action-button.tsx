'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, Code, Palette, Trophy, X } from 'lucide-react'
import Link from 'next/link'

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  const categories = [
    {
      id: 'technical',
      name: 'Technical',
      icon: Code,
      color: 'bg-cyber-blue',
      href: '/events',
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: Palette,
      color: 'bg-cyber-pink',
      href: '/events',
    },
    {
      id: 'business',
      name: 'Business',
      icon: Trophy,
      color: 'bg-cyber-purple',
      href: '/events',
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: Trophy,
      color: 'bg-cyber-green',
      href: '/events',
    },
  ]

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Category Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {categories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <motion.div
                  key={category.id}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={category.href}>
                    <Button
                      variant="cyber"
                      size="lg"
                      className={`${category.color} hover:scale-110 transition-all duration-300 shadow-lg`}
                      onClick={() => setIsOpen(false)}
                    >
                      <IconComponent className="h-5 w-5 mr-2" />
                      {category.name}
                    </Button>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="glow"
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl"
          onClick={toggleOpen}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  )
}