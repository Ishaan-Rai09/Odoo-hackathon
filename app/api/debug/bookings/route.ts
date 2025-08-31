import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/auth-utils'
import mysqlPool from '@/database/connections/mysql'
import { RowDataPacket } from 'mysql2'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking authentication and bookings...')
    
    // Check all possible auth tokens
    const cookies = {
      'auth-token': request.cookies.get('auth-token')?.value,
      'token': request.cookies.get('token')?.value,
      'authToken': request.cookies.get('authToken')?.value,
    }
    
    const authHeader = request.headers.get('Authorization')
    
    console.log('🔍 Debug: Cookies found:', Object.fromEntries(
      Object.entries(cookies).filter(([_, value]) => value !== undefined)
    ))
    console.log('🔍 Debug: Auth header:', authHeader)
    
    const authResult = validateToken(request)
    console.log('🔍 Debug: Auth validation result:', authResult)
    
    if (!authResult) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          cookies,
          authHeader,
          message: 'No valid auth token found'
        }
      }, { status: 401 })
    }
    
    const { userId } = authResult
    console.log('🔍 Debug: User ID:', userId)
    
    // Check MySQL connection and data
    try {
      const connection = await mysqlPool.getConnection()
      
      // Check if bookings table exists
      const [tables] = await connection.execute<RowDataPacket[]>(
        "SHOW TABLES LIKE 'bookings'"
      )
      console.log('🔍 Debug: Bookings table exists:', tables.length > 0)
      
      // Check total bookings in database
      const [totalBookings] = await connection.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM bookings"
      )
      console.log('🔍 Debug: Total bookings in DB:', totalBookings[0]?.count || 0)
      
      // Check bookings for this specific user
      const [userBookings] = await connection.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM bookings WHERE user_id = ?",
        [userId]
      )
      console.log('🔍 Debug: User bookings count:', userBookings[0]?.count || 0)
      
      // Get sample booking data for this user
      const [sampleBookings] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          booking_id, 
          user_id, 
          event_title, 
          status, 
          created_at,
          standard_tickets,
          vip_tickets,
          total_amount
         FROM bookings 
         WHERE user_id = ? 
         LIMIT 5`,
        [userId]
      )
      
      console.log('🔍 Debug: Sample user bookings:', sampleBookings)
      
      connection.release()
      
      return NextResponse.json({
        success: true,
        debug: {
          userId,
          cookies,
          authHeader,
          tablesExist: tables.length > 0,
          totalBookings: totalBookings[0]?.count || 0,
          userBookings: userBookings[0]?.count || 0,
          sampleBookings: sampleBookings
        }
      })
      
    } catch (mysqlError) {
      console.error('🔍 Debug: MySQL error:', mysqlError)
      
      return NextResponse.json({
        success: false,
        debug: {
          userId,
          cookies,
          authHeader,
          mysqlError: mysqlError.message
        }
      })
    }
    
  } catch (error) {
    console.error('🔍 Debug: General error:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint error',
      debug: {
        error: error.message
      }
    }, { status: 500 })
  }
}
