"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getToken, removeToken } from "@/lib/auth"
import { getUsage, UsageInfo } from "@/lib/api"
import { useRouter } from "next/navigation"
import { LogOut, FlaskConical, Zap, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/evaluate", label: "Evaluate" },
  { href: "/history", label: "History" },
]

function RateBadge({ usage }: { usage: UsageInfo }) {
  if (usage.tier === "pro") return null
  const pct = usage.used / usage.limit
  if (pct < 0.7) return null // only show when ≥70% used

  const isOut = usage.remaining === 0
  const isWarn = pct >= 0.9

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border",
      isOut
        ? "text-red-400 bg-red-500/[0.08] border-red-500/20"
        : isWarn
          ? "text-yellow-400 bg-yellow-500/[0.08] border-yellow-500/20"
          : "text-slate-400 bg-white/[0.04] border-white/[0.06]"
    )}>
      <Zap className="h-3 w-3" />
      {isOut ? "Limit reached" : `${usage.remaining} left`}
    </div>
  )
}

export function Navbar() {
  const [token, setToken] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Re-read token on every route change so navbar updates right after login/logout
  useEffect(() => {
    setToken(getToken())
  }, [pathname])

  // Fetch usage once on mount
  useEffect(() => {
    const t = getToken()
    if (!t) return
    getUsage(t).then(setUsage).catch(() => null)
  }, [])

  // Refresh usage after /results where evals are consumed
  useEffect(() => {
    if (pathname === "/results") {
      const t = getToken()
      if (t) getUsage(t).then(setUsage).catch(() => null)
    }
  }, [pathname])

  function handleLogout() {
    removeToken()
    setToken(null)
    setUsage(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090f]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/25 transition-all group-hover:ring-indigo-500/50">
            <FlaskConical className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="text-[15px] tracking-tight text-slate-100">
            <span className="font-medium">eval</span>
            <span className="font-display italic text-indigo-300">forge</span>
          </span>
        </Link>

        {/* Nav + actions */}
        <div className="flex items-center gap-1">
          {token && NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              <button className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname === href
                  ? "text-slate-100 bg-white/[0.07]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              )}>
                {label}
              </button>
            </Link>
          ))}

          {/* Rate limit badge */}
          {usage && <RateBadge usage={usage} />}

          <div className="mx-2 h-4 w-px bg-white/[0.08]" />

          {token ? (
            <div className="flex items-center gap-1">
              <Link href="/account">
                <button className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname === "/account"
                    ? "text-slate-100 bg-white/[0.07]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                )}>
                  <User className="h-3.5 w-3.5" />
                  Account
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="ml-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-400 text-white transition-colors">
                  Get started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
