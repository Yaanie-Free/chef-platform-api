import React from 'react';

const Button = ({ children, className = '', variant = 'primary', size = 'md', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none';
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };
  const variants = {
    primary: 'bg-pink-500 text-white hover:bg-pink-600',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline: 'bg-transparent border border-gray-200 text-gray-800 hover:bg-gray-50',
  };

  return (
    <button className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
