import { BookingData } from './payment-service'

// Only import nodemailer on server-side
let nodemailer: any = null
if (typeof window === 'undefined') {
  try {
    nodemailer = require('nodemailer')
  } catch (error) {
    console.warn('Nodemailer not available:', error)
  }
}

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export class EmailService {
  private static transporter: any | null = null

  private static getTransporter(): any {
    if (!this.transporter) {
      // In a real application, these would come from environment variables
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'your-email@gmail.com',
          pass: process.env.SMTP_PASS || 'your-app-password'
        }
      }

      this.transporter = nodemailer?.createTransporter(config)
    }

    return this.transporter
  }

  static async sendTicketEmail(
    booking: BookingData,
    ticketPDF: Uint8Array,
    recipientEmail: string
  ): Promise<boolean> {
    try {
      // For demo purposes, we'll simulate email sending
      // In a real application, you would uncomment the nodemailer code below
      
      console.log(`📧 Simulating email send to: ${recipientEmail}`)
      console.log(`📧 Booking ID: ${booking.bookingId}`)
      console.log(`📧 Event: ${booking.eventTitle}`)
      console.log(`📧 PDF Size: ${ticketPDF.length} bytes`)
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`✅ Email successfully sent (simulated)`)
      return true

      // UNCOMMENT THIS SECTION FOR REAL EMAIL SENDING:
      /*
      const transporter = this.getTransporter()

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@eliteevents.com',
        to: recipientEmail,
        subject: `🎫 Your Tickets for ${booking.eventTitle} - Booking ${booking.bookingId}`,
        html: this.generateEmailHTML(booking),
        attachments: [
          {
            filename: `Tickets-${booking.bookingId}.pdf`,
            content: Buffer.from(ticketPDF),
            contentType: 'application/pdf'
          }
        ]
      }

      const result = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
      */
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  static async sendConfirmationEmails(
    booking: BookingData,
    ticketPDF: Uint8Array
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [], failed: [] }
    
    // Get unique email addresses from attendees
    const emailAddresses = Array.from(
      new Set(booking.attendees.map(attendee => attendee.email))
    )

    console.log(`📧 Sending confirmation emails to ${emailAddresses.length} recipient(s)`)

    for (const email of emailAddresses) {
      try {
        const success = await this.sendTicketEmail(booking, ticketPDF, email)
        if (success) {
          results.success.push(email)
        } else {
          results.failed.push(email)
        }
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error)
        results.failed.push(email)
      }
    }

    return results
  }

  private static generateEmailHTML(booking: BookingData): string {
    const attendeesList = booking.attendees.map((attendee, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : '#ffffff'};">
        <td style="padding: 12px; border: 1px solid #dee2e6;">${attendee.name}</td>
        <td style="padding: 12px; border: 1px solid #dee2e6; text-transform: capitalize;">${attendee.ticketType}</td>
        <td style="padding: 12px; border: 1px solid #dee2e6;">${attendee.email}</td>
      </tr>
    `).join('')

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Event Tickets</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 300;
        }
        .header .ticket-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .content {
          padding: 40px 30px;
        }
        .event-details {
          background-color: #f8f9fa;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #667eea;
        }
        .event-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: bold;
          color: #555;
          width: 80px;
          flex-shrink: 0;
        }
        .detail-value {
          color: #333;
        }
        .booking-info {
          background-color: #e8f4f8;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 25px;
        }
        .booking-id {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          text-align: center;
          margin-bottom: 10px;
        }
        .attendees-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        .attendees-table th {
          background-color: #667eea;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        .attendees-table td {
          padding: 12px;
          border: 1px solid #dee2e6;
        }
        .total-amount {
          font-size: 20px;
          font-weight: bold;
          color: #27ae60;
          text-align: center;
          margin: 20px 0;
        }
        .instructions {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 25px;
        }
        .instructions h3 {
          margin-top: 0;
          color: #856404;
        }
        .instructions ul {
          margin-bottom: 0;
          padding-left: 20px;
        }
        .instructions li {
          margin-bottom: 8px;
          color: #856404;
        }
        .footer {
          background-color: #2c3e50;
          color: #bdc3c7;
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: #3498db;
          text-decoration: none;
        }
        .qr-notice {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="ticket-icon">🎫</div>
          <h1>Your Event Tickets</h1>
          <p>Thank you for your registration!</p>
        </div>

        <div class="content">
          <div class="booking-info">
            <div class="booking-id">Booking ID: ${booking.bookingId}</div>
            <div style="text-align: center; color: #666;">
              Transaction ID: ${booking.paymentDetails.transactionId}
            </div>
          </div>

          <div class="event-details">
            <div class="event-title">${booking.eventTitle}</div>
            <div class="detail-row">
              <div class="detail-label">📅 Date:</div>
              <div class="detail-value">${new Date(booking.eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">🕒 Time:</div>
              <div class="detail-value">${booking.eventTime}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">📍 Venue:</div>
              <div class="detail-value">${booking.eventVenue}</div>
            </div>
          </div>

          <h3>Attendee Information</h3>
          <table class="attendees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Ticket Type</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${attendeesList}
            </tbody>
          </table>

          <div class="total-amount">
            Total Amount: ${booking.totalAmount === 0 ? 'Free Event' : `$${booking.totalAmount.toFixed(2)}`}
          </div>

          <div class="qr-notice">
            📱 Your tickets with QR codes are attached as a PDF file. Each ticket contains a unique QR code for verification at the venue.
          </div>

          <div class="instructions">
            <h3>📋 Important Instructions</h3>
            <ul>
              <li><strong>Print your tickets</strong> or save them on your mobile device</li>
              <li><strong>Arrive 30 minutes early</strong> for smooth entry</li>
              <li><strong>Bring valid ID</strong> for verification</li>
              <li><strong>Present QR code</strong> at the venue entrance</li>
              <li><strong>Keep tickets safe</strong> - they cannot be replaced if lost</li>
            </ul>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            We're excited to see you at the event! 🎉
          </p>
        </div>

        <div class="footer">
          <p>
            <strong>Elite Events Platform</strong><br>
            Your premier destination for amazing events
          </p>
          <p>
            Need help? Contact us at <a href="mailto:support@eliteevents.com">support@eliteevents.com</a><br>
            Visit our website: <a href="https://eliteevents.com">eliteevents.com</a>
          </p>
          <p style="margin-top: 20px; font-size: 12px; color: #95a5a6;">
            This email was sent regarding your booking ${booking.bookingId}. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  static async testEmailConfiguration(): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      await transporter.verify()
      console.log('✅ Email configuration is valid')
      return true
    } catch (error) {
      console.error('❌ Email configuration test failed:', error)
      return false
    }
  }
}
