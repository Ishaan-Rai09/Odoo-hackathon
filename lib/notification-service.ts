import { EmailService } from './email-service'

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
}

export interface NotificationData {
  type: 'booking_confirmation' | 'reminder_24h' | 'reminder_1h' | 'event_update' | 'cancellation'
  recipientEmail: string
  recipientPhone?: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  bookingId?: string
  attendeeName?: string
  customMessage?: string
}

export class NotificationService {
  // Send booking confirmation notification
  static async sendBookingConfirmation(
    bookingData: any,
    attendeeEmails: string[]
  ): Promise<{ success: string[]; failed: string[] }> {
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] }

    for (const email of attendeeEmails) {
      try {
        const notificationData: NotificationData = {
          type: 'booking_confirmation',
          recipientEmail: email,
          eventTitle: bookingData.eventTitle,
          eventDate: bookingData.eventDate,
          eventTime: bookingData.eventTime,
          eventVenue: bookingData.eventVenue,
          bookingId: bookingData.bookingId
        }

        const success = await this.sendEmailNotification(notificationData)
        if (success) {
          results.success.push(email)
        } else {
          results.failed.push(email)
        }
      } catch (error) {
        console.error(`Failed to send confirmation to ${email}:`, error)
        results.failed.push(email)
      }
    }

    return results
  }

  // Send event reminder (24h or 1h before)
  static async sendEventReminder(
    bookingData: any,
    reminderType: 'reminder_24h' | 'reminder_1h'
  ): Promise<boolean> {
    try {
      const attendeeEmails: string[] = Array.from(
        new Set(bookingData.attendees.map((attendee: any) => attendee.email as string))
      )

      for (const email of attendeeEmails) {
        const notificationData: NotificationData = {
          type: reminderType,
          recipientEmail: email,
          eventTitle: bookingData.eventTitle,
          eventDate: bookingData.eventDate,
          eventTime: bookingData.eventTime,
          eventVenue: bookingData.eventVenue,
          bookingId: bookingData.bookingId
        }

        await this.sendEmailNotification(notificationData)
      }

      console.log(`✅ ${reminderType} reminders sent for booking ${bookingData.bookingId}`)
      return true
    } catch (error) {
      console.error(`Error sending ${reminderType} reminder:`, error)
      return false
    }
  }

  // Send event update notification
  static async sendEventUpdate(
    eventId: string,
    updateMessage: string,
    attendeeEmails: string[]
  ): Promise<{ success: string[]; failed: string[] }> {
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] }

    for (const email of attendeeEmails) {
      try {
        const notificationData: NotificationData = {
          type: 'event_update',
          recipientEmail: email,
          eventTitle: 'Event Update',
          eventDate: '',
          eventTime: '',
          eventVenue: '',
          customMessage: updateMessage
        }

        const success = await this.sendEmailNotification(notificationData)
        if (success) {
          results.success.push(email)
        } else {
          results.failed.push(email)
        }
      } catch (error) {
        console.error(`Failed to send update to ${email}:`, error)
        results.failed.push(email)
      }
    }

    return results
  }

  // Send SMS notification (simulated)
  static async sendSMSNotification(
    phone: string,
    message: string
  ): Promise<boolean> {
    try {
      // Simulate SMS sending
      console.log(`📱 SMS to ${phone}: ${message}`)
      
      // In production, integrate with services like:
      // - Twilio
      // - AWS SNS
      // - Firebase Cloud Messaging
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`✅ SMS sent successfully (simulated)`)
      return true
    } catch (error) {
      console.error('Error sending SMS:', error)
      return false
    }
  }

  // Send push notification (simulated)
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string
  ): Promise<boolean> {
    try {
      // Simulate push notification
      console.log(`🔔 Push to ${userId}: ${title} - ${body}`)
      
      // In production, integrate with:
      // - Firebase Cloud Messaging
      // - OneSignal
      // - Pusher
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log(`✅ Push notification sent successfully (simulated)`)
      return true
    } catch (error) {
      console.error('Error sending push notification:', error)
      return false
    }
  }

  // Private method to send email notifications
  private static async sendEmailNotification(data: NotificationData): Promise<boolean> {
    try {
      const emailContent = this.generateEmailContent(data)
      
      // Simulate email sending for demo
      console.log(`📧 ${data.type} email to: ${data.recipientEmail}`)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return true
    } catch (error) {
      console.error('Error sending email notification:', error)
      return false
    }
  }

  // Generate email content based on notification type
  private static generateEmailContent(data: NotificationData): string {
    switch (data.type) {
      case 'booking_confirmation':
        return `
          <h2>🎫 Booking Confirmed!</h2>
          <p>Your registration for <strong>${data.eventTitle}</strong> has been confirmed.</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li>Date: ${new Date(data.eventDate).toLocaleDateString()}</li>
            <li>Time: ${data.eventTime}</li>
            <li>Venue: ${data.eventVenue}</li>
            <li>Booking ID: ${data.bookingId}</li>
          </ul>
          <p>Your tickets with QR codes are attached to this email.</p>
        `

      case 'reminder_24h':
        return `
          <h2>⏰ Event Reminder - 24 Hours</h2>
          <p>Don't forget! Your event <strong>${data.eventTitle}</strong> is tomorrow.</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li>Date: ${new Date(data.eventDate).toLocaleDateString()}</li>
            <li>Time: ${data.eventTime}</li>
            <li>Venue: ${data.eventVenue}</li>
          </ul>
          <p><strong>Remember to:</strong></p>
          <ul>
            <li>Bring your ticket and valid ID</li>
            <li>Arrive 30 minutes early</li>
            <li>Have your QR code ready</li>
          </ul>
        `

      case 'reminder_1h':
        return `
          <h2>🚨 Event Starting Soon!</h2>
          <p><strong>${data.eventTitle}</strong> starts in 1 hour!</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li>Time: ${data.eventTime}</li>
            <li>Venue: ${data.eventVenue}</li>
          </ul>
          <p><strong>Last-minute reminders:</strong></p>
          <ul>
            <li>Leave now to arrive on time</li>
            <li>Have your QR code ready on your phone</li>
            <li>Bring valid ID for entry</li>
          </ul>
        `

      case 'event_update':
        return `
          <h2>📢 Event Update</h2>
          <p>${data.customMessage}</p>
        `

      case 'cancellation':
        return `
          <h2>❌ Event Cancelled</h2>
          <p>We regret to inform you that <strong>${data.eventTitle}</strong> has been cancelled.</p>
          <p>If you purchased tickets, a full refund will be processed within 3-5 business days.</p>
          <p>Booking ID: ${data.bookingId}</p>
        `

      default:
        return `<p>Event notification: ${data.eventTitle}</p>`
    }
  }

  // Schedule automated reminders for all upcoming events
  static async scheduleEventReminders(): Promise<void> {
    try {
      console.log('🔄 Checking for events requiring reminders...')
      
      // This would typically run as a cron job
      // For demo purposes, we'll just log the scheduling
      
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

      console.log(`📅 Scheduled reminder check for events on:`)
      console.log(`- 24h reminders: ${tomorrow.toISOString()}`)
      console.log(`- 1h reminders: ${oneHourLater.toISOString()}`)
      
      // In production, this would:
      // 1. Query database for events happening in 24h and 1h
      // 2. Find all bookings for those events
      // 3. Send appropriate reminders
      // 4. Mark reminders as sent to avoid duplicates
      
    } catch (error) {
      console.error('Error scheduling reminders:', error)
    }
  }

  // Simulate WhatsApp message sending
  static async sendWhatsAppMessage(
    phone: string,
    message: string
  ): Promise<boolean> {
    try {
      console.log(`💬 WhatsApp to ${phone}: ${message}`)
      
      // In production, integrate with:
      // - WhatsApp Business API
      // - Twilio WhatsApp
      // - Meta WhatsApp Cloud API
      
      await new Promise(resolve => setTimeout(resolve, 700))
      
      console.log(`✅ WhatsApp message sent successfully (simulated)`)
      return true
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return false
    }
  }
}
