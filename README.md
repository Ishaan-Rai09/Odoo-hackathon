# 🎉 Elite Events Platform

A modern, luxurious event listing website with cyberpunk + Apple aesthetic, featuring custom authentication, event categories, and stunning animations.

## ✨ Features

### 🔐 Authentication
- **Custom Authentication**: Secure sign-in and sign-up with credentials
- **Role-Based Access**: Two distinct roles with different permissions :- Organizer and User 
- **Protected Routes**: Admin panel and user-specific features

### 🎨 Design & UI
- **Cyberpunk + Apple Aesthetic**: Sleek, minimal, animated design
- **Glassmorphism Effects**: Beautiful blur and transparency effects
- **Framer Motion Animations**: Smooth page transitions and micro-interactions
- **Dark Mode**: Optimized for dark theme with neon accents
- **Responsive Design**: Mobile-first approach with perfect tablet/desktop scaling

### 📱 User Experience
- **Hero Section**: Stunning landing with animated statistics and CTAs
- **Category Filters**: Technical, Non-Technical, and Sports event categories
- **Search Functionality**: Real-time search across events, clubs, and keywords
- **Event Cards**: Animated reveal effects with hover interactions
- **Floating Action Button**: Quick category navigation
- **Loading Transitions**: Smooth loading states and skeleton screens

### 🎯 Event Management
- **Event Categories**: Technical, Non-Technical, Sports
- **Club Listings**: Organized by category with clean card layouts
- **Event Details**: Comprehensive event information with registration links
- **Registration Tracking**: Progress bars showing registration status
- **Badges System**: Hot, New, Popular, and custom event badges
- **Countdown Timers**: Time until event start (ready to implement)

### 🛠 Technical Features
- **Next.js 14**: Latest App Router with TypeScript
- **Tailwind CSS**: Utility-first styling with custom cyberpunk theme
- **Shadcn UI**: High-quality, accessible component library
- **MySQL & MongoDB**: Dual database support - MySQL for user credentials and authentication, MongoDB for events and bookings
- **Custom Auth System**: Built-in authentication with credential storage
- **Role-Based Access Control**: Two-tier permission system
- **Attendee Dashboard**: Full booking management with refund policy
- **Loyalty Points System**: Tier-based rewards with automatic calculations
- **Discounts & Promotions**: Complete coupon system with validation
- **SEO Optimized**: Meta tags, Open Graph, and semantic HTML

## 🎥 Demo Video

Watch the platform in action:

