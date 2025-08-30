import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import mysqlPool from '@/database/connections/mysql'
import { RowDataPacket } from 'mysql2'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = params
    
    // Fetch booking and attendees from MySQL
    const connection = await mysqlPool.getConnection()
    
    // Get booking details
    const [bookingRows] = await connection.execute<RowDataPacket[]>(`
      SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?
    `, [bookingId, userId])
    
    if (bookingRows.length === 0) {
      connection.release()
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    const booking = bookingRows[0]
    
    // Get attendees
    const [attendeeRows] = await connection.execute<RowDataPacket[]>(`
      SELECT * FROM attendees WHERE booking_id = ?
    `, [bookingId])
    
    connection.release()
    
    // Generate PDF
    const pdf = new jsPDF()
    
    // Set font
    pdf.setFont('helvetica')
    
    // Add header
    pdf.setFontSize(20)
    pdf.setTextColor(0, 100, 200)
    pdf.text('EVENT TICKET', 105, 20, { align: 'center' })
    
    // Add event details
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text(booking.event_title, 105, 35, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.text(`Date: ${new Date(booking.event_date).toLocaleDateString()}`, 20, 50)
    pdf.text(`Time: ${booking.event_time}`, 20, 60)
    pdf.text(`Venue: ${booking.event_venue}`, 20, 70)
    pdf.text(`Booking ID: ${booking.booking_id}`, 20, 80)
    
    // Add attendee tickets
    let yPosition = 100
    
    for (const [index, attendee] of attendeeRows.entries()) {
      // Start a new page if needed
      if (index > 0 && yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }
      
      // Add separator line
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, yPosition - 10, 190, yPosition - 10)
      
      // Attendee info
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`TICKET #${index + 1}`, 20, yPosition)
      
      pdf.setFontSize(12)
      pdf.text(`Name: ${attendee.name}`, 20, yPosition + 15)
      pdf.text(`Email: ${attendee.email}`, 20, yPosition + 25)
      pdf.text(`Phone: ${attendee.phone}`, 20, yPosition + 35)
      pdf.text(`Ticket Type: ${attendee.ticket_type.toUpperCase()}`, 20, yPosition + 45)
      
      // Generate QR code data
      const qrData = JSON.stringify({
        bookingId: booking.booking_id,
        attendeeName: attendee.name,
        eventTitle: booking.event_title,
        ticketType: attendee.ticket_type,
        eventDate: booking.event_date,
        eventTime: booking.event_time
      })
      
      try {
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 100,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        // Add QR code to PDF
        pdf.addImage(qrCodeDataURL, 'PNG', 140, yPosition, 40, 40)
        
      } catch (qrError) {
        console.error('QR code generation error:', qrError)
        // Continue without QR code if it fails
      }
      
      yPosition += 70
    }
    
    // Add footer
    const pageHeight = pdf.internal.pageSize.height
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text('Please present this ticket at the event entrance', 105, pageHeight - 20, { align: 'center' })
    pdf.text('Thank you for choosing Elite Events', 105, pageHeight - 10, { align: 'center' })
    
    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer')
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tickets-${bookingId}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tickets' },
      { status: 500 }
    )
  }
}
