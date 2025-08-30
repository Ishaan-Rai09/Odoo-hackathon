export interface DemographicsData {
  ageGroups: {
    '18-25': number
    '26-35': number
    '36-45': number
    '46-55': number
    '55+': number
  }
  genderDistribution: {
    male: number
    female: number
    other: number
  }
  locationDistribution: {
    [city: string]: number
  }
  ticketTypeDistribution: {
    standard: number
    vip: number
  }
  registrationTrends: Array<{
    date: string
    registrations: number
    revenue: number
  }>
}

export interface EventAnalytics {
  eventId: string
  eventName: string
  totalRevenue: number
  totalRegistrations: number
  totalCapacity: number
  fillRate: number
  averageTicketPrice: number
  demographics: DemographicsData
  paymentMethods: {
    [method: string]: number
  }
  dailyRegistrations: Array<{
    date: string
    count: number
    revenue: number
  }>
  topReferralSources: Array<{
    source: string
    registrations: number
  }>
}

export interface PlatformAnalytics {
  totalEvents: number
  totalUsers: number
  totalRevenue: number
  totalBookings: number
  activeEvents: number
  averageEventSize: number
  topCategories: Array<{
    category: string
    eventCount: number
    totalRevenue: number
  }>
  monthlyGrowth: {
    events: number
    users: number
    revenue: number
  }
  userRetention: {
    oneTime: number
    returning: number
    loyal: number
  }
}

export class AnalyticsService {
  // Generate event analytics
  static async generateEventAnalytics(eventId: string): Promise<EventAnalytics> {
    // Simulate analytics data generation
    const mockAnalytics: EventAnalytics = {
      eventId,
      eventName: 'Sample Event',
      totalRevenue: 15420,
      totalRegistrations: 287,
      totalCapacity: 400,
      fillRate: 71.75,
      averageTicketPrice: 53.73,
      demographics: {
        ageGroups: {
          '18-25': 45,
          '26-35': 32,
          '36-45': 15,
          '46-55': 6,
          '55+': 2
        },
        genderDistribution: {
          male: 52,
          female: 46,
          other: 2
        },
        locationDistribution: {
          'New York': 35,
          'Los Angeles': 22,
          'Chicago': 18,
          'Houston': 12,
          'Other': 13
        },
        ticketTypeDistribution: {
          standard: 78,
          vip: 22
        },
        registrationTrends: this.generateRegistrationTrends()
      },
      paymentMethods: {
        'Credit Card': 65,
        'Debit Card': 20,
        'PayPal': 10,
        'Apple Pay': 5
      },
      dailyRegistrations: this.generateDailyRegistrations(),
      topReferralSources: [
        { source: 'Social Media', registrations: 125 },
        { source: 'Email Campaign', registrations: 89 },
        { source: 'Direct', registrations: 45 },
        { source: 'Referral', registrations: 28 }
      ]
    }

    return mockAnalytics
  }

  // Generate platform-wide analytics
  static async generatePlatformAnalytics(): Promise<PlatformAnalytics> {
    const mockPlatformAnalytics: PlatformAnalytics = {
      totalEvents: 1247,
      totalUsers: 15692,
      totalRevenue: 892450,
      totalBookings: 12845,
      activeEvents: 89,
      averageEventSize: 145,
      topCategories: [
        { category: 'Technical', eventCount: 342, totalRevenue: 234500 },
        { category: 'Entertainment', eventCount: 298, totalRevenue: 189200 },
        { category: 'Business', eventCount: 265, totalRevenue: 298700 },
        { category: 'Sports', eventCount: 201, totalRevenue: 125800 },
        { category: 'Other', eventCount: 141, totalRevenue: 44250 }
      ],
      monthlyGrowth: {
        events: 12.5,
        users: 8.7,
        revenue: 15.3
      },
      userRetention: {
        oneTime: 45,
        returning: 35,
        loyal: 20
      }
    }

    return mockPlatformAnalytics
  }

