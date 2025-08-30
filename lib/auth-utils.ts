import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface JwtPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export function validateToken(request: NextRequest): { userId: string; email: string } | null {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    return {
      userId: decoded.userId,
      email: decoded.email
    }
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}
