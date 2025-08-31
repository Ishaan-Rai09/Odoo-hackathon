'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Tag, 
  Check, 
  X, 
  Loader2, 
  Gift, 
  Percent,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react'

interface DiscountInputProps {
  eventId: string
  userId: string
  orderAmount: number
  ticketTypes: { standard: number; vip: number }
  onDiscountApplied: (discount: DiscountResult) => void
  onDiscountRemoved: () => void
  disabled?: boolean
}

export interface DiscountResult {
  type: 'coupon' | 'early_bird' | 'group' | 'referral' | 'loyalty'
  code?: string
  discountAmount: number
  discountPercentage?: number
  message: string
  isValid: boolean
}

export default function DiscountInput({ 
  eventId, 
  userId, 
  orderAmount, 
  ticketTypes, 
  onDiscountApplied, 
  onDiscountRemoved,
  disabled = false 
}: DiscountInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [appliedDiscounts, setAppliedDiscounts] = useState<DiscountResult[]>([])
  const [validationLoading, setValidationLoading] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [showAutoDiscounts, setShowAutoDiscounts] = useState(true)

  useEffect(() => {
    // Check for automatic discounts when component loads
    checkAutomaticDiscounts()
  }, [orderAmount, ticketTypes])

  const checkAutomaticDiscounts = async () => {
    const autoDiscounts: DiscountResult[] = []

    // Check for group discount
    const totalTickets = ticketTypes.standard + ticketTypes.vip
    if (totalTickets >= 5) {
      const groupDiscount = await fetch('/api/discounts/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalTickets,
          ticketPrice: totalTickets > 0 ? orderAmount / totalTickets : 0
        })
      })

      if (groupDiscount.ok) {
        const result = await groupDiscount.json()
        if (result.applicable) {
          autoDiscounts.push({
            type: 'group',
            discountAmount: result.discount,
            message: result.message,
            isValid: true
          })
        }
      }
    }

    // Check for early bird discount
    try {
      const earlyBirdResponse = await fetch(`/api/events/${eventId}/early-bird`)
      if (earlyBirdResponse.ok) {
        const earlyBird = await earlyBirdResponse.json()
        if (earlyBird.applicable) {
          autoDiscounts.push({
            type: 'early_bird',
            discountAmount: (orderAmount * earlyBird.discount) / 100,
            discountPercentage: earlyBird.discount,
            message: earlyBird.message,
            isValid: true
          })
        }
      }
    } catch (error) {
      console.log('Early bird check failed:', error)
    }

    // Apply automatic discounts
    autoDiscounts.forEach(discount => {
      setAppliedDiscounts(prev => {
        const exists = prev.some(d => d.type === discount.type)
        if (!exists) {
          onDiscountApplied(discount)
          return [...prev, discount]
        }
        return prev
      })
    })
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) return

    setValidationLoading(true)
    setValidationMessage('')

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.toUpperCase(),
          eventId,
          userId,
          orderAmount,
          ticketTypes
        })
      })

      const result = await response.json()

      if (result.isValid) {
        const discount: DiscountResult = {
          type: 'coupon',
          code: couponCode.toUpperCase(),
          discountAmount: result.discountAmount,
          message: result.message,
          isValid: true
        }

        setAppliedDiscounts(prev => [...prev, discount])
        onDiscountApplied(discount)
        setCouponCode('')
        setValidationMessage('')
      } else {
        setValidationMessage(result.message)
      }
    } catch (error) {
      setValidationMessage('Error validating coupon code')
      console.error('Coupon validation error:', error)
    }

    setValidationLoading(false)
  }

  const removeDiscount = (index: number) => {
    const discountToRemove = appliedDiscounts[index]
    setAppliedDiscounts(prev => prev.filter((_, i) => i !== index))
    onDiscountRemoved()
  }

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'coupon': return <Tag className="w-4 h-4" />
      case 'early_bird': return <Calendar className="w-4 h-4" />
      case 'group': return <Users className="w-4 h-4" />
      case 'referral': return <Gift className="w-4 h-4" />
      case 'loyalty': return <Sparkles className="w-4 h-4" />
      default: return <Percent className="w-4 h-4" />
    }
  }

  const getDiscountColor = (type: string) => {
    switch (type) {
      case 'coupon': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'early_bird': return 'bg-green-100 text-green-800 border-green-300'
      case 'group': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'referral': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'loyalty': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const totalDiscount = appliedDiscounts.reduce((sum, discount) => sum + discount.discountAmount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Discounts & Promotions
        </CardTitle>
        <CardDescription>
          Apply coupon codes and view available discounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Applied Discounts */}
        {appliedDiscounts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Applied Discounts:</h4>
            {appliedDiscounts.map((discount, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
              >
                <div className="flex items-center gap-2">
                  {getDiscountIcon(discount.type)}
                  <div>
                    <div className="font-medium text-sm">
                      {discount.code ? `${discount.code}` : discount.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-600">{discount.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">
                    -${discount.discountAmount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDiscount(index)}
                    disabled={disabled}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {totalDiscount > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-800">Total Savings:</span>
                  <span className="font-bold text-blue-800 text-lg">
                    -${totalDiscount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coupon Code Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={disabled || validationLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    validateCoupon()
                  }
                }}
              />
            </div>
            <Button 
              onClick={validateCoupon}
              disabled={disabled || !couponCode.trim() || validationLoading}
              variant="outline"
            >
              {validationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Apply
                </>
              )}
            </Button>
          </div>

          {validationMessage && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Available Discount Hints */}
        {showAutoDiscounts && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Available Offers:</h4>
            <div className="grid gap-2">
              {/* Group Discount Hint */}
              {ticketTypes.standard + ticketTypes.vip < 5 && (
                <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-purple-600" />
                    <span className="font-medium">Group Discount:</span>
                  </div>
                  <span className="text-purple-700">
                    Book {5 - (ticketTypes.standard + ticketTypes.vip)} more tickets to get 15% off!
                  </span>
                </div>
              )}

              {/* Sample Coupon Codes */}
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="font-medium text-blue-800 mb-1">Try these codes:</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-blue-100" 
                        onClick={() => setCouponCode('SAVE20')}>
                    SAVE20
                  </Badge>
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-blue-100" 
                        onClick={() => setCouponCode('FIRST10')}>
                    FIRST10
                  </Badge>
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-blue-100" 
                        onClick={() => setCouponCode('BUY2GET1')}>
                    BUY2GET1
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
