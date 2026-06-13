"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { evaluate, ApiError, EvalResponse } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Cpu, ArrowRight, Lock, Zap } from "lucide-react"

const MODELS = [
  {
    group: "Anthropic",
    icon: "⬡",
    color: "indigo",
    options: [
      { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", desc: "Fast & capable" },
      { value: "claude-opus-4-20250514", label: "Claude Opus 4", desc: "Most powerful" },
    ],
  },
  {
    group: "OpenAI",
    icon: "◎",
    color: "emerald",
    options: [
      { value: "gpt-4o", label: "GPT-4o", desc: "Flagship model" },
      { value: "gpt-4o-mini", label: "GPT-4o mini", desc: "Efficient & fast" },
    ],
  },
]

export default function EvaluatePage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [task, setTask] = useState("")
  const [input, setInput] = useState("")
  const [model, setModel] = useState(MODELS[0].options[0].value)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToken(getToken())
  }, [])

  async function handleSubmit() {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const result: EvalResponse = await evaluate({ task, input, model }, token)
      sessionStorage.setItem("evalforge_result", JSON.stringify(result))
      router.push("/results")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          removeToken()
          setToken(null)
          router.push("/auth/login")
          return
        }
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 ring-1 ring-white/[0.07] mx-auto">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-slate-400 mb-4 text-sm">Authentication required to run evaluations</p>
          <Link href="/auth/login">
            <Button>Login to continue</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-50">New evaluation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit a task and input to run through the multi-agent pipeline
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Task */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="task">
            Task
          </label>
          <textarea
            id="task"
            rows={3}
            placeholder="Describe what the agent should do — e.g. 'Summarize this conversation in one sentence.'"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border border-white/[0.09] bg-slate-900/70 px-4 py-3 text-sm text-slate-100",
              "placeholder:text-slate-600 transition-all resize-none",
              "focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-900",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <p className="text-right text-[11px] text-slate-600">{task.length} chars</p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="input">
            Input
          </label>
          <textarea
            id="input"
            rows={5}
            placeholder="The content the agent will process — a message, document, conversation, etc."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border border-white/[0.09] bg-slate-900/70 px-4 py-3 text-sm text-slate-100",
              "placeholder:text-slate-600 transition-all resize-none",
              "focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-900",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <p className="text-right text-[11px] text-slate-600">{input.length} chars</p>
        </div>

        {/* Model selector */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Model
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODELS.map((group) => (
              <div key={group.group} className="flex flex-col gap-1.5">
                <p className="text-[11px] font-medium text-slate-500 pl-1">{group.group}</p>
                {group.options.map((opt) => {
                  const isSelected = model === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setModel(opt.value)}
                      disabled={isLoading}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                        isSelected
                          ? "border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                          : "border-white/[0.07] bg-slate-900/40 hover:border-white/[0.12] hover:bg-slate-900/70",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      <div>
                        <p className={cn("text-sm font-medium", isSelected ? "text-indigo-200" : "text-slate-200")}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border-2 transition-all",
                          isSelected ? "border-indigo-400 bg-indigo-400" : "border-slate-600 bg-transparent"
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!task.trim() || !input.trim()}
          size="lg"
          className="w-full mt-1 gap-2"
        >
          {isLoading ? (
            <>
              <Cpu className="h-4 w-4 animate-pulse" />
              Running pipeline...
            </>
          ) : (
            <>
              Run evaluation
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {isLoading && (
          <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-4">
            <div className="flex flex-col gap-2">
              {["Executor agent calling model", "Evaluator agent scoring response", "Computing verdict"].map(
                (step, i) => (
                  <div key={step} className="flex items-center gap-2.5">
                    <div
                      className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                    <p className="text-xs text-slate-500">{step}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
          <Zap className="h-3 w-3" />
          <span>Rate limited to 10 evaluations/hour per account</span>
        </div>
      </div>
    </div>
  )
}
