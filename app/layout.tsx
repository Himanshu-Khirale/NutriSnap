import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Nutrisnap - Smart Food Analysis",
  description:
    "Upload photos of your meals and get instant nutrition analysis, tracking, and personalized health insights powered by AI.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${dmSans.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
        </Suspense>
        <script src='https://cdn.jotfor.ms/agent/embedjs/0199ce7086de7445a36a79fca4cf03faf2ea/embed.js'></script>
      </body>
    </html>
  )
}
