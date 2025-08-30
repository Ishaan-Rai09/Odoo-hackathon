// Backend Module Entry Point

// Core Services
export * from './services/analytics-service'
export * from './services/checkin-service'
export * from './services/discount-service'
export * from './services/email-service'
export * from './services/loyalty-service'
export * from './services/notification-service'
export * from './services/payment-service'
export * from './services/pdf-service'
export * from './services/qr-service'

// Utilities
export * from './services/utils'
export * from './services/sample-events'

// API Routes (for Next.js integration)
// These are exported for Next.js to use in app/api/ directory
export { GET as getEvents, POST as createEvent } from './api/events/route'
export { GET as getBookings, POST as createBooking, DELETE as deleteBooking } from './api/bookings/route'
export { GET as getLoyalty, POST as updateLoyalty } from './api/loyalty/route'
export { POST as organizerLogin } from './api/organizer/login/route'
export { POST as organizerRegister } from './api/organizer/register/route'

// Middleware
export { default as authMiddleware } from './middleware/auth-middleware'
