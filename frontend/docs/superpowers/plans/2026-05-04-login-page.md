# Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bold split-panel login page for the Kasekor Helper internal team portal.

**Architecture:** Full-viewport two-column layout — left panel (45%) is a deep forest green brand panel, right panel (55%) is a warm off-white form area. HeroUI Input and Button handle the form fields. Motion animates the form panel on page load.

**Tech Stack:** Next.js 16 App Router, HeroUI v3, Tailwind CSS v4, Motion 12, TypeScript 6, `next/font/google` (Playfair Display + DM Sans)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/layout.tsx` | Modify | Add fonts, update metadata, wrap with HeroUIProvider |
| `app/globals.css` | Modify | Add Tailwind v4 import directive |
| `app/page.tsx` | Replace | Full login page component |

---

### Task 1: Wire up fonts and HeroUIProvider in layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update globals.css for Tailwind v4**

Replace the entire contents of `app/globals.css` with:

```css
@import "tailwindcss";
```

> Tailwind v4 uses `@import` instead of `@tailwind` directives.

- [ ] **Step 2: Update layout.tsx**

Replace the entire contents of `app/layout.tsx` with:

```tsx
import type { Metadata } from "next"
import { Playfair_Display, DM_Sans } from "next/font/google"
import { HeroUIProvider } from "@heroui/react"
import "./globals.css"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Kasekor Helper",
  description: "Internal team portal",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="h-full">
        <HeroUIProvider>{children}</HeroUIProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: add fonts and HeroUIProvider to layout"
```

---

### Task 2: Build the login page

**Files:**
- Replace: `app/page.tsx`

- [ ] **Step 1: Write the login page**

Replace the entire contents of `app/page.tsx` with:

```tsx
"use client"

import { Input, Button } from "@heroui/react"
import { motion } from "motion/react"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#e8e5e0] p-6">
      <div
        className="flex w-full max-w-[900px] overflow-hidden rounded-2xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)" }}
      >
        {/* Left brand panel */}
        <div
          className="relative flex w-[45%] flex-col justify-between overflow-hidden p-12"
          style={{ background: "#0f3d1f" }}
        >
          {/* Top-right glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)" }}
          />
          {/* Bottom-left glow */}
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(134,239,172,0.10) 0%, transparent 70%)" }}
          />

          {/* Brand identity */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#22c55e]">
              <svg
                className="h-6 w-6"
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

            {/* Wordmark */}
            <h1
              className="mb-3 text-4xl font-black leading-none tracking-tight text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Kasekor<br />Helper
            </h1>

            {/* Badge */}
            <span
              className="inline-block rounded px-2.5 py-1 text-[10px] font-semibold tracking-[2px]"
              style={{
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#86efac",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              TEAM PORTAL
            </span>
          </div>

          {/* Footer */}
          <p
            className="relative z-10 text-xs"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-dm-sans)" }}
          >
            Internal use only · © 2026
          </p>
        </div>

        {/* Right form panel */}
        <motion.div
          className="flex flex-1 flex-col items-center justify-center px-12 py-14"
          style={{ background: "#fafaf8" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="w-full max-w-[320px]">
            <h2
              className="mb-1.5 text-2xl font-bold tracking-tight text-[#111]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Welcome back
            </h2>
            <p
              className="mb-9 text-sm text-[#999]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Sign in to your team account
            </p>

            <form className="flex flex-col gap-4">
              <Input
                type="email"
                label="Email"
                labelPlacement="outside"
                placeholder="you@kasekor.com"
                classNames={{
                  label: "text-[11px] font-semibold tracking-[0.8px] uppercase text-[#666]",
                  input: "text-sm text-[#333] placeholder:text-[#ccc]",
                  inputWrapper:
                    "bg-white border-[1.5px] border-[#e5e5e0] rounded-lg shadow-none hover:border-[#16a34a] focus-within:!border-[#16a34a]",
                }}
              />

              <Input
                type="password"
                label="Password"
                labelPlacement="outside"
                placeholder="••••••••"
                classNames={{
                  label: "text-[11px] font-semibold tracking-[0.8px] uppercase text-[#666]",
                  input: "text-sm text-[#333] placeholder:text-[#ccc]",
                  inputWrapper:
                    "bg-white border-[1.5px] border-[#e5e5e0] rounded-lg shadow-none hover:border-[#16a34a] focus-within:!border-[#16a34a]",
                }}
              />

              <Button
                type="submit"
                fullWidth
                className="mt-1 rounded-lg bg-[#0f3d1f] text-sm font-semibold text-white"
                style={{ fontFamily: "var(--font-dm-sans)" }}
                endContent={
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                }
              >
                Sign In
              </Button>
            </form>

            <p
              className="mt-7 text-center text-[11px] text-[#bbb]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Access restricted to authorized team members
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start dev server and verify visually**

```bash
cd frontend && npm run dev
```

Open `http://localhost:3000` and verify:
- Split layout fills the viewport
- Left panel: forest green background, wordmark, badge, glow effects visible
- Right panel: "Welcome back" heading, Email + Password inputs, Sign In button
- Form panel fades in and slides up on load
- Inputs show green border on focus
- No console errors

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build split-panel login page"
```
