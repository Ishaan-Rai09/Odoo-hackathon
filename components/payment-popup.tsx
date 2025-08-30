'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@clerk/nextjs'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download, 
  Mail,
  Ticket,
  Clock,
  ArrowLeft
} from 'lucide-react'
import { PaymentService, BookingData } from '@/lib/payment-service'
import { QRService } from '@/lib/qr-service'
import { PDFService } from '@/lib/pdf-service'
import { EmailService } from '@/lib/email-service'

interface PaymentPopupProps {
  event: any
  tickets: {
    standard: number
    vip: number
  }
  attendees: Array<{
    name: string
    email: string
    phone: string
    gender: string
  }>
  totalAmount: number
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

type PaymentStage = 'payment' | 'processing' | 'success' | 'failed' | 'generating' | 'complete'

export function PaymentPopup({ 
  event, 
  tickets, 
  attendees, 
  totalAmount, 
  isOpen, 
  onClose, 
  onBack 
}: PaymentPopupProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [stage, setStage] = useState<PaymentStage>('payment')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [ticketPDF, setTicketPDF] = useState<Uint8Array | null>(null)
  const [processingStep, setProcessingStep] = useState('')

  const totalTickets = tickets.standard + tickets.vip

  useEffect(() => {
    if (isOpen) {
      setStage('payment')
      setBookingData(null)
      setTicketPDF(null)
      setProcessingStep('')
    }
  }, [isOpen])

  const handlePayment = async () => {
    try {
      setStage('processing')
      setProcessingStep('Processing payment...')

      // Simulate payment
      const paymentDetails = await PaymentService.simulatePayment(totalAmount, paymentMethod)

      if (paymentDetails.status === 'failed') {
        setStage('failed')
        toast({
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please try again.',
          variant: 'destructive'
        })
        return
      }

      setStage('generating')
      setProcessingStep('Creating booking...')

      // Create booking
      const booking = await PaymentService.createBooking(
        event,
        tickets,
        attendees,
        totalAmount,
        paymentDetails
      )
      setBookingData(booking)

      setProcessingStep('Generating QR codes...')

      // Generate QR codes for tickets
      const attendeesWithTicketTypes = attendees.map((attendee, index) => ({
        name: attendee.name,
        ticketType: (index < tickets.standard ? 'standard' : 'vip') as 'standard' | 'vip'
      }))

      const qrCodes = await QRService.generateTicketQRCodes(
        booking.bookingId,
        booking.eventTitle,
        booking.eventDate,
        booking.eventTime,
        booking.eventVenue,
        attendeesWithTicketTypes
      )

      setProcessingStep('Generating PDF tickets...')

      // Generate PDF tickets
      const pdfTickets = await PDFService.generateAllTicketsPDF(booking, qrCodes)
      setTicketPDF(pdfTickets)

      setProcessingStep('Sending confirmation emails...')

      // Send email confirmations
      const emailResults = await EmailService.sendConfirmationEmails(booking, pdfTickets)

      setProcessingStep('Saving booking...')

      // Save booking to database
      if (user) {
        const saved = await PaymentService.saveBookingToDatabase(
          booking,
          qrCodes,
          user.id,
          user.primaryEmailAddress?.emailAddress || attendees[0].email
        )
        
        if (saved) {
          console.log('✅ Booking saved to database successfully')
        } else {
          console.warn('⚠️ Failed to save booking to database, but booking process completed')
        }
      }

      setStage('complete')

      toast({
        title: 'Booking Successful! 🎉',
        description: `Your tickets have been generated. Booking ID: ${booking.bookingId}`,
      })

      if (emailResults.success.length > 0) {
        toast({
          title: 'Tickets Sent! 📧',
          description: `Confirmation emails sent to ${emailResults.success.length} recipient(s)`,
        })
      }

    } catch (error) {
      console.error('Payment error:', error)
      setStage('failed')
      toast({
        title: 'Booking Failed',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const downloadTickets = () => {
    if (ticketPDF && bookingData) {
      const blob = new Blob([ticketPDF], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Tickets-${bookingData.bookingId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Download Started',
        description: 'Your tickets are being downloaded.',
      })
    }
  }

  const handleClose = () => {
    setStage('payment')
    setBookingData(null)
    setTicketPDF(null)
    setProcessingStep('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-black/95 border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            {stage === 'payment' && (
              <>
                <CreditCard className="h-6 w-6 mr-3 text-cyber-blue" />
                Payment Details
              </>
            )}
            {(stage === 'processing' || stage === 'generating') && (
              <>
                <Loader2 className="h-6 w-6 mr-3 text-cyber-blue animate-spin" />
                Processing
              </>
            )}
            {stage === 'success' && (
              <>
                <CheckCircle className="h-6 w-6 mr-3 text-green-400" />
                Payment Successful
              </>
            )}
            {stage === 'failed' && (
              <>
                <XCircle className="h-6 w-6 mr-3 text-red-400" />
                Payment Failed
              </>
            )}
            {stage === 'complete' && (
              <>
                <Ticket className="h-6 w-6 mr-3 text-cyber-green" />
                Tickets Ready
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Stage */}
          {stage === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <Card className="glassmorphism border-cyber-blue/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/80">Event</span>
                      <span className="text-white font-medium">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Date & Time</span>
                      <span className="text-white font-medium">{event.date} • {event.time}</span>
                    </div>
                    {tickets.standard > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/80">Standard × {tickets.standard}</span>
                        <span className="text-white font-medium">
                          {event.standardPrice === 0 ? 'Free' : `$${tickets.standard * event.standardPrice}`}
                        </span>
                      </div>
                    )}
                    {tickets.vip > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/80">VIP × {tickets.vip}</span>
                        <span className="text-white font-medium">
                          ${tickets.vip * event.vipPrice}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-white">Total</span>
                        <span className="text-xl font-bold text-cyber-blue">
                          {totalAmount === 0 ? 'Free' : `$${totalAmount}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              {totalAmount > 0 && (
                <Card className="glassmorphism border-white/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={paymentMethod === 'credit_card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-cyber-blue"
                        />
                        <span className="text-white">💳 Credit Card</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="debit_card"
                          checked={paymentMethod === 'debit_card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-cyber-blue"
                        />
                        <span className="text-white">💳 Debit Card</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-cyber-blue"
                        />
                        <span className="text-white">🏦 PayPal</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attendee Summary */}
              <Card className="glassmorphism border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Attendees ({totalTickets})
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {attendees.map((attendee, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-white/80">{attendee.name}</span>
                        <span className="text-cyber-blue capitalize">
                          {index < tickets.standard ? 'Standard' : 'VIP'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Processing Stage */}
          {(stage === 'processing' || stage === 'generating') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-cyber-blue/20 rounded-full"></div>
                </div>
                <div className="relative flex items-center justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-cyber-blue" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-2">
                {stage === 'processing' ? 'Processing Payment' : 'Generating Tickets'}
              </h3>
              <p className="text-white/60 mb-4">{processingStep}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                <Clock className="h-4 w-4" />
                This may take a few moments...
              </div>
            </motion.div>
          )}

          {/* Failed Stage */}
          {stage === 'failed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
              <p className="text-white/60 mb-6">
                We couldn't process your payment. Please try again or use a different payment method.
              </p>
            </motion.div>
          )}

          {/* Complete Stage */}
          {stage === 'complete' && bookingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Success Header */}
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed! 🎉</h3>
                <p className="text-white/60">
                  Your tickets have been generated and sent to your email
                </p>
              </div>

              {/* Booking Details */}
              <Card className="glassmorphism border-green-400/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/60 text-sm mb-1">Booking ID</div>
                      <div className="text-white font-mono font-bold">{bookingData.bookingId}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm mb-1">Transaction ID</div>
                      <div className="text-white font-mono">{bookingData.paymentDetails.transactionId}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm mb-1">Total Tickets</div>
                      <div className="text-white font-medium">{totalTickets}</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm mb-1">Amount Paid</div>
                      <div className="text-green-400 font-bold">
                        {totalAmount === 0 ? 'Free Event' : `$${totalAmount}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Download Section */}
              <Card className="glassmorphism border-cyber-blue/30">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Ticket className="h-5 w-5 mr-2 text-cyber-blue" />
                    Your Tickets
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">PDF Tickets with QR Codes</div>
                        <div className="text-white/60 text-sm">
                          {totalTickets} ticket{totalTickets > 1 ? 's' : ''} ready for download
                        </div>
                      </div>
                      <Button
                        variant="cyber"
                        size="sm"
                        onClick={downloadTickets}
                        className="shrink-0"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-center p-3 bg-green-500/10 rounded-lg">
                      <Mail className="h-4 w-4 mr-2 text-green-400" />
                      <span className="text-green-400 text-sm">
                        Tickets automatically sent to registered email addresses
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="glassmorphism border-white/20">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-3">What's Next?</h4>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li>• Check your email for ticket confirmation</li>
                    <li>• Download and save your tickets to your device</li>
                    <li>• Arrive 30 minutes before the event starts</li>
                    <li>• Present your QR code at the venue entrance</li>
                    <li>• Bring valid ID for verification</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/20">
            {stage === 'payment' && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onBack}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClose}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  variant="glow"
                  size="lg"
                  onClick={handlePayment}
                  className="flex-1"
                >
                  {totalAmount === 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Registration
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ${totalAmount}
                    </>
                  )}
                </Button>
              </>
            )}

            {stage === 'failed' && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStage('payment')}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClose}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </>
            )}

            {stage === 'complete' && (
              <>
                <Button
                  variant="cyber"
                  size="lg"
                  onClick={downloadTickets}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Tickets
                </Button>
                <Button
                  variant="glow"
                  size="lg"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
