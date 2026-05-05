"use client"

import { Card, CardContent } from "~/components/ui/card"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

export interface StatCell {
  label: string
  value: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

interface StatRowProps {
  cells: StatCell[]
}

export function StatRow({ cells }: StatRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cells.map((cell, i) => {
        const Icon = cell.icon
        const TrendIcon = cell.trend?.isPositive ? TrendingUp : TrendingDown

        return (
          <Card
            key={i}
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            <CardContent className="px-5 py-4">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0fdf4]">
                  <Icon className="h-4 w-4 text-field-green" strokeWidth={1.75} />
                </div>
                {cell.trend && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.75 text-[10px] font-semibold ${
                      cell.trend.isPositive
                        ? "bg-[#f0fdf4] text-field-green"
                        : "bg-[#fef2f2] text-[#dc2626]"
                    }`}
                    style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
                  >
                    <TrendIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
                    {Math.abs(cell.trend.value)}%
                  </span>
                )}
              </div>

              <p
                className="tabular-nums text-[1.625rem] font-bold leading-none tracking-tight text-[#111]"
                style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
              >
                {cell.value}
              </p>
              <p
                className="mt-1.5 text-[11px] leading-snug text-[#666]"
                style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
              >
                {cell.label}
              </p>
              {cell.trend && (
                <p
                  className="mt-1 text-[10px] text-[#aaa]"
                  style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
                >
                  {cell.trend.label}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
