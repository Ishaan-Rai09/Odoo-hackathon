export interface CheckInResult {
  success: boolean
  message: string
  attendeeInfo?: {
    name: string
    email: string
    ticketType: string
    bookingId: string
    eventTitle: string
  }
  alreadyCheckedIn?: boolean
  checkInTime?: Date
}

export interface CheckInStats {
  totalTickets: number
  checkedIn: number
  pending: number
  checkInRate: number
  recentCheckIns: Array<{
    attendeeName: string
    ticketType: string
    checkInTime: Date
  }>
}

export class CheckInService {
  // Store check-ins in memory for demo (in production, use database)
  private static checkIns: Map<string, {
    ticketNumber: string
    attendeeName: string
    checkInTime: Date
    eventId: string
  }> = new Map()

  // Validate QR code and check in attendee
  static async validateAndCheckIn(qrCodeData: string): Promise<CheckInResult> {
    try {
      // Parse QR code data
      const ticketData = this.parseQRCode(qrCodeData)
      
      if (!ticketData) {
        return {
          success: false,
          message: 'Invalid QR code format'
        }
      }

      // Check if ticket is valid
      const validationResult = await this.validateTicket(ticketData)
      if (!validationResult.valid) {
        return {
          success: false,
          message: validationResult.message
        }
      }

      // Check if already checked in
      if (this.checkIns.has(ticketData.ticketNumber)) {
        const existingCheckIn = this.checkIns.get(ticketData.ticketNumber)!
        return {
          success: false,
          message: `Already checked in at ${existingCheckIn.checkInTime.toLocaleTimeString()}`,
          alreadyCheckedIn: true,
          checkInTime: existingCheckIn.checkInTime,
          attendeeInfo: {
            name: ticketData.attendee,
            email: '', // Would be fetched from database
            ticketType: ticketData.type,
            bookingId: ticketData.bookingId,
            eventTitle: validationResult.eventTitle || ''
          }
        }
      }

      // Record check-in
      const checkInTime = new Date()
      this.checkIns.set(ticketData.ticketNumber, {
        ticketNumber: ticketData.ticketNumber,
        attendeeName: ticketData.attendee,
        checkInTime,
        eventId: ticketData.eventId
      })

      console.log(`✅ Check-in successful: ${ticketData.attendee} (${ticketData.ticketNumber})`)

      return {
        success: true,
        message: `Welcome, ${ticketData.attendee}! Check-in successful.`,
        attendeeInfo: {
          name: ticketData.attendee,
          email: '', // Would be fetched from database
          ticketType: ticketData.type,
          bookingId: ticketData.bookingId,
          eventTitle: validationResult.eventTitle || ''
        },
        checkInTime
      }
    } catch (error) {
      console.error('Check-in error:', error)
      return {
        success: false,
        message: 'Error processing check-in. Please try again.'
      }
    }
  }

  // Parse QR code data (assumes JSON format from QRService)
  private static parseQRCode(qrCodeData: string): any | null {
    try {
      const data = JSON.parse(qrCodeData)
      
      // Validate required fields
      if (!data.ticketNumber || !data.bookingId || !data.attendee) {
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error parsing QR code:', error)
      return null
    }
  }

  // Validate ticket against database (simulated)
  private static async validateTicket(
    ticketData: any
  ): Promise<{ valid: boolean; message: string; eventTitle?: string }> {
    try {
      // Simulate database lookup
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // In production, this would:
      // 1. Check if booking exists in database
      // 2. Verify ticket belongs to current event
      // 3. Check if event is happening today
      // 4. Validate ticket hasn't been refunded/cancelled
      
      // Simulate validation logic
      const isValidBooking = Math.random() > 0.05 // 95% of tickets are valid
      
      if (!isValidBooking) {
        return {
          valid: false,
          message: 'Ticket not found in system. Please contact support.'
        }
      }

      // Check if event is today (simulated)
      const isEventToday = Math.random() > 0.1 // 90% chance event is today
      
      if (!isEventToday) {
        return {
          valid: false,
          message: 'This ticket is not valid for today\'s event.'
        }
      }

      return {
        valid: true,
        message: 'Ticket is valid',
        eventTitle: 'Sample Event' // Would come from database
      }
    } catch (error) {
      console.error('Ticket validation error:', error)
      return {
        valid: false,
        message: 'Error validating ticket'
      }
    }
  }

  // Get check-in statistics for an event
  static getCheckInStats(eventId: string): CheckInStats {
    const eventCheckIns = Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.eventId === eventId)
    
    // Simulate total tickets for the event
    const totalTickets = 150 // Would come from database
    const checkedIn = eventCheckIns.length
    const pending = totalTickets - checkedIn
    const checkInRate = totalTickets > 0 ? (checkedIn / totalTickets) * 100 : 0

    // Get recent check-ins (last 10)
    const recentCheckIns = eventCheckIns
      .sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime())
      .slice(0, 10)
      .map(checkIn => ({
        attendeeName: checkIn.attendeeName,
        ticketType: 'standard', // Would be from database
        checkInTime: checkIn.checkInTime
      }))

