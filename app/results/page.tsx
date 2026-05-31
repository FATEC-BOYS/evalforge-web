"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EvalResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScoreBar } from "@/components/score-bar"
import { VerdictBadge } from "@/components/verdict-badge"
import { Clock } from "lucide-react"

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<EvalResponse | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("evalforge_result")
    if (!raw) {
      router.push("/evaluate")
      return
    }
    try {
      setResult(JSON.parse(raw))
    } catch {
      router.push("/evaluate")
    }
  }, [router])

  if (!result) return null

  const { request, result: evalResult } = result

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 flex flex-col gap-6">
      {/* Verdict */}
      <div className="flex items-center justify-center">
        <VerdictBadge verdict={evalResult.verdict} className="text-base px-6 py-2" />
      </div>

      {/* Request summary */}
      <Card>
        <CardHeader>
          <CardTitle>Request</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-gray-700">
          <div>
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">Model</span>
            <p className="mt-0.5 font-mono text-xs bg-gray-50 rounded px-2 py-1">{request.model}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">Task</span>
            <p className="mt-0.5 whitespace-pre-wrap">{request.task}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500 uppercase text-xs tracking-wide">Input</span>
            <p className="mt-0.5 whitespace-pre-wrap">{request.input}</p>
          </div>
        </CardContent>
      </Card>

      {/* Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Scores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ScoreBar
            dimension="Accuracy"
            score={evalResult.accuracy.score}
            justification={evalResult.accuracy.justification}
          />
          <ScoreBar
            dimension="Reasoning"
            score={evalResult.reasoning.score}
            justification={evalResult.reasoning.justification}
          />
          <ScoreBar
            dimension="Safety"
            score={evalResult.safety.score}
            justification={evalResult.safety.justification}
          />
        </CardContent>
      </Card>

      {/* Latency */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>Latency: <strong className="text-gray-700">{evalResult.latency_ms.toLocaleString()} ms</strong></span>
      </div>

      {/* CTA */}
      <Link href="/evaluate">
        <Button variant="outline" className="w-full">
          Evaluate again
        </Button>
      </Link>
    </div>
  )
}
