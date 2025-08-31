export interface CouponValidationResult {
  isValid: boolean
  discountAmount: number
  discountType: 'percentage' | 'fixed_amount' | 'buy_x_get_y'
  message: string
  couponData?: any
}

export interface DiscountCalculation {
  originalAmount: number
  discountAmount: number
  finalAmount: number
  appliedCoupons: string[]
  savings: number
}

export class DiscountService {
  // Validate coupon code
  static async validateCoupon(
    couponCode: string,
    eventId: string,
    userId: string,
    orderAmount: number,
    ticketTypes: { standard: number; vip: number }
  ): Promise<CouponValidationResult> {
    try {
      // Simulate coupon validation
      const couponData = this.getMockCoupon(couponCode)
      
      if (!couponData) {
        return {
          isValid: false,
          discountAmount: 0,
          discountType: 'percentage',
          message: 'Invalid coupon code'
        }
      }

      // Check if coupon is active
      if (!couponData.isActive) {
        return {
          isValid: false,
          discountAmount: 0,
          discountType: couponData.discountType,
          message: 'This coupon is no longer active'
        }
      }

      // Check date validity
      const now = new Date()
      if (now < couponData.validFrom || now > couponData.validUntil) {
        return {
          isValid: false,
          discountAmount: 0,
          discountType: couponData.discountType,
          message: 'This coupon has expired or is not yet valid'
        }
      }

      // Check minimum order amount
      if (orderAmount < couponData.minimumOrderAmount) {
        return {
          isValid: false,
          discountAmount: 0,
          discountType: couponData.discountType,
          message: `Minimum order amount of $${couponData.minimumOrderAmount} required`
        }
      }

      // Check usage limits
      if (couponData.maxUses && couponData.currentUses >= couponData.maxUses) {
        return {
          isValid: false,
          discountAmount: 0,
          discountType: couponData.discountType,
          message: 'This coupon has reached its usage limit'
        }
      }

      // Calculate discount
      const discountAmount = this.calculateDiscount(couponData, orderAmount, ticketTypes)

      return {
        isValid: true,
        discountAmount,
        discountType: couponData.discountType,
        message: `Coupon applied successfully! You saved $${discountAmount.toFixed(2)}`,
        couponData
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      return {
        isValid: false,
        discountAmount: 0,
        discountType: 'percentage',
        message: 'Error validating coupon'
      }
    }
  }

  // Calculate discount amount
  private static calculateDiscount(
    coupon: any,
    orderAmount: number,
    ticketTypes: { standard: number; vip: number }
  ): number {
    switch (coupon.discountType) {
      case 'percentage':
        return Math.min(orderAmount * (coupon.discountValue / 100), orderAmount)

      case 'fixed_amount':
        return Math.min(coupon.discountValue, orderAmount)

      case 'buy_x_get_y':
        const totalTickets = ticketTypes.standard + ticketTypes.vip
        const freeTickets = Math.floor(totalTickets / coupon.buyQuantity) * coupon.getQuantity
        // Assume average ticket price for simplicity
        const avgTicketPrice = totalTickets > 0 ? orderAmount / totalTickets : 0
        return freeTickets * avgTicketPrice

      default:
        return 0
    }
  }

  // Apply early bird discount
  static checkEarlyBirdDiscount(
    eventData: any,
    currentDate: Date = new Date()
  ): { applicable: boolean; discount: number; message: string } {
    // Check if event has early bird pricing
    const earlyBirdEndDate = eventData.earlyBirdEndDate ? new Date(eventData.earlyBirdEndDate) : null
    
    if (!earlyBirdEndDate || currentDate > earlyBirdEndDate) {
      return {
        applicable: false,
        discount: 0,
        message: 'Early bird discount not available'
      }
    }

    // Calculate early bird discount (example: 20% off)
    const discountPercentage = eventData.earlyBirdDiscount || 20
    const discount = discountPercentage

    return {
      applicable: true,
      discount,
      message: `Early Bird Special: ${discountPercentage}% off! Offer expires on ${earlyBirdEndDate.toLocaleDateString()}`
    }
  }

  // Generate referral reward
  static async generateReferralReward(
    referrerUserId: string,
    refereeUserId: string,
    bookingAmount: number
  ): Promise<{ referrerReward: number; refereeReward: number; message: string }> {
    try {
      // Standard referral rewards (can be configurable)
      const referrerRewardPercentage = 10 // 10% of booking amount
      const refereeDiscountPercentage = 15 // 15% discount for referee

      const referrerReward = Math.min(bookingAmount * 0.10, 50) // Max $50 reward
      const refereeReward = bookingAmount * 0.15

      console.log(`💰 Referral rewards generated:`)
      console.log(`- Referrer (${referrerUserId}): $${referrerReward.toFixed(2)}`)
      console.log(`- Referee (${refereeUserId}): $${refereeReward.toFixed(2)} discount`)

      return {
        referrerReward,
        refereeReward,
        message: `Referral bonus applied! You've earned $${referrerReward.toFixed(2)} credit, and your friend gets $${refereeReward.toFixed(2)} off!`
      }
    } catch (error) {
      console.error('Error generating referral reward:', error)
      return {
        referrerReward: 0,
        refereeReward: 0,
        message: 'Error processing referral reward'
      }
    }
  }

  // Calculate group booking discount
  static calculateGroupDiscount(
    totalTickets: number,
    ticketPrice: number
  ): { applicable: boolean; discount: number; message: string } {
    if (totalTickets < 5) {
      return {
        applicable: false,
        discount: 0,
        message: 'Group discount requires minimum 5 tickets'
      }
    }

    let discountPercentage = 0
    let message = ''

    if (totalTickets >= 10) {
      discountPercentage = 20
      message = 'Group Discount: 20% off for 10+ tickets!'
    } else if (totalTickets >= 5) {
      discountPercentage = 15
      message = 'Group Discount: 15% off for 5+ tickets!'
    }

    const discount = (ticketPrice * totalTickets * discountPercentage) / 100

    return {
      applicable: true,
      discount,
      message
    }
  }

  // Apply loyalty points discount
  static calculateLoyaltyDiscount(
    userId: string,
    availablePoints: number,
    orderAmount: number
  ): { pointsToUse: number; discountAmount: number; remainingPoints: number } {
    // 100 points = $1 discount
    const pointValue = 0.01
    const maxDiscount = orderAmount * 0.5 // Max 50% discount from points
    const maxPointsUsable = Math.floor(maxDiscount / pointValue)
    
    const pointsToUse = Math.min(availablePoints, maxPointsUsable)
    const discountAmount = pointsToUse * pointValue
    const remainingPoints = availablePoints - pointsToUse

    return {
      pointsToUse,
      discountAmount,
      remainingPoints
    }
  }

  // Mock coupon data for demonstration
  private static getMockCoupon(code: string): any | null {
    const mockCoupons = {
      'SAVE20': {
        code: 'SAVE20',
        name: '20% Off',
        discountType: 'percentage',
        discountValue: 20,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        minimumOrderAmount: 50,
        maxUses: null,
        currentUses: 0
      },
      'FIRST10': {
        code: 'FIRST10',
        name: 'First Time User',
        discountType: 'fixed_amount',
        discountValue: 10,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        minimumOrderAmount: 0,
        maxUses: 1000,
        currentUses: 245
      },
      'BUY2GET1': {
        code: 'BUY2GET1',
        name: 'Buy 2 Get 1 Free',
        discountType: 'buy_x_get_y',
        buyQuantity: 2,
        getQuantity: 1,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        minimumOrderAmount: 0,
        maxUses: null,
        currentUses: 0
      },
      'EXPIRED': {
        code: 'EXPIRED',
        name: 'Expired Coupon',
        discountType: 'percentage',
        discountValue: 30,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-01-31'), // Expired
        minimumOrderAmount: 0,
        maxUses: null,
        currentUses: 0
      }
    }

    return mockCoupons[code as keyof typeof mockCoupons] || null
  }

  // Calculate final price with all applicable discounts
  static calculateFinalPrice(
    originalAmount: number,
    appliedDiscounts: Array<{
      type: string
      amount: number
      description: string
    }>
  ): DiscountCalculation {
    const totalDiscount = appliedDiscounts.reduce((sum, discount) => sum + discount.amount, 0)
    const finalAmount = Math.max(0, originalAmount - totalDiscount)

    return {
      originalAmount,
      discountAmount: totalDiscount,
      finalAmount,
      appliedCoupons: appliedDiscounts.map(d => d.type),
      savings: totalDiscount
    }
  }

  // Generate promotional codes for organizers
  static generatePromotionalCode(
    eventName: string,
    discountType: 'percentage' | 'fixed_amount' = 'percentage'
  ): string {
    const eventPrefix = eventName.replace(/\s+/g, '').substring(0, 4).toUpperCase()
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${eventPrefix}${randomSuffix}`
  }

  // Check if user is eligible for first-time discount
  static async checkFirstTimeUserDiscount(userId: string): Promise<boolean> {
    // In production, this would check the database for user's booking history
    // For demo, we'll simulate
    const hasBookedBefore = Math.random() > 0.7 // 30% chance user is new
    return !hasBookedBefore
  }
}
