import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import mysqlPool from '@/database/connections/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const SALT_ROUNDS = 12

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  emailVerified: boolean
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  lastLogin?: Date
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  message?: string
  error?: string
}

export interface SignUpData {
  name: string
  email: string
  password: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS)
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  // Generate JWT token
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      return decoded
    } catch (error) {
      return null
    }
  }

  // Generate verification token
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Sign up new user
  static async signUp(userData: SignUpData): Promise<AuthResult> {
    let connection
    try {
      connection = await mysqlPool.getConnection()

      // Check if user already exists
      const [existingUsers] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      )

      if (existingUsers.length > 0) {
        return {
          success: false,
          error: 'User with this email already exists'
        }
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password)
      const userId = uuidv4()
      const verificationToken = this.generateVerificationToken()

      // Insert new user
      await connection.execute(
        `INSERT INTO users (id, email, password_hash, name, phone, verification_token) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, userData.email, passwordHash, userData.name, userData.phone || null, verificationToken]
      )

      // Create user preferences
      await connection.execute(
        `INSERT INTO user_preferences (user_id) VALUES (?)`,
        [userId]
      )

      // Get the created user
      const [users] = await connection.execute<RowDataPacket[]>(
        `SELECT id, email, name, phone, email_verified, status, created_at, last_login 
         FROM users WHERE id = ?`,
        [userId]
      )

      const user = users[0] as User
      const token = this.generateToken(userId)

      // Store session
      await this.storeSession(userId, token)

      return {
        success: true,
        user: {
          ...user,
          emailVerified: Boolean(user.emailVerified),
          createdAt: new Date(user.createdAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        },
        token,
        message: 'Account created successfully'
      }

    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: 'Failed to create account'
      }
    } finally {
      if (connection) connection.release()
    }
  }

  // Sign in user
  static async signIn(credentials: SignInData): Promise<AuthResult> {
    let connection
    try {
      connection = await mysqlPool.getConnection()

      // Get user by email
      const [users] = await connection.execute<RowDataPacket[]>(
        `SELECT id, email, password_hash, name, phone, email_verified, status, created_at, last_login 
         FROM users WHERE email = ? AND status = 'active'`,
        [credentials.email]
      )

      if (users.length === 0) {
        return {
          success: false,
          error: 'Invalid email or password'
        }
      }

      const userData = users[0]

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, userData.password_hash)
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        }
      }

      // Update last login
      await connection.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userData.id]
      )

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        emailVerified: Boolean(userData.email_verified),
        status: userData.status,
        createdAt: new Date(userData.created_at),
        lastLogin: new Date()
      }

      const token = this.generateToken(userData.id)

      // Store session
      await this.storeSession(userData.id, token)

      return {
        success: true,
        user,
        token,
        message: 'Signed in successfully'
      }

    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: 'Failed to sign in'
      }
    } finally {
      if (connection) connection.release()
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    let connection
    try {
      connection = await mysqlPool.getConnection()

      const [users] = await connection.execute<RowDataPacket[]>(
        `SELECT id, email, name, phone, email_verified, status, created_at, last_login 
         FROM users WHERE id = ? AND status = 'active'`,
        [userId]
      )

      if (users.length === 0) {
        return null
      }

      const userData = users[0]
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        emailVerified: Boolean(userData.email_verified),
        status: userData.status,
        createdAt: new Date(userData.created_at),
        lastLogin: userData.last_login ? new Date(userData.last_login) : undefined
      }

    } catch (error) {
      console.error('Get user error:', error)
      return null
    } finally {
      if (connection) connection.release()
    }
  }

  // Store session
  static async storeSession(userId: string, token: string, ipAddress?: string, userAgent?: string): Promise<void> {
    let connection
    try {
      connection = await mysqlPool.getConnection()
      
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await connection.execute(
        `INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, tokenHash, expiresAt, ipAddress || null, userAgent || null]
      )

    } catch (error) {
      console.error('Store session error:', error)
    } finally {
      if (connection) connection.release()
    }
  }

  // Validate session
  static async validateSession(token: string): Promise<User | null> {
    let connection
    try {
      connection = await mysqlPool.getConnection()
      
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      // Check if session exists and is not expired
      const [sessions] = await connection.execute<RowDataPacket[]>(
        `SELECT s.user_id, s.expires_at, u.id, u.email, u.name, u.phone, u.email_verified, u.status, u.created_at, u.last_login
         FROM user_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.status = 'active'`,
        [tokenHash]
      )

      if (sessions.length === 0) {
        return null
      }

      const sessionData = sessions[0]

      // Update last used timestamp
      await connection.execute(
        'UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE token_hash = ?',
        [tokenHash]
      )

      return {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        phone: sessionData.phone,
        emailVerified: Boolean(sessionData.email_verified),
        status: sessionData.status,
        createdAt: new Date(sessionData.created_at),
        lastLogin: sessionData.last_login ? new Date(sessionData.last_login) : undefined
      }

    } catch (error) {
      console.error('Validate session error:', error)
      return null
    } finally {
      if (connection) connection.release()
    }
  }

  // Sign out (invalidate session)
  static async signOut(token: string): Promise<boolean> {
    let connection
    try {
      connection = await mysqlPool.getConnection()
      
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      await connection.execute(
        'DELETE FROM user_sessions WHERE token_hash = ?',
        [tokenHash]
      )

      return true

    } catch (error) {
      console.error('Sign out error:', error)
      return false
    } finally {
      if (connection) connection.release()
    }
  }

  // Clean expired sessions
  static async cleanExpiredSessions(): Promise<void> {
    let connection
    try {
      connection = await mysqlPool.getConnection()
      
      await connection.execute(
        'DELETE FROM user_sessions WHERE expires_at <= NOW()'
      )

    } catch (error) {
      console.error('Clean sessions error:', error)
    } finally {
      if (connection) connection.release()
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    let connection
    try {
      connection = await mysqlPool.getConnection()

      const [users] = await connection.execute<RowDataPacket[]>(
        `SELECT id, email, name, phone, email_verified, status, created_at, last_login 
         FROM users WHERE email = ? AND status = 'active'`,
        [email]
      )

      if (users.length === 0) {
        return null
      }

      const userData = users[0]
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        emailVerified: Boolean(userData.email_verified),
        status: userData.status,
        createdAt: new Date(userData.created_at),
        lastLogin: userData.last_login ? new Date(userData.last_login) : undefined
      }

    } catch (error) {
      console.error('Get user by email error:', error)
      return null
    } finally {
      if (connection) connection.release()
    }
  }

  // Store reset token
  static async storeResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    let connection
    try {
      connection = await mysqlPool.getConnection()
      
      await connection.execute(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [token, expiresAt, userId]
      )

    } catch (error) {
      console.error('Store reset token error:', error)
      throw error
    } finally {
      if (connection) connection.release()
    }
  }

  // Validate reset token
  static async validateResetToken(token: string): Promise<boolean> {
    let connection
    try {
      connection = await mysqlPool.getConnection()
      
      const [users] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() AND status = "active"',
        [token]
      )

      return users.length > 0

    } catch (error) {
      console.error('Validate reset token error:', error)
      return false
    } finally {
      if (connection) connection.release()
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    let connection
    try {
      connection = await mysqlPool.getConnection()
      
      // First, verify the token is valid
      const [users] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() AND status = "active"',
        [token]
      )

      if (users.length === 0) {
        return {
          success: false,
          error: 'Invalid or expired reset token'
        }
      }

      const userId = users[0].id

      // Hash the new password
      const passwordHash = await this.hashPassword(newPassword)

      // Update password and clear reset token
      await connection.execute(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [passwordHash, userId]
      )

      // Invalidate all existing sessions for this user
      await connection.execute(
        'DELETE FROM user_sessions WHERE user_id = ?',
        [userId]
      )

      return {
        success: true,
        message: 'Password reset successfully'
      }

    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: 'Failed to reset password'
      }
    } finally {
      if (connection) connection.release()
    }
  }
}
