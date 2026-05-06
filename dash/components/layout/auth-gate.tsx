"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch, ApiError } from "~/lib/api"

type Status = "checking" | "authenticated"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>("checking")

  useEffect(() => {
    let cancelled = false

    apiFetch("/api/auth/me")
      .then(() => {
        if (!cancelled) setStatus("authenticated")
      })
      .catch(() => {
        if (cancelled) return
        // Anything that isn't 200 from /me — 401 (no session), 404 (deleted user
        // record), network failure — is treated as "not authenticated" and we
        // bounce to login.
        router.replace("/")
      })

    return () => {
      cancelled = true
    }
  }, [router])

  if (status === "checking") {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ background: "var(--color-rice-parchment)" }}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e0] border-t-[#16a34a]" />
      </div>
    )
  }

  return <>{children}</>
}
