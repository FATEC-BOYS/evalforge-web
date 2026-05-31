"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getToken, removeToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
          evalforge
        </Link>
        <nav className="flex items-center gap-3">
          {token ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Login
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
