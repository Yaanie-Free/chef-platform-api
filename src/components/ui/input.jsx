import React from "react";
import { cn } from "./utils";

const Input = ({ label, className = '', error, type = "text", ...props }) => {
  if (label) {
    return (
      <label className="block">
        <span className="text-sm text-gray-700 mb-1 block">{label}</span>
        <input
          type={type}
          className={cn(
            "w-full px-4 py-2 rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300",
            error ? 'border-red-400' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </label>
    );
  }

  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

export { Input };
