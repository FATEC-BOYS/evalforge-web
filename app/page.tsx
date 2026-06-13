import Link from "next/link"
import {
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react"

const DIMENSIONS = [
  {
    icon: BarChart3,
    label: "Accuracy",
    desc: "Does the response correctly address the task?",
    threshold: "≥ 7.0",
    color: "text-blue-400",
    bar: "bg-blue-400",
    pct: 70,
  },
  {
    icon: BrainCircuit,
    label: "Reasoning",
    desc: "Is the logic coherent and well-structured?",
    threshold: "≥ 7.0",
    color: "text-violet-400",
    bar: "bg-violet-400",
    pct: 70,
  },
  {
    icon: ShieldCheck,
    label: "Safety",
    desc: "Hard gate — harmful content forces FAIL regardless of other scores.",
    threshold: "≥ 9.0",
    color: "text-emerald-400",
    bar: "bg-emerald-400",
    pct: 90,
    isGate: true,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#09090f)]" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-20">

            {/* Left: copy */}
            <div className="flex-1 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-3 py-1.5 text-xs font-medium text-indigo-300">
                <Zap className="h-3 w-3" />
                Multi-agent evaluation pipeline
              </div>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
                <span className="font-display italic text-indigo-300">Score</span>{" "}
                your LLMs<br />
                <span className="text-slate-300">before they</span>{" "}
                <span className="font-display italic">ship.</span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-slate-400 max-w-xl">
                A two-agent pipeline that evaluates any LLM response on{" "}
                <span className="text-slate-200">accuracy</span>,{" "}
                <span className="text-slate-200">reasoning</span>, and{" "}
                <span className="text-slate-200">safety</span> —
                returning a hard{" "}
                <span className="text-emerald-400 font-medium">PASS</span>{" "}
                or{" "}
                <span className="text-red-400 font-medium">FAIL</span>{" "}
                verdict with justifications.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/evaluate"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
                >
                  Run an evaluation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.07] hover:text-white transition-colors"
                >
                  Create account — free
                </Link>
              </div>
            </div>

            {/* Right: result card mockup */}
            <div className="mt-14 lg:mt-0 flex-shrink-0 w-full max-w-xs mx-auto lg:mx-0">
              <div className="rounded-2xl border border-white/[0.07] bg-[#111118] shadow-2xl shadow-black/40 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Evaluation result</span>
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/60" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/60" />
                    <div className="h-2 w-2 rounded-full bg-green-500/60" />
                  </div>
                </div>

                {/* Verdict */}
                <div className="px-4 py-4 border-b border-white/[0.05] flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-widest text-emerald-400">PASS</p>
                    <p className="text-[11px] text-slate-500">All dimensions passed</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-emerald-400">9.4</p>
                    <p className="text-[10px] text-slate-500">avg / 10</p>
                  </div>
                </div>

                {/* Scores */}
                <div className="px-4 py-3 flex flex-col gap-2.5">
                  {[
                    { label: "Accuracy", score: 9.2, color: "bg-blue-400" },
                    { label: "Reasoning", score: 9.0, color: "bg-violet-400" },
                    { label: "Safety", score: 10.0, color: "bg-emerald-400" },
                  ].map(({ label, score, color }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-200">{score.toFixed(1)}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/[0.06]">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Claude Sonnet 4</span>
                  <span className="text-[11px] text-slate-500">5.1s</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.05]" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">How it works</p>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: Cpu,
                iconColor: "text-indigo-400",
                bg: "bg-indigo-500/10",
                ring: "ring-indigo-500/20",
                title: "Executor agent",
                desc: "Calls the selected LLM with your task and input. Measures latency and cost.",
              },
              {
                step: "02",
                icon: BrainCircuit,
                iconColor: "text-violet-400",
                bg: "bg-violet-500/10",
                ring: "ring-violet-500/20",
                title: "Evaluator agent",
                desc: "A second agent scores the response across 3 dimensions with written justifications.",
              },
              {
                step: "03",
                icon: CheckCircle2,
                iconColor: "text-emerald-400",
                bg: "bg-emerald-500/10",
                ring: "ring-emerald-500/20",
                title: "Verdict",
                desc: "PASS if avg ≥ 7.0 and safety ≥ 9.0. Safety is a hard gate — never skipped.",
              },
            ].map(({ step, icon: Icon, iconColor, bg, ring, title, desc }) => (
              <div key={step} className="rounded-2xl border border-white/[0.06] bg-[#111118] p-6 relative overflow-hidden">
                <span className="absolute top-4 right-5 text-[11px] font-mono text-white/[0.06] font-bold">{step}</span>
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${bg} ring-1 ${ring}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <p className="text-sm font-semibold text-slate-100 mb-1.5">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dimensions ── */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3">
            <h2 className="text-2xl font-semibold text-slate-100">
              Three dimensions,{" "}
              <span className="font-display italic text-indigo-300">one verdict.</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Every eval is scored across three axes. Safety is a hard gate.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {DIMENSIONS.map(({ icon: Icon, label, desc, threshold, color, bar, pct, isGate }) => (
              <div
                key={label}
                className={`rounded-2xl border p-5 ${isGate ? "border-emerald-500/15 bg-emerald-500/[0.03]" : "border-white/[0.06] bg-[#111118]"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`h-5 w-5 ${color}`} />
                  {isGate && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Hard gate
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-100">{label}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-white/[0.06]">
                    <div className={`h-full rounded-full ${bar}/60`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[11px] font-semibold tabular-nums ${color}`}>{threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-100">
                Ready to{" "}
                <span className="font-display italic text-indigo-300">evaluate?</span>
              </h3>
              <p className="mt-1 text-sm text-slate-500">Free tier — 10 evaluations per hour.</p>
            </div>
            <Link
              href="/auth/register"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
            >
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
