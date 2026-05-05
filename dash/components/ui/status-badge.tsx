import { Badge } from "~/components/ui/badge"

type BatchStatus = "Healthy" | "At Risk" | "Harvesting"

const statusConfig: Record<BatchStatus, { bg: string; text: string; border: string; label: string }> = {
  Healthy: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", label: "សុខភាពល្អ" },
  "At Risk": { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", label: "មានហានិភ័យ" },
  Harvesting: { bg: "#fffbeb", text: "#ca8a04", border: "#fde68a", label: "កំពុងប្រមូលផល" },
}

export function StatusBadge({ status }: { status: BatchStatus }) {
  const config = statusConfig[status]
  if (!config) return null
  return (
    <Badge
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontFamily: "var(--font-inter), var(--font-kantumruy)",
        fontWeight: 600,
        fontSize: "0.6875rem",
      }}
    >
      {config.label}
    </Badge>
  )
}
