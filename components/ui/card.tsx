import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  )
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none text-gray-900", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  )
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
