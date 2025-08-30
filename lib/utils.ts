import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function getTimeUntilEvent(dateString: string, timeString: string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
} {
  const eventDate = new Date(`${dateString}T${timeString}`)
  const now = new Date()
  const difference = eventDate.getTime() - now.getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, isExpired: false }
}

export function getEventStatus(dateString: string, timeString: string): 'upcoming' | 'live' | 'ended' {
  const eventDate = new Date(`${dateString}T${timeString}`)
  const now = new Date()
  const eventEndTime = new Date(eventDate.getTime() + (4 * 60 * 60 * 1000)) // Assume 4 hours duration

  if (now < eventDate) return 'upcoming'
  if (now >= eventDate && now <= eventEndTime) return 'live'
  return 'ended'
}

export function getRegistrationProgress(current: number, max: number): number {
  return Math.round((current / max) * 100)
}

export function getBadgeColor(badge: string): string {
  const colors: Record<string, string> = {
    'Hot': 'bg-red-500/20 text-red-400 border-red-500/30',
    'New': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Popular': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Registration Closing Soon': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Championship': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Cultural': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Creative': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Urban': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Fast-paced': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Gaming': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Seminar': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Workshop': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Concert': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Comedy': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Live Show': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Festival': 'bg-green-500/20 text-green-400 border-green-500/30',
    'International': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Networking': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Professional': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'Expert Panel': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Live Music': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Final': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Spectator': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Career': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Prizes': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    '48 Hours': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }
  return colors[badge] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    'Beginner': 'text-green-400',
    'Intermediate': 'text-yellow-400',
    'Advanced': 'text-orange-400',
    'Expert': 'text-red-400',
    'All Levels': 'text-blue-400',
    'Competitive': 'text-purple-400',
    'Spectator': 'text-cyan-400',
  }
  return colors[difficulty] || 'text-gray-400'
}

export function generateParticles(count: number = 50) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 3,
  }))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}