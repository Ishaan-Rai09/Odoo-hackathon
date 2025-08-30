'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  User, 
  Search,
  Scan,
  Users,
  Clock,
  RotateCcw,
  Download,
  AlertCircle
} from 'lucide-react'
import { CheckInService, CheckInResult } from '@/lib/checkin-service'

interface QRScannerProps {
  eventId: string
  eventName: string
  onCheckInUpdate?: () => void
}

export function QRScanner({ eventId, eventName, onCheckInUpdate }: QRScannerProps) {
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [manualCheckIn, setManualCheckIn] = useState({ name: '', bookingId: '' })
  const [checkInStats, setCheckInStats] = useState(CheckInService.getCheckInStats(eventId))

  // Simulate QR code scanning
  const simulateQRScan = async () => {
    setIsScanning(true)
    setScanResult(null)

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock QR data
    const mockQRData = JSON.stringify({
      ticketNumber: `${eventId}-T${Date.now()}`,
      bookingId: `BK${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      eventId: eventId,
      attendee: `Attendee ${Math.floor(Math.random() * 1000)}`,
      type: Math.random() > 0.7 ? 'vip' : 'standard'
    })

    const result = await CheckInService.validateAndCheckIn(mockQRData)
    setScanResult(result)
    setIsScanning(false)
    
    if (result.success) {
      updateStats()
    }

    onCheckInUpdate?.()
  }

  const updateStats = () => {
    setCheckInStats(CheckInService.getCheckInStats(eventId))
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length > 2) {
      const results = CheckInService.searchAttendee(query, eventId)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleManualCheckIn = async () => {
    if (!manualCheckIn.name || !manualCheckIn.bookingId) return

    const result = await CheckInService.manualCheckIn(
      manualCheckIn.bookingId,
      manualCheckIn.name,
      eventId
    )
    
    setScanResult(result)
    setManualCheckIn({ name: '', bookingId: '' })
    
    if (result.success) {
      updateStats()
    }

    onCheckInUpdate?.()
  }

  const checkInFromSearch = async (attendee: any) => {
    if (attendee.isCheckedIn) return

    const result = await CheckInService.manualCheckIn(
      attendee.bookingId,
      attendee.attendeeName,
      eventId
    )
    
    setScanResult(result)
    updateStats()
    handleSearch(searchQuery) // Refresh search results
    onCheckInUpdate?.()
  }

  const clearResult = () => {
    setScanResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Check-in Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glassmorphism border-cyber-blue/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-blue">{checkInStats.checkedIn}</div>
            <div className="text-sm text-white/60">Checked In</div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism border-cyber-green/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-green">{checkInStats.totalTickets}</div>
            <div className="text-sm text-white/60">Total Tickets</div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism border-cyber-pink/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-pink">{checkInStats.pending}</div>
            <div className="text-sm text-white/60">Pending</div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism border-cyber-purple/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyber-purple">{checkInStats.checkInRate.toFixed(1)}%</div>
            <div className="text-sm text-white/60">Check-in Rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-cyber-blue" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scanner Area */}
            <div className="relative">
              <div className="bg-white/10 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-white/20">
                {isScanning ? (
                  <div className="text-center">
                    <div className="animate-pulse">
                      <Scan className="h-16 w-16 text-cyber-blue mx-auto mb-4" />
                    </div>
                    <p className="text-white">Scanning QR Code...</p>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                      <div className="bg-cyber-blue h-2 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">Point camera at QR code to scan</p>
                    <Button 
                      onClick={simulateQRScan}
                      variant="cyber"
                      className="mx-auto"
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      Simulate Scan
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Scan Result */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-lg border ${
                    scanResult.success 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : scanResult.alreadyCheckedIn
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {scanResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      ) : scanResult.alreadyCheckedIn ? (
                        <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mr-2" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          scanResult.success 
                            ? 'text-green-400' 
                            : scanResult.alreadyCheckedIn 
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}>
                          {scanResult.message}
                        </p>
                        {scanResult.attendeeInfo && (
                          <div className="text-sm text-white/80 mt-1">
                            <p>{scanResult.attendeeInfo.name}</p>
                            <p className="capitalize">{scanResult.attendeeInfo.ticketType} Ticket</p>
                            {scanResult.checkInTime && (
                              <p>{scanResult.checkInTime.toLocaleTimeString()}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearResult}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Manual Check-in */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2 text-cyber-green" />
              Manual Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Attendees */}
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <Input
                  placeholder="Search by name or booking ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{attendee.attendeeName}</p>
                        <p className="text-white/60 text-sm">ID: {attendee.bookingId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {attendee.isCheckedIn ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="cyber"
                            onClick={() => checkInFromSearch(attendee)}
                          >
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="border-t border-white/20 pt-4">
              <p className="text-white/80 text-sm mb-3">Manual Entry</p>
              <div className="space-y-3">
                <Input
                  placeholder="Attendee Name"
                  value={manualCheckIn.name}
                  onChange={(e) => setManualCheckIn(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Input
                  placeholder="Booking ID"
                  value={manualCheckIn.bookingId}
                  onChange={(e) => setManualCheckIn(prev => ({ ...prev, bookingId: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button
                  onClick={handleManualCheckIn}
                  disabled={!manualCheckIn.name || !manualCheckIn.bookingId}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <User className="h-4 w-4 mr-2" />
                  Manual Check-in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-cyber-purple" />
              Recent Check-ins
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkInStats.recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {checkInStats.recentCheckIns.map((checkIn, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-cyber-blue/20 rounded-full flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-cyber-blue" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{checkIn.attendeeName}</p>
                      <p className="text-white/60 text-sm capitalize">{checkIn.ticketType} ticket</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-white/60 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {checkIn.checkInTime.toLocaleTimeString()}
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                      Checked In
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No check-ins yet</p>
              <p className="text-white/40 text-sm">Check-ins will appear here as attendees arrive</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
