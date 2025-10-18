"use client";
import React from 'react';
import { cn } from '@/lib/utils';

const ResponsiveGrid = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, laptop: 3, desktop: 4 },
  gap = 'responsive',
  className = '',
  ...props 
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-4',
    responsive: 'gap-4 sm:gap-6 lg:gap-8',
    large: 'gap-6 sm:gap-8 lg:gap-10'
  };

  const gridColsClasses = {
    mobile: `grid-cols-${cols.mobile}`,
    tablet: `sm:grid-cols-${cols.tablet}`,
    laptop: `lg:grid-cols-${cols.laptop}`,
    desktop: `xl:grid-cols-${cols.desktop}`
  };

  return (
    <div
      className={cn(
        'grid w-full',
        gridColsClasses.mobile,
        gridColsClasses.tablet,
        gridColsClasses.laptop,
        gridColsClasses.desktop,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;