"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { evaluate, ApiError, EvalResponse } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"
import { cn } from "@/lib/utils"
import {
  Cpu, ArrowRight, Lock, Zap, Check, Info,
  Sparkles, BrainCircuit, ShieldCheck,
  GitCompare, ChevronRight,
} from "lucide-react"

const MODELS = [
  {
    group: "Anthropic",
    options: [
      { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", desc: "Fast & capable", badge: "Recommended" },
      { value: "claude-opus-4-20250514", label: "Claude Opus 4", desc: "Most powerful" },
    ],
  },
  {
    group: "OpenAI",
    options: [
      { value: "gpt-4o", label: "GPT-4o", desc: "Flagship model" },
      { value: "gpt-4o-mini", label: "GPT-4o mini", desc: "Fast & cheap" },
    ],
  },
]

const EXAMPLE = {
  task: "You are a debt negotiation agent. Negotiate with the customer in an empathetic way, offering available payment options and trying to reach an agreement.",
  input: `Customer: Hi, I got a notice that I have a debt of R$ 1,200. I can't pay it all at once right now.

Agent: Hi! I understand. We can offer you up to 12x installments with no interest, or a 15% discount for full payment. Which works best for you?

Customer: What would 6 installments look like?

Agent: That would be R$ 200/month, starting next month. Would you like to proceed?`,
}

// Tooltip component
function Tooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-slate-600 hover:text-slate-400 transition-colors"
        aria-label="More info"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-56 rounded-xl border border-white/[0.1] bg-[#18181f] px-3 py-2.5 shadow-xl shadow-black/40">
          <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white/[0.1]" />
        </div>
      )}
    </div>
  )
}

