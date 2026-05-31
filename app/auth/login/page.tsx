"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login, ApiError } from "@/lib/api"
import { saveToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!email || !password}
              className="w-full"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-indigo-600 hover:underline">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
