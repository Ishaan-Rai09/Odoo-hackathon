// Database Module Entry Point

// Connections
export { default as mongoConnection, connectToDatabase } from './connections/mongodb'
export { default as mysqlPool, initializeDatabase } from './connections/mysql'

// Models
export { default as Event } from './models/Event'
export { default as Booking } from './models/Booking'
export { default as Organizer } from './models/Organizer'
export { default as Coupon } from './models/Coupon'

// Types
export type { IEvent, ITicketType, ICustomQuestion } from './models/Event'
export type { IOrganizer } from './models/Organizer'

// Seeds and Sample Data
// Note: Import these for database seeding and development
// export { sampleEvents } from './seeds/sample-events.json'
// export { populateDatabase } from './seeds/populate-events.js'
