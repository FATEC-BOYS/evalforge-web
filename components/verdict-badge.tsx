import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerdictBadgeProps {
  verdict: "PASS" | "FAIL"
  className?: string
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const isPass = verdict === "PASS"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold",
        isPass
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800",
        className
      )}
    >
      {isPass ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      {verdict}
    </span>
  )
}
