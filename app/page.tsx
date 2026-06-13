import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BrainCircuit,
  BarChart3,
  Network,
  ShieldCheck,
  Cpu,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute left-1/4 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-violet-600/8 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-blue-600/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-3 py-1.5 text-xs font-medium text-indigo-300">
            <FlaskConical className="h-3 w-3" />
            Multi-agent evaluation pipeline
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-50 sm:text-6xl">
            eval<span className="text-indigo-400">forge</span>
          </h1>

          <p className="mt-5 text-base text-slate-400 leading-relaxed sm:text-lg">
            Run your LLM through a two-agent pipeline that scores{" "}
            <span className="text-slate-200">accuracy</span>,{" "}
            <span className="text-slate-200">reasoning</span>, and{" "}
            <span className="text-slate-200">safety</span> — and returns a hard{" "}
            <span className="text-green-400 font-medium">PASS</span>{" "}
            /{" "}
            <span className="text-red-400 font-medium">FAIL</span> verdict.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/evaluate">
              <Button size="lg" className="gap-2">
                Run an evaluation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pipeline diagram */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-white/[0.07] bg-slate-900/40 p-8">
            {/* Section label */}
            <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              How it works
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center w-40">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 ring-1 ring-white/[0.08]">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-slate-100">Executor</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Calls the selected LLM with your task and input. Measures latency and cost.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center sm:mt-4">
                <div className="hidden h-px w-12 bg-gradient-to-r from-slate-700 to-indigo-600/60 sm:block" />
                <div className="sm:hidden h-8 w-px bg-gradient-to-b from-slate-700 to-indigo-600/60" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center w-40">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 ring-1 ring-white/[0.08]">
                  <BrainCircuit className="h-5 w-5 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-slate-100">Evaluator</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  A second agent scores the response on 3 dimensions with justifications.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center sm:mt-4">
                <div className="hidden h-px w-12 bg-gradient-to-r from-indigo-600/60 to-green-600/60 sm:block" />
                <div className="sm:hidden h-8 w-px bg-gradient-to-b from-indigo-600/60 to-green-600/60" />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center w-40">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 ring-1 ring-green-500/30">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-sm font-semibold text-slate-100">Verdict</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  PASS if avg ≥ 7.0 and safety ≥ 9.0. Hard gate ensures safety is never skipped.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dimensions */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Evaluation dimensions
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-5">
              <BarChart3 className="mb-3 h-5 w-5 text-blue-400" />
              <p className="text-sm font-semibold text-slate-100">Accuracy</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Does the response correctly address the task? Threshold: ≥7.0
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-slate-800">
                  <div className="h-1 w-[70%] rounded-full bg-blue-500/60" />
                </div>
                <span className="text-[10px] text-slate-500 tabular-nums w-6">7.0</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 p-5">
              <BrainCircuit className="mb-3 h-5 w-5 text-violet-400" />
              <p className="text-sm font-semibold text-slate-100">Reasoning</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Is the logic coherent and well-structured? Threshold: ≥7.0
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-slate-800">
                  <div className="h-1 w-[70%] rounded-full bg-violet-500/60" />
                </div>
                <span className="text-[10px] text-slate-500 tabular-nums w-6">7.0</span>
              </div>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5">
              <ShieldCheck className="mb-3 h-5 w-5 text-green-400" />
              <p className="text-sm font-semibold text-slate-100">Safety</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Hard gate — harmful content forces FAIL regardless of other scores. Threshold: ≥9.0
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-slate-800">
                  <div className="h-1 w-[90%] rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-red-400 tabular-nums w-6 font-medium">9.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Built for teams
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.07] bg-slate-900/30 p-5 hover:border-white/[0.12] hover:bg-slate-900/50 transition-all">
              <Network className="mb-3 h-5 w-5 text-indigo-400" />
              <p className="text-sm font-semibold text-slate-100">Multi-provider</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Evaluate Claude, GPT-4o, and more. Factory routing by model prefix.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-slate-900/30 p-5 hover:border-white/[0.12] hover:bg-slate-900/50 transition-all">
              <BarChart3 className="mb-3 h-5 w-5 text-indigo-400" />
              <p className="text-sm font-semibold text-slate-100">Async pipeline</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Non-blocking Celery queue. Submit and poll — never wait on a slow model.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-slate-900/30 p-5 hover:border-white/[0.12] hover:bg-slate-900/50 transition-all">
              <BrainCircuit className="mb-3 h-5 w-5 text-indigo-400" />
              <p className="text-sm font-semibold text-slate-100">LangSmith tracing</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Every run is traced. Inspect agent steps, token counts, and latency in detail.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
