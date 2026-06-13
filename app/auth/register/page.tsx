"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register, ApiError } from "@/lib/api"
import { saveToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) errors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address"
    if (!password) errors.password = "Password is required"
    else if (password.length < 8) errors.password = "Password must be at least 8 characters"
    return errors
  }

  async function handleSubmit() {
    setError(null)
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setIsLoading(true)
    try {
      const { access_token } = await register(email, password)
      saveToken(access_token)
      router.push("/evaluate")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError("An account with this email already exists.")
        else if (err.status === 422) setError("Invalid email or password format.")
        else if (err.status >= 500) setError("Server error. Please try again in a moment.")
        else setError(err.message)
      } else {
        setError("Unable to connect. Check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-50">
              eval<span className="text-indigo-400">forge</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Create your account</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 pl-0.5">{fieldErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })) }}
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-400 pl-0.5">{fieldErrors.password}</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              className="w-full mt-1"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
