import mongoose from 'mongoose'

const CouponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  
  // Discount details
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed_amount', 'buy_x_get_y'], 
    required: true 
  },
  discountValue: { 
    type: Number, 
    required: true 
  },
  
  // For buy_x_get_y offers
  buyQuantity: { 
    type: Number, 
    default: 1 
  },
  getQuantity: { 
    type: Number, 
    default: 0 
  },
  
  // Usage limits
  maxUses: { 
    type: Number, 
    default: null // null = unlimited
  },
  maxUsesPerUser: { 
    type: Number, 
    default: 1 
  },
  currentUses: { 
    type: Number, 
    default: 0 
  },
  
  // Date constraints
  validFrom: { 
    type: Date, 
    required: true 
  },
  validUntil: { 
    type: Date, 
    required: true 
  },
  
  // Applicable constraints
  applicableEvents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  }],
  applicableCategories: [String],
  minimumOrderAmount: { 
    type: Number, 
    default: 0 
  },
  applicableTicketTypes: [String], // ['standard', 'vip']
  
  // Early bird specific
  isEarlyBird: { 
    type: Boolean, 
    default: false 
  },
  earlyBirdEndDate: Date,
  
  // Referral specific
  isReferral: { 
    type: Boolean, 
    default: false 
  },
  referrerReward: { 
    type: Number, 
    default: 0 
  },
  refereeReward: { 
    type: Number, 
    default: 0 
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Organizer who created this coupon
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organizer' 
  },
  
  // Usage tracking
  usedBy: [{
    userId: String,
    bookingId: String,
    usedAt: { type: Date, default: Date.now },
    discountAmount: Number
  }]
}, {
  timestamps: true
})

// Index for efficient lookups
CouponSchema.index({ code: 1, isActive: 1 })
CouponSchema.index({ validFrom: 1, validUntil: 1 })
CouponSchema.index({ applicableEvents: 1 })

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema)
