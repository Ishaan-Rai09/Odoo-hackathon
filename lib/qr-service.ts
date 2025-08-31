import QRCode from 'qrcode'

export interface TicketQRData {
  bookingId: string
  attendeeName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  ticketType: 'standard' | 'vip'
  ticketNumber: string
  verificationUrl: string
}

export class QRService {
  private static generateTicketNumber(bookingId: string, index: number): string {
    const suffix = (index + 1).toString().padStart(3, '0')
    return `${bookingId}-T${suffix}`
  }

  static async generateQRCode(data: TicketQRData): Promise<string> {
    try {
      // Create verification URL with ticket data
      const verificationData = {
        ticketNumber: data.ticketNumber,
        bookingId: data.bookingId,
        eventId: data.eventTitle.replace(/\s+/g, '-').toLowerCase(),
        attendee: data.attendeeName,
        type: data.ticketType
      }

      // In a real application, this would be a URL to your ticket verification system
      const qrContent = JSON.stringify(verificationData)

      // Generate QR code as base64 image
      const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  static async generateTicketQRCodes(
    bookingId: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventVenue: string,
    attendees: Array<{
      name: string
      ticketType: 'standard' | 'vip'
    }>
  ): Promise<Array<{ attendeeName: string; qrCode: string; ticketNumber: string }>> {
    const qrCodes = []

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i]
      const ticketNumber = this.generateTicketNumber(bookingId, i)

      const ticketData: TicketQRData = {
        bookingId,
        attendeeName: attendee.name,
        eventTitle,
        eventDate,
        eventTime,
        eventVenue,
        ticketType: attendee.ticketType,
        ticketNumber,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-ticket/${ticketNumber}`
      }

      const qrCode = await this.generateQRCode(ticketData)

      qrCodes.push({
        attendeeName: attendee.name,
        qrCode,
        ticketNumber
      })
    }

    return qrCodes
  }

  static async generateQRCodeSVG(data: TicketQRData): Promise<string> {
    try {
      const verificationData = {
        ticketNumber: data.ticketNumber,
        bookingId: data.bookingId,
        eventId: data.eventTitle.replace(/\s+/g, '-').toLowerCase(),
        attendee: data.attendeeName,
        type: data.ticketType
      }

      const qrContent = JSON.stringify(verificationData)

      // Generate QR code as SVG string
      const qrCodeSVG = await QRCode.toString(qrContent, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      return qrCodeSVG
    } catch (error) {
      console.error('Error generating SVG QR code:', error)
      throw new Error('Failed to generate SVG QR code')
    }
  }
}