  // Export attendee list as CSV
  static async exportAttendeeListCSV(eventId: string): Promise<string> {
    try {
      // In production, fetch from database
      const attendees = this.getMockAttendeeData(eventId)
      
      const headers = [
        'Name',
        'Email', 
        'Phone',
        'Gender',
        'Ticket Type',
        'Booking ID',
        'Registration Date',
        'Check-in Status',
        'Check-in Time',
        'Amount Paid'
      ]

      const csvRows = [
        headers.join(','),
        ...attendees.map(attendee => [
          `"${attendee.name}"`,
          `"${attendee.email}"`,
          `"${attendee.phone}"`,
          `"${attendee.gender}"`,
          `"${attendee.ticketType}"`,
          `"${attendee.bookingId}"`,
          `"${attendee.registrationDate}"`,
          `"${attendee.checkedIn ? 'Checked In' : 'Pending'}"`,
          `"${attendee.checkInTime || 'N/A'}"`,
          `"$${attendee.amountPaid}"`
        ].join(','))
      ]

      return csvRows.join('\n')
    } catch (error) {
      console.error('Error exporting attendee list:', error)
      throw error
    }
  }

  // Export event analytics as CSV
  static async exportEventAnalyticsCSV(eventId: string): Promise<string> {
    try {
      const analytics = await this.generateEventAnalytics(eventId)
      
      const rows = [
        'Metric,Value',
        `Event Name,"${analytics.eventName}"`,
        `Total Revenue,$${analytics.totalRevenue}`,
        `Total Registrations,${analytics.totalRegistrations}`,
        `Fill Rate,${analytics.fillRate}%`,
        `Average Ticket Price,$${analytics.averageTicketPrice}`,
        '',
        'Demographics - Age Groups',
        '18-25,' + analytics.demographics.ageGroups['18-25'] + '%',
        '26-35,' + analytics.demographics.ageGroups['26-35'] + '%',
        '36-45,' + analytics.demographics.ageGroups['36-45'] + '%',
        '46-55,' + analytics.demographics.ageGroups['46-55'] + '%',
        '55+,' + analytics.demographics.ageGroups['55+'] + '%',
        '',
        'Gender Distribution',
        'Male,' + analytics.demographics.genderDistribution.male + '%',
        'Female,' + analytics.demographics.genderDistribution.female + '%',
        'Other,' + analytics.demographics.genderDistribution.other + '%',
        '',
        'Ticket Types',
        'Standard,' + analytics.demographics.ticketTypeDistribution.standard + '%',
        'VIP,' + analytics.demographics.ticketTypeDistribution.vip + '%'
      ]

      return rows.join('\n')
    } catch (error) {
      console.error('Error exporting analytics:', error)
      throw error
    }
  }

  // Generate registration trends data
  private static generateRegistrationTrends(): Array<{ date: string; registrations: number; revenue: number }> {
    const trends = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Last 30 days

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      
      const registrations = Math.floor(Math.random() * 20) + 5
      const revenue = registrations * (Math.random() * 100 + 50)
      
      trends.push({
        date: date.toISOString().split('T')[0],
        registrations,
        revenue: Math.round(revenue)
      })
    }

