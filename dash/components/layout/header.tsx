"use client"

import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "ទិដ្ឋភាពទូទៅ", subtitle: "សេចក្តីសង្ខេបហ្វូង/ដំណាំ និងការជូនដំណឹងដែលរង់ចាំ" },
  "/dashboard/assets": { title: "ទ្រព្យសកម្ម", subtitle: "ហ្វូង/ដំណាំដែលបានចុះឈ្មោះទាំងអស់" },
  "/dashboard/schedules": { title: "កាលវិភាគ", subtitle: "កាលវិភាគថែទាំ MAFF តាមប្រភេទទ្រព្យសកម្ម" },
  "/dashboard/settings": { title: "ការកំណត់", subtitle: "ការកំណត់គណនី និងប្រព័ន្ធ" },
}

const ALERT_COUNT = 3

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const meta = pageMeta[pathname ?? ""] ?? { title: "ផ្ទាំងគ្រប់គ្រង", subtitle: "" }

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#e5e5e0] bg-[#fafaf8] px-4 sm:h-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          aria-label="បើកម៉ឺនុយ"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#666] transition-colors hover:bg-[#f0ece8] hover:text-[#333] lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a34a]"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>

        <div>
          <h1
            className="text-base font-bold leading-tight tracking-tight text-[#111] sm:text-lg"
            style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}
          >
            {meta.title}
          </h1>
          <p
            className="hidden text-[11px] text-[#999] sm:block"
            style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
          >
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <span
          className="hidden text-xs font-medium text-[#999] md:block"
          style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
        >
          {formattedDate}
        </span>

        <button
          aria-label={`ការជូនដំណឹង (${ALERT_COUNT})`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e0] text-[#666] transition-colors hover:border-[#a3b8aa] hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a34a]"
        >
          <Bell size={15} strokeWidth={1.75} />
          {ALERT_COUNT > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#dc2626] text-[9px] font-bold text-white ring-2 ring-[#fafaf8]">
              {ALERT_COUNT > 9 ? "9+" : ALERT_COUNT}
            </span>
          )}
        </button>

        <div className="h-5 w-px bg-[#e5e5e0]" />

        <button
          aria-label="ទម្រង់អ្នកប្រើប្រាស់"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16a34a] text-[13px] font-bold text-white transition-colors hover:bg-[#165a2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a34a]"
          style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
        >
          VS
        </button>
      </div>
    </header>
  )
}
