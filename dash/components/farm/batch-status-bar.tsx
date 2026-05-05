export type BatchStatus = "Healthy" | "At Risk" | "Harvesting"

export interface FarmerBatch {
  id: string
  nameKh: string
  type: string
  emoji: string
  status: BatchStatus
  dayCount: number
}

const statusCfg: Record<BatchStatus, { labelKh: string; bg: string; text: string; border: string }> = {
  "Healthy":    { labelKh: "ល្អ",        bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  "At Risk":    { labelKh: "ប្រឈម",      bg: "#fff5f5", text: "#dc2626", border: "#fecaca" },
  "Harvesting": { labelKh: "ប្រមូលផល",   bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
}

export function BatchStatusBar({ batches }: { batches: FarmerBatch[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {batches.map((batch) => {
        const s = statusCfg[batch.status]
        return (
          <div
            key={batch.id}
            className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <span className="text-lg leading-none">{batch.emoji}</span>

            <div className="flex flex-col gap-0.5">
              <span
                className="leading-tight"
                style={{
                  fontFamily: "var(--font-kantumruy)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1c1408",
                  lineHeight: "1.5",
                }}
              >
                {batch.nameKh}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    fontFamily: "var(--font-kantumruy)",
                    fontSize: 11,
                    fontWeight: 500,
                    color: s.text,
                  }}
                >
                  {s.labelKh}
                </span>
                <span style={{ color: "#d4c8b4", fontSize: 10 }}>·</span>
                <span
                  style={{
                    fontFamily: "var(--font-inter), var(--font-kantumruy)",
                    fontSize: 11,
                    color: "#b5a88f",
                  }}
                >
                  ថ្ងៃទី {batch.dayCount}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
