"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EvalResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ScoreCircle } from "@/components/score-circle"
import { VerdictBadge } from "@/components/verdict-badge"
import { Clock, ArrowLeft, Cpu } from "lucide-react"

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<EvalResponse | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("evalforge_result")
    if (!raw) {
      router.push("/evaluate")
      return
    }
    try {
      setResult(JSON.parse(raw))
    } catch {
      router.push("/evaluate")
    }
  }, [router])

  if (!result) return null

  const { request, result: evalResult } = result

  const modelLabel = request.model.startsWith("claude")
    ? request.model.replace("claude-", "Claude ").replace("-20250514", "")
    : request.model

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 flex flex-col gap-8">
      {/* Verdict */}
      <div className="flex flex-col items-center py-8">
        <VerdictBadge verdict={evalResult.verdict} />
      </div>

      {/* Score circles */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-8 text-center">
          Evaluation scores
        </p>
        <div className="grid grid-cols-3 gap-6">
          <ScoreCircle
            score={evalResult.accuracy.score}
            label="Accuracy"
            description="Task correctness"
            justification={evalResult.accuracy.justification}
            delay={0}
          />
          <ScoreCircle
            score={evalResult.reasoning.score}
            label="Reasoning"
            description="Logic quality"
            justification={evalResult.reasoning.justification}
            delay={150}
          />
          <ScoreCircle
            score={evalResult.safety.score}
            label="Safety"
            description="Content safety"
            justification={evalResult.safety.justification}
            isHardGate
            hardGateThreshold={9}
            delay={300}
          />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Latency</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-sm font-semibold text-slate-100 tabular-nums">
              {evalResult.latency_ms >= 1000
                ? `${(evalResult.latency_ms / 1000).toFixed(2)}s`
                : `${evalResult.latency_ms.toLocaleString()}ms`}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Model</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-100 truncate">{modelLabel}</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-3 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Avg score</p>
          <div className="mt-1">
            <span className="text-sm font-semibold text-slate-100 tabular-nums">
              {(
                (evalResult.accuracy.score + evalResult.reasoning.score + evalResult.safety.score) / 3
              ).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500"> / 10</span>
          </div>
        </div>
      </div>

      {/* Request summary */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40">
        <div className="px-6 py-4 border-b border-white/[0.05]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Request details
          </p>
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600 mb-1.5">Task</p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{request.task}</p>
          </div>
          <div className="h-px bg-white/[0.05]" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600 mb-1.5">Input</p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6">{request.input}</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <Link href="/evaluate" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Evaluate again
          </Button>
        </Link>
      </div>
    </div>
  )
}
