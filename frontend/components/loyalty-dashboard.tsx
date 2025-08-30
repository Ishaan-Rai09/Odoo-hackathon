'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Trophy, 
  Star, 
  Clock, 
  Gift, 
  TrendingUp, 
  Users,
  Calendar,
  Coins,
  Crown,
  Sparkles
} from 'lucide-react'
import { LoyaltyService, LoyaltyAccount, LoyaltyTransaction } from '@/backend/services/loyalty-service'

interface LoyaltyDashboardProps {
  userId: string
  email: string
}

export default function LoyaltyDashboard({ userId, email }: LoyaltyDashboardProps) {
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null)
  const [redeemAmount, setRedeemAmount] = useState<number>(0)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLoyaltyData()
  }, [userId, email])

  const loadLoyaltyData = async () => {
    try {
      const account = await LoyaltyService.getLoyaltyAccount(userId, email)
      setLoyaltyAccount(account)
      
      const leaders = LoyaltyService.getLoyaltyLeaderboard(10)
      setLeaderboard(leaders)
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading loyalty data:', error)
      setLoading(false)
    }
  }

  const handleRedeemPoints = async () => {
    if (!loyaltyAccount || redeemAmount <= 0) return

    const pointsToRedeem = redeemAmount * 100 // $1 = 100 points
    
    if (pointsToRedeem > loyaltyAccount.totalPoints) {
      alert('Insufficient points for this redemption')
      return
    }

    try {
      const result = await LoyaltyService.redeemPoints(
        userId,
        pointsToRedeem,
        'manual-redemption',
        `Redeemed $${redeemAmount} credit`
      )

      if (result.success) {
        alert(`Successfully redeemed $${redeemAmount} credit!`)
        setRedeemAmount(0)
        loadLoyaltyData() // Refresh data
      }
    } catch (error) {
      console.error('Error redeeming points:', error)
      alert('Failed to redeem points')
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Bronze': return <Trophy className="w-4 h-4" />
      case 'Silver': return <Star className="w-4 h-4" />
      case 'Gold': return <Crown className="w-4 h-4" />
      case 'Platinum': return <Sparkles className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'redeemed': return <Gift className="w-4 h-4 text-blue-500" />
      case 'expired': return <Clock className="w-4 h-4 text-red-500" />
      default: return <Coins className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!loyaltyAccount) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load loyalty account</p>
      </div>
    )
  }

  const tierBenefits = LoyaltyService.getTierBenefits(loyaltyAccount.tier)
  const progressPercentage = loyaltyAccount.nextTierPoints > 0 
    ? Math.min(100, (loyaltyAccount.lifetimePoints / (loyaltyAccount.lifetimePoints + loyaltyAccount.nextTierPoints)) * 100)
    : 100

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
        <p className="text-gray-600">Earn points, unlock benefits, and get rewarded for your bookings</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Points</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loyaltyAccount.totalPoints.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Worth ${(loyaltyAccount.totalPoints / 100).toFixed(2)} in rewards
            </p>
          </CardContent>
        </Card>

        {/* Current Tier */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
            {getTierIcon(loyaltyAccount.tier)}
          </CardHeader>
          <CardContent>
            <Badge className={`${getTierColor(loyaltyAccount.tier)} text-sm font-semibold`}>
              {loyaltyAccount.tier}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {tierBenefits.pointsMultiplier}x points multiplier
            </p>
          </CardContent>
        </Card>

        {/* Lifetime Points */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loyaltyAccount.lifetimePoints.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total points earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      {loyaltyAccount.nextTierPoints > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tier Progress</CardTitle>
            <CardDescription>
              {loyaltyAccount.nextTierPoints} more points to reach the next tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="w-full h-3" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Current: {loyaltyAccount.tier}</span>
              <span>{loyaltyAccount.nextTierPoints} points needed</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="redeem">Redeem</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Tier Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Your {loyaltyAccount.tier} Benefits</CardTitle>
              <CardDescription>Exclusive perks for your tier level</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Coins className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-semibold">{tierBenefits.pointsMultiplier}x Points</p>
                  <p className="text-sm text-gray-600">Earn more on every booking</p>
                </div>
              </div>
              
              {tierBenefits.earlyAccess && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Early Access</p>
                    <p className="text-sm text-gray-600">Book events before general release</p>
                  </div>
                </div>
              )}
              
              {tierBenefits.freeTicketUpgrades > 0 && (
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold">{tierBenefits.freeTicketUpgrades} Free Upgrades</p>
                    <p className="text-sm text-gray-600">Per year</p>
                  </div>
                </div>
              )}
              
              {tierBenefits.prioritySupport && (
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-semibold">Priority Support</p>
                    <p className="text-sm text-gray-600">Get help faster</p>
                  </div>
                </div>
              )}
              
              {tierBenefits.exclusiveEvents && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">Exclusive Events</p>
                    <p className="text-sm text-gray-600">VIP and member-only events</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redeem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Points</CardTitle>
              <CardDescription>
                Convert your points to account credit (100 points = $1)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Redeem Amount ($)
                  </label>
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter dollar amount"
                    min="1"
                    max={Math.floor(loyaltyAccount.totalPoints / 100)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Requires {redeemAmount * 100} points
                  </p>
                </div>
                <Button 
                  onClick={handleRedeemPoints}
                  disabled={redeemAmount <= 0 || redeemAmount * 100 > loyaltyAccount.totalPoints}
                  className="mt-6"
                >
                  Redeem ${redeemAmount}
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-semibold text-blue-800 mb-2">Quick Redeem Options</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[5, 10, 25, 50].map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setRedeemAmount(amount)}
                      disabled={amount * 100 > loyaltyAccount.totalPoints}
                      className="text-sm"
                    >
                      ${amount}
                      <span className="text-xs text-gray-500 ml-1">
                        ({amount * 100}pts)
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>Your recent points activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {loyaltyAccount.pointsHistory
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((transaction, index) => (
                      <div key={transaction.id || index} className="flex items-center space-x-4 p-3 border rounded-md">
                        {getTransactionIcon(transaction.type)}
                        
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.timestamp)}
                          </p>
                          {transaction.expiresAt && (
                            <p className="text-xs text-gray-400">
                              Expires: {formatDate(transaction.expiresAt)}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {loyaltyAccount.pointsHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No points history yet. Start booking events to earn points!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Points Leaderboard</CardTitle>
              <CardDescription>Top loyalty members this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((member, index) => (
                  <div
                    key={member.userId}
                    className={`flex items-center space-x-4 p-3 rounded-md ${
                      member.userId === userId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-500' :
                        index === 2 ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        #{index + 1}
                      </span>
                      {index < 3 && (
                        <Trophy className={`w-4 h-4 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-500' :
                          'text-amber-600'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${member.userId === userId ? 'text-blue-700' : ''}`}>
                        {member.userId === userId ? 'You' : member.email}
                      </p>
                      <Badge className={`${getTierColor(member.tier)} text-xs`}>
                        {member.tier}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-lg">{member.points.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
