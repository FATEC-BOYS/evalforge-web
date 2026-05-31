"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { evaluate, ApiError, EvalResponse } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const MODELS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { value: "claude-opus-4-20250514", label: "Claude Opus 4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
]

export default function EvaluatePage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [task, setTask] = useState("")
  const [input, setInput] = useState("")
  const [model, setModel] = useState(MODELS[0].value)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToken(getToken())
  }, [])

  async function handleSubmit() {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const result: EvalResponse = await evaluate({ task, input, model }, token)
      sessionStorage.setItem("evalforge_result", JSON.stringify(result))
      router.push("/results")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          removeToken()
          setToken(null)
          router.push("/auth/login")
          return
        }
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to evaluate</p>
          <Link href="/auth/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>New Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="task">
              Task
            </label>
            <textarea
              id="task"
              rows={3}
              placeholder="What should the agent do?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="input">
              Input
            </label>
            <textarea
              id="input"
              rows={4}
              placeholder="Content for the agent to process"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="model">
              Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!task.trim() || !input.trim()}
            size="lg"
            className="w-full mt-1"
          >
            {isLoading ? "Evaluating..." : "Run Evaluation"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
