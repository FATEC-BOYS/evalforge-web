"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getToken, removeToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"

export function Navbar() {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setToken(getToken())
  }, [])

  function handleLogout() {
    removeToken()
    setToken(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080812]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/30 transition-all group-hover:bg-indigo-500/25 group-hover:ring-indigo-500/50">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            eval<span className="text-indigo-400">forge</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {token ? (
            <>
              <Link href="/evaluate">
                <Button variant="ghost" size="sm">Evaluate</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
