"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface ScoreCircleProps {
  score: number
  label: string
  description?: string
  justification?: string
  isHardGate?: boolean
  hardGateThreshold?: number
  delay?: number
}

export function ScoreCircle({
  score,
  label,
  description,
  justification,
  isHardGate = false,
  hardGateThreshold = 9,
  delay = 0,
}: ScoreCircleProps) {
  const [animated, setAnimated] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const radius = 34
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference * (1 - score / 10)
  const offset = animated ? targetOffset : circumference

  const isGateFailing = isHardGate && score < hardGateThreshold

  const strokeColor =
    score >= 8
      ? "#22c55e"
      : score >= 6
      ? "#eab308"
      : "#ef4444"

  const textColor =
    score >= 8
      ? "text-green-400"
      : score >= 6
      ? "text-yellow-400"
      : "text-red-400"

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}ms` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-bold tabular-nums", textColor)}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">/ 10</span>
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-sm font-semibold text-slate-200">{label}</p>
          {isHardGate && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                isGateFailing
                  ? "bg-red-500/15 text-red-400"
                  : "bg-slate-700 text-slate-400"
              )}
            >
              gate
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
        {isHardGate && (
          <p className={cn("text-[10px] mt-1", isGateFailing ? "text-red-400" : "text-slate-500")}>
            ≥{hardGateThreshold}.0 required
          </p>
        )}
      </div>

      {justification && (
        <div className="w-full">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors mx-auto"
          >
            <ChevronDown
              className={cn("h-3 w-3 transition-transform duration-200", expanded && "rotate-180")}
            />
            {expanded ? "Hide" : "Why?"}
          </button>
          {expanded && (
            <p className="mt-2 text-xs text-slate-400 leading-relaxed bg-slate-800/60 rounded-lg px-3 py-2.5 border border-white/[0.05]">
              {justification}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
