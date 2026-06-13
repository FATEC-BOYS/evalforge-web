"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreBarProps {
  dimension: string
  score: number
  justification: string
}

export function ScoreBar({ dimension, score, justification }: ScoreBarProps) {
  const [expanded, setExpanded] = useState(false)

  const colorClass =
    score >= 8 ? "bg-green-500" : score >= 6 ? "bg-yellow-500" : "bg-red-500"

  const textColorClass =
    score >= 8 ? "text-green-400" : score >= 6 ? "text-yellow-400" : "text-red-400"

  const percentage = (score / 10) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300 capitalize">{dimension}</span>
        <span className={cn("text-sm font-bold tabular-nums", textColorClass)}>
          {score.toFixed(1)}<span className="text-slate-600 font-normal text-xs"> / 10</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800">
        <div
          className={cn("h-1.5 rounded-full transition-all duration-700", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors self-start"
      >
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} />
        {expanded ? "Hide" : "Show"} justification
      </button>
      {expanded && (
        <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/60 rounded-lg px-3 py-2.5 border border-white/[0.05]">
          {justification}
        </p>
      )}
    </div>
  )
}
