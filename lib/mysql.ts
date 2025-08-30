import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'elite_events',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
})

// Create tables if they don't exist
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection()
    
    // Create bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        event_id VARCHAR(255) NOT NULL,
        event_title VARCHAR(255) NOT NULL,
        event_date VARCHAR(255) NOT NULL,
        event_time VARCHAR(255) NOT NULL,
        event_venue TEXT NOT NULL,
        event_image TEXT,
        standard_tickets INT DEFAULT 0,
        vip_tickets INT DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'confirmed',
        payment_method VARCHAR(100) NOT NULL,
        transaction_id VARCHAR(255) NOT NULL,
        payment_timestamp DATETIME NOT NULL,
        pdf_generated BOOLEAN DEFAULT FALSE,
        emails_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_booking_id (booking_id),
        INDEX idx_event_id (event_id)
      )
    `)

    // Create attendees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        ticket_type ENUM('standard', 'vip') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
        INDEX idx_booking_id (booking_id)
      )
    `)

    // Create qr_codes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(255) NOT NULL,
        attendee_name VARCHAR(255) NOT NULL,
        ticket_number VARCHAR(255) NOT NULL,
        qr_code LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
        INDEX idx_booking_id (booking_id),
        INDEX idx_ticket_number (ticket_number)
      )
    `)

    connection.release()
    console.log('✅ MySQL database tables initialized successfully')
    
  } catch (error) {
    console.error('❌ Error initializing MySQL database:', error)
    throw error
  }
}

export default pool
