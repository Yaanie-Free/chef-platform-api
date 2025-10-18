"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, User, Search, ChefHat, LogIn, UserPlus } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import UniversalButton from '@/components/ui/UniversalButton';
import UniversalInput from '@/components/ui/UniversalInput';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const ResponsiveNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Find Chefs', href: '/chefs' },
    { label: 'How it Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' }
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                ChefConnect
              </h1>
            </a>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm lg:text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}

          {/* Search Bar - Hidden on mobile */}
          {!isMobile && (
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <UniversalInput
                  placeholder="Search chefs, cuisines..."
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            {user && <NotificationCenter />}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-sm">
                  <p className="font-medium">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.userType}</p>
                </div>
                <UniversalButton
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </UniversalButton>
                <UniversalButton
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex"
                >
                  Logout
                </UniversalButton>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UniversalButton
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </UniversalButton>
                <UniversalButton
                  variant="gradient"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Started
                </UniversalButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <UniversalButton
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </UniversalButton>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-md rounded-lg mt-2 border border-border/50">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <UniversalInput
                    placeholder="Search..."
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              {/* Mobile Navigation Items */}
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile Auth Buttons */}
              {!user ? (
                <div className="px-3 py-2 space-y-2">
                  <UniversalButton
                    variant="outline"
                    className="w-full"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </UniversalButton>
                  <UniversalButton
                    variant="gradient"
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Get Started
                  </UniversalButton>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.userType}</p>
                  </div>
                  <UniversalButton
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </UniversalButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ResponsiveNavigation;