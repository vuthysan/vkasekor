import * as React from "react"
import { cn } from "~/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#e8e5e0]", className)}
      {...props}
    />
  )
}

export { Skeleton }
