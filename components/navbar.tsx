"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getToken, removeToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Zap, History, LogOut, FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/evaluate", label: "Evaluate" },
  { href: "/account", label: "History" },
]

export function Navbar() {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setToken(getToken())
  }, [])

  function handleLogout() {
    removeToken()
    setToken(null)
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

          <div className="mx-2 h-4 w-px bg-white/[0.08]" />

          {token ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
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
