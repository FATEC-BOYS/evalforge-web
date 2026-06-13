"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { evaluate, ApiError, EvalResponse } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"
import {
  Clock, ArrowLeft, Cpu, Sparkles, Check, GitCompare,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, Plus,
  RotateCcw, Trophy, Medal,
} from "lucide-react"
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
  return s >= 8 ? "text-emerald-400" : s >= 6 ? "text-yellow-400" : "text-red-400"
}

function barColor(s: number) {
  return s >= 8 ? "bg-emerald-400" : s >= 6 ? "bg-yellow-400" : "bg-red-400"
}

// ─── Score dimension row with expandable justification ───────────────────────
function ScoreDimension({
  label, score, justification, isGate,
}: {
  label: string
  score: number
  justification?: string
  isGate?: boolean
}) {
  const [open, setOpen] = useState(false)
  const hasJustification = !!justification

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 capitalize">{label}</span>
          {isGate && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">gate</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-bold tabular-nums", scoreColor(score))}>{score.toFixed(1)}</span>
          {hasJustification && (
            <button onClick={() => setOpen((v) => !v)} className="text-slate-600 hover:text-slate-400 transition-colors">
              {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor(score))}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      {open && justification && (
        <p className="text-[11px] text-slate-500 leading-relaxed rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
          {justification}
        </p>
      )}
    </div>
  )
}

// ─── Add more models panel ───────────────────────────────────────────────────
function AddModelsPanel({
  result,
  existingModels,
  onResults,
}: {
  result: EvalResponse
  existingModels: string[]
  onResults: (r: EvalResponse[]) => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const available = ALL_MODELS.filter((m) => !existingModels.includes(m.value))

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
      const newResults = [result, ...extra]
      sessionStorage.setItem("evalforge_results", JSON.stringify(newResults))
      sessionStorage.removeItem("evalforge_result")
      onResults(newResults)
      setOpen(false)
      setSelected([])
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) { removeToken(); router.push("/auth/login"); return }
        setError(err.message)
      } else { setError("Unexpected error.") }
    } finally { setLoading(false) }
  }

  if (available.length === 0) return null

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] border border-dashed border-white/[0.1] transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
        Compare with other models
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111118] p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
        <GitCompare className="h-3.5 w-3.5 text-indigo-400" />
        Add models to compare
      </p>
      <div className="grid grid-cols-2 gap-2">
        {available.map((m) => {
          const sel = selected.includes(m.value)
          return (
            <button key={m.value} onClick={() => toggle(m.value)} disabled={loading}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all",
                sel ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200" : "border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]",
                "disabled:opacity-50"
              )}>
              {m.label}
              <div className={cn(
                "h-3.5 w-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all",
                sel ? "border-indigo-400 bg-indigo-400" : "border-slate-600"
              )}>
                {sel && <Check className="h-2 w-2 text-white" />}
              </div>
            </button>
          )
        })}
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={run}
          disabled={loading || selected.length === 0}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Running evals…" : `Run ${selected.length > 0 ? `(${selected.length})` : ""}`}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={loading}
          className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Single result view ──────────────────────────────────────────────────────
