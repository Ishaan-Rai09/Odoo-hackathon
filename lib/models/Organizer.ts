import mongoose, { CallbackError } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IOrganizer extends mongoose.Document {
  name: string
  email: string
  password: string
  organizationName: string
  phone?: string
  website?: string
  description?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const OrganizerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot be more than 200 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please enter a valid website URL'
    ]
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Hash password before saving
OrganizerSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error as CallbackError)
  }
})

// Compare password method
OrganizerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.Organizer || mongoose.model<IOrganizer>('Organizer', OrganizerSchema)
