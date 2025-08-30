'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getTimeUntilEvent } from '@/lib/utils'

interface CountdownTimerProps {
  date: string
  time: string
  className?: string
}

export function CountdownTimer({ date, time, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilEvent(date, time))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilEvent(date, time))
    }, 1000)

    return () => clearInterval(timer)
  }, [date, time])

  if (timeLeft.isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-red-400 font-medium">Event has ended</div>
      </div>
    )
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-4 gap-2 text-center">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glassmorphism rounded-lg p-3"
          >
            <motion.div
              key={unit.value}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-white mb-1"
            >
              {unit.value.toString().padStart(2, '0')}
            </motion.div>
            <div className="text-xs text-white/60 uppercase tracking-wide">
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}