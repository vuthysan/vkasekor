import { Kantumruy_Pro } from "next/font/google"
import type { ReactNode } from "react"

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
})

export default function FarmLayout({ children }: { children: ReactNode }) {
  return (
    <div className={kantumruy.variable} lang="km">
      {children}
    </div>
  )
}