    return {
      totalTickets,
      checkedIn,
      pending,
      checkInRate: Math.round(checkInRate * 100) / 100,
      recentCheckIns
    }
  }

  // Get all check-ins for an event (for organizer export)
  static getEventCheckIns(eventId: string): Array<{
    ticketNumber: string
    attendeeName: string
    checkInTime: Date
    ticketType: string
  }> {
    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.eventId === eventId)
      .map(checkIn => ({
        ticketNumber: checkIn.ticketNumber,
        attendeeName: checkIn.attendeeName,
        checkInTime: checkIn.checkInTime,
        ticketType: 'standard' // Would be from database
      }))
      .sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime())
  }

  // Manual check-in (for organizers when QR doesn't work)
  static async manualCheckIn(
    bookingId: string,
    attendeeName: string,
    eventId: string
  ): Promise<CheckInResult> {
    try {
      // Generate a manual ticket number
      const manualTicketNumber = `MANUAL-${bookingId}-${Date.now()}`
      
      // Check if already checked in by booking ID
      const existingCheckIn = Array.from(this.checkIns.values())
        .find(checkIn => checkIn.ticketNumber.includes(bookingId))

      if (existingCheckIn) {
        return {
          success: false,
          message: `${attendeeName} already checked in at ${existingCheckIn.checkInTime.toLocaleTimeString()}`,
          alreadyCheckedIn: true,
          checkInTime: existingCheckIn.checkInTime
        }
      }

      // Record manual check-in
      const checkInTime = new Date()
      this.checkIns.set(manualTicketNumber, {
        ticketNumber: manualTicketNumber,
        attendeeName,
        checkInTime,
        eventId
      })

      console.log(`✅ Manual check-in: ${attendeeName} (${bookingId})`)

      return {
        success: true,
        message: `Manual check-in successful for ${attendeeName}`,
        attendeeInfo: {
          name: attendeeName,
          email: '',
          ticketType: 'standard',
          bookingId,
          eventTitle: ''
        },
        checkInTime
      }
    } catch (error) {
      console.error('Manual check-in error:', error)
      return {
        success: false,
        message: 'Error processing manual check-in'
      }
    }
  }

  // Undo check-in (for mistakes)
  static async undoCheckIn(ticketNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.checkIns.has(ticketNumber)) {
        return {
          success: false,
          message: 'Check-in record not found'
        }
      }

      const checkIn = this.checkIns.get(ticketNumber)!
      this.checkIns.delete(ticketNumber)

      console.log(`↩️ Check-in undone: ${checkIn.attendeeName} (${ticketNumber})`)

      return {
        success: true,
        message: `Check-in undone for ${checkIn.attendeeName}`
      }
    } catch (error) {
      console.error('Undo check-in error:', error)
      return {
        success: false,
        message: 'Error undoing check-in'
      }
    }
  }

  // Search attendee by name or booking ID
  static searchAttendee(
    query: string,
    eventId: string
  ): Array<{
    attendeeName: string
    bookingId: string
    ticketNumber: string
    isCheckedIn: boolean
    checkInTime?: Date
  }> {
    // In production, this would search the database
    // For demo, search through check-ins and simulate database results
    
    const searchResults: Array<{
      attendeeName: string
      bookingId: string
      ticketNumber: string
      isCheckedIn: boolean
      checkInTime?: Date
    }> = []

    // Search through existing check-ins
    for (const [ticketNumber, checkIn] of this.checkIns.entries()) {
      if (checkIn.eventId === eventId && 
          (checkIn.attendeeName.toLowerCase().includes(query.toLowerCase()) ||
           ticketNumber.includes(query.toUpperCase()))) {
        searchResults.push({
          attendeeName: checkIn.attendeeName,
          bookingId: ticketNumber.split('-')[1] || 'UNKNOWN',
          ticketNumber,
          isCheckedIn: true,
          checkInTime: checkIn.checkInTime
        })
      }
    }

    // Simulate additional database results (attendees who haven't checked in)
    if (searchResults.length < 3) {
      const mockAttendees = [
        'John Smith',
        'Sarah Johnson',
        'Mike Brown',
        'Emily Davis',
        'David Wilson'
      ].filter(name => name.toLowerCase().includes(query.toLowerCase()))

      mockAttendees.forEach((name, index) => {
        if (!searchResults.find(r => r.attendeeName === name)) {
          searchResults.push({
            attendeeName: name,
            bookingId: `BK${Date.now()}${index}`,
            ticketNumber: `${eventId}-T${index + 1}`,
            isCheckedIn: false
          })
        }
      })
    }

    return searchResults.slice(0, 10) // Limit results
  }

  // Get check-in summary for dashboard
  static getDashboardSummary(eventId: string): {
    checkedIn: number
    totalExpected: number
    checkInRate: number
    lastCheckIn?: {
      name: string
      time: Date
    }
  } {
    const eventCheckIns = Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.eventId === eventId)
    
    const checkedIn = eventCheckIns.length
    const totalExpected = 150 // Would come from database
    const checkInRate = totalExpected > 0 ? (checkedIn / totalExpected) * 100 : 0

    const lastCheckIn = eventCheckIns.length > 0 
      ? eventCheckIns.reduce((latest, current) => 
          current.checkInTime > latest.checkInTime ? current : latest
        )
      : null

    return {
      checkedIn,
      totalExpected,
      checkInRate: Math.round(checkInRate * 100) / 100,
      lastCheckIn: lastCheckIn ? {
        name: lastCheckIn.attendeeName,
        time: lastCheckIn.checkInTime
      } : undefined
    }
  }

  // Clear all check-ins (for testing)
  static clearCheckIns(): void {
    this.checkIns.clear()
    console.log('🧹 All check-ins cleared')
  }
}
