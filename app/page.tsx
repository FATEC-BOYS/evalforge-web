import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BrainCircuit, BarChart3, Network } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            eval<span className="text-indigo-600">forge</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A multi-agent pipeline for systematic LLM evaluation — accuracy, reasoning, and safety, all in one run.
          </p>
          <div className="mt-8">
            <Link href="/evaluate">
              <Button size="lg">Try it now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold text-gray-900 mb-10">
            What EvalForge does
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <Network className="h-8 w-8 text-indigo-500 mb-1" />
                <CardTitle>Multi-agent pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Orchestrates multiple specialized agents to run, judge, and score your LLM responses in parallel.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-indigo-500 mb-1" />
                <CardTitle>Systematic evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Scores responses across accuracy, reasoning quality, and safety — with justifications for every dimension.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BrainCircuit className="h-8 w-8 text-indigo-500 mb-1" />
                <CardTitle>LangSmith tracing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Every run is traced in LangSmith so you can inspect agent steps, token usage, and latency in detail.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
