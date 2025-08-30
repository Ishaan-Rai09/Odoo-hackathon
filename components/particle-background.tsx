'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { generateParticles } from '@/lib/utils'

export function ParticleBackground() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    setParticles(generateParticles(30))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyber-blue/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}