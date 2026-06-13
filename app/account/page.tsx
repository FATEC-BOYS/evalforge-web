"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMe, listEvaluations, UserProfile, EvalHistoryItem } from "@/lib/api"
import { getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Clock, Cpu, CheckCircle2, XCircle, ChevronDown, ChevronUp, User, History } from "lucide-react"

function formatModel(model: string) {
  return model.startsWith("claude")
    ? model.replace("claude-", "Claude ").replace(/-\d{8}$/, "")
    : model
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function avgScore(scores: EvalHistoryItem["scores"]) {
  const vals = Object.values(scores)
  return vals.reduce((s, d) => s + d.score, 0) / Math.max(vals.length, 1)
}

function EvalRow({ item }: { item: EvalHistoryItem }) {
  const [expanded, setExpanded] = useState(false)
  const isPass = item.verdict === "PASS"
  const avg = avgScore(item.scores)

  return (
    <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        {isPass
          ? <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
          : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate">{item.task}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatModel(item.model)} · {formatDate(item.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={cn("text-sm font-bold tabular-nums", isPass ? "text-green-400" : "text-red-400")}>
            {avg.toFixed(1)}
          </span>
          {expanded
            ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
            : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          }
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.05] px-4 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Input</p>
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-6">{item.input}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Object.entries(item.scores).map(([dim, d]) => {
              const color = d.score >= 8 ? "text-green-400" : d.score >= 6 ? "text-yellow-400" : "text-red-400"
              return (
                <div key={dim} className="rounded-lg border border-white/[0.05] bg-slate-800/40 px-3 py-2">
                  <p className="text-[10px] text-slate-500 capitalize mb-1">{dim}</p>
                  <p className={cn("text-sm font-bold tabular-nums", color)}>{d.score.toFixed(1)}</p>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.latency_ms >= 1000
                ? `${(item.latency_ms / 1000).toFixed(2)}s`
                : `${Math.round(item.latency_ms)}ms`}
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {formatModel(item.model)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [evals, setEvals] = useState<EvalHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"history" | "account">("history")

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push("/auth/login"); return }

    Promise.all([getMe(token), listEvaluations(token)])
      .then(([p, e]) => { setProfile(p); setEvals(e) })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-5 w-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  const passCount = evals.filter((e) => e.verdict === "PASS").length
  const failCount = evals.length - passCount

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-slate-900/40 p-1">
        {([
          { key: "history", label: "History", icon: History },
          { key: "account", label: "Account", icon: User },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              tab === key
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "history" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.07] bg-slate-900/40 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-slate-100">{evals.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Total</p>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-green-400">{passCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Passed</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-red-400">{failCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Failed</p>
            </div>
          </div>

          {/* List */}
          {evals.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 px-6 py-12 text-center">
              <p className="text-slate-500 text-sm">No evaluations yet.</p>
              <Link href="/evaluate" className="mt-3 inline-block text-sm text-indigo-400 hover:text-indigo-300">
                Run your first eval →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {evals.map((item) => (
                <EvalRow key={item.public_id} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "account" && profile && (
        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Account</p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Email</span>
              <span className="text-sm text-slate-200">{profile.email}</span>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Plan</span>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide",
                profile.tier === "pro"
                  ? "text-indigo-300 bg-indigo-500/15"
                  : "text-slate-400 bg-slate-700/50"
              )}>
                {profile.tier}
              </span>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">User ID</span>
              <span className="text-[11px] text-slate-500 font-mono">{profile.public_id}</span>
            </div>
            {profile.is_admin && (
              <>
                <div className="h-px bg-white/[0.04]" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Role</span>
                  <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">Admin</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
