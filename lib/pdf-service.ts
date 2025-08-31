import jsPDF from 'jspdf'
import { BookingData } from './payment-service'

export interface TicketPDFData {
  bookingId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  attendeeName: string
  ticketType: 'standard' | 'vip'
  ticketNumber: string
  qrCode: string
  totalAmount: number
}

export class PDFService {
  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  private static formatTime(timeString: string): string {
    try {
      // Handle various time formats
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const hour12 = hour % 12 || 12
        return `${hour12}:${minutes} ${ampm}`
      }
      return timeString
    } catch {
      return timeString
    }
  }

  static async generateTicketPDF(ticketData: TicketPDFData): Promise<Uint8Array> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Set background color
      pdf.setFillColor(0, 0, 0)
      pdf.rect(0, 0, 210, 297, 'F')

      // Add header with gradient effect simulation
      pdf.setFillColor(20, 20, 30)
      pdf.rect(0, 0, 210, 60, 'F')

      // Add cyber-style border
      pdf.setDrawColor(0, 200, 255)
      pdf.setLineWidth(0.5)
      pdf.rect(10, 10, 190, 277)

      // Title
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EVENT TICKET', 105, 25, { align: 'center' })

      // Subtitle
      pdf.setFontSize(12)
      pdf.setTextColor(0, 200, 255)
      pdf.text('ELITE EVENTS PLATFORM', 105, 35, { align: 'center' })

      // Event Title
      pdf.setFontSize(18)
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.text(ticketData.eventTitle, 105, 50, { align: 'center' })

      // Ticket type badge
      const badgeColor: [number, number, number] = ticketData.ticketType === 'vip' ? [255, 215, 0] : [0, 200, 255]
      pdf.setFillColor(...badgeColor)
      pdf.rect(150, 15, 40, 8, 'F')
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(ticketData.ticketType.toUpperCase(), 170, 21, { align: 'center' })

      // Event Details Section
      let yPosition = 80

      pdf.setTextColor(0, 200, 255)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EVENT DETAILS', 20, yPosition)

      yPosition += 10
      pdf.setDrawColor(0, 200, 255)
      pdf.setLineWidth(0.3)
      pdf.line(20, yPosition, 190, yPosition)

      yPosition += 10
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')

      // Date
      pdf.setFont('helvetica', 'bold')
      pdf.text('Date:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(this.formatDate(ticketData.eventDate), 40, yPosition)

      yPosition += 8
      // Time
      pdf.setFont('helvetica', 'bold')
      pdf.text('Time:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(this.formatTime(ticketData.eventTime), 40, yPosition)

      yPosition += 8
      // Venue
      pdf.setFont('helvetica', 'bold')
      pdf.text('Venue:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      const venue = ticketData.eventVenue || 'TBA'
      pdf.text(venue, 40, yPosition)

      // Attendee Information
      yPosition += 20

      pdf.setTextColor(0, 200, 255)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ATTENDEE INFORMATION', 20, yPosition)

      yPosition += 10
      pdf.line(20, yPosition, 190, yPosition)

      yPosition += 10
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(11)

      // Attendee Name
      pdf.setFont('helvetica', 'bold')
      pdf.text('Name:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(ticketData.attendeeName, 50, yPosition)

      yPosition += 8
      // Ticket Number
      pdf.setFont('helvetica', 'bold')
      pdf.text('Ticket #:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(ticketData.ticketNumber, 50, yPosition)

      yPosition += 8
      // Booking ID
      pdf.setFont('helvetica', 'bold')
      pdf.text('Booking ID:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(ticketData.bookingId, 50, yPosition)

      // QR Code Section
      yPosition += 25

      pdf.setTextColor(0, 200, 255)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('VERIFICATION QR CODE', 20, yPosition)

      yPosition += 10
      pdf.line(20, yPosition, 190, yPosition)

      // Add QR code image
      if (ticketData.qrCode) {
        try {
          pdf.addImage(ticketData.qrCode, 'PNG', 75, yPosition + 10, 60, 60)
        } catch (error) {
          console.warn('Failed to add QR code to PDF:', error)
          // Add fallback text
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(10)
          pdf.text('QR Code could not be generated', 105, yPosition + 40, { align: 'center' })
        }
      }

      // Instructions
      yPosition += 80
      pdf.setTextColor(200, 200, 200)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text('INSTRUCTIONS:', 20, yPosition)
      yPosition += 6
      pdf.text('• Present this ticket at the venue entrance', 22, yPosition)
      yPosition += 5
      pdf.text('• Ensure QR code is clearly visible for scanning', 22, yPosition)
      yPosition += 5
      pdf.text('• Bring valid ID for verification', 22, yPosition)
      yPosition += 5
      pdf.text('• Arrive 30 minutes before event start time', 22, yPosition)

      // Footer
      pdf.setFillColor(20, 20, 30)
      pdf.rect(0, 270, 210, 27, 'F')

      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.text('Generated by Elite Events Platform', 20, 280)
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 285)
      pdf.text('For support, visit: support@eliteevents.com', 20, 290)

      // Return PDF as Uint8Array
      const pdfOutput = pdf.output('arraybuffer')
      return new Uint8Array(pdfOutput)

    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate ticket PDF')
    }
  }

  static async generateAllTicketsPDF(
    bookingData: BookingData,
    ticketQRCodes: Array<{ attendeeName: string; qrCode: string; ticketNumber: string }>
  ): Promise<Uint8Array> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Remove the default first page
      pdf.deletePage(1)

      for (let i = 0; i < bookingData.attendees.length; i++) {
        const attendee = bookingData.attendees[i]
        const qrData = ticketQRCodes[i]

        // Add a new page for each ticket
        pdf.addPage()

        const ticketData: TicketPDFData = {
          bookingId: bookingData.bookingId,
          eventTitle: bookingData.eventTitle,
          eventDate: bookingData.eventDate,
          eventTime: bookingData.eventTime,
          eventVenue: bookingData.eventVenue,
          attendeeName: attendee.name,
          ticketType: attendee.ticketType,
          ticketNumber: qrData.ticketNumber,
          qrCode: qrData.qrCode,
          totalAmount: bookingData.totalAmount
        }

        // Generate ticket content for this page
        await this.generateSingleTicketOnPage(pdf, ticketData)
      }

      // Return PDF as Uint8Array
      const pdfOutput = pdf.output('arraybuffer')
      return new Uint8Array(pdfOutput)

    } catch (error) {
      console.error('Error generating combined PDF:', error)
      throw new Error('Failed to generate tickets PDF')
    }
  }

  private static async generateSingleTicketOnPage(pdf: jsPDF, ticketData: TicketPDFData) {
    // Set background color
    pdf.setFillColor(0, 0, 0)
    pdf.rect(0, 0, 210, 297, 'F')

    // Add header with gradient effect simulation
    pdf.setFillColor(20, 20, 30)
    pdf.rect(0, 0, 210, 60, 'F')

    // Add cyber-style border
    pdf.setDrawColor(0, 200, 255)
    pdf.setLineWidth(0.5)
    pdf.rect(10, 10, 190, 277)

    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('EVENT TICKET', 105, 25, { align: 'center' })

    // Subtitle
    pdf.setFontSize(12)
    pdf.setTextColor(0, 200, 255)
    pdf.text('ELITE EVENTS PLATFORM', 105, 35, { align: 'center' })

    // Event Title
    pdf.setFontSize(18)
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.text(ticketData.eventTitle, 105, 50, { align: 'center' })

    // Ticket type badge
    const badgeColor: [number, number, number] = ticketData.ticketType === 'vip' ? [255, 215, 0] : [0, 200, 255]
    pdf.setFillColor(...badgeColor)
    pdf.rect(150, 15, 40, 8, 'F')
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(ticketData.ticketType.toUpperCase(), 170, 21, { align: 'center' })

    // Event Details Section
    let yPosition = 80

    pdf.setTextColor(0, 200, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('EVENT DETAILS', 20, yPosition)

    yPosition += 10
    pdf.setDrawColor(0, 200, 255)
    pdf.setLineWidth(0.3)
    pdf.line(20, yPosition, 190, yPosition)

    yPosition += 10
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')

    // Date
    pdf.setFont('helvetica', 'bold')
    pdf.text('Date:', 20, yPosition)
    pdf.setFont('helvetica', 'normal')
    pdf.text(this.formatDate(ticketData.eventDate), 40, yPosition)

    yPosition += 8
    // Time
    pdf.setFont('helvetica', 'bold')
    pdf.text('Time:', 20, yPosition)
    pdf.setFont('helvetica', 'normal')
    pdf.text(this.formatTime(ticketData.eventTime), 40, yPosition)

    yPosition += 8
    // Venue
    pdf.setFont('helvetica', 'bold')
    pdf.text('Venue:', 20, yPosition)
    pdf.setFont('helvetica', 'normal')
    const venue = ticketData.eventVenue || 'TBA'
    pdf.text(venue, 40, yPosition)

    // Attendee Information
    yPosition += 20

    pdf.setTextColor(0, 200, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ATTENDEE INFORMATION', 20, yPosition)

    yPosition += 10
    pdf.line(20, yPosition, 190, yPosition)

    yPosition += 10
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(11)

    // Attendee Name
    pdf.setFont('helvetica', 'bold')
    pdf.text('Name:', 20, yPosition)
    pdf.setFont('helvetica', 'normal')
    pdf.text(ticketData.attendeeName, 50, yPosition)

    yPosition += 8
    // Ticket Number
    pdf.setFont('helvetica', 'bold')
    pdf.text('Ticket #:', 20, yPosition)
    pdf.setFont('helvetica', 'normal')
    pdf.text(ticketData.ticketNumber, 50, yPosition)

    yPosition += 8
    // Booking ID
    pdf.setFont('helvetica', 'bold')
    pdf.text('Booking ID:', 20, yPosition)
    pdf.setFont('helvetica', 'normal')
    pdf.text(ticketData.bookingId, 50, yPosition)

    // QR Code Section
    yPosition += 25

    pdf.setTextColor(0, 200, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('VERIFICATION QR CODE', 20, yPosition)

    yPosition += 10
    pdf.line(20, yPosition, 190, yPosition)

    // Add QR code image
    if (ticketData.qrCode) {
      try {
        pdf.addImage(ticketData.qrCode, 'PNG', 75, yPosition + 10, 60, 60)
      } catch (error) {
        console.warn('Failed to add QR code to PDF:', error)
        // Add fallback text
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(10)
        pdf.text('QR Code could not be generated', 105, yPosition + 40, { align: 'center' })
      }
    }

    // Instructions
    yPosition += 80
    pdf.setTextColor(200, 200, 200)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text('INSTRUCTIONS:', 20, yPosition)
    yPosition += 6
    pdf.text('• Present this ticket at the venue entrance', 22, yPosition)
    yPosition += 5
    pdf.text('• Ensure QR code is clearly visible for scanning', 22, yPosition)
    yPosition += 5
    pdf.text('• Bring valid ID for verification', 22, yPosition)
    yPosition += 5
    pdf.text('• Arrive 30 minutes before event start time', 22, yPosition)

    // Footer
    pdf.setFillColor(20, 20, 30)
    pdf.rect(0, 270, 210, 27, 'F')

    pdf.setTextColor(100, 100, 100)
    pdf.setFontSize(8)
    pdf.text('Generated by Elite Events Platform', 20, 280)
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 285)
    pdf.text('For support, visit: support@eliteevents.com', 20, 290)
  }
}
