'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Share2, 
  Copy, 
  Gift, 
  Users, 
  TrendingUp, 
  ExternalLink,
  Check,
  Sparkles,
  DollarSign
} from 'lucide-react'

interface ReferralSystemProps {
  userId: string
  userEmail: string
}

interface ReferralStats {
  totalReferrals: number
  totalEarned: number
  pendingRewards: number
  successfulBookings: number
  referralCode: string
  recentReferrals: Array<{
    email: string
    dateReferred: string
    status: 'pending' | 'confirmed' | 'booked'
    rewardEarned: number
  }>
}

export default function ReferralSystem({ userId, userEmail }: ReferralSystemProps) {
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
    successfulBookings: 0,
    referralCode: '',
    recentReferrals: []
  })
  const [referralCode, setReferralCode] = useState('')
  const [friendEmail, setFriendEmail] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReferralData()
    generateReferralCode()
  }, [userId])

  const loadReferralData = async () => {
    try {
      const response = await fetch(`/api/referrals/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setReferralStats(data)
      }
    } catch (error) {
      console.error('Error loading referral data:', error)
    }
    setLoading(false)
  }

  const generateReferralCode = () => {
    // Generate a unique referral code based on user info
    const code = `REF${userId.slice(-4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    setReferralCode(code)
    setReferralStats(prev => ({ ...prev, referralCode: code }))
  }

  const getReferralLink = () => {
    // Check if running on client side
    if (typeof window === 'undefined') {
      return `https://localhost:3000?ref=${referralCode}`
    }
    const baseUrl = window.location.origin
    return `${baseUrl}?ref=${referralCode}`
  }

  const copyReferralLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(getReferralLink())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback for older browsers or server-side
        const textArea = document.createElement('textarea')
        textArea.value = getReferralLink()
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const sendReferralEmail = async () => {
    if (!friendEmail.trim()) return

    try {
      const response = await fetch('/api/referrals/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerUserId: userId,
          referrerEmail: userEmail,
          friendEmail,
          referralCode,
          customMessage: shareMessage
        })
      })

      if (response.ok) {
        alert('Referral invitation sent successfully!')
        setFriendEmail('')
        setShareMessage('')
        loadReferralData() // Refresh stats
      } else {
        alert('Failed to send referral invitation')
      }
    } catch (error) {
      console.error('Error sending referral:', error)
      alert('Error sending referral invitation')
    }
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '📱',
      url: `https://wa.me/?text=Join me on EventBook! Use my referral code ${referralCode} and get 15% off your first event booking. ${getReferralLink()}`
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=Get 15% off your first event booking with my referral code ${referralCode}&url=${getReferralLink()}`
    },
    {
      name: 'Facebook',
      icon: '👥',
      url: `https://www.facebook.com/sharer/sharer.php?u=${getReferralLink()}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${getReferralLink()}`
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'booked':
        return <Badge className="bg-blue-100 text-blue-800">Booked</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="event-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue"></div>
          <p className="ml-4 text-white/60">Loading your referral dashboard...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-white">
          <Gift className="w-8 h-8 text-cyber-blue" />
          Referral Program
        </h1>
        <p className="text-white/60">Earn rewards by inviting friends to join Elite Events!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="event-card">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-cyber-blue mb-2" />
            <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
            <div className="text-sm text-white/60">Total Referrals</div>
          </CardContent>
        </Card>
        <Card className="event-card">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto text-cyber-green mb-2" />
            <div className="text-2xl font-bold text-white">${referralStats.totalEarned}</div>
            <div className="text-sm text-white/60">Total Earned</div>
          </CardContent>
        </Card>
        <Card className="event-card">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-cyber-pink mb-2" />
            <div className="text-2xl font-bold text-white">${referralStats.pendingRewards}</div>
            <div className="text-sm text-white/60">Pending Rewards</div>
          </CardContent>
        </Card>
        <Card className="event-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-cyber-purple mb-2" />
            <div className="text-2xl font-bold text-white">{referralStats.successfulBookings}</div>
            <div className="text-sm text-white/60">Successful Bookings</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="share" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="invite">Invite Friends</TabsTrigger>
          <TabsTrigger value="history">Referral History</TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="space-y-6">
          {/* Referral Code & Link */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-white">Your Referral Code</CardTitle>
              <CardDescription className="text-white/60">
                Share this code with friends and earn 10% of their booking amount (up to $50 per referral)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={referralCode}
                    readOnly
                    className="text-center font-mono text-lg font-bold bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button onClick={copyReferralLink} variant="cyber">
                  {copied ? (
                    <Check className="w-4 h-4 text-cyber-green" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={getReferralLink()}
                    readOnly
                    className="text-sm bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button onClick={copyReferralLink} variant="cyber" size="sm">
                  Copy Link
                </Button>
              </div>

              <Alert className="border-cyber-blue/30 bg-cyber-blue/10">
                <Gift className="h-4 w-4 text-cyber-blue" />
                <AlertDescription className="text-white/80">
                  <strong>How it works:</strong> When someone uses your referral code, they get 15% off their first booking, and you earn 10% of their booking amount as credit (max $50 per referral).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Social Share */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Share2 className="w-5 h-5 text-cyber-blue" />
                Share on Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {shareOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="cyber"
                    className="h-16 flex flex-col gap-1"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(option.url, '_blank')
                      }
                    }}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-xs">{option.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="space-y-6">
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-white">Invite a Friend</CardTitle>
              <CardDescription className="text-white/60">
                Send a personalized invitation directly to your friend's email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Friend's Email</label>
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Personal Message (Optional)</label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  rows={3}
                  placeholder="Hey! I thought you'd love Elite Events. Use my referral code to get 15% off your first booking!"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                />
              </div>

              <Button 
                onClick={sendReferralEmail}
                disabled={!friendEmail.trim()}
                variant="cyber"
                className="w-full"
              >
                <Gift className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-white">Referral History</CardTitle>
              <CardDescription className="text-white/60">
                Track your referrals and earned rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referralStats.recentReferrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="font-medium text-white">No referrals yet</h3>
                  <p className="text-white/60 text-sm">Start sharing your referral code to earn rewards!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referralStats.recentReferrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-white/5">
                      <div>
                        <div className="font-medium text-white">{referral.email}</div>
                        <div className="text-sm text-white/60">
                          Referred on {new Date(referral.dateReferred).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(referral.status)}
                        {referral.rewardEarned > 0 && (
                          <span className="font-bold text-cyber-green">
                            +${referral.rewardEarned}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
