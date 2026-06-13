"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login, ApiError } from "@/lib/api"
import { saveToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setIsLoading(true)
    setError(null)
    try {
      const { access_token } = await login(email, password)
      saveToken(access_token)
      router.push("/evaluate")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-50">
              eval<span className="text-indigo-400">forge</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Sign in to your account</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!email || !password}
              className="w-full mt-1"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
