'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Calendar,
  Users,
  DollarSign,
  Percent,
  Tag,
  Gift,
  BarChart3
} from 'lucide-react'

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed_amount' | 'buy_x_get_y'
  discountValue: number
  buyQuantity?: number
  getQuantity?: number
  maxUses: number | null
  maxUsesPerUser: number
  currentUses: number
  validFrom: string
  validUntil: string
  minimumOrderAmount: number
  isActive: boolean
  isEarlyBird: boolean
  isReferral: boolean
  applicableEvents: string[]
  applicableCategories: string[]
  createdAt: string
  usedBy: Array<{
    userId: string
    bookingId: string
    usedAt: string
    discountAmount: number
  }>
}

interface CouponFormData {
  code: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed_amount' | 'buy_x_get_y'
  discountValue: number
  buyQuantity: number
  getQuantity: number
  maxUses: number | null
  maxUsesPerUser: number
  validFrom: string
  validUntil: string
  minimumOrderAmount: number
  isEarlyBird: boolean
  isReferral: boolean
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'inactive'>('all')
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    buyQuantity: 2,
    getQuantity: 1,
    maxUses: null,
    maxUsesPerUser: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minimumOrderAmount: 0,
    isEarlyBird: false,
    isReferral: false
  })

  useEffect(() => {
    loadCoupons()
  }, [])

  useEffect(() => {
    filterCoupons()
  }, [coupons, searchTerm, filterStatus])

  const loadCoupons = async () => {
    try {
      // Mock data - in production this would fetch from API
      const mockCoupons: Coupon[] = [
        {
          id: '1',
          code: 'SAVE20',
          name: '20% Off',
          description: 'Get 20% off any event booking',
          discountType: 'percentage',
          discountValue: 20,
          maxUses: null,
          maxUsesPerUser: 1,
          currentUses: 145,
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          minimumOrderAmount: 50,
          isActive: true,
          isEarlyBird: false,
          isReferral: false,
          applicableEvents: [],
          applicableCategories: [],
          createdAt: '2024-01-01',
          usedBy: [
            {
              userId: 'user1',
              bookingId: 'booking1',
              usedAt: '2024-12-15',
              discountAmount: 25.50
            }
          ]
        },
        {
          id: '2',
          code: 'FIRST10',
          name: 'First Time User',
          description: 'Welcome bonus for new users',
          discountType: 'fixed_amount',
          discountValue: 10,
          maxUses: 1000,
          maxUsesPerUser: 1,
          currentUses: 267,
          validFrom: '2024-01-01',
          validUntil: '2024-12-31',
          minimumOrderAmount: 0,
          isActive: true,
          isEarlyBird: false,
          isReferral: false,
          applicableEvents: [],
          applicableCategories: [],
          createdAt: '2024-01-01',
          usedBy: []
        },
        {
          id: '3',
          code: 'EARLYBIRD25',
          name: 'Early Bird Special',
          description: '25% off for early bookings',
          discountType: 'percentage',
          discountValue: 25,
          maxUses: 500,
          maxUsesPerUser: 1,
          currentUses: 89,
          validFrom: '2024-01-01',
          validUntil: '2024-06-30',
          minimumOrderAmount: 100,
          isActive: false,
          isEarlyBird: true,
          isReferral: false,
          applicableEvents: [],
          applicableCategories: ['conference', 'workshop'],
          createdAt: '2024-01-01',
          usedBy: []
        }
      ]
      setCoupons(mockCoupons)
    } catch (error) {
      console.error('Error loading coupons:', error)
    }
    setLoading(false)
  }

  const filterCoupons = () => {
    let filtered = coupons

    if (searchTerm) {
      filtered = filtered.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      const now = new Date()
      filtered = filtered.filter(coupon => {
        const validUntil = new Date(coupon.validUntil)
        
        switch (filterStatus) {
          case 'active':
            return coupon.isActive && validUntil > now
          case 'expired':
            return validUntil <= now
          case 'inactive':
            return !coupon.isActive
          default:
            return true
        }
      })
    }

    setFilteredCoupons(filtered)
  }

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 8
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code }))
  }

  const handleCreateCoupon = async () => {
    try {
      const newCoupon: Coupon = {
        id: Date.now().toString(),
        ...formData,
        currentUses: 0,
        isActive: true,
        applicableEvents: [],
        applicableCategories: [],
        createdAt: new Date().toISOString(),
        usedBy: []
      }

      setCoupons(prev => [newCoupon, ...prev])
      setShowCreateDialog(false)
      resetForm()
      
      console.log('Created coupon:', newCoupon)
    } catch (error) {
      console.error('Error creating coupon:', error)
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(prev => prev.filter(c => c.id !== couponId))
    }
  }

  const handleToggleCoupon = async (couponId: string) => {
    setCoupons(prev => prev.map(c => 
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    ))
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      buyQuantity: 2,
      getQuantity: 1,
      maxUses: null,
      maxUsesPerUser: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minimumOrderAmount: 0,
      isEarlyBird: false,
      isReferral: false
    })
  }

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date()
    const validUntil = new Date(coupon.validUntil)
    
    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    } else if (validUntil <= now) {
      return <Badge variant="destructive">Expired</Badge>
    } else {
      return <Badge variant="default">Active</Badge>
    }
  }

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.maxUses) return 0
    return Math.min(100, (coupon.currentUses / coupon.maxUses) * 100)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-gray-600">Create and manage promotional codes</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Tag className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{coupons.length}</div>
            <div className="text-sm text-gray-600">Total Coupons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {coupons.filter(c => c.isActive && new Date(c.validUntil) > new Date()).length}
            </div>
            <div className="text-sm text-gray-600">Active Coupons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {coupons.reduce((sum, c) => sum + c.currentUses, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Uses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <div className="text-2xl font-bold">
              ${coupons.reduce((sum, c) => sum + c.usedBy.reduce((s, u) => s + u.discountAmount, 0), 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total Savings</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons ({filteredCoupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-700">No coupons found</h3>
              <p className="text-gray-500 text-sm">Create your first coupon to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm font-bold">
                          {coupon.code}
                        </code>
                        {getStatusBadge(coupon)}
                        {coupon.isEarlyBird && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Early Bird
                          </Badge>
                        )}
                        {coupon.isReferral && (
                          <Badge variant="outline" className="text-xs">
                            <Gift className="w-3 h-3 mr-1" />
                            Referral
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-lg">{coupon.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{coupon.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Discount:</span>
                          <div className="font-medium">
                            {coupon.discountType === 'percentage' ? (
                              <>
                                <Percent className="w-3 h-3 inline mr-1" />
                                {coupon.discountValue}%
                              </>
                            ) : coupon.discountType === 'fixed_amount' ? (
                              <>
                                <DollarSign className="w-3 h-3 inline mr-1" />
                                ${coupon.discountValue}
                              </>
                            ) : (
                              `Buy ${coupon.buyQuantity}, Get ${coupon.getQuantity} Free`
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Uses:</span>
                          <div className="font-medium">
                            {coupon.currentUses} / {coupon.maxUses || '∞'}
                            {coupon.maxUses && (
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${getUsagePercentage(coupon)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Valid Until:</span>
                          <div className="font-medium">
                            {new Date(coupon.validUntil).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Min Order:</span>
                          <div className="font-medium">
                            ${coupon.minimumOrderAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(coupon.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCoupon(coupon.id)}
                      >
                        {coupon.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCoupon(coupon)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Set up a new promotional code for your events
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20"
                    className="font-mono"
                  />
                  <Button type="button" variant="outline" onClick={generateCouponCode}>
                    Generate
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="20% Off Special"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Get 20% off any event booking"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                  <option value="buy_x_get_y">Buy X Get Y</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.discountType === 'percentage' ? 'Percentage (%)' : 
                   formData.discountType === 'fixed_amount' ? 'Amount ($)' : 'Buy Quantity'}
                </label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                />
              </div>
              
              {formData.discountType === 'buy_x_get_y' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Get Quantity</label>
                  <Input
                    type="number"
                    value={formData.getQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, getQuantity: Number(e.target.value) }))}
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valid From</label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Valid Until</label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Uses</label>
                <Input
                  type="number"
                  value={formData.maxUses || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    maxUses: e.target.value ? Number(e.target.value) : null 
                  }))}
                  placeholder="Unlimited"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Max Uses Per User</label>
                <Input
                  type="number"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUsesPerUser: Number(e.target.value) }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Min Order Amount ($)</label>
                <Input
                  type="number"
                  value={formData.minimumOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isEarlyBird}
                  onChange={(e) => setFormData(prev => ({ ...prev, isEarlyBird: e.target.checked }))}
                />
                <span className="text-sm">Early Bird Coupon</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isReferral}
                  onChange={(e) => setFormData(prev => ({ ...prev, isReferral: e.target.checked }))}
                />
                <span className="text-sm">Referral Coupon</span>
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCoupon}>
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
