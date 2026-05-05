"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Tractor, CalendarRange, Settings, Sprout } from "lucide-react"

const navigation = [
  { name: "ទិដ្ឋភាពទូទៅ", href: "/overview", icon: LayoutDashboard },
  { name: "ទ្រព្យសកម្ម", href: "/assets", icon: Tractor },
  { name: "កាលវិភាគ", href: "/schedules", icon: CalendarRange },
  { name: "ចំការ", href: "/farm", icon: Sprout },
  { name: "ការកំណត់", href: "/settings", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/25 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "flex h-screen w-64 flex-shrink-0 flex-col overflow-hidden text-white",
          "transition-transform duration-200 ease-out",
          // Mobile: fixed overlay, slides from left
          "fixed inset-y-0 left-0 z-40",
          // Desktop: static in normal flow
          "lg:relative lg:z-auto lg:translate-x-0 lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        style={{ background: "#0f3d1f" }}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="px-6 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#22c55e]">
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <span
                className="block text-[17px] font-black leading-tight tracking-tight text-white"
                style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}
              >
                ជំនួយការ
              </span>
              <span
                className="block text-[17px] font-black leading-tight tracking-tight text-white"
                style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}
              >
                កសិករ
              </span>
            </div>
          </div>

          <span
            className="mt-3 inline-block rounded px-2 py-0.5 text-[9px] font-semibold tracking-[1.5px]"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#86efac",
              fontFamily: "var(--font-inter), var(--font-kantumruy)",
            }}
          >
            ផតថល
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-100 ${
                  isActive
                    ? "bg-[#16a34a] text-white"
                    : "text-[#a3b8aa] hover:bg-[#1a4a2a] hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
              >
                <item.icon
                  className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-100 ${
                    isActive ? "text-white" : "text-[#7f9988] group-hover:text-white"
                  }`}
                  strokeWidth={2}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-4">
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-sm font-bold text-white">
              VS
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-sm font-semibold text-white"
                style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
              >
                Vuthy San
              </p>
              <p className="text-xs text-[#a3b8aa]" style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}>
                អ្នកគ្រប់គ្រងកសិដ្ឋាន
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
