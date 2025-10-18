"use client";
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const UniversalInput = forwardRef(({ 
  className = '',
  type = 'text',
  size = 'responsive',
  variant = 'default',
  ...props 
}, ref) => {
  const variants = {
    default: 'border border-input bg-background',
    filled: 'border-0 bg-muted',
    outlined: 'border-2 border-input bg-transparent'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    responsive: 'h-9 px-3 py-2 text-sm sm:h-10 sm:px-4 sm:text-base',
    lg: 'h-11 px-4 text-lg',
    xl: 'h-12 px-5 text-xl'
  };

  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-md transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        'touch-target',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

UniversalInput.displayName = 'UniversalInput';

export default UniversalInput;