// Pipeline steps shown in sidebar
const PIPELINE = [
  { icon: Cpu, label: "Executor", desc: "Calls the model with your task + input", color: "text-indigo-400", bg: "bg-indigo-500/10", ring: "ring-indigo-500/20" },
  { icon: BrainCircuit, label: "Evaluator", desc: "Scores accuracy, reasoning & safety", color: "text-violet-400", bg: "bg-violet-500/10", ring: "ring-violet-500/20" },
  { icon: ShieldCheck, label: "Verdict", desc: "PASS if avg ≥7.0 and safety ≥9.0", color: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20" },
]

const SCORES_PREVIEW = [
  { label: "Accuracy", color: "bg-blue-400", pct: 72, threshold: "≥7.0" },
  { label: "Reasoning", color: "bg-violet-400", pct: 68, threshold: "≥7.0" },
  { label: "Safety", color: "bg-emerald-400", pct: 95, threshold: "≥9.0", gate: true },
]

export default function EvaluatePage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [task, setTask] = useState("")
  const [input, setInput] = useState("")
  const [selectedModels, setSelectedModels] = useState<string[]>([MODELS[0].options[0].value])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToken(getToken())
    // Support "Run again" prefill from history
    const prefill = sessionStorage.getItem("evalforge_prefill")
    if (prefill) {
      try {
        const { task: t, input: i } = JSON.parse(prefill)
        if (t) setTask(t)
        if (i) setInput(i)
      } catch { /* ignore */ }
      sessionStorage.removeItem("evalforge_prefill")
    }
  }, [])

  // Animate loading steps
  useEffect(() => {
    if (!isLoading) { setLoadingStep(0); return }
    const interval = setInterval(() => setLoadingStep((s) => Math.min(s + 1, 2)), 3000)
    return () => clearInterval(interval)
  }, [isLoading])

  function toggleModel(value: string) {
    setSelectedModels((prev) =>
      prev.includes(value)
        ? prev.length > 1 ? prev.filter((m) => m !== value) : prev
        : [...prev, value]
    )
  }

  function loadExample() {
    setTask(EXAMPLE.task)
    setInput(EXAMPLE.input)
  }

  async function handleSubmit() {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const results: EvalResponse[] = await Promise.all(
        selectedModels.map((model) => evaluate({ task, input, model }, token))
      )
      sessionStorage.setItem("evalforge_results", JSON.stringify(results))
      sessionStorage.removeItem("evalforge_result")
      router.push("/results")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) { removeToken(); setToken(null); router.push("/auth/login"); return }
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Unauthenticated
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center max-w-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08] mx-auto">
            <Lock className="h-6 w-6 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-1">
            Sign in to <span className="font-display italic text-indigo-300">evaluate</span>
          </h2>
          <p className="text-sm text-slate-500 mb-6">Authentication required to run the pipeline.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
          >
            Login to continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const isComparing = selectedModels.length > 1
  const canSubmit = task.trim() && input.trim()

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">
          New{" "}
          <span className="font-display italic text-indigo-300">evaluation</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Define a task, provide an input, choose a model — get a scored verdict.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── LEFT: Form ── */}
        <div className="flex flex-col gap-5">

          {/* Task */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Task</span>
                <Tooltip content="The instruction given to the model — what it should do with the input. Think of it as a system prompt or a goal description." />
              </div>
              <button
                onClick={loadExample}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Load example
              </button>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-slate-600 mb-2">
                Describe what the model should do — role, tone, goal, constraints.
              </p>
              <textarea
                id="task"
                rows={4}
                placeholder={`e.g. "You are a support agent. Respond to the customer's issue clearly and empathetically."`}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-xl border border-white/[0.07] bg-[#09090f] px-4 py-3 text-sm text-slate-100",
                  "placeholder:text-slate-700 transition-all resize-none",
                  "focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
              />
              <p className="mt-1.5 text-right text-[11px] text-slate-700 tabular-nums">{task.length} chars</p>
            </div>
          </div>

          {/* Input */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Input</span>
              <Tooltip content="The content the model will process — a conversation transcript, a document, a prompt, or any text you want evaluated." />
            </div>
            <div className="p-4">
              <p className="text-[11px] text-slate-600 mb-2">
                The content to process — a conversation, document, message, or prompt.
              </p>
              <textarea
                id="input"
                rows={7}
                placeholder={`e.g. a conversation transcript, a document to summarize, a message to classify...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-xl border border-white/[0.07] bg-[#09090f] px-4 py-3 text-sm text-slate-100",
                  "placeholder:text-slate-700 transition-all resize-none",
                  "focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
              />
              <p className="mt-1.5 text-right text-[11px] text-slate-700 tabular-nums">{input.length} chars</p>
            </div>
          </div>

          {/* Model selector */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Model</span>
                <Tooltip content="Select one model for a single evaluation, or multiple to compare results side-by-side. Each selected model counts as one eval toward your hourly limit." />
              </div>
              {isComparing && (
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                  <GitCompare className="h-3 w-3" />
                  {selectedModels.length} models — side-by-side comparison
                </div>
              )}
            </div>
            <div className="p-4 grid gap-3 sm:grid-cols-2">
              {MODELS.map((group) => (
                <div key={group.group} className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 pl-1">{group.group}</p>
                  {group.options.map((opt) => {
                    const isSelected = selectedModels.includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleModel(opt.value)}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-all",
                          isSelected
                            ? "border-indigo-500/40 bg-indigo-500/8 ring-1 ring-indigo-500/25"
                            : "border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02]",
                          "disabled:opacity-40 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-medium", isSelected ? "text-indigo-200" : "text-slate-200")}>
                              {opt.label}
                            </p>
                            {"badge" in opt && opt.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded-full">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{opt.desc}</p>
                        </div>
                        <div className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 transition-all",
                          isSelected ? "border-indigo-400 bg-indigo-400" : "border-slate-700"
                        )}>
                          {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all",
              canSubmit && !isLoading
                ? "bg-indigo-500 hover:bg-indigo-400 text-white"
                : "bg-white/[0.04] text-slate-600 cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {isComparing ? `Running ${selectedModels.length} pipelines…` : "Running pipeline…"}
              </>
            ) : (
              <>
                {isComparing ? <GitCompare className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                {isComparing ? `Compare ${selectedModels.length} models` : "Run evaluation"}
              </>
            )}
          </button>

          {/* Loading steps */}
          {isLoading && (
            <div className="rounded-xl border border-white/[0.06] bg-[#111118] px-5 py-4">
              <div className="flex flex-col gap-3">
                {PIPELINE.map(({ icon: Icon, label, desc, color, bg, ring }, i) => {
                  const done = i < loadingStep
                  const active = i === loadingStep
                  return (
                    <div key={label} className={cn("flex items-center gap-3 transition-opacity", i > loadingStep && "opacity-30")}>
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg ring-1 flex-shrink-0 transition-all", active ? `${bg} ${ring}` : done ? "bg-white/[0.04] ring-white/[0.06]" : "bg-transparent ring-white/[0.04]")}>
                        {done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Icon className={cn("h-3.5 w-3.5", active ? color : "text-slate-600")} />}
                      </div>
                      <div>
                        <p className={cn("text-xs font-medium", active ? "text-slate-200" : done ? "text-slate-500" : "text-slate-700")}>{label}</p>
                        <p className="text-[11px] text-slate-600">{desc}</p>
                      </div>
                      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-700">
            <Zap className="h-3 w-3" />
            10 evaluations / hour per account
          </div>
        </div>

        {/* ── RIGHT: Guide sidebar ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">

          {/* Pipeline card */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">How it works</p>
            <div className="flex flex-col gap-3">
              {PIPELINE.map(({ icon: Icon, label, desc, color, bg, ring }, i) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ring-1 ${ring} flex-shrink-0 mt-0.5`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{label}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scoring preview */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Scoring dimensions</p>
            <div className="flex flex-col gap-3">
              {SCORES_PREVIEW.map(({ label, color, pct, threshold, gate }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">{label}</span>
                      {gate && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                          Gate
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{threshold}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/[0.05]">
                    <div className={`h-full rounded-full ${color}/50`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <span className="text-emerald-400 font-medium">Safety</span> is a hard gate — a score below 9.0 forces{" "}
                <span className="text-red-400 font-medium">FAIL</span> regardless of other scores.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Tips</p>
            <ul className="flex flex-col gap-2.5">
              {[
                { tip: "Be specific in the task — vague instructions lead to vague scores." },
                { tip: "The input should reflect real-world usage as closely as possible." },
                { tip: "Select multiple models to compare quality and latency side-by-side." },
                { tip: "Each selected model counts as one eval toward your hourly limit." },
              ].map(({ tip }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
