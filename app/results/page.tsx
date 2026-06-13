"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { evaluate, ApiError, EvalResponse } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Clock, ArrowLeft, Cpu, Sparkles, Check, GitCompare, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const ALL_MODELS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { value: "claude-opus-4-20250514", label: "Claude Opus 4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
]

function formatModel(m: string) {
  return m.startsWith("claude") ? m.replace("claude-", "Claude ").replace(/-\d{8}$/, "") : m
}

function formatLatency(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`
}

function avg(scores: EvalResponse["result"]["scores"]) {
  const vals = Object.values(scores)
  return vals.reduce((s, d) => s + d.score, 0) / Math.max(vals.length, 1)
}

function scoreColor(s: number) {
  return s >= 8 ? "text-green-400" : s >= 6 ? "text-yellow-400" : "text-red-400"
}

function ScoreBar({ label, score, isGate }: { label: string; score: number; isGate?: boolean }) {
  const [open, setOpen] = useState(false)
  const color = scoreColor(score)
  const barColor = score >= 8 ? "bg-green-400" : score >= 6 ? "bg-yellow-400" : "bg-red-400"

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 capitalize">{label}</span>
          {isGate && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">gate</span>
          )}
        </div>
        <span className={cn("text-sm font-bold tabular-nums", color)}>{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  )
}

// "Compare with other models" panel
function ComparePanel({ result }: { result: EvalResponse }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const available = ALL_MODELS.filter((m) => m.value !== result.request.model)

  function toggle(v: string) {
    setSelected((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])
  }

  async function run() {
    const token = getToken()
    if (!token) { router.push("/auth/login"); return }
    setLoading(true); setError(null)
    try {
      const extra = await Promise.all(
        selected.map((model) => evaluate({ task: result.request.task, input: result.request.input, model }, token))
      )
      sessionStorage.setItem("evalforge_results", JSON.stringify([result, ...extra]))
      sessionStorage.removeItem("evalforge_result")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) { removeToken(); router.push("/auth/login"); return }
        setError(err.message)
      } else { setError("Unexpected error.") }
    } finally { setLoading(false) }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <GitCompare className="h-3.5 w-3.5" />
        Compare with other models
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-900/60 p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
        <GitCompare className="h-3.5 w-3.5 text-indigo-400" /> Compare with
      </p>
      <div className="grid grid-cols-2 gap-2">
        {available.map((m) => {
          const sel = selected.includes(m.value)
          return (
            <button key={m.value} onClick={() => toggle(m.value)} disabled={loading}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all",
                sel ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-200" : "border-white/[0.07] text-slate-400 hover:text-slate-200",
                "disabled:opacity-50"
              )}>
              {m.label}
              <div className={cn("h-3.5 w-3.5 rounded border flex items-center justify-center", sel ? "border-indigo-400 bg-indigo-400" : "border-slate-600")}>
                {sel && <Check className="h-2 w-2 text-white" />}
              </div>
            </button>
          )
        })}
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={run} isLoading={loading} disabled={selected.length === 0} size="sm" className="flex-1">
          {loading ? "Running..." : "Run"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
      </div>
    </div>
  )
}

// Single result: 2-column grid layout
function SingleResult({ result }: { result: EvalResponse }) {
  const { request, result: r, output } = result
  const [inputOpen, setInputOpen] = useState(false)
  const isPass = r.verdict === "PASS"
  const average = avg(r.scores)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
      {/* LEFT: verdict + response */}
      <div className="flex flex-col gap-4">
        {/* Verdict card */}
        <div className={cn(
          "rounded-2xl border p-5 flex items-center gap-4",
          isPass ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
        )}>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl ring-1 flex-shrink-0",
            isPass ? "bg-green-500/10 ring-green-500/30" : "bg-red-500/10 ring-red-500/30"
          )}>
            {isPass
              ? <CheckCircle2 className="h-6 w-6 text-green-400" />
              : <XCircle className="h-6 w-6 text-red-400" />
            }
          </div>
          <div className="flex-1">
            <p className={cn("text-xl font-bold tracking-widest", isPass ? "text-green-400" : "text-red-400")}>
              {r.verdict}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPass ? "All dimensions passed" : "One or more dimensions failed"}
            </p>
          </div>
          <div className="text-right">
            <span className={cn("text-3xl font-bold tabular-nums", isPass ? "text-green-400" : "text-red-400")}>
              {average.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500"> / 10</span>
          </div>
        </div>

        {/* Model response */}
        {output && (
          <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 flex-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Response</p>
              <span className="ml-auto text-[11px] text-slate-600">{formatModel(request.model)}</span>
            </div>
            <div className="px-4 py-4 max-h-80 overflow-y-auto">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{output}</p>
            </div>
          </div>
        )}

        {/* Compare panel */}
        <ComparePanel result={result} />
      </div>

      {/* RIGHT: scores + metrics + request */}
      <div className="flex flex-col gap-4">
        {/* Scores */}
        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-4 flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Evaluation scores</p>
          <ScoreBar label="Accuracy" score={r.scores.accuracy?.score ?? 0} />
          <ScoreBar label="Reasoning" score={r.scores.reasoning?.score ?? 0} />
          <ScoreBar label="Safety" score={r.scores.safety?.score ?? 0} isGate />
          {r.scores.accuracy?.justification && (
            <details className="group">
              <summary className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer list-none flex items-center gap-1">
                <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
                Justifications
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                {Object.entries(r.scores).map(([dim, d]) => (
                  <div key={dim} className="rounded-lg bg-slate-800/50 px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-500 capitalize mb-1">{dim}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{d.justification}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 mb-1">Latency</p>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-500" />
              <span className="text-sm font-semibold text-slate-100 tabular-nums">{formatLatency(r.latency_ms)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 mb-1">Model</p>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-semibold text-slate-100 truncate">{formatModel(request.model)}</span>
            </div>
          </div>
        </div>

        {/* Request */}
        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Request</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Task</p>
              <p className="text-xs text-slate-300 leading-relaxed">{request.task}</p>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div>
              <button
                onClick={() => setInputOpen((v) => !v)}
                className="flex items-center justify-between w-full"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Input</p>
                {inputOpen ? <ChevronUp className="h-3 w-3 text-slate-600" /> : <ChevronDown className="h-3 w-3 text-slate-600" />}
              </button>
              <p className={cn("text-xs text-slate-400 leading-relaxed whitespace-pre-wrap mt-1", !inputOpen && "line-clamp-3")}>
                {request.input}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Comparison column
function CompareColumn({ result, rank }: { result: EvalResponse; rank: number }) {
  const { result: r, output } = result
  const average = avg(r.scores)
  const isPass = r.verdict === "PASS"

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className={cn(
        "rounded-xl border p-4",
        rank === 1
          ? isPass ? "border-green-500/30 bg-green-500/8" : "border-red-500/30 bg-red-500/8"
          : "border-white/[0.07] bg-slate-900/40"
      )}>
        {rank === 1 && <p className="text-[10px] font-bold text-yellow-400 mb-2 uppercase tracking-widest">Best</p>}
        <p className="text-xs font-semibold text-slate-300 mb-2">{formatModel(result.request.model)}</p>
        <div className="flex items-end justify-between">
          <div>
            <span className={cn("text-2xl font-bold tabular-nums", isPass ? "text-green-400" : "text-red-400")}>
              {average.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500"> / 10</span>
          </div>
          <span className={cn(
            "text-[11px] font-bold tracking-widest px-2 py-0.5 rounded-full",
            isPass ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
          )}>
            {r.verdict}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-3 flex flex-col gap-2.5">
        {(["accuracy", "reasoning", "safety"] as const).map((dim) => {
          const d = r.scores[dim]
          if (!d) return null
          return <ScoreBar key={dim} label={dim} score={d.score} isGate={dim === "safety"} />
        })}
        <div className="h-px bg-white/[0.04]" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Latency</span>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">{formatLatency(r.latency_ms)}</span>
        </div>
      </div>

      {output && (
        <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3 w-3 text-violet-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Response</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">{output}</p>
        </div>
      )}
    </div>
  )
}

function ComparisonResult({ results }: { results: EvalResponse[] }) {
  const sorted = [...results].sort((a, b) => avg(b.result.scores) - avg(a.result.scores))
  const { task, input } = results[0].request
  const [inputOpen, setInputOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Request context */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="h-3.5 w-3.5 text-indigo-400" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Comparing {results.length} models
          </p>
        </div>
        <p className="text-sm text-slate-300">{task}</p>
        <button onClick={() => setInputOpen((v) => !v)} className="mt-1 text-[11px] text-slate-500 hover:text-slate-400 flex items-center gap-1">
          {inputOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {inputOpen ? "Hide input" : "Show input"}
        </button>
        {inputOpen && <p className="mt-2 text-xs text-slate-400 whitespace-pre-wrap">{input}</p>}
      </div>

      {/* Columns */}
      <div className={cn(
        "grid gap-4",
        sorted.length === 2 ? "grid-cols-2" : sorted.length === 3 ? "grid-cols-3" : "grid-cols-2 xl:grid-cols-4"
      )}>
        {sorted.map((r, i) => <CompareColumn key={r.request.model} result={r} rank={i + 1} />)}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<EvalResponse[] | null>(null)

  useEffect(() => {
    const rawMulti = sessionStorage.getItem("evalforge_results")
    const rawSingle = sessionStorage.getItem("evalforge_result")

    if (rawMulti) {
      try {
        const parsed = JSON.parse(rawMulti)
        if (Array.isArray(parsed) && parsed.length > 0) { setResults(parsed); return }
      } catch { /* fall through */ }
    }
    if (rawSingle) {
      try {
        const parsed = JSON.parse(rawSingle)
        if (parsed?.request?.model && parsed?.result?.scores) { setResults([parsed]); return }
      } catch { /* fall through */ }
    }

    sessionStorage.removeItem("evalforge_results")
    sessionStorage.removeItem("evalforge_result")
    router.push("/evaluate")
  }, [router])

  if (!results) return null

  const isComparison = results.length > 1

  return (
    <div className={cn("mx-auto px-4 py-8 flex flex-col gap-6", isComparison ? "max-w-5xl" : "max-w-4xl")}>
      {isComparison ? <ComparisonResult results={results} /> : <SingleResult result={results[0]} />}
      <Link href="/evaluate">
        <Button variant="outline" className="w-full gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Evaluate again
        </Button>
      </Link>
    </div>
  )
}
