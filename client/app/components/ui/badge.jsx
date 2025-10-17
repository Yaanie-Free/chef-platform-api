import React from 'react';

const Badge = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-pink-50 text-pink-700',
    outline: 'bg-transparent border border-gray-200 text-gray-800'
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${variants[variant] || variants.default} ${className}`}>{children}</span>
  );
};

export default Badge;
