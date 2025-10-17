// Reusable button for CRA app
import React from 'react'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors '
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50',
    ghost: 'bg-transparent text-emerald-600 hover:bg-emerald-50',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
