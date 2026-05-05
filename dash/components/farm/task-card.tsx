"use client"

import { motion } from "motion/react"

export interface FarmerTask {
  id: string
  batchNameKh: string
  emoji: string
  titleKh: string
  instructionsKh: string
  day: number
  dueType: "overdue" | "today" | "upcoming"
  isDone: boolean
}

interface TaskCardProps {
  task: FarmerTask
  onDone: (id: string) => void
}

export function TaskCard({ task, onDone }: TaskCardProps) {
  const { dueType, isDone } = task
  const isOverdue = dueType === "overdue"
  const isUpcoming = dueType === "upcoming"

  const cardBg = isOverdue ? "#fff5f5" : "#fffdf7"
  const cardBorder = isOverdue
    ? "1px solid #fecaca"
    : "1px solid rgba(0,0,0,0.07)"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDone ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
      className="overflow-hidden rounded-2xl"
      style={{ background: cardBg, border: cardBorder }}
    >
      {/* Card body */}
      <div className="px-5 py-4">
        {/* Overdue pill */}
        {isOverdue && !isDone && (
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" />
            <span
              style={{
                fontFamily: "var(--font-kantumruy)",
                fontSize: 11,
                fontWeight: 700,
                color: "#dc2626",
                letterSpacing: "0.04em",
              }}
            >
              យឺតពេល
            </span>
          </div>
        )}

        {/* Emoji + title */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 text-2xl leading-none">{task.emoji}</span>
          <p
            style={{
              fontFamily: "var(--font-kantumruy)",
              fontSize: 17,
              fontWeight: 600,
              lineHeight: "1.75",
              color: "#1c1408",
            }}
          >
            {task.titleKh}
          </p>
        </div>

        {/* Instructions */}
        <p
          className="mt-3"
          style={{
            fontFamily: "var(--font-kantumruy)",
            fontSize: 13.5,
            lineHeight: "2.05",
            color: "#7a6a50",
          }}
        >
          {task.instructionsKh}
        </p>

        {/* Batch + day */}
        <div className="mt-3.5 flex items-center gap-2">
          <span
            className="rounded-lg px-2.5 py-1"
            style={{
              background: "rgba(0,0,0,0.05)",
              fontFamily: "var(--font-kantumruy)",
              fontSize: 12,
              fontWeight: 500,
              color: "#7a6a50",
            }}
          >
            {task.batchNameKh}
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), var(--font-kantumruy)",
              fontSize: 11.5,
              color: "#b5a88f",
            }}
          >
            ថ្ងៃទី {task.day}
          </span>
        </div>
      </div>

      {/* Action footer */}
      <div className="px-4 pb-4">
        {isDone ? (
          <div
            className="flex items-center justify-center gap-2 rounded-xl py-3"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
          >
            <svg
              className="h-4 w-4"
              style={{ color: "#16a34a" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-kantumruy)",
                fontSize: 14,
                fontWeight: 600,
                color: "#16a34a",
              }}
            >
              បានធ្វើ
            </span>
          </div>
        ) : isUpcoming ? (
          <div
            className="flex w-full items-center justify-center rounded-xl py-3.5"
            style={{ background: "#ede8df" }}
          >
            <span
              style={{
                fontFamily: "var(--font-kantumruy)",
                fontSize: 15,
                fontWeight: 600,
                color: "#9c8b73",
              }}
            >
              ខាងមុខ
            </span>
          </div>
        ) : (
          <button
            onClick={() => onDone(task.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a34a]"
            style={{
              background: "#0f3d1f",
              fontFamily: "var(--font-kantumruy)",
              fontSize: 15,
              fontWeight: 700,
              color: "#fafaf8",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#165a2d")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0f3d1f")}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            បានធ្វើ
          </button>
        )}
      </div>
    </motion.div>
  )
}
