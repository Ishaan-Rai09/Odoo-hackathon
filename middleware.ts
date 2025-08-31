import { NextRequest, NextResponse } from 'next/server'

// Define routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/bookings',
  '/admin',
  '/my-bookings'
]

// Define routes that should redirect authenticated users
const authRoutes = [
  '/sign-in',
  '/sign-up'
]

// Define API routes that need authentication
const protectedApiRoutes = [
  '/api/user',
  '/api/bookings',
  '/api/events/create',
  '/api/events/update',
  '/api/events/delete'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Simple token presence check (detailed validation happens in API routes)
  const isAuthenticated = !!token

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to sign-in with return URL
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Handle auth routes (sign-in, sign-up) - redirect if already authenticated  
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // Handle protected API routes - let them handle their own authentication
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    // Just pass through - API routes will handle their own auth
    return NextResponse.next()
  }

  // For all other routes, continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
