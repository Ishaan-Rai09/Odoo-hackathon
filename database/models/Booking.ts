import mongoose from 'mongoose'

const AttendeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  ticketType: { type: String, enum: ['standard', 'vip'], required: true }
})

const PaymentDetailsSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'success', 'failed'], required: true },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, required: true },
  timestamp: { type: Date, required: true }
})

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // Clerk user ID
  userEmail: { type: String, required: true },
  
  // Event Information
  eventId: { type: String, required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventTime: { type: String, required: true },
  eventVenue: { type: String, required: true },
  eventImage: { type: String },
  
  // Tickets
  tickets: {
    standard: { type: Number, default: 0 },
    vip: { type: Number, default: 0 }
  },
  
  // Attendees
  attendees: [AttendeeSchema],
  
  // Payment
  totalAmount: { type: Number, required: true },
  paymentDetails: PaymentDetailsSchema,
  
  // Status
  status: { 
    type: String, 
    enum: ['confirmed', 'pending', 'cancelled'], 
    default: 'confirmed' 
  },
  
  // QR Codes and PDF
  qrCodes: [{
    attendeeName: String,
    qrCode: String, // Base64 encoded QR code
    ticketNumber: String
  }],
  
  pdfGenerated: { type: Boolean, default: false },
  emailsSent: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
BookingSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema)
