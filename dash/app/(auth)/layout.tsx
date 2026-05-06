"use client"

import { ReactNode, useState } from "react"
import { Sidebar } from "~/components/layout/sidebar"
import { Header } from "~/components/layout/header"
import { AuthGate } from "~/components/layout/auth-gate"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthGate>
      <div className="flex h-screen w-full overflow-hidden bg-[#fafaf8]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGate>
  )
}
