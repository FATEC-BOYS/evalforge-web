"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreBarProps {
  dimension: string
  score: number
  justification: string
}

export function ScoreBar({ dimension, score, justification }: ScoreBarProps) {
  const [expanded, setExpanded] = useState(false)

  const colorClass =
    score >= 8
      ? "bg-green-500"
      : score >= 6
      ? "bg-yellow-500"
      : "bg-red-500"

  const textColorClass =
    score >= 8
      ? "text-green-700"
      : score >= 6
      ? "text-yellow-700"
      : "text-red-700"

  const percentage = (score / 10) * 100

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 capitalize">{dimension}</span>
        <span className={cn("text-sm font-semibold", textColorClass)}>
          {score.toFixed(1)} / 10
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={cn("h-2 rounded-full transition-all", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 self-start"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Hide" : "Show"} justification
      </button>
      {expanded && (
        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-md px-3 py-2">
          {justification}
        </p>
      )}
    </div>
  )
}
