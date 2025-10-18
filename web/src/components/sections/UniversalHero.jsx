"use client";
import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import UniversalButton from '@/components/ui/UniversalButton';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { cn } from '@/lib/utils';
import { ChefHat, Star, Users, MapPin, Clock } from 'lucide-react';

const UniversalHero = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-pink-950 dark:via-background dark:to-rose-950" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <ResponsiveLayout className="relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className={cn(
            'font-bold text-foreground mb-6',
            isMobile ? 'text-4xl sm:text-5xl' : 
            isTablet ? 'text-5xl sm:text-6xl' : 
            'text-6xl sm:text-7xl lg:text-8xl'
          )}>
            <span className="block">Find Your Perfect</span>
            <span className="block bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Private Chef
            </span>
          </h1>

          {/* Subheading */}
          <p className={cn(
            'text-muted-foreground mb-8 max-w-2xl mx-auto',
            isMobile ? 'text-base sm:text-lg' : 
            isTablet ? 'text-lg sm:text-xl' : 
            'text-xl sm:text-2xl'
          )}>
            Connect with top-rated private chefs in South Africa. 
            Experience fine dining in the comfort of your own home.
          </p>

          {/* CTA Buttons */}
          <div className={cn(
            'flex flex-col sm:flex-row gap-4 justify-center items-center',
            isMobile ? 'mb-8' : 'mb-12'
          )}>
            <UniversalButton
              size={isMobile ? 'responsive' : 'lg'}
              variant="gradient"
              className="w-full sm:w-auto"
            >
              Find Chefs Now
            </UniversalButton>
            <UniversalButton
              size={isMobile ? 'responsive' : 'lg'}
              variant="outline"
              className="w-full sm:w-auto"
            >
              How It Works
            </UniversalButton>
          </div>

          {/* Stats */}
          <div className={cn(
            'grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8',
            isMobile ? 'mt-8' : 'mt-12'
          )}>
            {[
              { number: '500+', label: 'Chefs', icon: ChefHat },
              { number: '10K+', label: 'Happy Customers', icon: Users },
              { number: '50+', label: 'Cities', icon: MapPin },
              { number: '4.9★', label: 'Average Rating', icon: Star }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className={cn(
                    'text-pink-500',
                    isMobile ? 'h-6 w-6' : 'h-8 w-8'
                  )} />
                </div>
                <div className={cn(
                  'font-bold text-foreground',
                  isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl'
                )}>
                  {stat.number}
                </div>
                <div className={cn(
                  'text-muted-foreground',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    </section>
  );
};

export default UniversalHero;