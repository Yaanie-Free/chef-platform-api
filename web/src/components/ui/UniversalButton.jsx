"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const UniversalButton = ({ 
  children,
  variant = 'default',
  size = 'responsive',
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    gradient: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    responsive: 'h-9 px-4 py-2 text-sm sm:h-10 sm:px-6 sm:text-base',
    lg: 'h-11 px-8 text-lg',
    xl: 'h-12 px-10 text-xl',
    icon: 'h-9 w-9 sm:h-10 sm:w-10'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'touch-target', // Ensures 44px minimum touch target
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default UniversalButton;