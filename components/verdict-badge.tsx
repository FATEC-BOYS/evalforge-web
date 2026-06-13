import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerdictBadgeProps {
  verdict: "PASS" | "FAIL"
  className?: string
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const isPass = verdict === "PASS"

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-2",
        "animate-[verdict-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]",
        className
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl ring-1",
          isPass
            ? "bg-green-500/10 ring-green-500/30"
            : "bg-red-500/10 ring-red-500/30"
        )}
      >
        {isPass ? (
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        ) : (
          <XCircle className="h-8 w-8 text-red-400" />
        )}
      </div>
      <span
        className={cn(
          "text-2xl font-bold tracking-widest",
          isPass ? "text-green-400" : "text-red-400"
        )}
      >
        {verdict}
      </span>
      <p className="text-xs text-slate-500 text-center max-w-[180px]">
        {isPass
          ? "All dimensions passed evaluation thresholds"
          : "One or more dimensions failed evaluation thresholds"}
      </p>
    </div>
  )
}
