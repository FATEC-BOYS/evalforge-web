"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getMe, getUsage, UserProfile, UsageInfo } from "@/lib/api"
import { getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { User, CreditCard, Zap, Shield } from "lucide-react"

const SECTIONS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "plan", label: "Plan & Usage", icon: CreditCard },
] as const

type Section = typeof SECTIONS[number]["key"]

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100)
  const color = pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-yellow-400" : "bg-indigo-400"
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-slate-500">Evaluations used this hour</span>
        <span className="text-xs font-semibold text-slate-300 tabular-nums">{used} / {limit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06]">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-600">
        {limit - used} remaining · resets every hour
      </p>
    </div>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>("profile")

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push("/auth/login"); return }
    Promise.all([getMe(token), getUsage(token)])
      .then(([p, u]) => { setProfile(p); setUsage(u) })
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

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">
          My{" "}
          <span className="font-display italic text-indigo-300">account</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">Manage your profile, plan and usage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Sidebar nav */}
        <nav className="rounded-2xl border border-white/[0.06] bg-[#111118] p-2 flex flex-col gap-0.5 lg:sticky lg:top-20">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                section === key
                  ? "bg-white/[0.07] text-slate-100 font-medium"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-4">

          {section === "profile" && profile && (
            <>
              <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.05]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Identity</p>
                </div>
                <div className="px-5 py-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Email</span>
                    <span className="text-sm text-slate-200">{profile.email}</span>
                  </div>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">User ID</span>
                    <span className="text-[11px] text-slate-600 font-mono">{profile.public_id}</span>
                  </div>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  {profile.is_admin && (
                    <>
                      <div className="h-px bg-white/[0.04]" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Role</span>
                        <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {section === "plan" && profile && usage && (
            <>
              {/* Current plan */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.05]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Plan</p>
                </div>
                <div className="px-5 py-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Current plan</span>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide",
                      profile.tier === "pro"
                        ? "text-indigo-300 bg-indigo-500/15"
                        : "text-slate-400 bg-white/[0.06]"
                    )}>
                      {profile.tier}
                    </span>
                  </div>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Rate limit</span>
                    <span className="text-sm text-slate-300">
                      {profile.tier === "pro" ? "Unlimited" : `${usage.limit} evals / hour`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Usage */}
              {profile.tier !== "pro" && (
                <div className="rounded-2xl border border-white/[0.06] bg-[#111118] overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/[0.05]">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Usage this hour</p>
                  </div>
                  <div className="px-5 py-4">
                    <UsageBar used={usage.used} limit={usage.limit} />
                    {usage.remaining === 0 && (
                      <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
                        <p className="text-xs text-red-400">
                          Rate limit reached. Resets in{" "}
                          <span className="font-semibold">
                            {Math.ceil(usage.resets_in / 60)} min
                          </span>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upgrade CTA */}
              {profile.tier === "free" && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] px-5 py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/25 flex-shrink-0 mt-0.5">
                      <Zap className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">Upgrade to Pro</p>
                      <p className="text-xs text-slate-500 mt-0.5 mb-3">Remove rate limits and unlock priority access.</p>
                      <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium px-3 py-1.5 transition-colors">
                        <Zap className="h-3 w-3" /> Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