[![Elite College Events Platform Demo](https://img.youtube.com/vi/954seioV2n0/maxresdefault.jpg)](https://youtu.be/954seioV2n0)

[🎬 View Demo Video](https://youtu.be/954seioV2n0)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MySQL database for user credentials
- MongoDB database for events and bookings

### Installation

1. **Clone the repository**
   ```bash
   cd elite-college-events/college-events-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and update with your database connections:
   ```bash
   # MySQL Database (for user credentials)
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_mysql_user
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=your_mysql_database
   
   # MongoDB Database (for events and bookings)
   MONGODB_URI=mongodb://localhost:27017/your_mongodb_database
   
   # JWT Secret for authentication
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up databases**
   - Set up MySQL database for user authentication and credentials
   - Set up MongoDB for events, bookings, and related data
   - Run database migrations/setup scripts if available

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
college-events-platform/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and cyberpunk theme
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage
│   ├── events/                  # Events pages
│   │   ├── page.tsx            # All events listing
│   │   └── [category]/         # Category-specific pages
│   ├── sign-in/                # Authentication pages
│   └── sign-up/
├── components/                   # React components
│   ├── ui/                     # Shadcn UI components
│   ├── hero-section.tsx        # Landing hero
│   ├── categories-section.tsx  # Event categories
│   ├── featured-events.tsx     # Featured events grid
│   ├── navbar.tsx              # Navigation
│   └── ...
├── data/                        # Data storage
│   └── events.json             # Event data structure
├── lib/                         # Utilities
│   └── utils.ts                # Helper functions
└── public/                      # Static assets
```

## 🎨 Customization

### Colors & Theme
The cyberpunk color scheme is defined in `tailwind.config.js`:

```javascript
colors: {
  cyber: {
    pink: "#ff0080",
    blue: "#00ffff", 
    purple: "#8000ff",
    green: "#00ff41",
  },
}
```

### Event Data
Update `data/events.json` to add/modify:
- Event categories
- Club information  
- Event details
- Registration links
- Images and badges

### Platform Branding
1. Replace logo in navbar component
2. Modify hero section text and branding
3. Update meta tags in `layout.tsx`
4. Customize role-based access permissions

## ✅ Fully Implemented Features

### 🎫 Complete Booking System
- **Ticket Booking**: Multi-tier pricing (Standard & VIP) with quantity selection
- **Attendee Management**: Full attendee details collection and management
- **PDF Tickets**: Auto-generated PDF tickets with QR codes
- **Booking History**: Complete booking history with status tracking
- **Modification & Cancellation**: Full booking CRUD with refund policies

### 💰 Advanced Discount & Promotion System
- **Coupon Management**: Create/edit/manage promotional codes with validation
- **Multiple Discount Types**: Percentage, fixed amount, buy-x-get-y offers
- **Early Bird Discounts**: Automatic time-based early booking discounts
- **Group Discounts**: Automatic quantity-based discounts (15% for 5+, 20% for 10+)
- **Referral System**: Complete referral program with reward tracking
- **Loyalty Points**: Tier-based point system (Bronze/Silver/Gold/Platinum)
- **Real-time Validation**: API-based coupon validation with usage limits
- **Promotional Banners**: Dynamic promotional messaging throughout the app

### 👥 User Experience Features
- **My Bookings Dashboard**: View tickets, booking history, download PDFs, cancel with refunds
- **Loyalty Dashboard**: Point balance, tier benefits, transaction history, leaderboards
- **Referral Dashboard**: Share codes, track referrals, earn rewards
- **Smart Discounts**: Automatic group discount detection and application
- **Savings Tracking**: Clear discount breakdowns and savings summaries

### 🛠 Admin Features
- **Coupon Management**: Full admin interface for creating and managing coupons
- **Usage Analytics**: Track coupon usage, redemption rates, and savings
- **Flexible Configuration**: Support for event-specific, category-specific, and global coupons
- **Advanced Validation**: Date ranges, usage limits, minimum order amounts

## 🔧 Additional Features (Ready to Implement)

### Enhanced Features
- Real-time countdown timers
- Event calendar view
- Email notifications for promotions
- Advanced analytics dashboard
- Event reviews/ratings
- Social media integration

### Database Integration
- Replace JSON with Supabase/Firebase
- Real-time updates
- User event history
- Advanced search with filters

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Works with static export
- **Railway**: Full-stack deployment
- **AWS/GCP**: Custom deployment

## 🎯 Pages Overview

- **`/`** - Homepage with hero, categories, featured events
- **`/events`** - All events with search and filters  
- **`/events/details/[id]`** - Event details with promotional banners
- **`/my-bookings`** - Attendee dashboard to view and manage tickets, download PDFs, and cancel bookings with refund and loyalty integration
- **`/referral`** - Referral system with reward tracking and social sharing
- **`/sign-in`** - Custom authentication with credentials
- **`/sign-up`** - Custom registration with role assignment
- **`/admin/coupons`** - Complete coupon management interface

## 🛡 Security Features

- **Role-based access control**: Two-tier permission system
- **Protected routes**: Middleware-based route protection
- **Secure authentication**: Custom JWT-based authentication system
- **Password hashing**: Secure credential storage in MySQL
- **Input validation**: Form validation and sanitization
- **HTTPS enforcement**: Secure data transmission

## 📱 Mobile Experience

- **Touch-friendly**: Large tap targets and smooth gestures
- **Responsive design**: Optimized for all screen sizes
- **Fast loading**: Optimized images and code splitting
- **Offline support**: Service worker ready (can be added)

## 🎨 Animation Details

- **Page transitions**: Smooth enter/exit animations
- **Scroll animations**: Elements animate on scroll into view
- **Hover effects**: Interactive card and button animations
- **Loading states**: Skeleton screens and spinners
- **Micro-interactions**: Button presses, form interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or support:
- Check the documentation
- Create an issue on GitHub
- Contact the development team

---

**Built with ❤️ for the college community**

*Elite College Events Platform - Where memories are made and connections are forged.*
