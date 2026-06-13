"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { evaluate, ApiError, EvalResponse } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ScoreCircle } from "@/components/score-circle"
import { VerdictBadge } from "@/components/verdict-badge"
import { Clock, ArrowLeft, Cpu, Sparkles, Check, GitCompare } from "lucide-react"
import { cn } from "@/lib/utils"

const ALL_MODELS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { value: "claude-opus-4-20250514", label: "Claude Opus 4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
]

function formatModel(model: string) {
  return model.startsWith("claude")
    ? model.replace("claude-", "Claude ").replace(/-\d{8}$/, "")
    : model
}

function avgScore(scores: EvalResponse["result"]["scores"]) {
  const vals = Object.values(scores)
  return vals.reduce((s, d) => s + d.score, 0) / Math.max(vals.length, 1)
}

// Single result view (same as before)
function SingleResult({ result }: { result: EvalResponse }) {
  const { request, result: evalResult, output } = result
  const avg = avgScore(evalResult.scores)
  const isPass = evalResult.verdict === "PASS"

  return (
    <div className="flex flex-col gap-6">
      <div className={cn(
        "rounded-2xl border p-6 flex items-center justify-between",
        isPass ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
      )}>
        <VerdictBadge verdict={evalResult.verdict} />
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">Avg score</p>
          <span className={cn("text-4xl font-bold tabular-nums", isPass ? "text-green-400" : "text-red-400")}>
            {avg.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500"> / 10</span>
        </div>
      </div>

      {output && (
        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Model response</p>
            <span className="ml-auto text-[11px] text-slate-600">{formatModel(request.model)}</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        </div>
      )}

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
    </div>
  )
}

// Comparison column for one model
function CompareColumn({ result, rank }: { result: EvalResponse; rank: number }) {
  const { result: evalResult, output } = result
  const avg = avgScore(evalResult.scores)
  const isPass = evalResult.verdict === "PASS"

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className={cn(
        "rounded-xl border p-4 text-center",
        rank === 1
          ? isPass ? "border-green-500/30 bg-green-500/8" : "border-red-500/30 bg-red-500/8"
          : "border-white/[0.07] bg-slate-900/40"
      )}>
        {rank === 1 && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-2">Best score</p>
        )}
        <p className="text-xs font-semibold text-slate-300 mb-2">{formatModel(result.request.model)}</p>
        <span className={cn("text-3xl font-bold tabular-nums", isPass ? "text-green-400" : "text-red-400")}>
          {avg.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500"> / 10</span>
        <div className="mt-2">
          <span className={cn(
            "text-[11px] font-bold tracking-widest px-2 py-0.5 rounded-full",
            isPass ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
          )}>
            {evalResult.verdict}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-4 flex flex-col gap-3">
        {(["accuracy", "reasoning", "safety"] as const).map((dim) => {
          const d = evalResult.scores[dim]
          if (!d) return null
          const color = d.score >= 8 ? "text-green-400" : d.score >= 6 ? "text-yellow-400" : "text-red-400"
          return (
            <div key={dim} className="flex items-center justify-between">
              <span className="text-xs text-slate-500 capitalize">{dim}</span>
              <span className={cn("text-sm font-bold tabular-nums", color)}>{d.score.toFixed(1)}</span>
            </div>
          )
        })}
        <div className="h-px bg-white/[0.04]" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Latency</span>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            {evalResult.latency_ms >= 1000
              ? `${(evalResult.latency_ms / 1000).toFixed(2)}s`
              : `${Math.round(evalResult.latency_ms)}ms`}
          </span>
        </div>
      </div>

      {/* Response */}
      {output && (
        <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-4 flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3 w-3 text-violet-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Response</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{output}</p>
        </div>
      )}
    </div>
  )
}