function SingleResult({
  result,
  onResults,
}: {
  result: EvalResponse
  onResults: (r: EvalResponse[]) => void
}) {
  const { request, result: r, output } = result
  const [inputOpen, setInputOpen] = useState(false)
  const isPass = r.verdict === "PASS"
  const average = avg(r.scores)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

      {/* LEFT column */}
      <div className="flex flex-col gap-4">

        {/* Verdict hero */}
        <div className={cn(
          "rounded-2xl border p-5",
          isPass
            ? "border-emerald-500/20 bg-emerald-500/[0.04]"
            : "border-red-500/20 bg-red-500/[0.04]"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl ring-1 flex-shrink-0",
              isPass ? "bg-emerald-500/10 ring-emerald-500/25" : "bg-red-500/10 ring-red-500/25"
            )}>
              {isPass
                ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                : <XCircle className="h-5 w-5 text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-lg font-bold tracking-widest", isPass ? "text-emerald-400" : "text-red-400")}>
                {r.verdict}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {formatModel(request.model)} · {formatLatency(r.latency_ms)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={cn("text-4xl font-bold tabular-nums", isPass ? "text-emerald-400" : "text-red-400")}>
                {average.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500"> /10</span>
            </div>
          </div>
        </div>

        {/* Model response */}
        {output && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Model response</p>
              <span className="ml-auto text-[11px] text-slate-600">{formatModel(request.model)}</span>
            </div>
            <div className="px-4 py-4 max-h-96 overflow-y-auto">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{output}</p>
            </div>
          </div>
        )}

        {/* Compare */}
        <AddModelsPanel result={result} existingModels={[request.model]} onResults={onResults} />
      </div>

      {/* RIGHT column */}
      <div className="flex flex-col gap-4">

        {/* Scores */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Scores</p>
          </div>
          <div className="px-4 py-4 flex flex-col gap-4">
            {Object.entries(r.scores).map(([dim, d]) => (
              <ScoreDimension
                key={dim}
                label={dim}
                score={d.score}
                justification={d.justification}
                isGate={dim === "safety"}
              />
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.06] bg-[#111118] px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600 mb-1.5">Latency</p>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-500" />
              <span className="text-sm font-semibold text-slate-100 tabular-nums">{formatLatency(r.latency_ms)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#111118] px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600 mb-1.5">Model</p>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-semibold text-slate-100 truncate">{formatModel(request.model)}</span>
            </div>
          </div>
        </div>

        {/* Request context */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Request</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Task</p>
              <p className="text-xs text-slate-300 leading-relaxed">{request.task}</p>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div>
              <button
                onClick={() => setInputOpen((v) => !v)}
                className="flex items-center justify-between w-full mb-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Input</p>
                {inputOpen ? <ChevronUp className="h-3 w-3 text-slate-600" /> : <ChevronDown className="h-3 w-3 text-slate-600" />}
              </button>
              <p className={cn("text-xs text-slate-400 leading-relaxed whitespace-pre-wrap", !inputOpen && "line-clamp-3")}>
                {request.input}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Comparison column ───────────────────────────────────────────────────────
function CompareColumn({ result, rank }: { result: EvalResponse; rank: number }) {
  const { result: r, output } = result
  const average = avg(r.scores)
  const isPass = r.verdict === "PASS"
  const [responseOpen, setResponseOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Header card */}
      <div className={cn(
        "rounded-2xl border p-4",
        rank === 1
          ? isPass
            ? "border-emerald-500/25 bg-emerald-500/[0.05]"
            : "border-red-500/25 bg-red-500/[0.05]"
          : "border-white/[0.06] bg-[#111118]"
      )}>
        <div className="flex items-center gap-2 mb-3">
          {rank === 1 && <Trophy className="h-3.5 w-3.5 text-yellow-400" />}
          {rank === 2 && <Medal className="h-3.5 w-3.5 text-slate-400" />}
          <p className="text-xs font-semibold text-slate-300">{formatModel(result.request.model)}</p>
          <span className={cn(
            "ml-auto text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full",
            isPass ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          )}>
            {r.verdict}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className={cn("text-3xl font-bold tabular-nums", isPass ? "text-emerald-400" : "text-red-400")}>
            {average.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 mb-1">/10</span>
        </div>
      </div>

      {/* Scores */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-3 flex flex-col gap-3">
        {Object.entries(r.scores).map(([dim, d]) => (
          <ScoreDimension
            key={dim}
            label={dim}
            score={d.score}
            justification={d.justification}
            isGate={dim === "safety"}
          />
        ))}
        <div className="h-px bg-white/[0.04]" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" /> Latency
          </span>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">{formatLatency(r.latency_ms)}</span>
        </div>
      </div>

      {/* Response (collapsible) */}
      {output && (
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] overflow-hidden">
          <button
            onClick={() => setResponseOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
          >
            <Sparkles className="h-3 w-3 text-violet-400 flex-shrink-0" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex-1 text-left">Response</p>
            {responseOpen ? <ChevronUp className="h-3 w-3 text-slate-600" /> : <ChevronDown className="h-3 w-3 text-slate-600" />}
          </button>
          {responseOpen && (
            <div className="px-3 pb-3 border-t border-white/[0.04]">
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pt-2">{output}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Comparison result view ──────────────────────────────────────────────────
function ComparisonResult({
  results,
  onResults,
}: {
  results: EvalResponse[]
  onResults: (r: EvalResponse[]) => void
}) {
  const sorted = [...results].sort((a, b) => avg(b.result.scores) - avg(a.result.scores))
  const { task, input } = results[0].request
  const [inputOpen, setInputOpen] = useState(false)
  const existingModels = results.map((r) => r.request.model)
  const winner = sorted[0]
  const winnerIsPass = winner.result.verdict === "PASS"

  return (
    <div className="flex flex-col gap-5">
      {/* Context + winner summary */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-3">
          <GitCompare className="h-4 w-4 text-indigo-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{task}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">{results.length} models compared</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Trophy className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs font-semibold text-slate-300">{formatModel(winner.request.model)}</span>
            <span className={cn(
              "text-xs font-bold tabular-nums",
              winnerIsPass ? "text-emerald-400" : "text-red-400"
            )}>
              {avg(winner.result.scores).toFixed(1)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setInputOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-5 py-2.5 text-[11px] text-slate-600 hover:text-slate-400 hover:bg-white/[0.02] transition-colors"
        >
          {inputOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {inputOpen ? "Hide input" : "Show input"}
        </button>
        {inputOpen && (
          <div className="px-5 pb-4 border-t border-white/[0.04]">
            <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed pt-3">{input}</p>
          </div>
        )}
      </div>

      {/* Columns */}
      <div className={cn(
        "grid gap-4",
        sorted.length === 2 ? "grid-cols-2" :
        sorted.length === 3 ? "grid-cols-3" :
        "grid-cols-2 xl:grid-cols-4"
      )}>
        {sorted.map((r, i) => (
          <CompareColumn key={r.request.model} result={r} rank={i + 1} />
        ))}
      </div>

      {/* Add more models */}
      <AddModelsPanel result={results[0]} existingModels={existingModels} onResults={onResults} />
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
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
  const firstTask = results[0].request.task

  return (
    <div className={cn("mx-auto px-5 py-8 flex flex-col gap-6", isComparison ? "max-w-5xl" : "max-w-4xl")}>

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/evaluate")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div>
            <h1 className="text-sm font-medium text-slate-300 truncate max-w-xs sm:max-w-md">
              {isComparison
                ? <><span className="font-display italic text-indigo-300">Comparison</span> · {results.length} models</>
                : <><span className="font-display italic text-indigo-300">Results</span></>
              }
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              sessionStorage.setItem("evalforge_prefill", JSON.stringify({
                task: results[0].request.task,
                input: results[0].request.input,
              }))
              router.push("/evaluate")
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-white/[0.07] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Re-run
          </button>
          <button
            onClick={() => router.push("/evaluate")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white transition-colors"
          >
            New eval
          </button>
        </div>
      </div>

      {/* Content */}
      {isComparison
        ? <ComparisonResult results={results} onResults={setResults} />
        : <SingleResult result={results[0]} onResults={(r) => setResults(r)} />
      }
    </div>
  )
}
