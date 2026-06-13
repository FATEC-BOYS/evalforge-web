"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

const variantClasses = {
  default:
    "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:bg-indigo-800 disabled:text-indigo-300 disabled:shadow-none",
  outline:
    "border border-white/[0.12] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:border-white/[0.18] disabled:opacity-40",
  ghost:
    "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 disabled:opacity-40",
  destructive:
    "bg-red-600/90 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 disabled:bg-red-900 disabled:opacity-60",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-sm rounded-xl",
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080812] disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
