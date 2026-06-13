import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EvalForge — LLM Evaluation Pipeline",
  description: "Multi-agent pipeline for systematic LLM evaluation — accuracy, reasoning, and safety.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#080812]`}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
