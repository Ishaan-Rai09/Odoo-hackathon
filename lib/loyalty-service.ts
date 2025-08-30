export interface LoyaltyAccount {
  userId: string
  email: string
  totalPoints: number
  lifetimePoints: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  nextTierPoints: number
  pointsHistory: LoyaltyTransaction[]
}

export interface LoyaltyTransaction {
  id: string
  type: 'earned' | 'redeemed' | 'expired'
  points: number
  description: string
  eventId?: string
  bookingId?: string
  timestamp: Date
  expiresAt?: Date
}

export interface BookingCancellation {
  bookingId: string
  reason: string
  refundAmount: number
  refundMethod: string
  processingFee: number
  cancellationDate: Date
  refundProcessed: boolean
  refundTransactionId?: string
}

export interface BookingModification {
  bookingId: string
  modificationType: 'attendee_info' | 'ticket_quantity' | 'ticket_type'
  oldValue: any
  newValue: any
  additionalCost: number
  modificationDate: Date
  approvedBy?: string
}

export class LoyaltyService {
  // Store loyalty data in memory for demo
  private static loyaltyAccounts: Map<string, LoyaltyAccount> = new Map()
  private static cancellations: Map<string, BookingCancellation> = new Map()
  private static modifications: Map<string, BookingModification[]> = new Map()

  // Initialize or get loyalty account
  static async initializeLoyaltyAccount(userId: string, email: string): Promise<LoyaltyAccount> {
    if (!this.loyaltyAccounts.has(userId)) {
      const account: LoyaltyAccount = {
        userId,
        email,
        totalPoints: 0,
        lifetimePoints: 0,
        tier: 'Bronze',
        nextTierPoints: 1000, // Points needed for next tier
        pointsHistory: []
      }
      this.loyaltyAccounts.set(userId, account)
    }

    return this.loyaltyAccounts.get(userId)!
  }

  // Award points for booking
  static async awardBookingPoints(
    userId: string,
    bookingId: string,
    eventId: string,
    bookingAmount: number,
    eventTitle: string
  ): Promise<{ pointsEarned: number; newTotal: number; tierBonus: boolean }> {
    const account = await this.initializeLoyaltyAccount(userId, '')
    
    // Base rate: 1 point per $1 spent
    let pointsEarned = Math.floor(bookingAmount)
    
    // Tier multipliers
    const tierMultipliers = {
      'Bronze': 1,
      'Silver': 1.25,
      'Gold': 1.5,
      'Platinum': 2
    }
    
    const multiplier = tierMultipliers[account.tier]
    pointsEarned = Math.floor(pointsEarned * multiplier)
    
    // Bonus points for certain events or milestones
    const tierBonus = multiplier > 1
    if (account.lifetimePoints % 5000 < pointsEarned) {
      pointsEarned += 500 // Milestone bonus
    }

    // Create transaction
    const transaction: LoyaltyTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'earned',
      points: pointsEarned,
      description: `Earned points for booking ${eventTitle}`,
      eventId,
      bookingId,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
    }

    // Update account
    account.totalPoints += pointsEarned
    account.lifetimePoints += pointsEarned
    account.pointsHistory.push(transaction)
    
    // Check for tier upgrade
    this.updateUserTier(account)
    
    this.loyaltyAccounts.set(userId, account)

    console.log(`🎯 Awarded ${pointsEarned} points to user ${userId} (${account.tier} tier)`)

