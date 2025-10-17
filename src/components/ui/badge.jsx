import * as React from 'react'

function Badge({ className = '', variant = 'default', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/80' : 
        variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 
        variant === 'outline' ? 'border-input bg-background hover:bg-accent hover:text-accent-foreground' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
