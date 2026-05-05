import { Skeleton } from "~/components/ui/skeleton"

export function StatRowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-xl bg-white px-6 py-5"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)" }}
        >
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-7 w-16 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  )
}

export function DataTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)" }}>
      <div className="border-b border-[#e5e5e0] bg-[#fafaf8] px-6 py-4">
        <div className="flex gap-16">
          {[20, 20, 24, 20, 20].map((w, i) => (
            <Skeleton key={i} className={`h-3 w-${w} rounded`} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[#e5e5e0]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-16 px-6 py-5">
            {[24, 20, 28, 16, 20].map((w, j) => (
              <Skeleton key={j} className={`h-4 w-${w} rounded`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl bg-white px-6 py-5"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)" }}
    >
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-7 w-16 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </div>
  )
}
