"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { listEvaluations, EvalHistoryItem, EvalResponse } from "@/lib/api"
import { getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"
import {
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Clock, Cpu, Play, ExternalLink, ArrowRight, RotateCcw,
} from "lucide-react"

function formatModel(m: string) {
  return m.startsWith("claude") ? m.replace("claude-", "Claude ").replace(/-\d{8}$/, "") : m
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function avg(scores: EvalHistoryItem["scores"]) {
  const vals = Object.values(scores)
  return vals.reduce((s, d) => s + d.score, 0) / Math.max(vals.length, 1)
}

function scoreColor(s: number) {
  return s >= 8 ? "text-green-400" : s >= 6 ? "text-yellow-400" : "text-red-400"
}

function ScoreBar({ label, score, gate }: { label: string; score: number; gate?: boolean }) {
  const barColor = score >= 8 ? "bg-green-400" : score >= 6 ? "bg-yellow-400" : "bg-red-400"
  return (
    <div>
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 capitalize">{label}</span>
          {gate && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Gate</span>}
        </div>
        <span className={cn("text-xs font-bold tabular-nums", scoreColor(score))}>{score.toFixed(1)}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/[0.05]">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  )
}

function EvalCard({ item }: { item: EvalHistoryItem }) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const isPass = item.verdict === "PASS"
  const score = avg(item.scores)

  function viewResults() {
    // Reconstruct EvalResponse shape from history item
    const evalResponse: EvalResponse = {
      request: { task: item.task, input: item.input, model: item.model },
      result: {
        scores: item.scores,
        latency_ms: item.latency_ms,
        verdict: item.verdict,
        model: item.model,
      },
      output: item.response || null,
    }
    sessionStorage.setItem("evalforge_results", JSON.stringify([evalResponse]))
    sessionStorage.removeItem("evalforge_result")
    router.push("/results")
  }

  function runAgain() {
    sessionStorage.setItem("evalforge_prefill", JSON.stringify({ task: item.task, input: item.input }))
    router.push("/evaluate")
  }

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all",
      expanded ? "border-white/[0.1]" : "border-white/[0.06]",
      "bg-[#111118]"
    )}>
      {/* Row */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Verdict icon */}
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
          isPass ? "bg-emerald-500/10 ring-1 ring-emerald-500/20" : "bg-red-500/10 ring-1 ring-red-500/20"
        )}>
          {isPass
            ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            : <XCircle className="h-4 w-4 text-red-400" />
          }
        </div>

        {/* Task + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate font-medium">{item.task}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-slate-600 flex items-center gap-1">
              <Cpu className="h-2.5 w-2.5" />{formatModel(item.model)}
            </span>
            <span className="text-[11px] text-slate-600 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />{formatDate(item.created_at)}
            </span>
          </div>
        </div>

        {/* Score + verdict */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <span className={cn("text-sm font-bold tabular-nums", isPass ? "text-emerald-400" : "text-red-400")}>
            {score.toFixed(1)}
          </span>
          <span className={cn(
            "text-[10px] font-bold tracking-widest px-2 py-1 rounded-lg",
            isPass ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          )}>
            {item.verdict}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={viewResults}
            title="View full results"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Results</span>
          </button>
          <button
            onClick={runAgain}
            title="Run again with same task and input"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/[0.06] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Re-run</span>
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/[0.05] px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Left: scores + latency */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5">
              {Object.entries(item.scores).map(([dim, d]) => (
                <ScoreBar key={dim} label={dim} score={d.score} gate={dim === "safety"} />
              ))}
            </div>
            <div className="flex items-center gap-4 pt-1 border-t border-white/[0.04]">
              <span className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {item.latency_ms >= 1000
                  ? `${(item.latency_ms / 1000).toFixed(2)}s`
                  : `${Math.round(item.latency_ms)}ms`}
              </span>
              <span className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <Cpu className="h-3 w-3" />
                {formatModel(item.model)}
              </span>
            </div>
            {/* Justifications */}
            <div className="flex flex-col gap-2">
              {Object.entries(item.scores).map(([dim, d]) => d.justification ? (
                <div key={dim} className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1 capitalize">{dim}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{d.justification}</p>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Right: task, input, response */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Task</p>
              <p className="text-xs text-slate-400 leading-relaxed">{item.task}</p>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Input</p>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap line-clamp-6">{item.input}</p>
            </div>
            {item.response && (
              <>
                <div className="h-px bg-white/[0.04]" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Model response</p>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-8">{item.response}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const router = useRouter()
  const [evals, setEvals] = useState<EvalHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "PASS" | "FAIL">("all")

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push("/auth/login"); return }
    listEvaluations(token)
      .then(setEvals)
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false))
  }, [router])

  const filtered = filter === "all" ? evals : evals.filter((e) => e.verdict === filter)
  const passCount = evals.filter((e) => e.verdict === "PASS").length
  const failCount = evals.length - passCount

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-5 w-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">
          Eval{" "}
          <span className="font-display italic text-indigo-300">history</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">All your past evaluations. Expand to inspect scores, re-run, or view full results.</p>
      </div>

      {/* Stats + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-[#111118] px-4 py-2.5 text-center">
            <p className="text-xl font-bold text-slate-100">{evals.length}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Total</p>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-2.5 text-center">
            <p className="text-xl font-bold text-emerald-400">{passCount}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Passed</p>
          </div>
          <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-2.5 text-center">
            <p className="text-xl font-bold text-red-400">{failCount}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Failed</p>
          </div>
          {evals.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-[#111118] px-4 py-2.5 text-center">
              <p className="text-xl font-bold text-slate-100">
                {evals.length > 0 ? Math.round((passCount / evals.length) * 100) : 0}%
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">Pass rate</p>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-[#111118] p-1">
          {(["all", "PASS", "FAIL"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === v ? "bg-white/[0.08] text-slate-100" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {v === "all" ? "All" : v}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111118] px-6 py-16 text-center">
          <p className="text-slate-500 text-sm mb-3">
            {evals.length === 0 ? "No evaluations yet." : `No ${filter} evaluations.`}
          </p>
          {evals.length === 0 && (
            <Link
              href="/evaluate"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Run your first eval <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((item) => <EvalCard key={item.public_id} item={item} />)}
        </div>
      )}
    </div>
  )
}
