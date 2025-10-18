"use client";
import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const ResponsiveLayout = ({ 
  children, 
  className = '',
  maxWidth = 'full',
  padding = 'responsive',
  background = 'default'
}) => {
  const [isClient, setIsClient] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isLaptop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isDesktop = useMediaQuery('(min-width: 1280px) and (max-width: 1919px)');
  const isUltrawide = useMediaQuery('(min-width: 1920px)');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="animate-pulse bg-muted h-screen" />;
  }

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2 sm:p-4',
    responsive: 'p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12',
    large: 'p-6 sm:p-8 lg:p-10 xl:p-12 2xl:p-16'
  };

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted/50',
    card: 'bg-card',
    gradient: 'bg-gradient-to-br from-background to-muted/30'
  };

  return (
    <div 
      className={cn(
        'w-full min-h-screen',
        'transition-all duration-300 ease-in-out',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        backgroundClasses[background],
        className
      )}
      style={{
        // Dynamic spacing based on screen size
        '--mobile-padding': isMobile ? '1rem' : '1.5rem',
        '--tablet-padding': isTablet ? '2rem' : '2.5rem',
        '--desktop-padding': isDesktop ? '3rem' : '4rem',
        '--ultrawide-padding': isUltrawide ? '5rem' : '6rem'
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveLayout;