"use client";
import React from 'react';
import { cn } from '@/lib/utils';

const UniversalCard = ({ 
  children, 
  className = '',
  variant = 'default',
  size = 'responsive',
  padding = 'responsive',
  rounded = 'responsive',
  shadow = 'responsive',
  hover = true,
  ...props 
}) => {
  const variants = {
    default: 'bg-card text-card-foreground border border-border',
    elevated: 'bg-card text-card-foreground shadow-lg border-0',
    outlined: 'bg-transparent text-foreground border-2 border-border',
    filled: 'bg-muted text-muted-foreground border-0',
    gradient: 'bg-gradient-to-br from-card to-muted/50 text-card-foreground border border-border/50'
  };

  const sizes = {
    sm: 'p-3',
    responsive: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-10',
    xl: 'p-8 sm:p-10 lg:p-12'
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-2 sm:p-4',
    responsive: 'p-4 sm:p-6 lg:p-8',
    large: 'p-6 sm:p-8 lg:p-10'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm sm:rounded-md',
    responsive: 'rounded-lg sm:rounded-xl lg:rounded-2xl',
    large: 'rounded-xl sm:rounded-2xl lg:rounded-3xl'
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    responsive: 'shadow-sm sm:shadow-md lg:shadow-lg',
    large: 'shadow-md sm:shadow-lg lg:shadow-xl'
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        variants[variant],
        sizes[size],
        paddings[padding],
        roundedClasses[rounded],
        shadowClasses[shadow],
        hover && 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default UniversalCard;