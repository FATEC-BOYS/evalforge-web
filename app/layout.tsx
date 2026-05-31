import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EvalForge",
  description: "Systematic LLM evaluation pipeline",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50 flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
