# 🚀 Elite College Events Platform - Setup Guide

## Quick Setup (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- Git installed
- Clerk account (free at [clerk.com](https://clerk.com))

### 2. Installation

```bash
# Navigate to the project directory
cd elite-college-events/college-events-platform

# Install dependencies
npm install

# or if you prefer yarn
yarn install
```

### 3. Environment Setup

1. **Copy the environment file:**
   ```bash
   cp .env.local .env.local.example
   ```

2. **Get your Clerk keys:**
   - Go to [clerk.com](https://clerk.com) and create a free account
   - Create a new application
   - Go to "API Keys" in your Clerk dashboard
   - Copy your keys

3. **Update `.env.local`:**
   ```env
   # Replace with your actual Clerk keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_key_here
   
   # Update with your college domain
   NEXT_PUBLIC_COLLEGE_DOMAIN=yourcollege.edu
   ```

### 4. Configure Clerk

1. **In your Clerk dashboard:**
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Enable "Email address" as a required field
   - Go to "User & Authentication" → "Restrictions"
   - Add domain restriction: `@yourcollege.edu`

2. **Set up sign-in/sign-up URLs:**
   - Go to "Paths" in Clerk dashboard
   - Set Sign-in URL: `/sign-in`
   - Set Sign-up URL: `/sign-up`
   - Set After sign-in URL: `/`
   - Set After sign-up URL: `/`

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎉 You're Done!

Your luxurious college events platform is now running with:
- ✅ Authentication with college email restriction
- ✅ Beautiful cyberpunk + Apple design
- ✅ Responsive mobile-first layout
- ✅ Event categories and filtering
- ✅ Admin panel for event management
- ✅ Smooth animations and interactions

## 🔧 Customization

### Update College Information

1. **Change college domain:**
   - Update `NEXT_PUBLIC_COLLEGE_DOMAIN` in `.env.local`
   - Update domain restriction in Clerk dashboard

2. **Update branding:**
   - Edit `components/navbar.tsx` for logo/name
   - Modify `app/layout.tsx` for site metadata
   - Update `components/hero-section.tsx` for main messaging

3. **Add/modify events:**
   - Edit `data/events.json` to add your events
   - Update club information and event details
   - Replace image URLs with your own

### Color Scheme

Edit `tailwind.config.js` to change colors:

```javascript
colors: {
  cyber: {
    pink: "#your-color",
    blue: "#your-color", 
    purple: "#your-color",
    green: "#your-color",
  },
}
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

### Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Drag the `.next` folder to [netlify.com](https://netlify.com)
   - Add environment variables in Netlify dashboard

## 🛠 Advanced Setup

### Enable Admin Access

To make a user an admin:

1. **Method 1: Email-based (simple):**
   - Include "admin" in the email address
   - Example: `admin@yourcollege.edu`

2. **Method 2: Clerk metadata (recommended):**
   - In Clerk dashboard, go to "Users"
   - Select a user and edit their metadata
   - Add: `{ "role": "admin" }`

### Database Integration (Optional)

To replace JSON with a real database:

1. **Install Supabase:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create tables:**
   - Events table
   - Clubs table
   - Categories table
   - Registrations table

3. **Update data fetching:**
   - Replace JSON imports with Supabase queries
   - Add real-time subscriptions

### Email Notifications (Optional)

1. **Install email service:**
   ```bash
   npm install @sendgrid/mail
   # or
   npm install nodemailer
   ```

2. **Set up webhooks:**
   - Clerk webhooks for user registration
   - Event registration confirmations
   - Admin notifications

## 📱 Mobile App (Future)

This platform is ready for mobile app development:

- **React Native:** Reuse components and logic
- **Expo:** Quick mobile deployment
- **PWA:** Add service worker for app-like experience

## 🔒 Security Features

- ✅ Domain-restricted registration
- ✅ Protected admin routes
- ✅ Secure authentication with Clerk
- ✅ Input validation and sanitization
- ✅ HTTPS enforcement (in production)

## 📊 Analytics (Optional)

Add analytics to track:

1. **Google Analytics:**
   ```bash
   npm install @next/third-parties
   ```

2. **Event tracking:**
   - Event views
   - Registration clicks
   - User engagement

## 🆘 Troubleshooting

### Common Issues

1. **Clerk authentication not working:**
   - Check environment variables
   - Verify domain restrictions
   - Ensure URLs match in Clerk dashboard

2. **Styling issues:**
   - Run `npm run build` to check for errors
   - Verify Tailwind CSS is properly configured

3. **Images not loading:**
   - Check `next.config.js` image domains
   - Verify image URLs are accessible

### Getting Help

- Check the detailed `README.md`
- Review component documentation
- Create an issue on GitHub
- Contact the development team

## 🎯 Next Steps

1. **Customize content** with your college information
2. **Add real events** and club data
3. **Test authentication** with college emails
4. **Deploy to production** and share with students
5. **Gather feedback** and iterate

---

**Congratulations! 🎉**

You now have a world-class college events platform that rivals the best in the industry. Your students will love the modern design and seamless experience.

*Happy event planning!* ✨