    return {
      pointsEarned,
      newTotal: account.totalPoints,
      tierBonus
    }
  }

  // Redeem points for discount
  static async redeemPoints(
    userId: string,
    pointsToRedeem: number,
    bookingId: string,
    description: string
  ): Promise<{ success: boolean; discountAmount: number; remainingPoints: number }> {
    const account = await this.initializeLoyaltyAccount(userId, '')
    
    if (pointsToRedeem > account.totalPoints) {
      return {
        success: false,
        discountAmount: 0,
        remainingPoints: account.totalPoints
      }
    }

    // 100 points = $1 discount
    const discountAmount = pointsToRedeem / 100
    
    // Create redemption transaction
    const transaction: LoyaltyTransaction = {
      id: `RED-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'redeemed',
      points: -pointsToRedeem,
      description,
      bookingId,
      timestamp: new Date()
    }

    // Update account
    account.totalPoints -= pointsToRedeem
    account.pointsHistory.push(transaction)
    
    this.loyaltyAccounts.set(userId, account)

    console.log(`💰 Redeemed ${pointsToRedeem} points for $${discountAmount} discount`)

    return {
      success: true,
      discountAmount,
      remainingPoints: account.totalPoints
    }
  }

  // Update user tier based on lifetime points
  private static updateUserTier(account: LoyaltyAccount): void {
    const tierThresholds = {
      'Bronze': 0,
      'Silver': 1000,
      'Gold': 5000,
      'Platinum': 15000
    }

    let newTier: keyof typeof tierThresholds = 'Bronze'
    let nextTierPoints = 1000

    if (account.lifetimePoints >= tierThresholds.Platinum) {
      newTier = 'Platinum'
      nextTierPoints = 0 // Max tier
    } else if (account.lifetimePoints >= tierThresholds.Gold) {
      newTier = 'Gold'
      nextTierPoints = tierThresholds.Platinum - account.lifetimePoints
    } else if (account.lifetimePoints >= tierThresholds.Silver) {
      newTier = 'Silver'
      nextTierPoints = tierThresholds.Gold - account.lifetimePoints
    } else {
      newTier = 'Bronze'
      nextTierPoints = tierThresholds.Silver - account.lifetimePoints
    }

    if (newTier !== account.tier) {
      console.log(`🎊 User ${account.userId} upgraded to ${newTier} tier!`)
      
      // Award tier upgrade bonus
      const bonusPoints = newTier === 'Silver' ? 100 : newTier === 'Gold' ? 250 : 500
      
      const bonusTransaction: LoyaltyTransaction = {
        id: `BONUS-${Date.now()}`,
        type: 'earned',
        points: bonusPoints,
        description: `Tier upgrade bonus: Welcome to ${newTier}!`,
        timestamp: new Date()
      }
      
      account.totalPoints += bonusPoints
      account.pointsHistory.push(bonusTransaction)
    }

    account.tier = newTier
    account.nextTierPoints = nextTierPoints
  }

  // Get loyalty account details
  static async getLoyaltyAccount(userId: string, email: string): Promise<LoyaltyAccount> {
    return await this.initializeLoyaltyAccount(userId, email)
  }

  // Cancel booking with refund calculation
  static async cancelBooking(
    bookingId: string,
    userId: string,
    reason: string,
    totalAmount: number,
    eventDate: string
  ): Promise<BookingCancellation> {
    const eventDateTime = new Date(eventDate)
    const now = new Date()
    const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundPercentage = 0
    let processingFee = 0

    // Refund policy based on cancellation timing
    if (hoursUntilEvent > 168) { // More than 7 days
      refundPercentage = 100
      processingFee = 0
    } else if (hoursUntilEvent > 48) { // 2-7 days
      refundPercentage = 75
      processingFee = Math.min(totalAmount * 0.05, 10) // 5% or $10 max
    } else if (hoursUntilEvent > 24) { // 1-2 days
      refundPercentage = 50
      processingFee = Math.min(totalAmount * 0.1, 25) // 10% or $25 max
    } else { // Less than 24 hours
      refundPercentage = 0
      processingFee = 0
    }

    const refundAmount = (totalAmount * refundPercentage / 100) - processingFee

    const cancellation: BookingCancellation = {
      bookingId,
      reason,
      refundAmount: Math.max(0, refundAmount),
      refundMethod: 'original_payment_method',
      processingFee,
      cancellationDate: new Date(),
      refundProcessed: false,
      refundTransactionId: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    }

    this.cancellations.set(bookingId, cancellation)

    // Deduct points if they were awarded for this booking
    const pointsToDeduct = Math.floor(totalAmount) // Approximate points earned
    await this.deductPoints(userId, pointsToDeduct, bookingId, 'Booking cancellation')

    console.log(`❌ Booking ${bookingId} cancelled. Refund: $${refundAmount}`)

    return cancellation
  }

  // Deduct points (for cancellations)
  private static async deductPoints(
    userId: string,
    pointsToDeduct: number,
    bookingId: string,
    reason: string
  ): Promise<void> {
    const account = await this.initializeLoyaltyAccount(userId, '')
    
    const actualDeduction = Math.min(pointsToDeduct, account.totalPoints)
    
    const transaction: LoyaltyTransaction = {
      id: `DED-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'redeemed',
      points: -actualDeduction,
      description: reason,
      bookingId,
      timestamp: new Date()
    }

    account.totalPoints -= actualDeduction
    account.pointsHistory.push(transaction)
    
    this.loyaltyAccounts.set(userId, account)
  }

  // Modify booking
  static async modifyBooking(
    bookingId: string,
    modificationType: 'attendee_info' | 'ticket_quantity' | 'ticket_type',
    oldValue: any,
    newValue: any,
    additionalCost: number = 0
  ): Promise<BookingModification> {
    const modification: BookingModification = {
      bookingId,
      modificationType,
      oldValue,
      newValue,
      additionalCost,
      modificationDate: new Date()
    }

    if (!this.modifications.has(bookingId)) {
      this.modifications.set(bookingId, [])
    }

    this.modifications.get(bookingId)!.push(modification)

    console.log(`✏️ Booking ${bookingId} modified: ${modificationType}`)

    return modification
  }

  // Get booking modifications history
  static getBookingModifications(bookingId: string): BookingModification[] {
    return this.modifications.get(bookingId) || []
  }

  // Get cancellation details
  static getCancellationDetails(bookingId: string): BookingCancellation | null {
    return this.cancellations.get(bookingId) || null
  }

  // Calculate refund amount preview
  static calculateRefundPreview(
    totalAmount: number,
    eventDate: string
  ): { refundAmount: number; refundPercentage: number; processingFee: number } {
    const eventDateTime = new Date(eventDate)
    const now = new Date()
    const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundPercentage = 0
    let processingFee = 0

    if (hoursUntilEvent > 168) {
      refundPercentage = 100
      processingFee = 0
    } else if (hoursUntilEvent > 48) {
      refundPercentage = 75
      processingFee = Math.min(totalAmount * 0.05, 10)
    } else if (hoursUntilEvent > 24) {
      refundPercentage = 50
      processingFee = Math.min(totalAmount * 0.1, 25)
    } else {
      refundPercentage = 0
      processingFee = 0
    }

    const refundAmount = Math.max(0, (totalAmount * refundPercentage / 100) - processingFee)

    return {
      refundAmount,
      refundPercentage,
      processingFee
    }
  }

  // Get tier benefits
  static getTierBenefits(tier: string): {
    pointsMultiplier: number
    earlyAccess: boolean
    freeTicketUpgrades: number
    prioritySupport: boolean
    exclusiveEvents: boolean
  } {
    const benefits = {
      'Bronze': {
        pointsMultiplier: 1,
        earlyAccess: false,
        freeTicketUpgrades: 0,
        prioritySupport: false,
        exclusiveEvents: false
      },
      'Silver': {
        pointsMultiplier: 1.25,
        earlyAccess: true,
        freeTicketUpgrades: 1,
        prioritySupport: false,
        exclusiveEvents: false
      },
      'Gold': {
        pointsMultiplier: 1.5,
        earlyAccess: true,
        freeTicketUpgrades: 2,
        prioritySupport: true,
        exclusiveEvents: true
      },
      'Platinum': {
        pointsMultiplier: 2,
        earlyAccess: true,
        freeTicketUpgrades: 5,
        prioritySupport: true,
        exclusiveEvents: true
      }
    }

    return benefits[tier as keyof typeof benefits] || benefits.Bronze
  }

  // Award referral points
  static async awardReferralPoints(
    referrerUserId: string,
    refereeUserId: string,
    bookingAmount: number
  ): Promise<{ referrerPoints: number; refereePoints: number }> {
    const referrerPoints = Math.floor(bookingAmount * 0.1) // 10% of booking amount
    const refereePoints = Math.floor(bookingAmount * 0.05) // 5% of booking amount

    // Award to referrer
    await this.awardPoints(
      referrerUserId,
      referrerPoints,
      'Referral reward',
      undefined,
      undefined
    )

    // Award to referee
    await this.awardPoints(
      refereeUserId,
      refereePoints,
      'Welcome referral bonus',
      undefined,
      undefined
    )

    return { referrerPoints, refereePoints }
  }

  // Generic point award function
  private static async awardPoints(
    userId: string,
    points: number,
    description: string,
    eventId?: string,
    bookingId?: string
  ): Promise<void> {
    const account = await this.initializeLoyaltyAccount(userId, '')
    
    const transaction: LoyaltyTransaction = {
      id: `AWD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'earned',
      points,
      description,
      eventId,
      bookingId,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }

    account.totalPoints += points
    account.lifetimePoints += points
    account.pointsHistory.push(transaction)
    
    this.updateUserTier(account)
    this.loyaltyAccounts.set(userId, account)
  }

  // Clean expired points
  static async cleanExpiredPoints(userId: string): Promise<number> {
    const account = await this.initializeLoyaltyAccount(userId, '')
    const now = new Date()
    
    let expiredPoints = 0
    
    account.pointsHistory.forEach(transaction => {
      if (transaction.type === 'earned' && 
          transaction.expiresAt && 
          transaction.expiresAt < now &&
          !transaction.description.includes('expired')) {
        
        expiredPoints += transaction.points
        
        // Add expiry transaction
        const expiryTransaction: LoyaltyTransaction = {
          id: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'expired',
          points: -transaction.points,
          description: `Points expired: ${transaction.description}`,
          timestamp: now
        }
        
        account.pointsHistory.push(expiryTransaction)
      }
    })

    if (expiredPoints > 0) {
      account.totalPoints -= expiredPoints
      this.loyaltyAccounts.set(userId, account)
      console.log(`⏰ Expired ${expiredPoints} points for user ${userId}`)
    }

    return expiredPoints
  }

  // Get all loyalty accounts (for admin)
  static getAllLoyaltyAccounts(): LoyaltyAccount[] {
    return Array.from(this.loyaltyAccounts.values())
  }

  // Get loyalty leaderboard
  static getLoyaltyLeaderboard(limit: number = 10): Array<{
    userId: string
    email: string
    points: number
    tier: string
  }> {
    return Array.from(this.loyaltyAccounts.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map(account => ({
        userId: account.userId,
        email: account.email,
        points: account.totalPoints,
        tier: account.tier
      }))
  }
}
