import * as React from "react"

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${
        variant === "default" ? "bg-primary text-white hover:bg-primary/90" : 
        variant === "outline" ? "border border-input hover:bg-accent hover:text-accent-foreground" : 
        variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : 
        variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" : 
        variant === "link" ? "text-primary underline-offset-4 hover:underline" : ""
      } ${
        size === "default" ? "h-10 py-2 px-4" : 
        size === "sm" ? "h-9 px-3 rounded-md" : 
        size === "lg" ? "h-11 px-8 rounded-md" : ""
      } ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button }