    return trends
  }

  // Generate daily registration data
  private static generateDailyRegistrations(): Array<{ date: string; count: number; revenue: number }> {
    const daily = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 14) // Last 14 days

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      
      const count = Math.floor(Math.random() * 25) + 10
      const revenue = count * (Math.random() * 80 + 40)
      
      daily.push({
        date: date.toISOString().split('T')[0],
        count,
        revenue: Math.round(revenue)
      })
    }

    return daily
  }

  // Generate mock attendee data
  private static getMockAttendeeData(eventId: string): Array<{
    name: string
    email: string
    phone: string
    gender: string
    ticketType: string
    bookingId: string
    registrationDate: string
    checkedIn: boolean
    checkInTime?: string
    amountPaid: number
  }> {
    const mockAttendees = []
    const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Chris', 'Anna']
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Garcia', 'Miller', 'Jones']
    const genders = ['male', 'female', 'other']
    const ticketTypes = ['standard', 'vip']

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
      const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
      const gender = genders[Math.floor(Math.random() * genders.length)]
      const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)]
      const checkedIn = Math.random() > 0.3 // 70% checked in
      
      mockAttendees.push({
        name,
        email,
        phone,
        gender,
        ticketType,
        bookingId: `BK${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkedIn,
        checkInTime: checkedIn ? new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toLocaleTimeString() : undefined,
        amountPaid: ticketType === 'vip' ? 150 : 75
      })
    }

    return mockAttendees
  }

  // Calculate revenue by time period
  static calculateRevenueByPeriod(
    bookings: any[],
    period: 'daily' | 'weekly' | 'monthly'
  ): Array<{ period: string; revenue: number; bookings: number }> {
    const revenueData: { [key: string]: { revenue: number; bookings: number } } = {}

    bookings.forEach(booking => {
      const date = new Date(booking.createdAt)
      let key: string

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0]
          break
        case 'weekly':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
      }

      if (!revenueData[key]) {
        revenueData[key] = { revenue: 0, bookings: 0 }
      }

      revenueData[key].revenue += booking.totalAmount
      revenueData[key].bookings += 1
    })

    return Object.entries(revenueData)
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        bookings: data.bookings
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  // Calculate user retention metrics
  static calculateUserRetention(bookings: any[]): {
    newUsers: number
    returningUsers: number
    loyalUsers: number
    retentionRate: number
  } {
    const userBookingCounts: { [userId: string]: number } = {}
    
    bookings.forEach(booking => {
      userBookingCounts[booking.userId] = (userBookingCounts[booking.userId] || 0) + 1
    })

    const counts = Object.values(userBookingCounts)
    const newUsers = counts.filter(count => count === 1).length
    const returningUsers = counts.filter(count => count >= 2 && count <= 4).length
    const loyalUsers = counts.filter(count => count >= 5).length
    const totalUsers = counts.length

    return {
      newUsers,
      returningUsers,
      loyalUsers,
      retentionRate: totalUsers > 0 ? ((returningUsers + loyalUsers) / totalUsers) * 100 : 0
    }
  }

  // Calculate event performance metrics
  static calculateEventPerformance(events: any[]): Array<{
    eventId: string
    eventName: string
    score: number
    metrics: {
      fillRate: number
      revenuePerTicket: number
      registrationVelocity: number
      satisfaction: number
    }
  }> {
    return events.map(event => {
      const fillRate = event.maxCapacity > 0 ? (event.totalRegistrations / event.maxCapacity) * 100 : 0
      const revenuePerTicket = event.totalRegistrations > 0 ? 
        event.ticketTypes.reduce((sum: number, ticket: any) => sum + (ticket.price * ticket.soldCount), 0) / event.totalRegistrations : 0
      
      // Mock additional metrics
      const registrationVelocity = Math.random() * 100 // Registrations per day
      const satisfaction = 4.2 + Math.random() * 0.8 // 4.2-5.0 rating
      
      // Calculate composite performance score
      const score = (
        (fillRate * 0.3) +
        (Math.min(revenuePerTicket / 100, 1) * 100 * 0.3) +
        (Math.min(registrationVelocity / 50, 1) * 100 * 0.2) +
        (satisfaction / 5 * 100 * 0.2)
      )

      return {
        eventId: event._id,
        eventName: event.name,
        score: Math.round(score),
        metrics: {
          fillRate: Math.round(fillRate),
          revenuePerTicket: Math.round(revenuePerTicket),
          registrationVelocity: Math.round(registrationVelocity),
          satisfaction: Math.round(satisfaction * 10) / 10
        }
      }
    }).sort((a, b) => b.score - a.score)
  }

  // Generate demographic insights
  static generateDemographicInsights(attendees: any[]): DemographicsData {
    const demographics: DemographicsData = {
      ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '55+': 0 },
      genderDistribution: { male: 0, female: 0, other: 0 },
      locationDistribution: {},
      ticketTypeDistribution: { standard: 0, vip: 0 },
      registrationTrends: []
    }

    // Calculate age distribution (simulated since we don't collect age)
    const totalAttendees = attendees.length
    demographics.ageGroups['18-25'] = Math.round((0.35 + Math.random() * 0.2) * 100) // 35-55%
    demographics.ageGroups['26-35'] = Math.round((0.25 + Math.random() * 0.15) * 100) // 25-40%
    demographics.ageGroups['36-45'] = Math.round((0.15 + Math.random() * 0.1) * 100)  // 15-25%
    demographics.ageGroups['46-55'] = Math.round((0.10 + Math.random() * 0.1) * 100)  // 10-20%
    demographics.ageGroups['55+'] = 100 - (
      demographics.ageGroups['18-25'] + 
      demographics.ageGroups['26-35'] + 
      demographics.ageGroups['36-45'] + 
      demographics.ageGroups['46-55']
    )

    // Calculate gender distribution
    const maleCount = attendees.filter(a => a.gender === 'male').length
    const femaleCount = attendees.filter(a => a.gender === 'female').length
    const otherCount = attendees.length - maleCount - femaleCount

    if (totalAttendees > 0) {
      demographics.genderDistribution.male = Math.round((maleCount / totalAttendees) * 100)
      demographics.genderDistribution.female = Math.round((femaleCount / totalAttendees) * 100)
      demographics.genderDistribution.other = Math.round((otherCount / totalAttendees) * 100)
    }

    // Calculate ticket type distribution
    const standardCount = attendees.filter(a => a.ticketType === 'standard').length
    const vipCount = attendees.filter(a => a.ticketType === 'vip').length

    if (totalAttendees > 0) {
      demographics.ticketTypeDistribution.standard = Math.round((standardCount / totalAttendees) * 100)
      demographics.ticketTypeDistribution.vip = Math.round((vipCount / totalAttendees) * 100)
    }

    // Generate location distribution (simulated)
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia']
    cities.forEach(city => {
      demographics.locationDistribution[city] = Math.round(Math.random() * 25 + 5) // 5-30%
    })

    return demographics
  }

  // Download data as file
  static downloadAsFile(data: string, filename: string, type: string = 'text/csv'): void {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generate comprehensive event report
  static async generateEventReport(eventId: string): Promise<{
    analytics: EventAnalytics
    attendeeCsv: string
    analyticsCsv: string
  }> {
    const analytics = await this.generateEventAnalytics(eventId)
    const attendeeCsv = await this.exportAttendeeListCSV(eventId)
    const analyticsCsv = await this.exportEventAnalyticsCSV(eventId)

    return {
      analytics,
      attendeeCsv,
      analyticsCsv
    }
  }

  // Get revenue forecast based on current trends
  static getRevenueForecast(currentBookings: any[], eventDate: string): {
    projectedRevenue: number
    projectedAttendees: number
    confidence: number
  } {
    const eventDateTime = new Date(eventDate)
    const now = new Date()
    const daysUntilEvent = Math.ceil((eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilEvent <= 0) {
      return {
        projectedRevenue: 0,
        projectedAttendees: 0,
        confidence: 0
      }
    }

    // Simple linear projection based on current registration rate
    const currentRevenue = currentBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const currentAttendees = currentBookings.reduce((sum, booking) => 
      sum + booking.tickets.standard + booking.tickets.vip, 0)
    
    // Assume 70% of registrations happen in the last week
    const registrationMultiplier = daysUntilEvent > 7 ? 1.5 : 1.2
    
    const projectedRevenue = Math.round(currentRevenue * registrationMultiplier)
    const projectedAttendees = Math.round(currentAttendees * registrationMultiplier)
    
    // Confidence decreases as time until event increases
    const confidence = Math.max(50, 90 - (daysUntilEvent * 2))

    return {
      projectedRevenue,
      projectedAttendees,
      confidence
    }
  }
}
