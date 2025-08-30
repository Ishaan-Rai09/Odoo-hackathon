'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { redirect } from 'next/navigation'
import CouponManagement from '@/components/admin/coupon-management'

export default function AdminCouponsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect('/sign-in?redirectUrl=/admin/coupons')
  }

  // In a real app, you'd check if user has admin permissions
  // For now, we'll assume any signed-in user can access admin features

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <CouponManagement />
      </div>
    </div>
  )
}
