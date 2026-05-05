import type { Metadata } from "next"
import { Playfair_Display, Inter, Kantumruy_Pro } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kasekor Helper",
  description: "Internal team portal",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${kantumruy.variable} h-full antialiased`}>
      <body className="h-full" style={{ fontFamily: "var(--font-inter), var(--font-kantumruy), system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
