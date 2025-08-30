import mongoose from 'mongoose'

export interface ITicketType {
  name: string
  price: number
  maxTickets: number
  maxPerUser: number
  salesStart: Date
  salesEnd: Date
  soldCount: number
}

export interface ICustomQuestion {
  id: string
  question: string
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox'
  required: boolean
  options?: string[] // For select type
}

export interface IEvent extends mongoose.Document {
  organizer: mongoose.Types.ObjectId
  name: string
  description: string
  category: string
  startDate: Date
  endDate: Date
  registrationStart: Date
  registrationEnd: Date
  location: {
    name: string
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  coverImage?: string
  ticketTypes: ITicketType[]
  customQuestions: ICustomQuestion[]
  isPublished: boolean
  totalRegistrations: number
  maxCapacity: number
  createdAt: Date
  updatedAt: Date
}

const TicketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  maxTickets: {
    type: Number,
    required: true,
    min: 1
  },
  maxPerUser: {
    type: Number,
    required: true,
    min: 1
  },
  salesStart: {
    type: Date,
    required: true
  },
  salesEnd: {
    type: Date,
    required: true
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0
  }
})

const CustomQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'phone', 'select', 'checkbox']
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String,
    trim: true
  }]
})

const EventSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [200, 'Event name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['technical', 'entertainment', 'business', 'sports', 'other']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationStart: {
    type: Date,
    required: [true, 'Registration start date is required']
  },
  registrationEnd: {
    type: Date,
    required: [true, 'Registration end date is required']
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  coverImage: {
    type: String,
    trim: true
  },
  ticketTypes: [TicketTypeSchema],
  customQuestions: [CustomQuestionSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  totalRegistrations: {
    type: Number,
    default: 0,
    min: 0
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
})

// Validate dates
EventSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'))
  }
  if (this.registrationEnd <= this.registrationStart) {
    return next(new Error('Registration end date must be after registration start date'))
  }
  if (this.registrationStart >= this.startDate) {
    return next(new Error('Registration must start before the event starts'))
  }
  
  // Calculate max capacity from ticket types
  if (this.ticketTypes && this.ticketTypes.length > 0) {
    this.maxCapacity = this.ticketTypes.reduce((total, ticket) => total + ticket.maxTickets, 0)
  }
  
  next()
})

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)

