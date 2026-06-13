"use client"

import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-white/[0.09] bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all",
            "focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-900",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
