import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/database/connections/mongodb'
import Organizer from '@/database/models/Organizer'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { name, email, password, organizationName, phone, website, description } = body

    // Validate required fields
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'Name, email, password, and organization name are required' },
        { status: 400 }
      )
    }

    // Check if organizer already exists
    const existingOrganizer = await Organizer.findOne({ email })
    if (existingOrganizer) {
      return NextResponse.json(
        { error: 'An organizer with this email already exists' },
        { status: 409 }
      )
    }

    // Create new organizer
    const organizer = new Organizer({
      name,
      email,
      password,
      organizationName,
      phone,
      website,
      description
    })

    await organizer.save()

    // Generate JWT token
    const token = jwt.sign(
      { organizerId: organizer._id, email: organizer.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return success response (without password)
    const responseData = {
      message: 'Organizer registered successfully',
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        organizationName: organizer.organizationName,
        phone: organizer.phone,
        website: organizer.website,
        description: organizer.description,
        isVerified: organizer.isVerified,
        createdAt: organizer.createdAt
      },
      token
    }

    const response = NextResponse.json(responseData, { status: 201 })
    
    // Set HTTP-only cookie for authentication
    response.cookies.set('organizer-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
