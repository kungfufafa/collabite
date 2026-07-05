import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse border-2 border-[var(--neutral-900)] bg-accent shadow-[2px_2px_0_0_var(--neutral-900)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
