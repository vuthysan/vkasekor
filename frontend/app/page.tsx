"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Eye, EyeOff } from "lucide-react"
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand presence */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ backgroundColor: "var(--color-canopy-deep)" }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: "300px 300px",
          }}
        />

        {/* Gradient mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 85%, rgba(22,163,74,0.18) 0%, transparent 55%), radial-gradient(ellipse 55% 70% at 85% 15%, rgba(34,197,94,0.1) 0%, transparent 55%)",
          }}
        />

        {/* Ghost Khmer letterform */}
        <div
          className="absolute -bottom-6 -right-4 select-none pointer-events-none"
          style={{
            fontFamily: "var(--font-kantumruy)",
            fontSize: "clamp(160px, 22vw, 280px)",
            fontWeight: 700,
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(134,239,172,0.1)",
            lineHeight: 1,
          }}
        >
          ក
        </div>

        {/* Top — wordmark */}
        <div className="relative z-10">
          <span
            className="block text-xs tracking-widest uppercase mb-3"
            style={{
              color: "var(--color-sprout-light)",
              fontFamily: "var(--font-inter)",
              opacity: 0.55,
            }}
          >
            Internal Portal
          </span>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(36px, 4.5vw, 54px)",
              fontWeight: 700,
              color: "var(--color-rice-parchment)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            Kasekor
            <br />
            <span style={{ color: "var(--color-sprout)" }}>Helper</span>
          </h2>
        </div>

        {/* Bottom — tagline */}
        <div className="relative z-10">
          <div
            className="w-10 h-px mb-5"
            style={{ backgroundColor: "var(--color-sprout)", opacity: 0.45 }}
          />
          <p
            className="text-sm leading-relaxed max-w-65"
            style={{
              color: "var(--color-sage-mist)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Farm batch management &amp; daily operations for Cambodian
            agricultural teams.
          </p>
        </div>
      </motion.div>

      {/* Right panel — form */}
      <div
        className="flex-1 flex items-center justify-center px-8 py-12"
        style={{ backgroundColor: "var(--color-rice-parchment)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-85"
        >
          {/* Mobile wordmark */}
          <div className="lg:hidden mb-10">
            <p
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--color-canopy-deep)",
              }}
            >
              Kasekor{" "}
              <span style={{ color: "var(--color-field-green)" }}>Helper</span>
            </p>
          </div>

          {/* Heading */}
          <div className="mb-9">
            <h1
              className="mb-1.5"
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(26px, 3.5vw, 30px)",
                fontWeight: 700,
                color: "var(--color-canopy-deep)",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              Welcome back
            </h1>
            <p
              className="text-sm"
              style={{
                color: "var(--color-sage-mist)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Sign in to your admin account
            </p>
          </div>

          {/* Form */}
          <Form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <TextField isRequired name="email" type="email" className="w-full">
              <Label className="block text-[11px] font-medium tracking-widest uppercase mb-1.5"
                style={{ color: "var(--color-canopy-deep)", fontFamily: "var(--font-inter)", opacity: 0.7 }}
              >
                Email
              </Label>
              <Input
                placeholder="admin@kasekor.com"
                className="w-full px-4 py-2.75 text-sm rounded-md outline-none transition-all duration-150 bg-white"
                style={{
                  border: "1px solid var(--color-dried-grass)",
                  color: "var(--color-canopy-deep)",
                  fontFamily: "var(--font-inter)",
                }}
              />
              <FieldError className="text-xs mt-1"
                style={{ color: "#dc2626", fontFamily: "var(--font-inter)" }}
              />
            </TextField>

            {/* Password */}
            <TextField isRequired name="password" type={showPassword ? "text" : "password"} className="w-full">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="block text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: "var(--color-canopy-deep)", fontFamily: "var(--font-inter)", opacity: 0.7 }}
                >
                  Password
                </Label>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: "var(--color-sage-mist)", fontFamily: "var(--font-inter)" }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <Input
                placeholder="••••••••"
                className="w-full px-4 py-2.75 text-sm rounded-md outline-none transition-all duration-150 bg-white"
                style={{
                  border: "1px solid var(--color-dried-grass)",
                  color: "var(--color-canopy-deep)",
                  fontFamily: "var(--font-inter)",
                }}
              />
              <FieldError className="text-xs mt-1"
                style={{ color: "#dc2626", fontFamily: "var(--font-inter)" }}
              />
            </TextField>

            {/* Submit */}
            <Button
              type="submit"
              isDisabled={isLoading}
              variant="primary"
              fullWidth
              className="py-2.75 text-sm font-medium tracking-wide mt-1 rounded-md"
              style={{
                backgroundColor: "var(--color-canopy-deep)",
                color: "var(--color-rice-parchment)",
                fontFamily: "var(--font-inter)",
                letterSpacing: "0.04em",
                opacity: isLoading ? 0.72 : 1,
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>

          <p
            className="mt-10 text-xs text-center"
            style={{
              color: "var(--color-sage-mist)",
              fontFamily: "var(--font-inter)",
              opacity: 0.7,
            }}
          >
            Kasekor Helper · Admin Portal
          </p>
        </motion.div>
      </div>
    </div>
  )
}
