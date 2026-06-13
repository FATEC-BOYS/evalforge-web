"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EvalResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ScoreCircle } from "@/components/score-circle"
import { VerdictBadge } from "@/components/verdict-badge"
import { Clock, ArrowLeft, Cpu, DollarSign, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

function formatModel(model: string) {
  return model.startsWith("claude")
    ? model.replace("claude-", "Claude ").replace(/-\d{8}$/, "")
    : model
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<EvalResponse | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("evalforge_result")
    if (!raw) { router.push("/evaluate"); return }
    try {
      const parsed = JSON.parse(raw)
      if (!parsed?.request?.model || !parsed?.result?.scores) {
        sessionStorage.removeItem("evalforge_result")
        router.push("/evaluate")
        return
      }
      setResult(parsed)
    } catch {
      router.push("/evaluate")
    }
  }, [router])

  if (!result) return null

  const { request, result: evalResult, output } = result

  const avgScore =
    Object.values(evalResult.scores).reduce((s, d) => s + d.score, 0) /
    Math.max(Object.keys(evalResult.scores).length, 1)

  const isPass = evalResult.verdict === "PASS"

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col gap-6">

      {/* Header: verdict + avg */}
      <div className={cn(
        "rounded-2xl border p-6 flex items-center justify-between",
        isPass
          ? "border-green-500/20 bg-green-500/5"
          : "border-red-500/20 bg-red-500/5"
      )}>
        <VerdictBadge verdict={evalResult.verdict} />
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">Avg score</p>
          <span className={cn("text-4xl font-bold tabular-nums", isPass ? "text-green-400" : "text-red-400")}>
            {avgScore.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500"> / 10</span>
        </div>
      </div>

      {/* Model response */}
      {output && (
        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Model response
            </p>
            <span className="ml-auto text-[11px] text-slate-600">{formatModel(request.model)}</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        </div>
      )}

      {/* Scores */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-6 text-center">
          Evaluation scores
        </p>
        <div className="grid grid-cols-3 gap-6">
          <ScoreCircle
            score={evalResult.scores.accuracy?.score ?? 0}
            label="Accuracy"
            description="Task correctness"
            justification={evalResult.scores.accuracy?.justification ?? ""}
            delay={0}
          />
          <ScoreCircle
            score={evalResult.scores.reasoning?.score ?? 0}
            label="Reasoning"
            description="Logic quality"
            justification={evalResult.scores.reasoning?.justification ?? ""}
            delay={150}
          />
          <ScoreCircle
            score={evalResult.scores.safety?.score ?? 0}
            label="Safety"
            description="Content safety"
            justification={evalResult.scores.safety?.justification ?? ""}
            isHardGate
            hardGateThreshold={9}
            delay={300}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Latency</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-sm font-semibold text-slate-100 tabular-nums">
              {evalResult.latency_ms >= 1000
                ? `${(evalResult.latency_ms / 1000).toFixed(2)}s`
                : `${Math.round(evalResult.latency_ms)}ms`}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Model</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-100 truncate">{formatModel(request.model)}</span>
          </div>
        </div>
      </div>

      {/* Request details */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40">
        <div className="px-5 py-3 border-b border-white/[0.05]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Request</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Task</p>
            <p className="text-sm text-slate-300 leading-relaxed">{request.task}</p>
          </div>
          <div className="h-px bg-white/[0.04]" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Input</p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6">{request.input}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link href="/evaluate">
        <Button variant="outline" className="w-full gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Evaluate again
        </Button>
      </Link>
    </div>
  )
}
