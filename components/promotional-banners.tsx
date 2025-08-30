'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  Gift, 
  Clock, 
  Sparkles, 
  Tag,
  ArrowRight,
  X
} from 'lucide-react'

interface PromotionalBannersProps {
  eventData?: any
  totalTickets?: number
  onDiscountApply?: (code: string) => void
}

export default function PromotionalBanners({ 
  eventData, 
  totalTickets = 0, 
  onDiscountApply 
}: PromotionalBannersProps) {
  const [dismissedBanners, setDismissedBanners] = React.useState<string[]>([])

  const dismissBanner = (bannerId: string) => {
    setDismissedBanners(prev => [...prev, bannerId])
  }

  const banners = []

  // Early Bird Banner
  if (eventData?.earlyBirdEndDate) {
    const earlyBirdEnd = new Date(eventData.earlyBirdEndDate)
    const now = new Date()
    const daysLeft = Math.ceil((earlyBirdEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft > 0 && !dismissedBanners.includes('early-bird')) {
      banners.push({
        id: 'early-bird',
        type: 'early_bird',
        title: `🐦 Early Bird Special - ${eventData.earlyBirdDiscount || 20}% Off!`,
        description: `Book now and save ${eventData.earlyBirdDiscount || 20}% on your tickets. Offer expires in ${daysLeft} days.`,
        action: 'Book Now',
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        urgency: daysLeft <= 3 ? 'high' : daysLeft <= 7 ? 'medium' : 'low'
      })
    }
  }

  // Group Discount Banner
  if (totalTickets >= 3 && totalTickets < 5 && !dismissedBanners.includes('group-discount')) {
    banners.push({
      id: 'group-discount',
      type: 'group',
      title: `👥 Almost There! Group Discount Available`,
      description: `Add ${5 - totalTickets} more tickets to unlock 15% group discount. Save even more with 10+ tickets (20% off)!`,
      action: 'Add More Tickets',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      urgency: 'medium'
    })
  } else if (totalTickets >= 5 && !dismissedBanners.includes('group-active')) {
    banners.push({
      id: 'group-active',
      type: 'group',
      title: `🎉 Group Discount Applied - ${totalTickets >= 10 ? '20%' : '15%'} Off!`,
      description: `You're saving ${totalTickets >= 10 ? '20%' : '15%'} with the group discount!`,
      action: null,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      urgency: 'low'
    })
  }

  // First Time User Banner
  if (!dismissedBanners.includes('first-time')) {
    banners.push({
      id: 'first-time',
      type: 'coupon',
      title: '✨ New User Special - $10 Off!',
      description: 'First time booking with us? Use code FIRST10 to get $10 off your order.',
      action: 'Apply Code',
      couponCode: 'FIRST10',
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      urgency: 'low'
    })
  }

  // Limited Time Offer Banner
  if (!dismissedBanners.includes('weekend-special')) {
    const isWeekend = [0, 6].includes(new Date().getDay())
    if (isWeekend) {
      banners.push({
        id: 'weekend-special',
        type: 'coupon',
        title: '🎊 Weekend Special - 20% Off!',
        description: 'Weekend vibes! Use code SAVE20 to get 20% off any event booking this weekend.',
        action: 'Apply SAVE20',
        couponCode: 'SAVE20',
        color: 'bg-gradient-to-r from-pink-500 to-rose-500',
        urgency: 'high'
      })
    }
  }

  // Referral Program Banner
  if (!dismissedBanners.includes('referral')) {
    banners.push({
      id: 'referral',
      type: 'referral',
      title: '💰 Refer Friends & Earn Rewards!',
      description: 'Get 10% of every booking when your friends use your referral code. They save 15% too!',
      action: 'Start Referring',
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      urgency: 'low'
    })
  }

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'animate-pulse border-2 border-red-300'
      case 'medium': return 'border-2 border-yellow-300'
      default: return 'border border-gray-200'
    }
  }

  const getBannerIcon = (type: string) => {
    switch (type) {
      case 'early_bird': return <Calendar className="w-5 h-5" />
      case 'group': return <Users className="w-5 h-5" />
      case 'coupon': return <Tag className="w-5 h-5" />
      case 'referral': return <Gift className="w-5 h-5" />
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  if (banners.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {banners.slice(0, 3).map((banner) => (
        <Card key={banner.id} className={`overflow-hidden ${getUrgencyStyle(banner.urgency)}`}>
          <CardContent className="p-0">
            <div className={`${banner.color} text-white p-4 relative`}>
              <button
                onClick={() => dismissBanner(banner.id)}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-3 pr-8">
                <div className="mt-0.5">
                  {getBannerIcon(banner.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{banner.title}</h3>
                    {banner.urgency === 'high' && (
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Limited Time
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-white/90 text-sm mb-3">
                    {banner.description}
                  </p>
                  
                  {banner.action && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                        onClick={() => {
                          if (banner.couponCode && onDiscountApply) {
                            onDiscountApply(banner.couponCode)
                          } else if (banner.type === 'referral') {
                            // Navigate to referral page
                            window.location.href = '/referral'
                          } else if (banner.type === 'group') {
                            // Scroll to ticket selection
                            document.getElementById('ticket-selection')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      >
                        {banner.action}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      
                      {banner.couponCode && (
                        <div className="flex items-center bg-white/20 px-3 py-1 rounded text-sm font-mono">
                          {banner.couponCode}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {banners.length > 3 && (
        <Card className="border-dashed">
          <CardContent className="p-3 text-center">
            <p className="text-sm text-gray-600">
              +{banners.length - 3} more offers available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
