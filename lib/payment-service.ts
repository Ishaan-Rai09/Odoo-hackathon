import { v4 as uuidv4 } from 'uuid'

export interface PaymentDetails {
  bookingId: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed'
  paymentMethod: string
  transactionId: string
  timestamp: Date
}

export interface BookingData {
  bookingId: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  tickets: {
    standard: number
    vip: number
  }
  attendees: Array<{
    name: string
    email: string
    phone: string
    gender: string
    ticketType: 'standard' | 'vip'
  }>
  totalAmount: number
  paymentDetails: PaymentDetails
  createdAt: Date
}

export class PaymentService {
  private static generateBookingId(): string {
    const prefix = 'BK'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  private static generateTransactionId(): string {
    const prefix = 'TXN'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  static async simulatePayment(
    amount: number,
    paymentMethod: string = 'credit_card'
  ): Promise<PaymentDetails> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000))

    const bookingId = this.generateBookingId()
    const transactionId = this.generateTransactionId()

    // Simulate payment success/failure (95% success rate)
    const isSuccess = Math.random() > 0.05

    const paymentDetails: PaymentDetails = {
      bookingId,
      amount,
      currency: 'USD',
      status: isSuccess ? 'success' : 'failed',
      paymentMethod,
      transactionId,
      timestamp: new Date()
    }

    return paymentDetails
  }

  static async createBooking(
    event: any,
    tickets: { standard: number; vip: number },
    attendees: Array<{
      name: string
      email: string
      phone: string
      gender: string
    }>,
    totalAmount: number,
    paymentDetails: PaymentDetails,
    userId?: string,
    userEmail?: string
  ): Promise<BookingData> {
    // Create attendees with ticket types
    const attendeesWithTicketTypes = attendees.map((attendee, index) => ({
      ...attendee,
      ticketType: (index < tickets.standard ? 'standard' : 'vip') as 'standard' | 'vip'
    }))

    const bookingData: BookingData = {
      bookingId: paymentDetails.bookingId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue || event.location,
      tickets,
      attendees: attendeesWithTicketTypes,
      totalAmount,
      paymentDetails,
      createdAt: new Date()
    }

    console.log('Booking created:', bookingData)
    
    return bookingData
  }
  
  static async saveBookingToDatabase(
    bookingData: BookingData,
    qrCodes: Array<{ attendeeName: string; qrCode: string; ticketNumber: string }>,
    userId: string,
    userEmail: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bookingData,
          userId,
          userEmail,
          eventImage: '/api/placeholder/400/200', // Default placeholder
          qrCodes,
          pdfGenerated: true,
          emailsSent: true,
          status: 'confirmed'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save booking')
      }
      
      const result = await response.json()
      console.log('Booking saved to database:', result.booking.bookingId)
      return true
      
    } catch (error) {
      console.error('Error saving booking to database:', error)
      return false
    }
  }
}
