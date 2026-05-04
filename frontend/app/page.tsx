"use client"

import { Input, Button, TextField, Label } from "@heroui/react"
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

            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              {/* Email field */}
              <TextField className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#666]">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="you@kasekor.com"
                  className="w-full rounded-lg border-[1.5px] border-[#e5e5e0] bg-white px-3 py-2.5 text-sm text-[#333] placeholder:text-[#ccc] outline-none hover:border-[#16a34a] focus-visible:border-[#16a34a]"
                />
              </TextField>

              {/* Password field */}
              <TextField className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#666]">
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border-[1.5px] border-[#e5e5e0] bg-white px-3 py-2.5 text-sm text-[#333] placeholder:text-[#ccc] outline-none hover:border-[#16a34a] focus-visible:border-[#16a34a]"
                />
              </TextField>

              <Button
                type="submit"
                fullWidth
                className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#0f3d1f] py-2.5 text-sm font-semibold text-white"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Sign In
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
