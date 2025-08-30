'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Menu, X, Search, Ticket, Settings, User, LogOut } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Categories', href: '/#categories' },
    { name: 'About', href: '/about' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="text-2xl font-bold gradient-text">
              Elite Events
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyber-blue to-cyber-pink transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* My Bookings - Only show when signed in */}
            {mounted && user && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/my-bookings">
                  <Button variant="outline" className="text-sm border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10">
                    <Ticket className="h-4 w-4 mr-2" />
                    My Bookings
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Organizer Portal */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/organizer/signin">
                <Button variant="cyber" className="text-sm bg-gradient-to-r from-cyber-purple to-cyber-pink">
                  <Settings className="h-4 w-4 mr-2" />
                  Organizer Portal
                </Button>
              </Link>
            </motion.div>

            {/* Auth */}
            {mounted ? (
              user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-full border border-white/20 hover:border-white/40 transition-colors"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-cyber-blue to-cyber-pink rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium">{user.name}</span>
                  </motion.button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs text-white/60 border-b border-white/10">
                          {user.email}
                        </div>
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            signOut()
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/sign-in">
                    <Button variant="outline" className="text-sm border-white/20 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              )
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/sign-in">
                  <Button variant="outline" className="text-sm border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/80 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              {/* My Bookings - Mobile */}
              {mounted && user && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href="/my-bookings"
                    className="text-cyber-blue hover:text-cyber-blue/80 block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    My Bookings
                  </Link>
                </motion.div>
              )}
              
              {/* Organizer Portal - Mobile */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href="/organizer/signin"
                  className="text-cyber-purple hover:text-cyber-purple/80 block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Organizer Portal
                </Link>
              </motion.div>
              
              <div className="flex flex-col space-y-2 px-3 py-2">
                {mounted ? (
                  user ? (
                    <>
                      <div className="text-white/80 text-sm mb-2">
                        Signed in as {user.name}
                      </div>
                      <Link
                        href="/dashboard"
                        className="text-white hover:text-white/80 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setIsOpen(false)
                        }}
                        className="text-left text-white hover:text-white/80 block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link href="/sign-in">
                      <Button variant="outline" className="text-sm border-white/20 text-white hover:bg-white/10">
                        Sign In
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link href="/sign-in">
                    <Button variant="outline" className="text-sm border-white/20 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}