// Comparison view for multiple results
function ComparisonResult({ results }: { results: EvalResponse[] }) {
  const sorted = [...results].sort(
    (a, b) => avgScore(b.result.scores) - avgScore(a.result.scores)
  )
  const { task, input } = results[0].request

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <GitCompare className="h-3.5 w-3.5 text-indigo-400" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Comparing {results.length} models
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Task</p>
            <p className="text-sm text-slate-300">{task}</p>
          </div>
          <div className="h-px bg-white/[0.04]" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Input</p>
            <p className="text-sm text-slate-300 line-clamp-3 whitespace-pre-wrap">{input}</p>
          </div>
        </div>
      </div>

      <div className={cn(
        "grid gap-4",
        sorted.length === 2 ? "grid-cols-2" : sorted.length === 3 ? "grid-cols-3" : "grid-cols-2 xl:grid-cols-4"
      )}>
        {sorted.map((r, i) => (
          <CompareColumn key={r.request.model} result={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}

// "Compare with other models" panel for single result page
function ComparePanel({ result }: { result: EvalResponse }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const available = ALL_MODELS.filter((m) => m.value !== result.request.model)

  function toggleModel(value: string) {
    setSelectedModels((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    )
  }

  async function handleCompare() {
    const token = getToken()
    if (!token) { router.push("/auth/login"); return }
    setIsLoading(true)
    setError(null)
    try {
      const extra = await Promise.all(
        selectedModels.map((model) =>
          evaluate({ task: result.request.task, input: result.request.input, model }, token)
        )
      )
      const all = [result, ...extra]
      sessionStorage.setItem("evalforge_results", JSON.stringify(all))
      sessionStorage.removeItem("evalforge_result")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          removeToken()
          router.push("/auth/login")
          return
        }
        setError(err.message)
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-3 text-sm text-slate-400 hover:text-slate-200 hover:border-white/[0.12] transition-all flex items-center justify-center gap-2"
      >
        <GitCompare className="h-4 w-4" />
        Compare with other models
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <GitCompare className="h-3.5 w-3.5 text-indigo-400" />
        <p className="text-sm font-semibold text-slate-200">Compare with other models</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {available.map((m) => {
          const selected = selectedModels.includes(m.value)
          return (
            <button
              key={m.value}
              onClick={() => toggleModel(m.value)}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all text-sm",
                selected
                  ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-200"
                  : "border-white/[0.07] text-slate-300 hover:border-white/[0.12]",
                "disabled:opacity-50"
              )}
            >
              {m.label}
              <div className={cn(
                "h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                selected ? "border-indigo-400 bg-indigo-400" : "border-slate-600"
              )}>
                {selected && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button
          onClick={handleCompare}
          isLoading={isLoading}
          disabled={selectedModels.length === 0}
          className="flex-1 gap-2"
        >
          <GitCompare className="h-3.5 w-3.5" />
          {isLoading
            ? `Running ${selectedModels.length} model${selectedModels.length > 1 ? "s" : ""}...`
            : `Run comparison`}
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<EvalResponse[] | null>(null)

  useEffect(() => {
    // Support both old single-result key and new array key
    const rawMulti = sessionStorage.getItem("evalforge_results")
    const rawSingle = sessionStorage.getItem("evalforge_result")

    if (rawMulti) {
      try {
        const parsed = JSON.parse(rawMulti)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setResults(parsed)
          return
        }
      } catch { /* fall through */ }
    }

    if (rawSingle) {
      try {
        const parsed = JSON.parse(rawSingle)
        if (parsed?.request?.model && parsed?.result?.scores) {
          setResults([parsed])
          return
        }
      } catch { /* fall through */ }
    }

    sessionStorage.removeItem("evalforge_results")
    sessionStorage.removeItem("evalforge_result")
    router.push("/evaluate")
  }, [router])

  if (!results) return null

  const isComparison = results.length > 1

  return (
    <div className={cn("mx-auto px-4 py-10 flex flex-col gap-6", isComparison ? "max-w-5xl" : "max-w-2xl")}>
      {isComparison ? (
        <ComparisonResult results={results} />
      ) : (
        <>
          <SingleResult result={results[0]} />
          <ComparePanel result={results[0]} />
        </>
      )}

      <Link href="/evaluate">
        <Button variant="outline" className="w-full gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Evaluate again
        </Button>
      </Link>
    </div>
  )
}
