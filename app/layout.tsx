import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Boomi Weather Predection",
  description: "Get real-time weather updates and forecasts for any location",
    generator: ''
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {children}
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'