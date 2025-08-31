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
    // Try multiple possible cookie names
    let token = request.cookies.get('auth-token')?.value ||
                request.cookies.get('token')?.value ||
                request.cookies.get('authToken')?.value

    // Also check Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      console.log('No auth token found in cookies or headers')
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Handle different token payload structures
    const userId = decoded.userId || (decoded as any).sub || (decoded as any).id
    const email = decoded.email || (decoded as any).email
    
    if (!userId) {
      console.log('No userId found in token payload')
      return null
    }
    
    return {
      userId,
      email: email || 'unknown@example.com'
    }
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}
