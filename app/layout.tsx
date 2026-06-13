import type { Metadata } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "EvalForge — LLM Evaluation Pipeline",
  description: "Multi-agent pipeline for systematic LLM evaluation — accuracy, reasoning, and safety.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans min-h-full flex flex-col bg-[#09090f]`}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
