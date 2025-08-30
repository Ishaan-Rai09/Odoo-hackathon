'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

interface Organizer {
  id: string
  name: string
  email: string
  organizationName: string
  phone?: string
  website?: string
  description?: string
  isVerified: boolean
  createdAt: string
}

export default function OrganizerSettingsPage() {
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [profileData, setProfileData] = useState({
    name: '',
    organizationName: '',
    phone: '',
    website: '',
    description: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailUpdates: true,
    smsBookings: false,
    smsReminders: false,
    pushNotifications: true,
    weeklyReports: true,
    marketingEmails: false
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    notifications: false
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const organizerData = localStorage.getItem('organizer')
    if (organizerData) {
      const org = JSON.parse(organizerData)
      setOrganizer(org)
      setProfileData({
        name: org.name || '',
        organizationName: org.organizationName || '',
        phone: org.phone || '',
        website: org.website || '',
        description: org.description || ''
      })
    } else {
      router.push('/organizer/signin')
    }
  }, [router])

  const handleProfileUpdate = async () => {
    if (!organizer) return

    setLoading(prev => ({ ...prev, profile: true }))

    try {
      // Simulate API call for profile update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update localStorage
      const updatedOrganizer = {
        ...organizer,
        ...profileData
      }
      localStorage.setItem('organizer', JSON.stringify(updatedOrganizer))
      setOrganizer(updatedOrganizer)

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully."
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      })
      return
    }

    setLoading(prev => ({ ...prev, password: true }))

    try {
      // Simulate API call for password change
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully."
      })

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: "Failed to change password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(prev => ({ ...prev, notifications: true }))

    try {
      // Simulate API call for notification settings
      await new Promise(resolve => setTimeout(resolve, 800))

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated."
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to save notification settings.",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }))
    }
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center">
        <div className="cyber-spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black cyber-grid">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold gradient-text">Account Settings</h1>
                <p className="text-white/60 text-sm">Manage your organizer account</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={organizer.isVerified 
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              }>
                {organizer.isVerified ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Pending Verification
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
            <TabsTrigger value="profile" className="data-[state=active]:bg-cyber-blue">Profile</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-cyber-pink">Security</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-cyber-green">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="glassmorphism border-cyber-blue/30">
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Full Name *</Label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Organization Name *</Label>
                    <Input
                      value={profileData.organizationName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, organizationName: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Your organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Email Address</Label>
                    <Input
                      value={organizer.email}
                      disabled
                      className="bg-white/5 border-white/10 text-white/60"
                    />
                    <p className="text-xs text-white/60">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Phone Number</Label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-white">Website</Label>
                    <Input
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://your-organization.com"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-white">Organization Description</Label>
                    <Textarea
                      value={profileData.description}
                      onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      rows={4}
                      placeholder="Tell us about your organization..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={loading.profile}
                    variant="cyber"
                  >
                    {loading.profile ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="glassmorphism border-cyber-pink/30">
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Current Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">New Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Confirm New Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Password Requirements
                  </h4>
                  <ul className="text-yellow-400 text-sm space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Contains both letters and numbers (recommended)</li>
                    <li>• Avoid common passwords</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={loading.password || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    variant="cyber"
                  >
                    {loading.password ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="glassmorphism border-cyber-green/30">
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-cyber-blue" />
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">New Bookings</p>
                          <p className="text-white/60 text-sm">Get notified when someone books your events</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailBookings}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailBookings: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Event Updates</p>
                          <p className="text-white/60 text-sm">Updates about your events and platform changes</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailUpdates}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailUpdates: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Weekly Reports</p>
                          <p className="text-white/60 text-sm">Summary of your events performance</p>
                        </div>
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Marketing Emails</p>
                          <p className="text-white/60 text-sm">Tips, features, and promotional content</p>
                        </div>
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-cyber-pink" />
                      SMS Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Booking Alerts</p>
                          <p className="text-white/60 text-sm">SMS alerts for new bookings (simulated)</p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsBookings}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsBookings: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Event Reminders</p>
                          <p className="text-white/60 text-sm">Reminders about upcoming events (simulated)</p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsReminders}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsReminders: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-cyber-purple" />
                      Push Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Browser Notifications</p>
                          <p className="text-white/60 text-sm">Real-time notifications in your browser</p>
                        </div>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <Button 
                    onClick={handleNotificationUpdate}
                    disabled={loading.notifications}
                    variant="cyber"
                  >
                    {loading.notifications ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
